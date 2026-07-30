/**
 * Contracts-as-code module index.
 *
 * Implemented (code + tests): ACC, CPC, ILC, RAC
 * Spec / declared only (see docs/specs/): CSS, GCE, MEL, CLP (protocol prose), LCPM, VCEE
 */

export { AuthorityRegistry } from './acc.js';
export { verifyContinuity, assertContinuousChain } from './cpc.js';
export {
  ILC_STAGES,
  buildLifecycleRecord,
  validateIntentLifecycle,
} from './ilc.js';
export {
  ContinuityLedger,
  replayAuditTrail,
  isValidAuditShape,
} from './rac.js';

/** @type {Record<string, { status: string; module: string|null; note: string }>} */
export const CONTRACT_STATUS = {
  ACC: {
    status: 'enforced',
    module: 'src/contracts/acc.js',
    note: 'Authority registry + signature/action/arena validation',
  },
  CPC: {
    status: 'enforced',
    module: 'src/contracts/cpc.js',
    note: 'Parent lineage / genesis continuity checks',
  },
  ILC: {
    status: 'enforced',
    module: 'src/contracts/ilc.js',
    note: 'CCR + lifecycle stage recording on schedule',
  },
  RAC: {
    status: 'partial',
    module: 'src/contracts/rac.js',
    note: 'In-memory ledger replay; durable seals declared',
  },
  CSS: {
    status: 'declared',
    module: null,
    note: 'Constitutional Scheduler Specification — docs/specs/CSS.md; runtime is CCS class',
  },
  GCE: {
    status: 'declared',
    module: null,
    note: 'GPU Contract for Constitutional Execution — docs/specs/GCE.md; arena stub only',
  },
  MEL: {
    status: 'declared',
    module: null,
    note: 'Mandala Energy Law — docs/specs/MEL.md; ENRG mnemonic is skeleton',
  },
  CLP: {
    status: 'partial',
    module: 'src/ledger.js',
    note: 'Continuity Ledger Protocol core in ContinuityLedger; full protocol prose in docs',
  },
};
