/**
 * Constitutional Instruction Set (CIS) — simulated mnemonics.
 * Status: partial (in-process simulation only; not a hardware ISA).
 */

/** @typedef {import('../types.js').CisMnemonic} CisMnemonic */

/** @type {Record<CisMnemonic, { role: string; status: string }>} */
export const CIS_TABLE = {
  AUTH: { role: 'Validate authority signature', status: 'enforced' },
  CONT: { role: 'Preserve continuity lineage', status: 'enforced' },
  REFL: { role: 'Reflect execution feedback', status: 'enforced' },
  AUDT: { role: 'Record event in ledger', status: 'enforced' },
  ENRG: { role: 'Route lawful energy token', status: 'skeleton' },
  SYNC: { role: 'Synchronize photonic lattice', status: 'declared' },
  EXEC: { role: 'Execute lawful instruction', status: 'enforced' },
  HALT: { role: 'Suspend unlawful state', status: 'enforced' },
};

/**
 * @param {CisMnemonic} mnemonic
 * @param {Record<string, unknown>} payload
 */
export function encodeInstruction(mnemonic, payload = {}) {
  if (!CIS_TABLE[mnemonic]) {
    throw new Error(`Unknown CIS mnemonic: ${mnemonic}`);
  }
  return {
    op: mnemonic,
    role: CIS_TABLE[mnemonic].role,
    status: CIS_TABLE[mnemonic].status,
    payload,
  };
}
