#include <hip/hip_runtime.h>

extern "C" {

__global__
void memory_algebra_map_kernel(
    const float* __restrict__ frame_usage,
    const float* __restrict__ frame_priority,
    float capacity,
    float* __restrict__ proposal_out,
    int n
);

int axiomx_hip_memory_algebra_map(
    const float* frame_usage,
    const float* frame_priority,
    float capacity,
    float* proposal_out,
    int n
) {
    if (n <= 0) return -1;

    float *d_usage = nullptr, *d_priority = nullptr, *d_proposal = nullptr;
    size_t bytes = static_cast<size_t>(n) * sizeof(float);

    if (hipMalloc(&d_usage, bytes) != hipSuccess) return -2;
    if (hipMalloc(&d_priority, bytes) != hipSuccess) { hipFree(d_usage); return -3; }
    if (hipMalloc(&d_proposal, bytes) != hipSuccess) { hipFree(d_usage); hipFree(d_priority); return -4; }

    hipMemcpy(d_usage, frame_usage, bytes, hipMemcpyHostToDevice);
    hipMemcpy(d_priority, frame_priority, bytes, hipMemcpyHostToDevice);

    int block_size = 256;
    int grid_size = (n + block_size - 1) / block_size;

    hipLaunchKernelGGL(
        memory_algebra_map_kernel,
        dim3(grid_size), dim3(block_size), 0, 0,
        d_usage, d_priority, capacity, d_proposal, n
    );

    hipDeviceSynchronize();
    hipMemcpy(proposal_out, d_proposal, bytes, hipMemcpyDeviceToHost);

    hipFree(d_usage);
    hipFree(d_priority);
    hipFree(d_proposal);

    return 0;
}

} // extern "C"
