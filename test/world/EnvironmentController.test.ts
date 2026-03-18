// EnvironmentController.test.ts — tests for tasks 6321-6323

import { EventBus } from '../../src/core/EventBus';
import { EnvironmentController } from '../../src/world/EnvironmentController';

describe('EnvironmentController', () => {
  let eventBus: EventBus;
  let ctrl: EnvironmentController;

  beforeEach(() => {
    eventBus = new EventBus();
    ctrl = new EnvironmentController(eventBus);
  });

  // ── Doors (6321) ──

  describe('Doors', () => {
    beforeEach(() => {
      ctrl.registerDoor({ id: 'd1', nodeId: 'node_a', open: false, locked: false });
      ctrl.registerDoor({ id: 'd2', nodeId: 'node_a', open: false, locked: true });
    });

    it('opens an unlocked door and emits event', () => {
      const events: any[] = [];
      eventBus.on('DOOR_STATE_CHANGED', (e) => events.push(e.data));

      expect(ctrl.openDoor('d1')).toBe(true);
      expect(ctrl.getDoor('d1')!.open).toBe(true);
      expect(events.length).toBe(1);
      expect(events[0]).toEqual({ doorId: 'd1', nodeId: 'node_a', open: true });
    });

    it('cannot open a locked door', () => {
      expect(ctrl.openDoor('d2')).toBe(false);
      expect(ctrl.getDoor('d2')!.open).toBe(false);
    });

    it('closes an open door', () => {
      ctrl.openDoor('d1');
      expect(ctrl.closeDoor('d1')).toBe(true);
      expect(ctrl.getDoor('d1')!.open).toBe(false);
    });

    it('returns undefined for unknown door', () => {
      expect(ctrl.getDoor('nonexistent')).toBeUndefined();
    });

    it('registration is a copy (not mutable reference)', () => {
      const door = ctrl.getDoor('d1')!;
      door.locked = true;
      expect(ctrl.getDoor('d1')!.locked).toBe(false);
    });
  });

  // ── Node Defenses (6322) ──

  describe('Node Defenses', () => {
    beforeEach(() => {
      ctrl.registerDefense({ id: 'def1', nodeId: 'node_b', active: false, type: 'shield' });
    });

    it('activates a defense and emits event', () => {
      const events: any[] = [];
      eventBus.on('NODE_DEFENSE_STATE_CHANGED', (e) => events.push(e.data));

      expect(ctrl.activateDefense('def1')).toBe(true);
      expect(ctrl.getDefense('def1')!.active).toBe(true);
      expect(events.length).toBe(1);
      expect(events[0].active).toBe(true);
    });

    it('cannot activate an already-active defense', () => {
      ctrl.activateDefense('def1');
      expect(ctrl.activateDefense('def1')).toBe(false);
    });

    it('deactivates a defense', () => {
      ctrl.activateDefense('def1');
      expect(ctrl.deactivateDefense('def1')).toBe(true);
      expect(ctrl.getDefense('def1')!.active).toBe(false);
    });

    it('cannot deactivate an already-inactive defense', () => {
      expect(ctrl.deactivateDefense('def1')).toBe(false);
    });
  });

  // ── Energy Conduits (6323) ──

  describe('Energy Conduits', () => {
    beforeEach(() => {
      ctrl.registerConduit({ id: 'c1', sourceNodeId: 'src', targetNodeId: 'tgt1', flowRate: 10, active: true });
      ctrl.registerConduit({ id: 'c2', sourceNodeId: 'src', targetNodeId: 'tgt2', flowRate: 5, active: false });
    });

    it('redirects an active conduit and emits event', () => {
      const events: any[] = [];
      eventBus.on('ENERGY_CONDUIT_REDIRECTED', (e) => events.push(e.data));

      expect(ctrl.redirectConduit('c1', 'tgt3')).toBe(true);
      expect(ctrl.getConduit('c1')!.targetNodeId).toBe('tgt3');
      expect(events.length).toBe(1);
      expect(events[0].oldTargetNodeId).toBe('tgt1');
      expect(events[0].newTargetNodeId).toBe('tgt3');
    });

    it('cannot redirect an inactive conduit', () => {
      expect(ctrl.redirectConduit('c2', 'tgt3')).toBe(false);
    });

    it('toggles conduit active state', () => {
      expect(ctrl.getConduit('c2')!.active).toBe(false);
      ctrl.toggleConduit('c2');
      expect(ctrl.getConduit('c2')!.active).toBe(true);
      ctrl.toggleConduit('c2');
      expect(ctrl.getConduit('c2')!.active).toBe(false);
    });

    it('getConduitsByNode returns matching conduits', () => {
      const conduits = ctrl.getConduitsByNode('src');
      expect(conduits.length).toBe(2);
    });

    it('getConduitsByNode returns empty for unknown node', () => {
      expect(ctrl.getConduitsByNode('unknown').length).toBe(0);
    });
  });
});
