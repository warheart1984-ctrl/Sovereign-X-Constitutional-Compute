# Drive-G maturity scorecard — sovereign-x-constitutional-compute

**Template:** `G:\docs\governance\MATURITY_SCORECARD_TEMPLATE.md`  
**Review date:** 2026-07-29  
**Repository:** `G:\Sovereign-X-Constitutional-Compute`

## Snapshot

| Field | Value |
|-------|-------|
| Project ID | `sovereign-x-constitutional-compute` |
| Audience | operators (local Node reference) |
| Evidence anchor | `npm test` in this repo |

## Dimension ratings

| Dimension | Rating | One-line justification |
|-----------|--------|------------------------|
| Constitutional model | Early | ACC/CPC/ILC gates + CIS sim; no OS-level constitution |
| Governance methodology | Early | Drive-G-1 tags + Lineage skill pointers; no promotion CI |
| Reference implementation | Working local slice | CCS schedule → arena stub → ledger; tests cover denies |
| Platform engineering | Not started | No CI deploy, persistence, or multi-host |
| Commercial operations | Not started | No signup / billing / self-serve |

## Operator vs commercial

| Audience | Ready? | Evidence |
|----------|--------|----------|
| Operator (run locally) | Partial | `npm test` / `npm run demo` |
| User / commercial | No | Not claimed |

## Notes

The **engine** (in-process constitutional scheduler) exists as a thin reference.  
The **factory** (hardware, durable ledger, commercial ops) is early / not started.

Do not collapse “CCS demo passes” into “production governed fabric.”
