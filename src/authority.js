/**
 * Authority Chain Contract (ACC) — enforced for registered nodes + action/arena allow-lists.
 */

/** @typedef {import('./types.js').AuthorityNode} AuthorityNode */
/** @typedef {import('./types.js').ArenaId} ArenaId */

export class AuthorityRegistry {
  constructor() {
    /** @type {Map<string, AuthorityNode>} */
    this.nodes = new Map();
  }

  /** @param {AuthorityNode} node */
  register(node) {
    if (!node?.id || !node?.signature) {
      throw new Error('ACC: authority node requires id and signature');
    }
    this.nodes.set(node.id, {
      id: node.id,
      signature: node.signature,
      allowedActions: [...(node.allowedActions || [])],
      allowedArenas: [...(node.allowedArenas || [])],
    });
  }

  /**
   * @param {string} authorityId
   * @param {string} signature
   * @param {string} action
   * @param {ArenaId} arena
   */
  validate(authorityId, signature, action, arena) {
    const node = this.nodes.get(authorityId);
    if (!node) {
      return { ok: false, reason: 'ACC: unknown authority' };
    }
    if (node.signature !== signature) {
      return { ok: false, reason: 'ACC: signature mismatch' };
    }
    if (node.allowedActions.length && !node.allowedActions.includes(action) && !node.allowedActions.includes('*')) {
      return { ok: false, reason: `ACC: action '${action}' not permitted` };
    }
    if (node.allowedArenas.length && !node.allowedArenas.includes(arena)) {
      return { ok: false, reason: `ACC: arena '${arena}' not permitted` };
    }
    return { ok: true, node };
  }
}
