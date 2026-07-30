# 06 Engineer Standards (ESFR #101)

**Role:** ls-esfr  
**PromotionEligibility:** `PROMOTE_WITH_GAPS`

## Summary

Software CCS vertical slice is shippable as a **reference library** for local operators. Not platform/commercial ready. Hardware volumes must stay labeled declared.

## Test matrix (local)

| Probe | Result |
|-------|--------|
| Unit CCS gates | PASS (see `npm test`) |
| Demo genesis+child | PASS (manual `npm run demo`) |
| CI | GAP |
| Hardware claims absent from runtime | PASS |

## Gaps to close before PROMOTE

- CI workflow
- Optional durable ledger adapter
