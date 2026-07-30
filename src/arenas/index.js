/**
 * Multi-arena stubs — each execute() is a governed stub, not real hardware.
 * Status: skeleton (dispatch surface) / partial (deterministic result shape).
 */

/** @typedef {import('../types.js').ArenaId} ArenaId */
/** @typedef {import('../types.js').IntentRequest} IntentRequest */

/**
 * @param {ArenaId} id
 * @param {string} label
 */
function makeArena(id, label) {
  return {
    id,
    label,
    status: 'skeleton',
    /**
     * @param {IntentRequest} intent
     * @param {{ sequence: number }} ctx
     */
    execute(intent, ctx) {
      return {
        arena: id,
        label,
        intentId: intent.id,
        action: intent.action,
        sequence: ctx.sequence,
        output: {
          ok: true,
          note: `${label} stub executed under CCS governance`,
          params: intent.params || {},
        },
      };
    },
  };
}

export const arenas = {
  cpu: makeArena('cpu', 'CPU Arena'),
  gpu: makeArena('gpu', 'GPU Arena'),
  vm: makeArena('vm', 'VM Arena'),
  llvm: makeArena('llvm', 'LLVM Arena'),
  twin: makeArena('twin', 'Twin Arena'),
  router: makeArena('router', 'Router Arena'),
};

/** @param {ArenaId} id */
export function getArena(id) {
  const arena = arenas[id];
  if (!arena) {
    throw new Error(`Unknown arena: ${id}`);
  }
  return arena;
}

export const ARENA_IDS = Object.keys(arenas);
