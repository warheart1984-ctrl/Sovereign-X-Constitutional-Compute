/**
 * Constitutional Compute Scheduler (CCS) — Router-as-Scheduler reference impl.
 *
 * Flow (enforced in-process):
 *   Intent → ACC validate → CPC continuity → schedule arena → EXEC → REFL → AUDT ledger
 *
 * Status: partial — software simulation of constitutional scheduling;
 * not an OS kernel, GPU driver, or photonic fabric.
 */

import { AuthorityRegistry } from './authority.js';
import { verifyContinuity, assertContinuousChain } from './continuity.js';
import { ContinuityLedger } from './ledger.js';
import { getArena } from './arenas/index.js';
import { runContinuityKernel } from './cis/kernel.js';
import {
  validateIntentLifecycle,
  buildLifecycleRecord,
} from './contracts/ilc.js';

export class ConstitutionalComputeScheduler {
  /**
   * @param {{ authority?: AuthorityRegistry, ledger?: ContinuityLedger }} [opts]
   */
  constructor(opts = {}) {
    this.authority = opts.authority || new AuthorityRegistry();
    this.ledger = opts.ledger || new ContinuityLedger();
  }

  /** @param {import('./types.js').AuthorityNode} node */
  registerAuthority(node) {
    this.authority.register(node);
  }

  /**
   * Schedule a constitutional intent into an arena under ACC/CPC/ILC.
   * @param {import('./types.js').IntentRequest} intent
   * @returns {import('./types.js').ScheduleResult}
   */
  schedule(intent) {
    const ilc = validateIntentLifecycle(intent);
    if (!ilc.ok) {
      return { decision: 'denied', reason: ilc.reason };
    }

    const auth = this.authority.validate(
      intent.ccr.authorityId,
      intent.authoritySignature,
      intent.action,
      intent.arena
    );

    const continuity = verifyContinuity(this.ledger, intent.ccr.continuityParentId);

    const kernel = runContinuityKernel({
      intent,
      auth,
      continuity,
      execute: () => {
        const arena = getArena(intent.arena);
        const nextSeq = this.ledger.size() + 1;
        return arena.execute(intent, { sequence: nextSeq });
      },
    });

    if (kernel.halted) {
      // Denied paths may still audit a halt record when genesis/continuity allows linking.
      // Prefer not to append without a valid parent when ledger is non-empty and parent missing.
      if (auth.ok === false || continuity.ok === false) {
        return {
          decision: 'denied',
          reason: kernel.reason,
          result: { cisTrace: kernel.trace },
        };
      }
      return {
        decision: 'halted',
        reason: kernel.reason,
        result: { cisTrace: kernel.trace },
      };
    }

    const lifecycle = buildLifecycleRecord(intent, {
      executed: true,
      verified: true,
      audited: true,
    });

    const reflection = {
      intentId: intent.id,
      arena: intent.arena,
      cisOps: kernel.trace.map((t) => t.op),
      lifecycle,
    };

    const event = this.ledger.append({
      authoritySignature: intent.authoritySignature,
      dispatch: {
        intentId: intent.id,
        action: intent.action,
        arena: intent.arena,
        origin: intent.ccr.origin,
        justification: intent.ccr.justification,
        evidenceIds: [...intent.ccr.evidenceIds],
        params: intent.params || {},
      },
      validation: {
        acc: true,
        cpc: true,
        ilc: true,
        continuityParentId: intent.ccr.continuityParentId ?? null,
      },
      parentId: intent.ccr.continuityParentId ?? null,
      continuityDelta: 1,
      status: 'committed',
      result: kernel.result,
      reflection,
    });

    return {
      decision: 'allowed',
      event,
      result: {
        arenaResult: kernel.result,
        cisTrace: kernel.trace,
        audit: this.ledger.auditRecord(event.id),
        lifecycle,
      },
    };
  }

  /** Deterministic full-history replay (RAC). */
  replay() {
    return this.ledger.replay();
  }

  /** Continuity chain health check. */
  verifyChain() {
    return assertContinuousChain(this.ledger.replay());
  }
}

export default ConstitutionalComputeScheduler;
