# Sovereign X Constitutional Compute

Independent reference implementation of **Router-as-Scheduler** — a Constitutional Compute Scheduler (CCS) that validates authority and continuity before stub arena execution, then audits to an in-memory continuity ledger.

**Not** Mandala Rendering Software. **Not** a physical GPU / photonic OS. Sibling repo on `G:\`.

## Honest status (Drive-G-1)

| Surface | Tag | Evidence |
|--------|-----|----------|
| ACC (authority validate) | **enforced** | `src/authority.js`, `test/ccs.test.js` |
| CPC (continuity lineage) | **enforced** | `src/continuity.js`, tests |
| ILC (CCR + lifecycle record) | **enforced** | `src/contracts/ilc.js`, tests |
| RAC / CLP ledger core | **partial** | in-memory append + replay; no durable seal |
| CIS simulation (AUTH…HALT) | **partial** | `src/cis/` — software trace, not hardware ISA |
| Arena stubs (CPU/GPU/VM/…) | **skeleton** | deterministic stub results only |
| CSS / GCE / MEL / LCPM / VCEE | **declared** | `docs/specs/` |
| G-1 Mandala GPU params | **declared** | `src/performance.js` — math helpers, not measured HW |
| Quantum / photonic / driver stack | **roadmap** | charter appendix prose only |

## Quick start

```bash
cd "G:\Sovereign-X-Constitutional-Compute"
npm test
npm run demo
```

Requires Node.js ≥ 18.

## Flow

```
Intent + CCR
  → ILC validate
  → ACC validate (authority signature / action / arena)
  → CPC verify continuity parent
  → CIS kernel (AUTH → CONT → ENRG* → EXEC → REFL → AUDT → SYNC*)
  → Arena stub execute
  → Continuity ledger append (RAC)
```

\*ENRG = skeleton token record; SYNC = declared photonic sync (trace only).

## Contracts-as-code

| Contract | Status | Path |
|----------|--------|------|
| ACC | enforced | `src/contracts/acc.js` |
| CPC | enforced | `src/contracts/cpc.js` |
| ILC | enforced | `src/contracts/ilc.js` |
| RAC | partial | `src/contracts/rac.js` |
| CSS, GCE, MEL, CLP prose | declared / partial | `docs/specs/` |

## Agent protocol (Lineage-first)

This repo **inherits LineageStudio** conventions for agents, skills, modes, and vendor skills — not Mandala `mrs-crew` as primary.

| Adopted | Source |
|---------|--------|
| Foreman `ls-crew` + ESFR #101 | `G:\LineageStudio\.cursor\skills\ls-crew\` / `ls-esfr` |
| Role skills `ls-architect`…`ls-inspector` | `G:\LineageStudio\.cursor\skills\` |
| ModeKey `sage__navigator__evidence-strict` | Lineage mode-cards + `.cursor/lineage-bootstrap.json` |
| Vendor skills `verification`, `verify-this` | Lineage `vendor-skills-map.json` |
| 100-agent roster / modes registry | Lineage `.cursor/mandala-crew/` (pointers only) |

See `AGENTS.md`, `.cursor/rules/lineage-protocol.mdc`, and trail `docs/governance/lineage-crew/trails/sx-ccf-bootstrap-2026-07/`.

## Maturity

Five-dimension scorecard: `docs/scorecards/sovereign-x-constitutional-compute.md`.

| Dimension | Rating |
|-----------|--------|
| Constitutional model | Early |
| Governance methodology | Early |
| Reference implementation | Working local slice |
| Platform engineering | Not started |
| Commercial operations | Not started |

## License

MIT
