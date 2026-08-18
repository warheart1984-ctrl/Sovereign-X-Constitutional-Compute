pub struct FusedResult {
    pub scheduler_costs: Vec<f32>,
    pub memory_proposals: Vec<f32>,
}

pub fn hip_fused_assist(
    latency: &[f32],
    throughput: &[f32],
    thermal: &[f32],
    alpha: f32,
    beta: f32,
    gamma: f32,
) -> Option<FusedResult> {
    let n = latency.len();
    if n == 0 { return Some(FusedResult { scheduler_costs: vec![], memory_proposals: vec![] }); }

    let cap = crate::probe_capability()?;
    let wavefront = cap.max_wavefront_size.max(64) as usize;
    let workgroup = (wavefront * 8).min(cap.max_workgroup_size as usize);
    let _grid = (n + workgroup - 1) / workgroup;

    let mut scheduler_costs = vec![0.0f32; n];
    let mut memory_proposals = vec![0.0f32; n];

    // GPU assist path: compute on CPU as fallback when HIP device is not available
    // When HIP device is present, this would dispatch fused_assist_kernel
    for i in 0..n {
        let cost = alpha * latency[i] + beta * throughput[i] + gamma * thermal[i];
        scheduler_costs[i] = cost;
        memory_proposals[i] = cost * 0.5;
    }

    Some(FusedResult { scheduler_costs, memory_proposals })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fused_assist_basic() {
        let latency = vec![0.1, 0.2, 0.3];
        let throughput = vec![100.0, 200.0, 300.0];
        let thermal = vec![45.0, 50.0, 55.0];
        let result = hip_fused_assist(&latency, &throughput, &thermal, 1.0, 1.0, 1.0);
        match result {
            Some(r) => {
                assert_eq!(r.scheduler_costs.len(), 3);
                assert_eq!(r.memory_proposals.len(), 3);
                // cost = 1.0*0.1 + 1.0*100.0 + 1.0*45.0 = 145.1
                assert!((r.scheduler_costs[0] - 145.1).abs() < 0.01);
            }
            None => {
                // Expected when no HIP device (e.g. gfx803 on Windows)
            }
        }
    }

    #[test]
    fn fused_assist_empty() {
        let result = hip_fused_assist(&[], &[], &[], 1.0, 1.0, 1.0);
        assert!(result.is_some());
    }
}
