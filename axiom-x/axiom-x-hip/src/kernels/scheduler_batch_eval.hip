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
) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n) return;

    float L = latency[idx];
    float T = throughput[idx];
    float Th = thermal[idx];

    cost_out[idx] = alpha * L + beta * T + gamma * Th;
}

} // extern "C"
