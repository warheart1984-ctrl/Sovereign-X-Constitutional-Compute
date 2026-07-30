/**
 * Governed performance formulas from Hardware Charter — pure math helpers.
 * Status: declared (theoretical model; values are not measured hardware).
 *
 * Π = (C * M) / (R + Ω) * P   [as used in charter examples]
 * Note: charter notation was ambiguous; this module documents the formula used.
 */

/**
 * @param {{ C: number, M: number, R: number, Omega: number, P: number }} p
 */
export function governedThroughput(p) {
  const { C, M, R, Omega, P } = p;
  if (R + Omega <= 0) throw new Error('R + Ω must be > 0');
  return (C * M) / (R + Omega) * P;
}

/**
 * Fabric sum Φ = Σ Π_i
 * @param {Array<{ C: number, M: number, R: number, Omega: number, P: number }>} arenas
 */
export function fabricThroughput(arenas) {
  return arenas.reduce((sum, a) => sum + governedThroughput(a), 0);
}

/**
 * Lawful energy contribution E_i = P_i / (R_i + Ω_i)  (charter energy curve form)
 * @param {{ P: number, R: number, Omega: number }} p
 */
export function lawfulEnergyTerm(p) {
  return p.P / (p.R + p.Omega);
}

/** Declared G-1 Mandala GPU example parameters — NOT physical hardware. */
export const G1_MANDALA_DECLARED = Object.freeze({
  C: 1.2e3,
  M: 12e3,
  R: 0.9,
  Omega: 0.05,
  P: 0.85,
  status: 'declared',
  note: 'Theoretical charter numbers; no quantum/photonic hardware exists in this repo.',
});
