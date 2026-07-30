# AGENTS.md — Sovereign X Constitutional Compute

> Binding on every AI agent operating in this repository.
> **Primary protocol:** LineageStudio (`G:\LineageStudio`), not Mandala MRS crew.

## Precedence

1. Drive-G-1 / Drive-G-2 (evidence-bound claims; five maturity dimensions)
2. This file + LineageStudio agent/skills/modes conventions
3. Optional Mandala constitutional *patterns* (CCR / ILC / CKL) for design analogy only
4. Never claim hardware / photonic / quantum enforcement without runtime evidence

## Status tags (mandatory)

Use only: `enforced` | `partial` | `declared` | `skeleton` | `roadmap`.

| Tag | Meaning |
|-----|---------|
| enforced | Runtime gate + tests pass |
| partial | Implemented with known gaps |
| declared | Spec / docs only |
| skeleton | Stub surface |
| roadmap | Future intent, not present capability |

## Lineage operating protocol (primary)

Prefer these over Mandala `mrs-*`:

| Role | Lineage skill | Path |
|------|---------------|------|
| Crew foreman | `ls-crew` | `G:\LineageStudio\.cursor\skills\ls-crew\SKILL.md` |
| Architect | `ls-architect` | `G:\LineageStudio\.cursor\skills\ls-architect\SKILL.md` |
| Builder | `ls-builder` | `G:\LineageStudio\.cursor\skills\ls-builder\SKILL.md` |
| Coding / implement | `ls-coding` / `ls-implementor` | `G:\LineageStudio\.cursor\skills\` |
| Reviewer | `ls-reviewer` | `G:\LineageStudio\.cursor\skills\ls-reviewer\SKILL.md` |
| Inspector | `ls-inspector` | `G:\LineageStudio\.cursor\skills\ls-inspector\SKILL.md` |
| ESFR | `ls-esfr` | `G:\LineageStudio\.cursor\skills\ls-esfr\SKILL.md` |

**Modes:** `G:\LineageStudio\.cursor\mandala-crew\modes-registry.json` (1000 ModeKeys)  
**Vendor skills map:** `G:\LineageStudio\.cursor\mandala-crew\vendor-skills-map.json`  
**Agents roster:** `G:\LineageStudio\.cursor\agents\ls-*.md`  
**Rules:** `G:\LineageStudio\.cursor\rules\`

Local thin pointers live under `.cursor/skills/` in this repo.

## Core principles (this product)

1. **No schedule without intent + CCR** (ILC)
2. **No dispatch without ACC** (registered authority + signature)
3. **No non-genesis execution without CPC parent**
4. **Every allowed dispatch appends a ledger event** (RAC/CLP core)
5. **Hardware charter numbers are declared** — never “enforced GPU TFLOPs”

## Protected claims

Do **not** modify docs or README to upgrade `declared` → `enforced` without adding tests and runtime gates in the same change.

## Tests before commit

```bash
npm test
```

## Mandala (optional, secondary)

Skim `G:\Mandala Rendering Software\engine\governance\` for CKL/policy patterns only.  
Do **not** use `mrs-crew` as the primary operating crew for this repository.
