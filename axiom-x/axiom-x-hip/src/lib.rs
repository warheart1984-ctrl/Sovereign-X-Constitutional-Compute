pub mod capability;
pub mod scheduler;
pub mod memory_algebra;
pub mod assist_bundle;
pub mod fused;

pub use capability::CapabilityTarget;

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

    // Read C strings from raw pointers
    let arch_name = unsafe {
        if raw.arch_name.is_null() {
            "unknown"
        } else {
            std::ffi::CStr::from_ptr(raw.arch_name)
                .to_str()
                .unwrap_or("unknown")
        }
    };
    let vendor = unsafe {
        if raw.vendor.is_null() {
            "unknown"
        } else {
            std::ffi::CStr::from_ptr(raw.vendor)
                .to_str()
                .unwrap_or("unknown")
        }
    };

    Some(CapabilityTarget {
        arch_name,
        vendor,
        fp16: raw.fp16 != 0,
        tensor_cores: raw.tensor_cores != 0,
        vram_bytes: raw.vram_bytes,
        subgroups: raw.subgroups != 0,
        max_compute_units: raw.max_compute_units as u32,
        max_wavefront_size: raw.max_wavefront_size as u32,
        max_workgroup_size: raw.max_workgroup_size as u32,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn probe_returns_result() {
        let result = probe_capability();
        match result {
            Some(cap) => {
                assert!(!cap.arch_name.is_empty());
                assert!(!cap.vendor.is_empty());
                assert!(cap.vram_bytes > 0);
                assert!(cap.max_compute_units > 0);
                assert!(cap.max_wavefront_size > 0);
            }
            None => {
                // Expected on systems without HIP-capable GPU
                // (e.g. RX 580 / gfx803 on Windows)
            }
        }
    }

    #[test]
    fn probe_idempotent() {
        let a = probe_capability();
        let b = probe_capability();
        match (&a, &b) {
            (Some(a), Some(b)) => {
                assert_eq!(a.arch_name, b.arch_name);
                assert_eq!(a.vendor, b.vendor);
                assert_eq!(a.vram_bytes, b.vram_bytes);
                assert_eq!(a.max_compute_units, b.max_compute_units);
            }
            (None, None) => {}
            _ => panic!("probe_capability returned inconsistent results"),
        }
    }
}
