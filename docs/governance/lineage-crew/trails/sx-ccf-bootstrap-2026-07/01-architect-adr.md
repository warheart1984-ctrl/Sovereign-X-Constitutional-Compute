# 01 Architect ADR

**Role:** ls-architect (Lineage)  
**ModeKey:** sage__navigator__evidence-strict  
**softwareCreationMode lens:** Architect-Kernel + Protocol (conceptual)

## Intent

Build an independent CCS repo: Router-as-Scheduler with ACC/CPC/ILC/ledger/CIS + arena stubs.

## Scope

- In: Node ESM package, scheduler, ledger, CIS sim, tests, evidence-bound docs, Lineage wiring
- Out: Real OS/GPU/LLVM/VM, Mandala MRS merge, vendor cloud lock-in

## Contracts

ACC, CPC, ILC, RAC/CLP enforced in software; hardware volumes declared.

## File manifest

`src/*`, `test/*`, `docs/*`, `constitution/CHARTER.md`, `.cursor/*`

## Acceptance

- [ ] `npm test` passes
- [ ] Demo schedules genesis + child
- [ ] README status tags honest

## Handoff

Builder → Implementor → Reviewer → Inspector → ESFR #101
