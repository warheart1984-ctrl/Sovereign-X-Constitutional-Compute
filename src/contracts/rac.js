/**
 * Replay & Audit Contract (RAC)
 * Status: partial — in-memory append-only ledger + deterministic replay;
 * durable storage and cryptographic seals are declared/roadmap.
 */

import { ContinuityLedger } from '../ledger.js';

export { ContinuityLedger };

/**
 * Replay ledger events and return RAC audit projections.
 * @param {ContinuityLedger} ledger
 */
export function replayAuditTrail(ledger) {
  const events = ledger.replay();
  return {
    contract: 'RAC',
    status: 'partial',
    count: events.length,
    records: events.map((e) => ledger.auditRecord(e.id)),
  };
}

/**
 * Verify that audit records match L(Ei) = { Ai, Di, Vi, Ti, Δi }.
 * @param {ReturnType<ContinuityLedger['auditRecord']>} record
 */
export function isValidAuditShape(record) {
  if (!record) return false;
  return (
    record.Ai != null &&
    record.Di != null &&
    record.Vi != null &&
    typeof record.Ti === 'number' &&
    typeof record.Δi === 'number'
  );
}
