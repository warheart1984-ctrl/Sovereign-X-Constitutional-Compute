/**
 * Intent Lifecycle Contract (ILC)
 * Status: enforced for lifecycle stages recorded on schedule;
 * verification/replay beyond ledger replay remain partial.
 *
 * Stages: intent → justification → execution → verification → replay → audit
 */

/** @type {readonly string[]} */
export const ILC_STAGES = Object.freeze([
  'intent',
  'justification',
  'execution',
  'verification',
  'replay',
  'audit',
]);

/**
 * Build a lifecycle record for a scheduled intent.
 * @param {import('../types.js').IntentRequest} intent
 * @param {{ executed: boolean, verified: boolean, audited: boolean }} flags
 */
export function buildLifecycleRecord(intent, flags) {
  const justification = intent.ccr?.justification || null;
  const stages = {
    intent: Boolean(intent?.id && intent?.action),
    justification: Boolean(justification),
    execution: flags.executed,
    verification: flags.verified,
    replay: flags.audited, // replay capability follows audit commit in this reference impl
    audit: flags.audited,
  };
  const complete = ILC_STAGES.every((s) => stages[s]);
  return {
    contract: 'ILC',
    status: complete ? 'enforced' : 'partial',
    stages,
    complete,
    evidenceIds: [...(intent.ccr?.evidenceIds || [])],
  };
}

/**
 * Deny when CCR lacks required justification / evidence (ILC gate).
 * @param {import('../types.js').IntentRequest} intent
 */
export function validateIntentLifecycle(intent) {
  if (!intent?.id) {
    return { ok: false, reason: 'ILC: intent.id required' };
  }
  if (!intent?.action) {
    return { ok: false, reason: 'ILC: intent.action required' };
  }
  if (!intent?.ccr) {
    return { ok: false, reason: 'ILC: Constitutional Context Record (CCR) required' };
  }
  const { origin, authorityId, justification, evidenceIds } = intent.ccr;
  if (!origin) {
    return { ok: false, reason: 'ILC: ccr.origin required' };
  }
  if (!authorityId) {
    return { ok: false, reason: 'ILC: ccr.authorityId required' };
  }
  if (!justification) {
    return { ok: false, reason: 'ILC: ccr.justification required' };
  }
  if (!Array.isArray(evidenceIds) || evidenceIds.length === 0) {
    return { ok: false, reason: 'ILC: ccr.evidenceIds must be a non-empty array' };
  }
  return { ok: true };
}
