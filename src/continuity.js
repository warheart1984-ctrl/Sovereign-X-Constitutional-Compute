/**
 * Continuity Preservation Contract (CPC) — enforced lineage checks against ledger.
 */

/** @typedef {import('./types.js').LedgerEvent} LedgerEvent */

/**
 * @param {import('./ledger.js').ContinuityLedger} ledger
 * @param {string|null|undefined} parentId
 */
export function verifyContinuity(ledger, parentId) {
  if (parentId == null || parentId === '') {
    // Genesis allowed only when ledger is empty.
    if (ledger.size() === 0) {
      return { ok: true, genesis: true };
    }
    return { ok: false, reason: 'CPC: non-genesis dispatch requires continuityParentId' };
  }
  const parent = ledger.get(parentId);
  if (!parent) {
    return { ok: false, reason: `CPC: unknown parent lineage '${parentId}'` };
  }
  if (parent.status !== 'committed') {
    return { ok: false, reason: `CPC: parent '${parentId}' is not committed` };
  }
  return { ok: true, parent };
}

/**
 * Continuity chain predicate: every non-genesis event links to a prior event.
 * @param {LedgerEvent[]} events
 */
export function assertContinuousChain(events) {
  const seen = new Set();
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (i === 0) {
      if (e.parentId != null) {
        return { ok: false, reason: 'first event must be genesis (parentId null)' };
      }
    } else if (!e.parentId || !seen.has(e.parentId)) {
      return { ok: false, reason: `broken link at ${e.id}` };
    }
    seen.add(e.id);
  }
  return { ok: true };
}
