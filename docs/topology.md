# Topology (declared diagram)

```
       ┌────────────────────────────┐
       │   Sovereign X Router       │
       │  (Constitutional Scheduler)│
       └────────────┬───────────────┘
                    │
    ┌───────────────┼────────────────┐
    │               │                │
┌──────────┐   ┌──────────┐     ┌──────────┐
│ CPU Arena│   │ GPU Arena│     │ VM Arena │
│ skeleton │   │ skeleton │     │ skeleton │
└──────────┘   └──────────┘     └──────────┘
    │               │                │
    └───────────────┼────────────────┘
                    │
       ┌────────────▼────────────┐
       │ Continuity Ledger       │
       │ (in-memory, partial)    │
       └─────────────────────────┘
```

Arenas also include llvm / twin / router stubs (`src/arenas/index.js`).
