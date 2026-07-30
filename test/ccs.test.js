/**
 * CCS end-to-end + contract gates.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ConstitutionalComputeScheduler,
  CONTRACT_STATUS,
  CIS_TABLE,
  encodeInstruction,
  governedThroughput,
  fabricThroughput,
  G1_MANDALA_DECLARED,
  replayAuditTrail,
  isValidAuditShape,
  assertContinuousChain,
} from '../src/index.js';

function makeScheduler() {
  const ccs = new ConstitutionalComputeScheduler();
  ccs.registerAuthority({
    id: 'a1',
    signature: 'sig-a1',
    allowedActions: ['*'],
    allowedArenas: ['cpu', 'gpu', 'vm', 'llvm', 'twin', 'router'],
  });
  return ccs;
}

function baseIntent(overrides = {}) {
  return {
    id: 'i1',
    action: 'compute.dispatch',
    arena: 'cpu',
    authoritySignature: 'sig-a1',
    ccr: {
      origin: 'test',
      authorityId: 'a1',
      justification: 'unit test',
      evidenceIds: ['e1'],
      continuityParentId: null,
    },
    params: {},
    ...overrides,
    ccr: {
      origin: 'test',
      authorityId: 'a1',
      justification: 'unit test',
      evidenceIds: ['e1'],
      continuityParentId: null,
      ...(overrides.ccr || {}),
    },
  };
}

describe('CCS schedule flow', () => {
  it('allows genesis → child across arenas and audits ledger', () => {
    const ccs = makeScheduler();
    const g = ccs.schedule(baseIntent({ id: 'i-gen', arena: 'cpu' }));
    assert.equal(g.decision, 'allowed');
    assert.ok(g.event?.id);
    assert.equal(g.result.lifecycle.complete, true);

    const c = ccs.schedule(
      baseIntent({
        id: 'i-child',
        arena: 'gpu',
        ccr: { continuityParentId: g.event.id },
      })
    );
    assert.equal(c.decision, 'allowed');
    assert.equal(c.event.parentId, g.event.id);
    assert.ok(isValidAuditShape(c.result.audit));

    const chain = ccs.verifyChain();
    assert.equal(chain.ok, true);
    assert.equal(ccs.replay().length, 2);

    const trail = replayAuditTrail(ccs.ledger);
    assert.equal(trail.count, 2);
  });

  it('denies missing ILC justification', () => {
    const ccs = makeScheduler();
    const r = ccs.schedule(
      baseIntent({
        ccr: { justification: '' },
      })
    );
    assert.equal(r.decision, 'denied');
    assert.match(r.reason, /justification/);
  });

  it('denies ACC signature mismatch', () => {
    const ccs = makeScheduler();
    const r = ccs.schedule(baseIntent({ authoritySignature: 'nope' }));
    assert.equal(r.decision, 'denied');
    assert.match(r.reason, /signature/);
  });

  it('denies CPC when parent missing on non-empty ledger', () => {
    const ccs = makeScheduler();
    const g = ccs.schedule(baseIntent({ id: 'g' }));
    assert.equal(g.decision, 'allowed');
    const r = ccs.schedule(
      baseIntent({
        id: 'orphan',
        ccr: { continuityParentId: null },
      })
    );
    assert.equal(r.decision, 'denied');
    assert.match(r.reason, /CPC/);
  });

  it('denies unknown continuity parent', () => {
    const ccs = makeScheduler();
    ccs.schedule(baseIntent({ id: 'g' }));
    const r = ccs.schedule(
      baseIntent({
        id: 'bad-parent',
        ccr: { continuityParentId: 'evt-999999' },
      })
    );
    assert.equal(r.decision, 'denied');
    assert.match(r.reason, /unknown parent/);
  });

  it('CIS table includes required mnemonics', () => {
    for (const op of ['AUTH', 'CONT', 'REFL', 'AUDT', 'ENRG', 'SYNC', 'EXEC', 'HALT']) {
      assert.ok(CIS_TABLE[op], op);
      const insn = encodeInstruction(/** @type {any} */ (op), {});
      assert.equal(insn.op, op);
    }
  });

  it('CIS kernel halts on auth failure without ledger append', () => {
    const ccs = makeScheduler();
    const before = ccs.ledger.size();
    const r = ccs.schedule(baseIntent({ authoritySignature: 'bad' }));
    assert.equal(r.decision, 'denied');
    assert.equal(ccs.ledger.size(), before);
    assert.ok(r.result.cisTrace.some((t) => t.op === 'HALT'));
  });

  it('contract status table distinguishes enforced vs declared', () => {
    assert.equal(CONTRACT_STATUS.ACC.status, 'enforced');
    assert.equal(CONTRACT_STATUS.CPC.status, 'enforced');
    assert.equal(CONTRACT_STATUS.ILC.status, 'enforced');
    assert.equal(CONTRACT_STATUS.RAC.status, 'partial');
    assert.equal(CONTRACT_STATUS.GCE.status, 'declared');
    assert.equal(CONTRACT_STATUS.MEL.status, 'declared');
    assert.equal(CONTRACT_STATUS.CSS.status, 'declared');
  });

  it('G-1 Mandala params are declared math helpers only', () => {
    assert.equal(G1_MANDALA_DECLARED.status, 'declared');
    const pi = governedThroughput(G1_MANDALA_DECLARED);
    assert.ok(Number.isFinite(pi));
    assert.ok(pi > 0);
    const phi = fabricThroughput([
      G1_MANDALA_DECLARED,
      { C: 250, M: 1000, R: 1.2, Omega: 0.08, P: 0.9 },
    ]);
    assert.ok(phi > pi);
  });

  it('assertContinuousChain rejects broken links', () => {
    const bad = assertContinuousChain([
      {
        id: 'a',
        parentId: null,
        authoritySignature: 'x',
        dispatch: {},
        validation: {},
        sequence: 1,
        continuityDelta: 1,
        status: 'committed',
      },
      {
        id: 'b',
        parentId: 'missing',
        authoritySignature: 'x',
        dispatch: {},
        validation: {},
        sequence: 2,
        continuityDelta: 1,
        status: 'committed',
      },
    ]);
    assert.equal(bad.ok, false);
  });
});
