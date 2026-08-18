# Mini ISA Backend for Axiom-X

## Overview

Exposes a custom ISA device through Axiom-X as a backend implementing the Axiom ABI.
All work is tagged **assistOnly=true** and **nonAuthoritative=true**.
Jobs with **determinismRequired=true** are NEVER routed to this backend.

## Architecture

```
Mini ISA Backend
├── probe()          → CapabilityReport (device identity, features, memory)
├── initialize()     → AxiomInitResult (success + capability)
├── allocate()       → allocation_id (host-device IO)
├── compile()        → kernel_id (ISA source → executable)
├── dispatch()       → AxiomFuture (async execution)
├── synchronize()    → AxiomResult (output + hash)
├── profile()        → AxiomProfile (timing)
└── shutdown()       → cleanup
```

## Capability Report

The backend registers itself with:
- `backendType: "miniisa"`
- `targetIdentity.architecture: "mini-isa-v1"`
- `targetIdentity.vendor: "MiniISA"`
- `features: [{name: "miniisa", supported: true, version: "v1"}]`
- `fp16: true`, `fp32: true`, `fp64: false`
- `globalBytes: 4GB`, `maxComputeUnits: 36`

## Constitutional Rules

1. **Assist-only**: All GPU work is `assistOnly=true`, `nonAuthoritative=true`
2. **No determinism**: Jobs with `determinismRequired=true` route to CPU RT4D print path
3. **Evidence receipts**: Every dispatch produces an immutable evidence JSON
4. **Capability-driven**: Sovereign-X selects this backend by capability + policy

## Requirements

- Python 3.10+
- No external dependencies (stdlib only)
- Userspace driver or daemon exposing the Mini ISA device (socket/IPC/C extension)

## Usage

```python
import asyncio
from axiom_x.backends.miniisa import MiniISABackendFactory

async def main():
    # Probe
    cap = await MiniISABackendFactory.probe()
    print(cap.target["targetIdentity"])

    # Create and dispatch
    backend = await MiniISABackendFactory.create()
    kid = await backend.compile(b"kernel source", "axiom_ir")
    fut = await backend.dispatch(kid, ["arg0"])
    result = await backend.synchronize(fut)
    print(result.output_hash)

asyncio.run(main())
```

## Smoke Test

```bash
python -m axiom_x.backends.miniisa.smoke_test
```
