# Constitutional Scheduler Specification (CSS)

**Status:** declared  
**Runtime counterpart:** `ConstitutionalComputeScheduler` in `src/scheduler.js` (**partial** reference impl)

## Purpose

Define lawful scheduling where every compute dispatch is governed by authority, validated intent, and continuity preservation.

## Core contracts

| Contract | Function | Impl status |
|----------|----------|-------------|
| ACC | Validate authority before dispatch | **enforced** |
| CPC | Verify lineage before execution | **enforced** |
| ILC | Bind task to justification + audit trail | **enforced** |
| RAC | Deterministic replay / audit projection | **partial** |

## Operational flow

1. Intent submission  
2. Validation (ILC → ACC → CPC)  
3. Scheduling (arena assignment)  
4. Execution (arena stub)  
5. Reflection + ledger audit  

Hardware multi-tenant OS scheduling is **roadmap**, not present.
