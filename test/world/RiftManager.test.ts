// RiftManager.test.ts
// Tests for rift spawn, enemy waves, sealing (tasks 5311-5314)

import { EventBus } from '../../src/core/EventBus';
import { RiftManager } from '../../src/world/RiftManager';

function createTestSetup(configOverrides?: any) {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('RIFT_SPAWNED', (e) => events.push(e));
  eventBus.on('RIFT_ENEMY_WAVE', (e) => events.push(e));
  eventBus.on('RIFT_SEALED', (e) => events.push(e));
  eventBus.on('RIFT_EXPANDED', (e) => events.push(e));
  const mgr = new RiftManager(eventBus, configOverrides);
  return { eventBus, mgr, events };
}

describe('RiftManager', () => {
  it('spawns rift at critical stability (P3.8)', () => {
    const { mgr, events } = createTestSetup({ criticalStability: 10 });
    const rift = mgr.checkNodeStability('node3', 8, 500, 300);
    expect(rift).not.toBeNull();
    expect(rift!.nodeId).toBe('node3');
    expect(events.some(e => e.type === 'RIFT_SPAWNED')).toBe(true);
  });

  it('does not spawn rift above threshold', () => {
    const { mgr } = createTestSetup({ criticalStability: 10 });
    const rift = mgr.checkNodeStability('node1', 50, 0, 0);
    expect(rift).toBeNull();
  });

  it('does not spawn duplicate rift at same node', () => {
    const { mgr } = createTestSetup({ criticalStability: 10 });
    mgr.checkNodeStability('node3', 5, 500, 300);
    const rift2 = mgr.checkNodeStability('node3', 3, 500, 300);
    expect(rift2).toBeNull();
  });

  it('spawns enemy waves on interval', () => {
    const { mgr, events } = createTestSetup({ waveIntervalMs: 1000, waveSize: 2 });
    mgr.spawnRift('node3', 500, 300);
    mgr.update(1100); // exceed wave interval
    const waveEvents = events.filter(e => e.type === 'RIFT_ENEMY_WAVE');
    expect(waveEvents.length).toBe(1);
    expect(waveEvents[0].data.count).toBe(2);
    expect(waveEvents[0].data.enemyType).toBe('nefarium_phantom');
  });

  it('seals rift only when enemies cleared', () => {
    const { mgr } = createTestSetup();
    const rift = mgr.spawnRift('node3', 500, 300);
    expect(mgr.sealRift(rift.id, 'UL_banish')).toBe(false); // enemies not cleared
    mgr.markEnemiesCleared(rift.id);
    expect(mgr.sealRift(rift.id, 'UL_banish')).toBe(true);
  });

  it('emits RIFT_SEALED event', () => {
    const { mgr, events } = createTestSetup();
    const rift = mgr.spawnRift('node3', 500, 300);
    mgr.markEnemiesCleared(rift.id);
    mgr.sealRift(rift.id, 'UL_banish');
    const sealed = events.find(e => e.type === 'RIFT_SEALED');
    expect(sealed).toBeDefined();
    expect(sealed.data.sealedBy).toBe('UL_banish');
  });

  it('force-seal works without clearing enemies', () => {
    const { mgr, events } = createTestSetup();
    const rift = mgr.spawnRift('node3', 500, 300);
    expect(mgr.forceSeal(rift.id, 'cheat')).toBe(true);
    expect(events.some(e => e.type === 'RIFT_SEALED')).toBe(true);
  });

  it('tracks active rifts', () => {
    const { mgr } = createTestSetup();
    mgr.spawnRift('node1', 100, 100);
    const rift2 = mgr.spawnRift('node3', 500, 300);
    expect(mgr.getActiveRifts()).toHaveLength(2);
    mgr.forceSeal(rift2.id, 'test');
    expect(mgr.getActiveRifts()).toHaveLength(1);
  });

  it('getRiftAtNode finds correct rift', () => {
    const { mgr } = createTestSetup();
    mgr.spawnRift('node3', 500, 300);
    expect(mgr.getRiftAtNode('node3')).toBeDefined();
    expect(mgr.getRiftAtNode('node1')).toBeUndefined();
  });

  it('rift expands over time', () => {
    const { mgr } = createTestSetup({ expansionRate: 10 });
    const rift = mgr.spawnRift('node3', 500, 300);
    const initialRadius = rift.radius;
    mgr.update(2000);
    expect(mgr.getRift(rift.id)!.radius).toBeGreaterThan(initialRadius);
  });
});
