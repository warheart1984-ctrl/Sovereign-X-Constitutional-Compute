use crate::backend::{BackendSelection, ComputeBackendKind};

#[derive(Debug, Clone)]
pub struct CapabilityTarget {
    pub arch_name: &'static str,
    pub vendor: &'static str,
    pub fp16: bool,
    pub tensor_cores: bool,
    pub vram_bytes: u64,
    pub subgroups: bool,
    pub max_compute_units: u32,
    pub max_wavefront_size: u32,
    pub max_workgroup_size: u32,
}

pub fn select_backend(cap: &CapabilityTarget) -> BackendSelection {
    if cap.vendor == "AMD" && cap.arch_name == "gfx803" {
        return BackendSelection {
            kind: ComputeBackendKind::HipComputeAssistOnly,
            assist_only: true,
            arch_name: cap.arch_name,
            vendor: cap.vendor,
        };
    }

    if cap.vendor == "AMD" {
        return BackendSelection {
            kind: ComputeBackendKind::OpenClComputeAssistOnly,
            assist_only: true,
            arch_name: cap.arch_name,
            vendor: cap.vendor,
        };
    }

    BackendSelection {
        kind: ComputeBackendKind::CpuMicrokernel,
        assist_only: false,
        arch_name: cap.arch_name,
        vendor: cap.vendor,
    }
}

/// Route a compute job. Enforces determinismRequired gate:
/// - If determinismRequired == true → always route to CpuMicrokernel (RT4D print path)
/// - MiniIsaAssistOnly is never authoritative
pub fn route_compute(cap: &CapabilityTarget, determinism_required: bool) -> BackendSelection {
    // Determinism gate: always CPU RT4D print path when determinism required
    if determinism_required {
        return BackendSelection {
            kind: ComputeBackendKind::CpuMicrokernel,
            assist_only: false,
            arch_name: cap.arch_name,
            vendor: cap.vendor,
        };
    }

    let sel = select_backend(cap);
    match sel.kind {
        ComputeBackendKind::HipComputeAssistOnly => {
            // call axiom_x_hip::assist_bundle::hip_assist_bundle
        }
        ComputeBackendKind::OpenClComputeAssistOnly => {
            // call OpenCL assist bundle
        }
        ComputeBackendKind::MiniIsaAssistOnly => {
            // call Mini ISA assist bundle (assistOnly=true, nonAuthoritative=true)
        }
        ComputeBackendKind::CpuMicrokernel => {
            // run pure CPU microkernel path (RT4D print)
        }
    }
    sel
}
