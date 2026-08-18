#include <hip/hip_runtime.h>

extern "C" {

__global__
void scheduler_batch_eval_kernel(
    const float* __restrict__ latency,
    const float* __restrict__ throughput,
    const float* __restrict__ thermal,
    float alpha,
    float beta,
    float gamma,
    float* __restrict__ cost_out,
    int n
);

int axiomx_hip_scheduler_batch_eval(
    const float* latency,
    const float* throughput,
    const float* thermal,
    float alpha,
    float beta,
    float gamma,
    float* cost_out,
    int n
) {
    if (n <= 0) return -1;

    float *d_latency = nullptr, *d_throughput = nullptr, *d_thermal = nullptr, *d_cost = nullptr;
    size_t bytes = static_cast<size_t>(n) * sizeof(float);

    if (hipMalloc(&d_latency, bytes) != hipSuccess) return -2;
    if (hipMalloc(&d_throughput, bytes) != hipSuccess) { hipFree(d_latency); return -3; }
    if (hipMalloc(&d_thermal, bytes) != hipSuccess) { hipFree(d_latency); hipFree(d_throughput); return -4; }
    if (hipMalloc(&d_cost, bytes) != hipSuccess) { hipFree(d_latency); hipFree(d_throughput); hipFree(d_thermal); return -5; }

    hipMemcpy(d_latency, latency, bytes, hipMemcpyHostToDevice);
    hipMemcpy(d_throughput, throughput, bytes, hipMemcpyHostToDevice);
    hipMemcpy(d_thermal, thermal, bytes, hipMemcpyHostToDevice);

    int block_size = 256;
    int grid_size = (n + block_size - 1) / block_size;

    hipLaunchKernelGGL(
        scheduler_batch_eval_kernel,
        dim3(grid_size), dim3(block_size), 0, 0,
        d_latency, d_throughput, d_thermal,
        alpha, beta, gamma,
        d_cost, n
    );

    hipDeviceSynchronize();
    hipMemcpy(cost_out, d_cost, bytes, hipMemcpyDeviceToHost);

    hipFree(d_latency);
    hipFree(d_throughput);
    hipFree(d_thermal);
    hipFree(d_cost);

    return 0;
}

} // extern "C"
