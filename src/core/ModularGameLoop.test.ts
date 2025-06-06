// ModularGameLoop.test.ts
// Artifact-driven: Unit tests for ModularGameLoop (see artifacts/testing_validation_strategy_2025-06-05.artifact)
import { ModularGameLoop } from './ModularGameLoop';
import { EventBus } from './EventBus';

describe('ModularGameLoop', () => {
  it('should register and update systems in priority order', () => {
    const eventBus = new EventBus();
    const loop = new ModularGameLoop(eventBus);
    const calls: string[] = [];
    loop.registerSystem({ id: 'a', priority: 2, update: () => calls.push('a') });
    loop.registerSystem({ id: 'b', priority: 1, update: () => calls.push('b') });
    loop.update(16);
    expect(calls).toEqual(['b', 'a']);
  });

  it('should emit GAMELOOP_POST_UPDATE event after update', () => {
    const eventBus = new EventBus();
    const loop = new ModularGameLoop(eventBus);
    let called = false;
    eventBus.on('GAMELOOP_POST_UPDATE', () => { called = true; });
    loop.update(16);
    expect(called).toBe(true);
  });
});
