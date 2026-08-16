pub mod capability;
pub mod scheduler;
pub mod memory_algebra;
pub mod assist_bundle;
pub mod fused;

use capability::CapabilityTarget;

#[repr(C)]
pub struct HipCapabilityRaw {
    pub arch_name: *const i8,
    pub vendor: *const i8,
    pub fp16: i32,
    pub tensor_cores: i32,
    pub vram_bytes: u64,
    pub subgroups: i32,
    pub max_compute_units: i32,
    pub max_wavefront_size: i32,
    pub max_workgroup_size: i32,
}

extern "C" {
    fn axiomx_hip_probe(out_cap: *mut HipCapabilityRaw) -> i32;
}

pub fn probe_capability() -> Option<CapabilityTarget> {
    let mut raw = HipCapabilityRaw {
        arch_name: std::ptr::null(),
        vendor: std::ptr::null(),
        fp16: 0,
        tensor_cores: 0,
        vram_bytes: 0,
        subgroups: 0,
        max_compute_units: 0,
        max_wavefront_size: 0,
        max_workgroup_size: 0,
    };

    let rc = unsafe { axiomx_hip_probe(&mut raw as *mut _) };
    if rc != 0 {
        return None;
    }

    Some(CapabilityTarget {
        arch_name: "gfx803",
        vendor: "AMD",
        fp16: raw.fp16 != 0,
        tensor_cores: raw.tensor_cores != 0,
        vram_bytes: raw.vram_bytes,
        subgroups: raw.subgroups != 0,
        max_compute_units: raw.max_compute_units as u32,
        max_wavefront_size: raw.max_wavefront_size as u32,
        max_workgroup_size: raw.max_workgroup_size as u32,
    })
}
