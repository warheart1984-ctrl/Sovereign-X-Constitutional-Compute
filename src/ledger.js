/**
 * Continuity Ledger Protocol (CLP) + Replay & Audit Contract (RAC) — partial/enforced core.
 * Events are append-only in-memory; replay reconstructs ordered history.
 *
 * Timestamps are sequence-based (deterministic). Wall-clock is not used in continuity identity.
 */

/** @typedef {import('./types.js').LedgerEvent} LedgerEvent */

export class ContinuityLedger {
  constructor() {
    /** @type {Map<string, LedgerEvent>} */
    this._events = new Map();
    /** @type {string[]} */
    this._order = [];
    this._seq = 0;
  }

  size() {
    return this._order.length;
  }

  /** @param {string} id */
  get(id) {
    return this._events.get(id) || null;
  }

  tip() {
    if (!this._order.length) return null;
    return this._events.get(this._order[this._order.length - 1]) || null;
  }

  /**
   * @param {object} input
   * @param {string} input.authoritySignature
   * @param {object} input.dispatch
   * @param {object} input.validation
   * @param {string|null} input.parentId
   * @param {number} [input.continuityDelta]
   * @param {string} [input.status]
   * @param {unknown} [input.result]
   * @param {object} [input.reflection]
   * @returns {LedgerEvent}
   */
  append(input) {
    this._seq += 1;
    const id = `evt-${String(this._seq).padStart(6, '0')}`;
    /** @type {LedgerEvent} */
    const event = {
      id,
      authoritySignature: input.authoritySignature,
      dispatch: Object.freeze({ ...input.dispatch }),
      validation: Object.freeze({ ...input.validation }),
      sequence: this._seq,
      parentId: input.parentId ?? null,
      continuityDelta: input.continuityDelta ?? 1,
      status: input.status || 'committed',
      result: input.result,
      reflection: input.reflection ? Object.freeze({ ...input.reflection }) : undefined,
    };
    Object.freeze(event);
    this._events.set(id, event);
    this._order.push(id);
    return event;
  }

  /** @returns {LedgerEvent[]} */
  replay() {
    return this._order.map((id) => this._events.get(id));
  }

  /**
   * Immutable audit view for RAC.
   * L(Ei) = { Ai, Di, Vi, Ti, Δi } where Ti := sequence (deterministic).
   */
  auditRecord(id) {
    const e = this.get(id);
    if (!e) return null;
    return {
      Ai: e.authoritySignature,
      Di: e.dispatch,
      Vi: e.validation,
      Ti: e.sequence,
      Δi: e.continuityDelta,
      status: e.status,
      parentId: e.parentId,
    };
  }
}
