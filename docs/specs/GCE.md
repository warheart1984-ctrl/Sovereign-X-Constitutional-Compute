# GPU Contract for Constitutional Execution (GCE)

**Status:** declared  
**Runtime:** GPU arena stub in `src/arenas/index.js` (**skeleton**)

## Purpose

Govern GPU kernel launches under Router authority (lawful parallelism + continuity).

## Clauses (spec only)

| Clause | Claim level |
|--------|-------------|
| Kernel Authority | declared — ACC covers arena allow-list; no real kernel launch |
| Continuity | declared — CPC parent required; no GPU driver linkage |
| Reflection | partial — stub returns structured result into ledger |
| Audit | partial — ledger event on allowed schedule |

## Execution model (declared)

```
K = Router(Intent, Authority, Continuity)
GPU(K) → Result + ContinuityRecord
```

This repository does **not** bind NVIDIA/AMD/Vulkan drivers. Vendor skills from LineageStudio may be consulted when adding future stubs — still label as skeleton until tests prove a gate.
