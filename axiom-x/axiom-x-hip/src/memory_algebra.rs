extern "C" {
    fn axiomx_hip_memory_algebra_map(
        frame_usage: *const f32,
        frame_priority: *const f32,
        capacity: f32,
        proposal_out: *mut f32,
        n: i32,
    ) -> i32;
}

pub struct HipMemoryAssistResult {
    pub proposals: Vec<f32>,
    pub assist_only: bool,
}

pub fn hip_memory_algebra_map(
    frame_usage: &[f32],
    frame_priority: &[f32],
    capacity: f32,
) -> Option<HipMemoryAssistResult> {
    let n = frame_usage.len();
    if frame_priority.len() != n || n == 0 {
        return None;
    }
    let mut proposals = vec![0.0f32; n];
    let rc = unsafe {
        axiomx_hip_memory_algebra_map(
            frame_usage.as_ptr(),
            frame_priority.as_ptr(),
            capacity,
            proposals.as_mut_ptr(),
            n as i32,
        )
    };
    if rc != 0 {
        return None;
    }
    Some(HipMemoryAssistResult { proposals, assist_only: true })
}
