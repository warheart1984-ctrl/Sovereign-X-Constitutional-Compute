/**
 * Demo: two lawful schedules (CPU then GPU) + one denied schedule.
 * Status: local operator demo — not a hardware launch.
 */

import { ConstitutionalComputeScheduler } from './scheduler.js';
import { G1_MANDALA_DECLARED, governedThroughput } from './performance.js';

const ccs = new ConstitutionalComputeScheduler();

ccs.registerAuthority({
  id: 'auth-router-1',
  signature: 'sig-lawful-alpha',
  allowedActions: ['compute.dispatch', 'kernel.assist'],
  allowedArenas: ['cpu', 'gpu', 'vm'],
});

const genesis = ccs.schedule({
  id: 'intent-001',
  action: 'compute.dispatch',
  arena: 'cpu',
  authoritySignature: 'sig-lawful-alpha',
  ccr: {
    origin: 'demo',
    authorityId: 'auth-router-1',
    justification: 'Bootstrap continuity with CPU arena stub',
    evidenceIds: ['ev-demo-1'],
    continuityParentId: null,
    constraints: {},
  },
  params: { workload: 'orchestrate' },
});

console.log('genesis:', genesis.decision, genesis.event?.id);

const child = ccs.schedule({
  id: 'intent-002',
  action: 'kernel.assist',
  arena: 'gpu',
  authoritySignature: 'sig-lawful-alpha',
  ccr: {
    origin: 'demo',
    authorityId: 'auth-router-1',
    justification: 'GPU assist under Router governance (stub arena)',
    evidenceIds: ['ev-demo-2'],
    continuityParentId: genesis.event.id,
    constraints: {},
  },
  params: { kernel: 'assist-stub' },
});

console.log('child:', child.decision, child.event?.id);

const denied = ccs.schedule({
  id: 'intent-003',
  action: 'kernel.assist',
  arena: 'gpu',
  authoritySignature: 'wrong-sig',
  ccr: {
    origin: 'demo',
    authorityId: 'auth-router-1',
    justification: 'Should fail ACC',
    evidenceIds: ['ev-demo-3'],
    continuityParentId: child.event.id,
    constraints: {},
  },
});

console.log('denied:', denied.decision, denied.reason);
console.log('chain ok:', ccs.verifyChain());
console.log(
  'G-1 Mandala Π (declared math only):',
  governedThroughput(G1_MANDALA_DECLARED),
  G1_MANDALA_DECLARED.status
);
