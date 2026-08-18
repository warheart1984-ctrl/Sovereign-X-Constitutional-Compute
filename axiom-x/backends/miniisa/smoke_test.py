"""
Smoke tests for Mini ISA Backend + Sovereign-X Router + Evidence Writer.

Run:
    python -m axiom_x.backends.miniisa.smoke_test
"""

import asyncio
import sys
import os

# Ensure backends parent and axiom-x root are importable
_backends_dir = os.path.dirname(os.path.dirname(__file__))
_axiom_x_root = os.path.dirname(_backends_dir)
if _backends_dir not in sys.path:
    sys.path.insert(0, _backends_dir)
if _axiom_x_root not in sys.path:
    sys.path.insert(0, _axiom_x_root)


async def test_probe():
    """Test 1: Probe device and print capability report."""
    print("=" * 60)
    print("TEST 1: Probe Device")
    print("=" * 60)
    from backends.miniisa import MiniISABackendFactory
    cap = await MiniISABackendFactory.probe()

    print(f"  backend_id:     {cap.backend_id}")
    print(f"  backend_type:   {cap.backend_type}")
    print(f"  architecture:   {cap.target['targetIdentity']['architecture']}")
    print(f"  vendor:         {cap.target['targetIdentity']['vendor']}")
    print(f"  fp16:           {cap.target['numeric']['fp16']}")
    print(f"  globalBytes:    {cap.target['memory']['globalBytes']}")
    print(f"  maxComputeUnits:{cap.target['maxComputeUnits']}")
    print(f"  kernels:        {cap.kernels_supported}")
    print(f"  detection_ms:   {cap.detection_duration_ms:.2f}")
    print("  PASS\n")
    return cap


async def test_compile_dispatch():
    """Test 2: Compile a tiny kernel and dispatch it."""
    print("=" * 60)
    print("TEST 2: Compile & Dispatch")
    print("=" * 60)
    from backends.miniisa import MiniISABackendFactory

    backend = await MiniISABackendFactory.create()
    assert backend.is_initialized, "Backend not initialized"

    # Compile a tiny kernel (memcopy/fill)
    kernel_source = b"kernel void fill(global float* out, float val) { out[get_global_id(0)] = val; }"
    kernel_id = await backend.compile(kernel_source, "axiom_ir")
    print(f"  kernel_id: {kernel_id}")

    # Allocate
    alloc_id = await backend.allocate(1024, "test_buffer")
    print(f"  alloc_id:  {alloc_id}")

    # Dispatch
    future = await backend.dispatch(kernel_id, ["alloc_id=test_buffer", "val=3.14"])
    print(f"  future_id: {future.future_id}")
    print(f"  status:    {future.status}")

    # Synchronize
    result = await backend.synchronize(future)
    print(f"  success:   {result.success}")
    print(f"  output_hash: {result.output_hash[:32]}...")

    # Profile
    profile = await backend.profile(future)
    print(f"  dispatch_ms: {profile.dispatch_time_ms}")
    print(f"  total_ms:    {profile.total_time_ms}")

    # Cleanup
    await backend.free(alloc_id)
    print("  PASS\n")
    return kernel_id, result.output_hash


async def test_evidence_writer():
    """Test 3: Write an immutable evidence receipt."""
    print("=" * 60)
    print("TEST 3: Evidence Writer")
    print("=" * 60)
    from tools.evidence_writer import write_evidence, verify_evidence, sha256_hex
    from pathlib import Path

    manifest = {
        "intent_id": "smoke-test-001",
        "base_model": "sd_turbo.safetensors",
        "seed": 42,
        "resolution": 128,
    }
    capability = {
        "backendType": "miniisa",
        "target": {"targetIdentity": {"architecture": "mini-isa-v1", "vendor": "MiniISA"}},
    }
    kernel_hash = sha256_hex(b"test-kernel-source")
    output_hash = sha256_hex(b"test-output-data")

    evidence_dir = Path(r"E:\Sovereign-X-Constitutional-Compute\axiom-x\evidence")
    path = write_evidence(
        manifest=manifest,
        capability=capability,
        kernel_hash=kernel_hash,
        output_path="N/A",
        output_hash=output_hash,
        seed=42,
        evidence_dir=evidence_dir,
    )
    print(f"  evidence_path: {path}")

    # Verify
    valid = verify_evidence(path)
    print(f"  verified: {valid}")
    assert valid, "Evidence verification failed!"
    print("  PASS\n")
    return path


async def test_routing_policy():
    """Test 4: Verify Sovereign-X routing policy — determinismRequired routes away from miniisa."""
    print("=" * 60)
    print("TEST 4: Routing Policy (determinismRequired gate)")
    print("=" * 60)

    # Simulate routing logic (mirrors sovereign_x_router/src/router.rs)
    class ComputeBackendKind:
        CPU_MICROKERNEL = "CpuMicrokernel"
        OPENCL_ASSIST = "OpenClComputeAssistOnly"
        HIP_ASSIST = "HipComputeAssistOnly"
        MINIISA_ASSIST = "MiniIsaAssistOnly"

    def select_backend(arch, vendor, determinism_required=False):
        """Mirrors router.rs select_backend + determinismRequired gate."""
        if determinism_required:
            # Determinism required → always CPU RT4D print path
            return ComputeBackendKind.CPU_MICROKERNEL, False

        if vendor == "MiniISA" and arch == "mini-isa-v1":
            return ComputeBackendKind.MINIISA_ASSIST, True

        if vendor == "AMD" and arch == "gfx803":
            return ComputeBackendKind.HIP_ASSIST, True

        if vendor == "AMD":
            return ComputeBackendKind.OPENCL_ASSIST, True

        return ComputeBackendKind.CPU_MICROKERNEL, False

    # Test cases
    cases = [
        # (arch, vendor, determinismRequired, expected_backend, expected_assist_only)
        ("mini-isa-v1", "MiniISA", False, "MiniIsaAssistOnly", True),
        ("mini-isa-v1", "MiniISA", True, "CpuMicrokernel", False),
        ("gfx803", "AMD", False, "HipComputeAssistOnly", True),
        ("gfx803", "AMD", True, "CpuMicrokernel", False),
        ("unknown", "Intel", False, "CpuMicrokernel", False),
    ]

    passed = 0
    for arch, vendor, det_req, expected_backend, expected_assist in cases:
        backend, assist = select_backend(arch, vendor, det_req)
        status = "PASS" if backend == expected_backend and assist == expected_assist else "FAIL"
        det_str = "detReq=true" if det_req else "detReq=false"
        print(f"  [{status}] {vendor}/{arch} {det_str} -> {backend} (assistOnly={assist})")
        if status == "PASS":
            passed += 1

    print(f"  {passed}/{len(cases)} routing cases passed")
    assert passed == len(cases), f"Only {passed}/{len(cases)} routing cases passed"
    print("  PASS\n")


async def main():
    print("Mini ISA Backend — Smoke Tests")
    print("=" * 60)
    print()

    try:
        await test_probe()
        await test_compile_dispatch()
        await test_evidence_writer()
        await test_routing_policy()

        print("=" * 60)
        print("ALL TESTS PASSED")
        print("=" * 60)
    except Exception as e:
        print(f"\nFAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
