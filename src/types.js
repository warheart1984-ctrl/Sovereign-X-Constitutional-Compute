/**
 * Status tags (Drive-G-1):
 * - enforced: covered by tests and runtime gates
 * - partial: implemented with known gaps
 * - declared: specified only
 * - skeleton: stub surface
 */

/** @typedef {'cpu'|'gpu'|'vm'|'llvm'|'twin'|'router'} ArenaId */

/** @typedef {'AUTH'|'CONT'|'REFL'|'AUDT'|'ENRG'|'SYNC'|'EXEC'|'HALT'} CisMnemonic */

/**
 * @typedef {object} ConstitutionalContextRecord
 * @property {string} origin
 * @property {string} authorityId
 * @property {string} justification
 * @property {string[]} evidenceIds
 * @property {Record<string, unknown>} [constraints]
 * @property {string|null} continuityParentId
 */

/**
 * @typedef {object} IntentRequest
 * @property {string} id
 * @property {string} action
 * @property {ArenaId} arena
 * @property {ConstitutionalContextRecord} ccr
 * @property {string} authoritySignature
 * @property {Record<string, unknown>} [params]
 */

/**
 * @typedef {object} AuthorityNode
 * @property {string} id
 * @property {string} signature
 * @property {string[]} allowedActions
 * @property {ArenaId[]} allowedArenas
 */

/**
 * @typedef {object} LedgerEvent
 * @property {string} id
 * @property {string} authoritySignature
 * @property {object} dispatch
 * @property {object} validation
 * @property {number} sequence
 * @property {string|null} parentId
 * @property {number} continuityDelta
 * @property {string} status
 * @property {unknown} [result]
 * @property {object} [reflection]
 */

/**
 * @typedef {object} ScheduleResult
 * @property {'allowed'|'denied'|'halted'} decision
 * @property {string} [reason]
 * @property {LedgerEvent} [event]
 * @property {unknown} [result]
 */

export {};
