/**
 * Sovereign X Continuity Kernel Source Spec (SX-CKSS) — reference simulation.
 * Status: partial — pseudocode made executable; not an OS kernel.
 */

import { encodeInstruction } from './instructions.js';

/**
 * @param {object} input
 * @param {import('../types.js').IntentRequest} input.intent
 * @param {{ ok: boolean, reason?: string }} input.auth
 * @param {{ ok: boolean, reason?: string }} input.continuity
 * @param {() => unknown} input.execute
 */
export function runContinuityKernel(input) {
  const trace = [];
  const push = (mnemonic, payload) => {
    const insn = encodeInstruction(mnemonic, payload);
    trace.push(insn);
    return insn;
  };

  push('AUTH', { authorityId: input.intent.ccr.authorityId });
  if (!input.auth.ok) {
    push('HALT', { reason: input.auth.reason });
    return { halted: true, reason: input.auth.reason, trace, result: null };
  }

  push('CONT', { parentId: input.intent.ccr.continuityParentId ?? null });
  if (!input.continuity.ok) {
    push('HALT', { reason: input.continuity.reason });
    return { halted: true, reason: input.continuity.reason, trace, result: null };
  }

  // ENRG is skeleton — records intent only; no physical power routing.
  push('ENRG', { token: input.intent.params?.energyToken ?? 'declared' });

  const result = input.execute();
  push('EXEC', { arena: input.intent.arena });
  push('REFL', { intentId: input.intent.id });
  push('AUDT', { intentId: input.intent.id });

  // SYNC is declared — photonic lattice not implemented.
  push('SYNC', { note: 'declared — no photonic hardware' });

  return { halted: false, reason: null, trace, result };
}
