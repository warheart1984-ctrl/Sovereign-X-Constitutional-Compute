__global__ void fused_assist_kernel(
    const float* latency,
    const float* throughput,
    const float* thermal,
    float alpha,
    float beta,
    float gamma,
    float* scheduler_costs,
    float* memory_proposals,
    int n
) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i >= n) return;
    float cost = alpha * latency[i] + beta * throughput[i] + gamma * thermal[i];
    scheduler_costs[i] = cost;
    memory_proposals[i] = cost * 0.5f; // simple memory mapping
}
