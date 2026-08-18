#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ComputeBackendKind {
    CpuMicrokernel,
    OpenClComputeAssistOnly,
    HipComputeAssistOnly,
    MiniIsaAssistOnly,
}

#[derive(Debug, Clone)]
pub struct BackendSelection {
    pub kind: ComputeBackendKind,
    pub assist_only: bool,
    pub arch_name: &'static str,
    pub vendor: &'static str,
}
