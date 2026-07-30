/**
 * @sovereign-x/constitutional-compute — public API
 */

export { ConstitutionalComputeScheduler } from './scheduler.js';
export { AuthorityRegistry } from './authority.js';
export { ContinuityLedger } from './ledger.js';
export { verifyContinuity, assertContinuousChain } from './continuity.js';
export { arenas, getArena, ARENA_IDS } from './arenas/index.js';
export { CIS_TABLE, encodeInstruction } from './cis/instructions.js';
export { runContinuityKernel } from './cis/kernel.js';
export {
  governedThroughput,
  fabricThroughput,
  lawfulEnergyTerm,
  G1_MANDALA_DECLARED,
} from './performance.js';
export {
  CONTRACT_STATUS,
  ILC_STAGES,
  buildLifecycleRecord,
  validateIntentLifecycle,
  replayAuditTrail,
  isValidAuditShape,
} from './contracts/index.js';
