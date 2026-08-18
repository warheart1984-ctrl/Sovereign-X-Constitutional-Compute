"""
Mini ISA Backend for Axiom-X / Sovereign-X.

Expose a custom ISA device through Axiom-X as a backend implementing the Axiom ABI.
All work is tagged assistOnly=true, nonAuthoritative=true.
DeterminismRequired jobs are NEVER routed to this backend.
"""

import hashlib
import json
import os
import struct
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class CapabilityReport:
    """Capability report returned by probe(). Matches Axiom-X CapabilityTarget schema."""
    backend_id: str
    backend_type: str = "miniisa"
    target: Dict[str, Any] = field(default_factory=lambda: {
        "executionModel": "gpu",
        "addressBits": 64,
        "features": [
            {"name": "hip", "supported": False},
            {"name": "opencl", "supported": False},
            {"name": "miniisa", "supported": True, "version": "v1"},
        ],
        "subgroup": {
            "supported": True, "minSize": 32, "maxSize": 64,
            "shuffle": True, "quad": False,
        },
        "memory": {
            "globalBytes": 4294967296,
            "localBytes": 16384,
            "constantBytes": 65536,
            "unified": False,
            "hostMapping": True,
            "atomicSupport": True,
            "bufferOffsetAlignment": 512,
        },
        "numeric": {
            "fp16": True, "fp32": True, "fp64": False, "bf16": False,
        },
        "maxWorkgroupSize": 1024,
        "maxComputeUnits": 36,
        "clockFrequencyMHz": None,
        "backend": {"name": "miniisa-driver", "version": "0.1"},
        "targetIdentity": {
            "vendor": "MiniISA",
            "architecture": "mini-isa-v1",
            "deviceName": "Mini ISA Card",
        },
    })
    kernels_supported: List[str] = field(default_factory=lambda: ["legacy_still", "axiom_ir"])
    timestamp: str = ""
    detection_duration_ms: float = 0.0

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


@dataclass
class AxiomInitResult:
    success: bool
    capability: Optional[CapabilityReport] = None
    error: Optional[str] = None
    device_id: str = ""


@dataclass
class AxiomFuture:
    future_id: str
    status: str = "pending"
    result_data: Optional[bytes] = None
    evidence: Optional[Dict] = None


@dataclass
class AxiomResult:
    success: bool
    data: Optional[bytes] = None
    error: Optional[str] = None
    output_hash: str = ""


@dataclass
class AxiomProfile:
    future_id: str
    dispatch_time_ms: float = 0.0
    sync_time_ms: float = 0.0
    total_time_ms: float = 0.0
    memory_used_bytes: int = 0


class MiniISABackend:
    """
    Main backend implementation for the Mini ISA device.
    Implements probe/initialize/allocate/compile/dispatch/synchronize/profile/shutdown.
    """

    def __init__(self):
        self._initialized = False
        self._device_id = ""
        self._capability: Optional[CapabilityReport] = None
        self._allocations: Dict[str, bytes] = {}
        self._kernels: Dict[str, bytes] = {}
        self._futures: Dict[str, AxiomFuture] = {}

    async def probe(self) -> CapabilityReport:
        """Probe the device and return a CapabilityReport."""
        start = time.time()
        backend_id = hashlib.sha256(b"miniisa-v1").hexdigest()[:16]
        cap = CapabilityReport(backend_id=f"miniisa-{backend_id}")
        cap.detection_duration_ms = (time.time() - start) * 1000
        self._capability = cap
        return cap

    async def initialize(self, config: Optional[Dict] = None) -> AxiomInitResult:
        """Initialize the backend device."""
        if self._capability is None:
            await self.probe()
        self._device_id = self._capability.backend_id
        self._initialized = True
        return AxiomInitResult(
            success=True,
            capability=self._capability,
            device_id=self._device_id,
        )

    async def allocate(self, size_bytes: int, name: str = "") -> str:
        """Allocate device memory. Returns allocation_id."""
        alloc_id = f"alloc-{hashlib.sha256(f'{name}:{size_bytes}:{time.time()}'.encode()).hexdigest()[:12]}"
        self._allocations[alloc_id] = b"\x00" * size_bytes
        return alloc_id

    async def map_host(self, alloc_id: str) -> bytes:
        """Map device memory to host. Returns data."""
        return self._allocations.get(alloc_id, b"")

    async def unmap(self, alloc_id: str):
        """Unmap device memory."""
        pass

    async def free(self, alloc_id: str):
        """Free device memory."""
        self._allocations.pop(alloc_id, None)

    async def copy_host_to_device(self, alloc_id: str, data: bytes):
        """Copy host data to device allocation."""
        self._allocations[alloc_id] = data

    async def fill(self, alloc_id: str, value: int, count: int):
        """Fill device memory with a value."""
        self._allocations[alloc_id] = bytes([value]) * count

    async def compile(self, module_source: bytes, target: str = "axiom_ir") -> str:
        """Compile a kernel module. Returns kernel_id."""
        kernel_hash = hashlib.sha256(module_source).hexdigest()
        kernel_id = f"kernel-{kernel_hash[:12]}"
        self._kernels[kernel_id] = module_source
        return kernel_id

    async def dispatch(self, kernel_id: str, args: List[str], grid: tuple = (1, 1, 1), block: tuple = (256, 1, 1)) -> AxiomFuture:
        """Dispatch a compiled kernel. Returns a future."""
        future_id = f"future-{hashlib.sha256(f'{kernel_id}:{time.time()}'.encode()).hexdigest()[:12]}"

        # Simulate execution — in production this calls the actual ISA driver
        result_data = self._simulate_kernel(kernel_id, args)

        future = AxiomFuture(
            future_id=future_id,
            status="complete",
            result_data=result_data,
        )
        self._futures[future_id] = future
        return future

    async def synchronize(self, future: AxiomFuture) -> AxiomResult:
        """Synchronize on a future and return the result."""
        output_hash = hashlib.sha256(future.result_data or b"").hexdigest()
        return AxiomResult(
            success=True,
            data=future.result_data,
            output_hash=output_hash,
        )

    async def profile(self, future: AxiomFuture) -> AxiomProfile:
        """Profile a completed dispatch."""
        return AxiomProfile(
            future_id=future.future_id,
            dispatch_time_ms=1.0,
            sync_time_ms=0.1,
            total_time_ms=1.1,
        )

    async def shutdown(self):
        """Shutdown the backend."""
        self._initialized = False
        self._allocations.clear()
        self._kernels.clear()
        self._futures.clear()

    def _simulate_kernel(self, kernel_id: str, args: List[str]) -> bytes:
        """Simulate kernel execution for smoke testing."""
        kernel_src = self._kernels.get(kernel_id, b"nop")
        return hashlib.sha256(kernel_src + json.dumps(args).encode()).digest()

    @property
    def is_initialized(self) -> bool:
        return self._initialized

    @property
    def device_id(self) -> str:
        return self._device_id


class MiniISABackendFactory:
    """Factory for creating MiniISABackend instances."""

    _instance: Optional[MiniISABackend] = None

    @classmethod
    async def create(cls) -> MiniISABackend:
        if cls._instance is None:
            cls._instance = MiniISABackend()
            await cls._instance.initialize()
        return cls._instance

    @classmethod
    async def probe(cls) -> CapabilityReport:
        backend = MiniISABackend()
        return await backend.probe()

    @classmethod
    def reset(cls):
        cls._instance = None
