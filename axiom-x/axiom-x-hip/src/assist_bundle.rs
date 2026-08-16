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
    frame_usage: &[f32],
    frame_priority: &[f32],
    capacity: f32,
) -> Option<HipAssistBundle> {
    // Fused kernel: one dispatch for scheduler + memory proposals
    let bundle = hip_fused_assist(latency, throughput, thermal, alpha, beta, gamma)?;
    
    Some(HipAssistBundle {
        scheduler_costs: bundle.scheduler_costs,
        memory_proposals: bundle.memory_proposals,
        assist_only: true,
    })
}
