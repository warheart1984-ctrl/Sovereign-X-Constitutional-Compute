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
