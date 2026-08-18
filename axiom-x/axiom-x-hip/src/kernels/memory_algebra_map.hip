#include <hip/hip_runtime.h>

extern "C" {

__global__
void memory_algebra_map_kernel(
    const float* __restrict__ frame_usage,
    const float* __restrict__ frame_priority,
    float capacity,
    float* __restrict__ proposal_out,
    int n
) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    float u = frame_usage[idx];
    float p = frame_priority[idx];

    float raw = p * (capacity - u);
    if (raw < 0.0f) raw = 0.0f;

    proposal_out[idx] = raw;
}

} // extern "C"
