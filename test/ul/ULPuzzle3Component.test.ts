// ULPuzzle3Component.test.ts — Task 7213
// Tests: 3-component expanded puzzle system (communication, navigation, combat)
// Uses jest.mock to avoid Phaser initialization in test env.

jest.mock('phaser', () => ({ __esModule: true, default: {} }));
jest.mock('../../src/ul/ULPuzzleOverlay', () => ({ ULPuzzleOverlay: jest.fn() }));
jest.mock('../../src/ul/ulWasmAdapter', () => ({ getULEngine: jest.fn() }));
jest.mock('../../src/ul/ULGlyphRenderer', () => ({ ULGlyphRenderer: jest.fn() }));
jest.mock('../../src/ul/ulEventBus', () => ({ ulEventBus: { emit: jest.fn() } }));

import {
  ULPuzzleController,
  COMMUNICATION_TARGET_GIR,
  NAVIGATION_TARGET_GIR,
  COMBAT_TARGET_GIR,
  REPAIR_TARGET_GIR,
  RIFT_SEAL_TARGET_GIR,
} from '../../src/ul/ULPuzzleController';

describe('ULPuzzleController 3-component expansion', () => {
  let ctrl: ULPuzzleController;

  beforeEach(() => {
    ctrl = new ULPuzzleController();
  });

  it('getTargetGir returns correct GIR for each puzzle type', () => {
    expect(ctrl.getTargetGir('damaged_robot')).toBe(REPAIR_TARGET_GIR);
    expect(ctrl.getTargetGir('rift')).toBe(RIFT_SEAL_TARGET_GIR);
    expect(ctrl.getTargetGir('communication')).toBe(COMMUNICATION_TARGET_GIR);
    expect(ctrl.getTargetGir('navigation')).toBe(NAVIGATION_TARGET_GIR);
    expect(ctrl.getTargetGir('combat')).toBe(COMBAT_TARGET_GIR);
  });

  it('all GIRs have exactly 3 nodes (base + modifier + harmonic) (P5.9)', () => {
    for (const gir of [COMMUNICATION_TARGET_GIR, NAVIGATION_TARGET_GIR, COMBAT_TARGET_GIR]) {
      expect(gir.nodes).toHaveLength(3);
      expect(gir.edges.length).toBeGreaterThanOrEqual(2);
    }
    // Original puzzles also have 3 nodes
    expect(REPAIR_TARGET_GIR.nodes).toHaveLength(3);
    expect(RIFT_SEAL_TARGET_GIR.nodes).toHaveLength(3);
  });

  it('resolves communication_success for exact grade', () => {
    const target = { id: 'npc1', type: 'communication' as const, x: 0, y: 0 };
    const effect = ctrl.resolveEffect(target, { success: true, score: 0.95, grade: 'exact' });
    expect(effect.type).toBe('communication_success');
  });

  it('resolves navigation_partial for partial grade', () => {
    const target = { id: 'nav1', type: 'navigation' as const, x: 0, y: 0 };
    const effect = ctrl.resolveEffect(target, { success: false, score: 0.55, grade: 'partial' });
    expect(effect.type).toBe('navigation_partial');
  });

  it('resolves combat_failed for unrelated grade', () => {
    const target = { id: 'foe1', type: 'combat' as const, x: 0, y: 0 };
    const effect = ctrl.resolveEffect(target, { success: false, score: 0.15, grade: 'unrelated' });
    expect(effect.type).toBe('combat_failed');
  });

  it('existing repair/rift puzzles still work', () => {
    const repairTarget = { id: 'r1', type: 'damaged_robot' as const, x: 0, y: 0 };
    const repairEffect = ctrl.resolveEffect(repairTarget, { success: true, score: 0.9, grade: 'exact' });
    expect(repairEffect.type).toBe('repair_success');

    const riftTarget = { id: 'rift1', type: 'rift' as const, x: 0, y: 0 };
    const riftEffect = ctrl.resolveEffect(riftTarget, { success: true, score: 0.85, grade: 'close' });
    expect(riftEffect.type).toBe('rift_sealed');
  });

  it('communication + navigation + combat are distinct puzzle contexts (P5.9)', () => {
    const types = new Set([
      COMMUNICATION_TARGET_GIR.nodes[0].label,
      NAVIGATION_TARGET_GIR.nodes[0].label,
      COMBAT_TARGET_GIR.nodes[0].label,
    ]);
    expect(types.size).toBe(3); // all unique base labels
  });
});
