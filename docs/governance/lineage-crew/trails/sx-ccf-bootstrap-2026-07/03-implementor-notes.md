# 03 Implementor notes

**Role:** ls-implementor  
**ModeKey:** sage__navigator__evidence-strict

## Files (SoT)

- `src/scheduler.js` — `ConstitutionalComputeScheduler` (CCS)
- `src/contracts/` — ACC/CPC/ILC/RAC surfaces
- `src/authority.js`, `continuity.js`, `ledger.js`
- `src/arenas/`, `src/cis/`, `src/performance.js`, `src/demo.js`
- `test/ccs.test.js` — 10 passing

## Gaps

- In-memory ledger only
- ENRG/SYNC declared/skeleton
- No crypto signatures

## Status

CCS vertical slice: **partial** / contract gates: **enforced** in tests.
