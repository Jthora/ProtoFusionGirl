import { WorldEngine } from '../../src/world/WorldEngine';
import { EventBus } from '../../src/core/EventBus';

describe('WorldEngine (data-driven)', () => {
  it('loads zones and ley lines from data', () => {
    const world = new WorldEngine(new EventBus());
    expect(world.zones.length).toBeGreaterThan(0);
    expect(world.leyLines.length).toBeGreaterThan(0);
  });

  it('emits WORLD_LOADED event', () => {
    const eventBus = new EventBus();
    let loaded = false;
    eventBus.on('WORLD_LOADED', () => { loaded = true; });
    new WorldEngine(eventBus);
    expect(loaded).toBe(true);
  });
});
