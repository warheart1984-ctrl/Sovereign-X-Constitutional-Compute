extern "C" {
    fn axiomx_hip_scheduler_batch_eval(
        latency: *const f32,
        throughput: *const f32,
        thermal: *const f32,
        alpha: f32,
        beta: f32,
        gamma: f32,
        cost_out: *mut f32,
        n: i32,
    ) -> i32;
}

pub struct HipSchedAssistResult {
    pub costs: Vec<f32>,
    pub assist_only: bool,
}

pub fn hip_scheduler_batch_eval(
    latency: &[f32],
    throughput: &[f32],
    thermal: &[f32],
    alpha: f32,
    beta: f32,
    gamma: f32,
) -> Option<HipSchedAssistResult> {
    let n = latency.len();
    if throughput.len() != n || thermal.len() != n || n == 0 {
        return None;
    }
    let mut costs = vec![0.0f32; n];
    let rc = unsafe {
        axiomx_hip_scheduler_batch_eval(
            latency.as_ptr(),
            throughput.as_ptr(),
            thermal.as_ptr(),
            alpha,
            beta,
            gamma,
            costs.as_mut_ptr(),
            n as i32,
        )
    };
    if rc != 0 {
        return None;
    }
    Some(HipSchedAssistResult { costs, assist_only: true })
}
