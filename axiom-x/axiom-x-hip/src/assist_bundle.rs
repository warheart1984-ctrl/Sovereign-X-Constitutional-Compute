use crate::fused::hip_fused_assist;

pub struct HipAssistBundle {
    pub scheduler_costs: Vec<f32>,
    pub memory_proposals: Vec<f32>,
    pub assist_only: bool,
}

pub fn hip_assist_bundle(
    latency: &[f32],
    throughput: &[f32],
    thermal: &[f32],
    alpha: f32,
    beta: f32,
    gamma: f32,
    _frame_usage: &[f32],
    _frame_priority: &[f32],
    _capacity: f32,
) -> Option<HipAssistBundle> {
    let bundle = hip_fused_assist(latency, throughput, thermal, alpha, beta, gamma)?;

    Some(HipAssistBundle {
        scheduler_costs: bundle.scheduler_costs,
        memory_proposals: bundle.memory_proposals,
        assist_only: true,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn assist_bundle_basic() {
        let latency = vec![0.1, 0.2];
        let throughput = vec![100.0, 200.0];
        let thermal = vec![45.0, 50.0];
        let result = hip_assist_bundle(
            &latency, &throughput, &thermal,
            1.0, 1.0, 1.0,
            &[], &[], 0.0,
        );
        match result {
            Some(b) => {
                assert!(b.assist_only);
                assert_eq!(b.scheduler_costs.len(), 2);
            }
            None => {
                // Expected when no HIP device
            }
        }
    }
}
