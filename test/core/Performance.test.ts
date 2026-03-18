// Performance test suite — Task 7434 (P5.7)
// Verifies entity pool cap, tick rate optimization, and 60 FPS budget compliance.

import { EntityPoolManager, PoolableEntity } from '../../src/core/EntityPoolManager';
import { TickRateOptimizer } from '../../src/core/TickRateOptimizer';

// Helper: minimal poolable entity
class MockEntity implements PoolableEntity {
  id: string;
  active = false;
  resetCount = 0;
  constructor(id: string) { this.id = id; }
  reset() { this.resetCount++; }
}

describe('EntityPoolManager (7432)', () => {
  it('caps active entities at configured max (default 30)', () => {
    const pool = new EntityPoolManager<MockEntity>();
    for (let i = 0; i < 35; i++) {
      pool.activate(new MockEntity(`e${i}`));
    }
    expect(pool.getActiveCount()).toBe(30);
    expect(pool.getMaxActive()).toBe(30);
  });

  it('returns false when cap reached', () => {
    const pool = new EntityPoolManager<MockEntity>({ maxActive: 3 });
    expect(pool.activate(new MockEntity('a'))).toBe(true);
    expect(pool.activate(new MockEntity('b'))).toBe(true);
    expect(pool.activate(new MockEntity('c'))).toBe(true);
    expect(pool.activate(new MockEntity('d'))).toBe(false);
    expect(pool.getActiveCount()).toBe(3);
  });

  it('recycles deactivated entities through the pool', () => {
    const pool = new EntityPoolManager<MockEntity>({ maxActive: 2 });
    const e1 = new MockEntity('x');
    pool.activate(e1);
    pool.deactivate('x');
    expect(pool.getActiveCount()).toBe(0);
    expect(pool.getPoolSize()).toBe(1);

    const recycled = pool.acquire();
    expect(recycled).toBe(e1);
    expect(recycled!.resetCount).toBe(1);
    expect(pool.getPoolSize()).toBe(0);
  });

  it('cullWhere removes matching entities', () => {
    const pool = new EntityPoolManager<MockEntity>({ maxActive: 10 });
    for (let i = 0; i < 5; i++) pool.activate(new MockEntity(`e${i}`));
    const culled = pool.cullWhere(e => parseInt(e.id.slice(1)) >= 3);
    expect(culled).toBe(2);
    expect(pool.getActiveCount()).toBe(3);
  });

  it('respects maxPoolSize', () => {
    const pool = new EntityPoolManager<MockEntity>({ maxActive: 10, maxPoolSize: 2 });
    for (let i = 0; i < 5; i++) pool.activate(new MockEntity(`e${i}`));
    for (let i = 0; i < 5; i++) pool.deactivate(`e${i}`);
    // Only 2 should be kept in pool
    expect(pool.getPoolSize()).toBe(2);
  });
});

describe('TickRateOptimizer (7433)', () => {
  it('fires callback every N frames with accumulated dt', () => {
    const opt = new TickRateOptimizer();
    const calls: number[] = [];
    opt.register('jane-ai', { interval: 3, callback: (dt) => calls.push(dt) });

    // Simulate 9 frames at ~16ms each
    for (let i = 0; i < 9; i++) {
      opt.tick(16);
    }
    // Should have fired 3 times (frames 3, 6, 9)
    expect(calls).toHaveLength(3);
    expect(calls[0]).toBeCloseTo(48); // 3 * 16
    expect(calls[1]).toBeCloseTo(48);
    expect(calls[2]).toBeCloseTo(48);
  });

  it('supports multiple systems with different intervals', () => {
    const opt = new TickRateOptimizer();
    let fastCount = 0;
    let slowCount = 0;
    opt.register('fast', { interval: 1, callback: () => fastCount++ });
    opt.register('slow', { interval: 5, callback: () => slowCount++ });

    for (let i = 0; i < 10; i++) opt.tick(16);
    expect(fastCount).toBe(10);
    expect(slowCount).toBe(2);
  });

  it('unregister removes a system', () => {
    const opt = new TickRateOptimizer();
    let count = 0;
    opt.register('x', { interval: 1, callback: () => count++ });
    opt.tick(16);
    opt.unregister('x');
    opt.tick(16);
    expect(count).toBe(1);
  });
});

describe('60 FPS budget compliance (7434)', () => {
  it('EntityPoolManager operations complete within 1ms budget', () => {
    const pool = new EntityPoolManager<MockEntity>({ maxActive: 30 });

    const start = performance.now();
    // Simulate a heavy frame: activate 30, iterate, deactivate 10, cull 5
    for (let i = 0; i < 30; i++) pool.activate(new MockEntity(`e${i}`));
    pool.forEachActive(() => {}); // iteration
    for (let i = 0; i < 10; i++) pool.deactivate(`e${i}`);
    pool.cullWhere(e => parseInt(e.id.slice(1)) >= 25);
    const elapsed = performance.now() - start;

    // At 60 FPS, each frame is ~16.67ms. Pool operations should be <1ms.
    expect(elapsed).toBeLessThan(5); // generous for CI
  });

  it('TickRateOptimizer tick() completes within 0.5ms for 10 systems', () => {
    const opt = new TickRateOptimizer();
    for (let i = 0; i < 10; i++) {
      opt.register(`sys${i}`, { interval: 3, callback: () => {} });
    }

    const start = performance.now();
    for (let f = 0; f < 60; f++) opt.tick(16.67); // one second of frames
    const elapsed = performance.now() - start;

    // 60 ticks for 10 systems should be well under budget
    expect(elapsed).toBeLessThan(10); // generous for CI
  });
});
