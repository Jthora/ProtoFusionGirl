// ULPuzzleManager.test.ts
// Tests for UL Puzzle system (tasks 5111-5134)

import { EventBus } from '../../src/core/EventBus';
import { ULPuzzleManager, PuzzleTarget } from '../../src/ul/ULPuzzleManager';
import { REPAIR_RULE, BANISH_RULE, ALL_PUZZLE_RULES } from '../../src/ul/ULPuzzleRules';

function createTestSetup() {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('UL_PUZZLE_OPENED', (e) => events.push(e));
  eventBus.on('UL_PUZZLE_SYMBOL_SELECTED', (e) => events.push(e));
  eventBus.on('UL_PUZZLE_DEPLOYED', (e) => events.push(e));
  eventBus.on('UL_PUZZLE_SUCCESS', (e) => events.push(e));
  eventBus.on('UL_PUZZLE_FAILURE', (e) => events.push(e));
  const mgr = new ULPuzzleManager(eventBus);
  return { eventBus, mgr, events };
}

describe('ULPuzzleManager', () => {
  it('opens puzzle palette on target click (P3.1)', () => {
    const { mgr, events } = createTestSetup();
    const target: PuzzleTarget = { id: 'robot1', type: 'damaged_robot', x: 100, y: 200, requiredSymbol: 'curve' };
    mgr.registerTarget(target);
    const opened = mgr.openPuzzle('robot1');
    expect(opened).toBe(true);
    expect(mgr.isActive()).toBe(true);
    expect(events.some(e => e.type === 'UL_PUZZLE_OPENED')).toBe(true);
    expect(events.find(e => e.type === 'UL_PUZZLE_OPENED').data.targetId).toBe('robot1');
  });

  it('fails to open puzzle for non-existent target', () => {
    const { mgr } = createTestSetup();
    expect(mgr.openPuzzle('nonexistent')).toBe(false);
    expect(mgr.isActive()).toBe(false);
  });

  it('selects symbols and computes combination', () => {
    const { mgr, events } = createTestSetup();
    // square = Earth, curve = Water → Earth+Water = Curve from cosmicRules
    const result = mgr.selectSymbols('square', 'curve');
    expect(result.resultSymbol).toBe('curve');
    expect(result.baseEntry?.element).toBe('Earth');
    expect(result.modEntry?.element).toBe('Water');
    expect(events.some(e => e.type === 'UL_PUZZLE_SYMBOL_SELECTED')).toBe(true);
  });

  it('returns undefined for invalid symbol combination', () => {
    const { mgr } = createTestSetup();
    const result = mgr.selectSymbols('nonexistent', 'circle');
    expect(result.resultSymbol).toBeUndefined();
  });

  it('correct repair symbol succeeds on damaged robot (P3.2)', () => {
    const { mgr, events } = createTestSetup();
    mgr.registerRule(REPAIR_RULE);
    const target: PuzzleTarget = { id: 'robot1', type: 'damaged_robot', x: 100, y: 200, requiredSymbol: 'curve' };
    mgr.registerTarget(target);
    mgr.openPuzzle('robot1');

    // square=Earth, curve=Water → Earth+Water = Curve (repair)
    const attempt = mgr.deploy('square', 'curve');
    expect(attempt).not.toBeNull();
    expect(attempt!.success).toBe(true);
    expect(attempt!.effect).toBe('repair');
    expect(attempt!.resultSymbol).toBe('curve');
    expect(events.some(e => e.type === 'UL_PUZZLE_SUCCESS')).toBe(true);
  });

  it('wrong symbol fails on damaged robot (P3.3)', () => {
    const { mgr, events } = createTestSetup();
    mgr.registerRule(REPAIR_RULE);
    const target: PuzzleTarget = { id: 'robot1', type: 'damaged_robot', x: 100, y: 200, requiredSymbol: 'curve' };
    mgr.registerTarget(target);
    mgr.openPuzzle('robot1');

    // angle=Fire, wave=Air → Fire+Air = Angle (banish, not repair)
    const attempt = mgr.deploy('angle', 'wave');
    expect(attempt).not.toBeNull();
    expect(attempt!.success).toBe(false);
    expect(events.some(e => e.type === 'UL_PUZZLE_FAILURE')).toBe(true);
  });

  it('failure emits confused response (P3.4)', () => {
    const { mgr, events } = createTestSetup();
    mgr.registerRule(REPAIR_RULE);
    const target: PuzzleTarget = { id: 'robot1', type: 'damaged_robot', x: 100, y: 200, requiredSymbol: 'curve' };
    mgr.registerTarget(target);
    mgr.openPuzzle('robot1');

    mgr.deploy('triangle', 'leap'); // Fire+Fire has no combo
    const failEvent = events.find(e => e.type === 'UL_PUZZLE_FAILURE');
    expect(failEvent).toBeDefined();
    expect(failEvent.data.reason).toBeDefined();
  });

  it('rift sealing with banish symbol succeeds (P3.9)', () => {
    const { mgr, events } = createTestSetup();
    mgr.registerRule(BANISH_RULE);
    const target: PuzzleTarget = { id: 'rift1', type: 'rift', x: 500, y: 300, requiredSymbol: 'angle' };
    mgr.registerTarget(target);
    mgr.openPuzzle('rift1');

    // angle=Fire, wave=Air → Fire+Air = Angle (banish)
    const attempt = mgr.deploy('angle', 'wave');
    expect(attempt).not.toBeNull();
    expect(attempt!.success).toBe(true);
    expect(attempt!.effect).toBe('seal_rift');
    expect(events.some(e => e.type === 'UL_PUZZLE_SUCCESS')).toBe(true);
  });

  it('deploy returns null when not opened', () => {
    const { mgr } = createTestSetup();
    mgr.registerRule(REPAIR_RULE);
    expect(mgr.deploy('square', 'curve')).toBeNull();
  });

  it('closes puzzle after deploy', () => {
    const { mgr } = createTestSetup();
    mgr.registerRule(REPAIR_RULE);
    const target: PuzzleTarget = { id: 'robot1', type: 'damaged_robot', x: 100, y: 200, requiredSymbol: 'curve' };
    mgr.registerTarget(target);
    mgr.openPuzzle('robot1');
    mgr.deploy('square', 'curve');
    expect(mgr.isActive()).toBe(false);
  });

  it('manages targets (register, get, remove)', () => {
    const { mgr } = createTestSetup();
    const target: PuzzleTarget = { id: 'r1', type: 'damaged_robot', x: 0, y: 0 };
    mgr.registerTarget(target);
    expect(mgr.getTarget('r1')).toBeDefined();
    mgr.removeTarget('r1');
    expect(mgr.getTarget('r1')).toBeUndefined();
  });

  it('destroy clears all state', () => {
    const { mgr } = createTestSetup();
    mgr.registerRule(REPAIR_RULE);
    mgr.registerTarget({ id: 'r1', type: 'damaged_robot', x: 0, y: 0 });
    mgr.destroy();
    expect(mgr.isActive()).toBe(false);
    expect(mgr.getRules()).toHaveLength(0);
  });

  // ─── Guided mode (FE-6) ────────────────────────────────────────────────────
  // setGuidedMode / deployGuided were added for the first UL moment scripted
  // event. Single-symbol deploy: correct = success, wrong = bounce (stays open).

  describe('guided mode (FE-6)', () => {
    it('setGuidedMode stores guided symbol', () => {
      const { mgr } = createTestSetup();
      mgr.setGuidedMode('point');
      expect(mgr.getGuidedSymbol()).toBe('point');
    });

    it('getGuidedSymbol returns null when not set', () => {
      const { mgr } = createTestSetup();
      expect(mgr.getGuidedSymbol()).toBeNull();
    });

    it('deployGuided returns null when no puzzle is open', () => {
      const { mgr } = createTestSetup();
      mgr.setGuidedMode('point');
      expect(mgr.deployGuided('point')).toBeNull();
    });

    it('deployGuided returns true and emits UL_PUZZLE_SUCCESS on correct symbol', () => {
      const { mgr, eventBus } = createTestSetup();
      const successes: any[] = [];
      eventBus.on('UL_PUZZLE_SUCCESS', (e) => successes.push(e.data));

      mgr.registerTarget({ id: 'fe6', type: 'damaged_robot', x: 0, y: 0 });
      mgr.setGuidedMode('point');
      mgr.openPuzzle('fe6');
      const result = mgr.deployGuided('point');

      expect(result).toBe(true);
      expect(successes).toHaveLength(1);
      expect(successes[0].targetId).toBe('fe6');
      expect(successes[0].effect).toBe('repair');
    });

    it('deployGuided closes the puzzle on success', () => {
      const { mgr } = createTestSetup();
      mgr.registerTarget({ id: 'fe6', type: 'damaged_robot', x: 0, y: 0 });
      mgr.setGuidedMode('point');
      mgr.openPuzzle('fe6');
      mgr.deployGuided('point');
      expect(mgr.isActive()).toBe(false);
    });

    it('deployGuided clears guided symbol on success', () => {
      const { mgr } = createTestSetup();
      mgr.registerTarget({ id: 'fe6', type: 'damaged_robot', x: 0, y: 0 });
      mgr.setGuidedMode('point');
      mgr.openPuzzle('fe6');
      mgr.deployGuided('point');
      expect(mgr.getGuidedSymbol()).toBeNull();
    });

    it('deployGuided returns false and emits UL_GUIDED_BOUNCE on wrong symbol', () => {
      const { mgr, eventBus } = createTestSetup();
      const bounces: any[] = [];
      eventBus.on('UL_GUIDED_BOUNCE', (e) => bounces.push(e.data));

      mgr.registerTarget({ id: 'fe6', type: 'damaged_robot', x: 0, y: 0 });
      mgr.setGuidedMode('point');
      mgr.openPuzzle('fe6');
      const result = mgr.deployGuided('line');

      expect(result).toBe(false);
      expect(bounces).toHaveLength(1);
      expect(bounces[0].attempted).toBe('line');
    });

    it('deployGuided keeps puzzle open on bounce', () => {
      const { mgr } = createTestSetup();
      mgr.registerTarget({ id: 'fe6', type: 'damaged_robot', x: 0, y: 0 });
      mgr.setGuidedMode('point');
      mgr.openPuzzle('fe6');
      mgr.deployGuided('line'); // wrong symbol
      expect(mgr.isActive()).toBe(true);
    });

    it('deployGuided emits UL_PUZZLE_DEPLOYED on both success and bounce', () => {
      const { mgr: mgrA, eventBus: ebA } = createTestSetup();
      const deployedA: any[] = [];
      ebA.on('UL_PUZZLE_DEPLOYED', (e) => deployedA.push(e.data));
      mgrA.registerTarget({ id: 'fe6', type: 'damaged_robot', x: 0, y: 0 });
      mgrA.setGuidedMode('point');
      mgrA.openPuzzle('fe6');
      mgrA.deployGuided('point'); // success
      expect(deployedA).toHaveLength(1);

      const { mgr: mgrB, eventBus: ebB } = createTestSetup();
      const deployedB: any[] = [];
      ebB.on('UL_PUZZLE_DEPLOYED', (e) => deployedB.push(e.data));
      mgrB.registerTarget({ id: 'fe6', type: 'damaged_robot', x: 0, y: 0 });
      mgrB.setGuidedMode('point');
      mgrB.openPuzzle('fe6');
      mgrB.deployGuided('line'); // bounce
      expect(deployedB).toHaveLength(1);
    });

    it('player can retry after a bounce and succeed', () => {
      const { mgr, eventBus } = createTestSetup();
      const successes: any[] = [];
      eventBus.on('UL_PUZZLE_SUCCESS', (e) => successes.push(e.data));

      mgr.registerTarget({ id: 'fe6', type: 'damaged_robot', x: 0, y: 0 });
      mgr.setGuidedMode('point');
      mgr.openPuzzle('fe6');
      mgr.deployGuided('line');  // wrong
      mgr.deployGuided('angle'); // wrong again
      mgr.deployGuided('point'); // correct
      expect(successes).toHaveLength(1);
    });
  });
});
