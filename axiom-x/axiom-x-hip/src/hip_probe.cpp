#include <hip/hip_runtime.h>

struct HipCapabilityRaw {
    const char* arch_name;
    const char* vendor;
    int fp16;
    int tensor_cores;
    unsigned long long vram_bytes;
    int subgroups;
    int max_compute_units;
    int max_wavefront_size;
    int max_workgroup_size;
};

static int parse_gfx_version(const char* name) {
    if (!name) return 0;
    const char* p = name;
    while (*p && *p != 'g') p++;
    if (*p == 'g') p++;
    if (*p == 'f') p++;
    if (*p == 'x') p++;
    int val = 0;
    while (*p >= '0' && *p <= '9') {
        val = val * 10 + (*p - '0');
        p++;
    }
    return val;
}

extern "C" {

int axiomx_hip_probe(HipCapabilityRaw* out) {
    int device_count = 0;
    hipError_t err = hipGetDeviceCount(&device_count);
    if (err != hipSuccess || device_count == 0) return -1;

    hipDeviceProp_t prop;
    err = hipGetDeviceProperties(&prop, 0);
    if (err != hipSuccess) return -2;

    out->arch_name = "unknown";
    out->vendor = "AMD";
    out->fp16 = 0;
    out->tensor_cores = 0;
    out->vram_bytes = prop.totalGlobalMem;
    out->subgroups = 1;
    out->max_compute_units = prop.multiProcessorCount;
    out->max_wavefront_size = prop.warpSize;
    out->max_workgroup_size = prop.maxThreadsPerBlock;

    int gfx = parse_gfx_version(prop.gcnArchName);
    if (gfx >= 1100) { out->arch_name = "gfx1100"; out->fp16 = 1; out->tensor_cores = 0; }
    else if (gfx >= 1030) { out->arch_name = "gfx1030"; out->fp16 = 1; out->tensor_cores = 0; }
    else if (gfx >= 1010) { out->arch_name = "gfx1010"; out->fp16 = 1; out->tensor_cores = 0; }
    else if (gfx >= 942) { out->arch_name = "gfx942"; out->fp16 = 1; out->tensor_cores = 1; }
    else if (gfx >= 940) { out->arch_name = "gfx940"; out->fp16 = 1; out->tensor_cores = 1; }
    else if (gfx >= 908) { out->arch_name = "gfx908"; out->fp16 = 1; out->tensor_cores = 1; }
    else if (gfx >= 906) { out->arch_name = "gfx906"; out->fp16 = 1; out->tensor_cores = 0; }
    else if (gfx >= 900) { out->arch_name = "gfx900"; out->fp16 = 1; out->tensor_cores = 0; }
    else if (gfx >= 810) { out->arch_name = "gfx810"; out->fp16 = 0; out->tensor_cores = 0; }
    else if (gfx >= 803) { out->arch_name = "gfx803"; out->fp16 = 0; out->tensor_cores = 0; }
    else { out->arch_name = prop.gcnArchName; }

    return 0;
}

} // extern "C"
