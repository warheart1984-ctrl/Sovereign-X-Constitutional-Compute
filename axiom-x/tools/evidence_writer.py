"""
Evidence Writer — immutable evidence receipts for Axiom-X backends.

Every assist run must produce an evidence package:
  - capability report (device identity)
  - kernel identity (hash)
  - input manifest (seed, config)
  - output hash (SHA-256)
  - provenance hash = SHA-256(manifest + capability + kernel_hash + output_hash)

Usage:
    from axiom_x.tools.evidence_writer import write_evidence
    write_evidence(manifest, capability, kernel_hash, output_path, seed=42)
"""

import hashlib
import json
import os
import time
from pathlib import Path
from typing import Any, Dict, Optional


EVIDENCE_DIR = Path(os.getenv(
    "AXIOM_EVIDENCE_DIR",
    r"E:\Sovereign-X-Constitutional-Compute\axiom-x\evidence"
))


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonicalize(obj: Any) -> str:
    """Deterministic JSON serialization for hashing."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def compute_provenance_hash(
    manifest: Dict,
    capability: Dict,
    kernel_hash: str,
    output_hash: str,
) -> str:
    """
    Provenance hash = SHA-256(canonical(manifest) + canonical(capability) + kernel_hash + output_hash)
    This is the immutable fingerprint of the entire run.
    """
    parts = (
        canonicalize(manifest).encode()
        + canonicalize(capability).encode()
        + kernel_hash.encode()
        + output_hash.encode()
    )
    return sha256_hex(parts)


def write_evidence(
    manifest: Dict,
    capability: Dict,
    kernel_hash: str,
    output_path: str,
    output_hash: Optional[str] = None,
    seed: Optional[int] = None,
    timings: Optional[Dict] = None,
    extra: Optional[Dict] = None,
    evidence_dir: Optional[Path] = None,
) -> Path:
    """
    Write an immutable evidence receipt JSON.

    Args:
        manifest: Input manifest (base_model, dataset, seed, config, etc.)
        capability: Capability report from backend probe()
        kernel_hash: SHA-256 of the kernel source/binary
        output_path: Path to the output artifact
        output_hash: SHA-256 of the output (computed if not provided)
        seed: RNG seed used for this run
        timings: Optional timing data (dispatch_ms, sync_ms, etc.)
        extra: Optional extra metadata
        evidence_dir: Directory to write evidence to

    Returns:
        Path to the written evidence JSON
    """
    if evidence_dir is None:
        evidence_dir = EVIDENCE_DIR
    evidence_dir.mkdir(parents=True, exist_ok=True)

    # Compute output hash if not provided
    if output_hash is None and os.path.exists(output_path):
        with open(output_path, "rb") as f:
            output_hash = sha256_hex(f.read())
    elif output_hash is None:
        output_hash = "no-output"

    # Build evidence
    intent_id = f"evidence-{int(time.time())}-{os.getpid()}"
    evidence = {
        "intent_id": intent_id,
        "schema_version": "1.0.0",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "manifest": manifest,
        "capability": capability,
        "kernel": {
            "hash": kernel_hash,
            "source": manifest.get("kernel_source", "unknown"),
        },
        "output": {
            "path": output_path,
            "hash": output_hash,
        },
        "seed": seed,
        "timings": timings or {},
        "constitutional": {
            "gpu_assist_only": True,
            "non_authoritative": True,
            "replayable": True,
            "determinism_required": False,
        },
    }

    # Compute provenance hash
    provenance_hash = compute_provenance_hash(
        manifest=manifest,
        capability=capability,
        kernel_hash=kernel_hash,
        output_hash=output_hash,
    )
    evidence["provenance_hash"] = provenance_hash

    # Merge extra
    if extra:
        evidence.update(extra)

    # Write
    filename = f"evidence-{intent_id}.json"
    evidence_path = evidence_dir / filename
    with open(evidence_path, "w", encoding="utf-8") as f:
        json.dump(evidence, f, indent=2, ensure_ascii=False)

    return evidence_path


def verify_evidence(evidence_path: Path) -> bool:
    """Verify an evidence receipt's provenance hash."""
    with open(evidence_path, "r", encoding="utf-8") as f:
        evidence = json.load(f)

    stored_hash = evidence.get("provenance_hash", "")
    computed_hash = compute_provenance_hash(
        manifest=evidence.get("manifest", {}),
        capability=evidence.get("capability", {}),
        kernel_hash=evidence.get("kernel", {}).get("hash", ""),
        output_hash=evidence.get("output", {}).get("hash", ""),
    )
    return stored_hash == computed_hash


if __name__ == "__main__":
    # Quick smoke test
    evidence_dir = Path(r"E:\Sovereign-X-Constitutional-Compute\axiom-x\evidence")
    path = write_evidence(
        manifest={"test": True, "seed": 42},
        capability={"backendType": "miniisa", "target": {"targetIdentity": {"architecture": "mini-isa-v1"}}},
        kernel_hash=sha256_hex(b"test-kernel"),
        output_path="N/A",
        output_hash=sha256_hex(b"test-output"),
        seed=42,
        evidence_dir=evidence_dir,
    )
    print(f"Evidence: {path}")
    print(f"Verified: {verify_evidence(path)}")
