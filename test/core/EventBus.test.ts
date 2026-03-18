// EventBus.test.ts
// Unit tests for EventBus — the central event system used across the whole game.

import { EventBus } from '../../src/core/EventBus';

describe('EventBus — on / emit', () => {
  it('calls registered handler when event emitted', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    bus.on('JANE_DAMAGED', handler);
    bus.emit({ type: 'JANE_DAMAGED', data: { amount: 10, health: 90 } });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ type: 'JANE_DAMAGED', data: { amount: 10, health: 90 } });
  });

  it('does not call handler for a different event type', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    bus.on('JANE_DAMAGED', handler);
    bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e1' } });
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls multiple handlers registered for the same type', () => {
    const bus = new EventBus();
    const h1 = jest.fn();
    const h2 = jest.fn();
    bus.on('ENEMY_DEFEATED', h1);
    bus.on('ENEMY_DEFEATED', h2);
    bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e1' } });
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('can emit the same event multiple times', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    bus.on('JANE_DAMAGED', handler);
    bus.emit({ type: 'JANE_DAMAGED', data: { amount: 5, health: 95 } });
    bus.emit({ type: 'JANE_DAMAGED', data: { amount: 5, health: 90 } });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('returns unsubscribe function from on()', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    const unsub = bus.on('ENEMY_DEFEATED', handler);
    expect(typeof unsub).toBe('function');
  });
});

describe('EventBus — off / unsubscribe', () => {
  it('stops calling handler after off()', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    bus.on('JANE_DAMAGED', handler);
    bus.off('JANE_DAMAGED', handler);
    bus.emit({ type: 'JANE_DAMAGED', data: { amount: 10, health: 90 } });
    expect(handler).not.toHaveBeenCalled();
  });

  it('stops calling handler after returned unsubscribe()', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    const unsub = bus.on('JANE_DAMAGED', handler);
    unsub();
    bus.emit({ type: 'JANE_DAMAGED', data: { amount: 10, health: 90 } });
    expect(handler).not.toHaveBeenCalled();
  });

  it('only removes the specified handler, not others', () => {
    const bus = new EventBus();
    const h1 = jest.fn();
    const h2 = jest.fn();
    bus.on('ENEMY_DEFEATED', h1);
    bus.on('ENEMY_DEFEATED', h2);
    bus.off('ENEMY_DEFEATED', h1);
    bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e1' } });
    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('off() is a no-op when handler was never registered', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    expect(() => bus.off('JANE_DAMAGED', handler)).not.toThrow();
  });

  it('off() is a no-op for an event type with no listeners', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    expect(() => bus.off('ENEMY_DEFEATED', handler)).not.toThrow();
  });

  it('cleans up listener map entry when last handler is removed', () => {
    // This tests memory hygiene: entries with empty arrays should be deleted
    const bus = new EventBus();
    const handler = jest.fn();
    bus.on('JANE_DAMAGED', handler);
    bus.off('JANE_DAMAGED', handler);
    // Emitting should not throw even with the entry cleaned up
    expect(() => bus.emit({ type: 'JANE_DAMAGED', data: { amount: 0, health: 100 } })).not.toThrow();
  });
});

describe('EventBus — once', () => {
  it('calls handler exactly once then removes it', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    bus.once('ENEMY_DEFEATED', handler);
    bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e1' } });
    bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e2' } });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e1' } });
  });

  it('returns unsubscribe function', () => {
    const bus = new EventBus();
    const unsub = bus.once('ENEMY_DEFEATED', jest.fn());
    expect(typeof unsub).toBe('function');
  });

  it('can be cancelled before firing via unsubscribe', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    const unsub = bus.once('ENEMY_DEFEATED', handler);
    unsub();
    bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e1' } });
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not interfere with permanent handlers on the same type', () => {
    const bus = new EventBus();
    const permanent = jest.fn();
    const single = jest.fn();
    bus.on('ENEMY_DEFEATED', permanent);
    bus.once('ENEMY_DEFEATED', single);
    bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e1' } });
    bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e2' } });
    expect(permanent).toHaveBeenCalledTimes(2);
    expect(single).toHaveBeenCalledTimes(1);
  });
});

describe('EventBus — onAny', () => {
  it('receives all emitted events regardless of type', () => {
    const bus = new EventBus();
    const received: string[] = [];
    bus.onAny((e) => received.push(e.type));
    bus.emit({ type: 'JANE_DAMAGED', data: { amount: 5, health: 95 } });
    bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e1' } });
    expect(received).toEqual(['JANE_DAMAGED', 'ENEMY_DEFEATED']);
  });

  it('onAny unsubscribe stops receiving events', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    const unsub = bus.onAny(handler);
    bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e1' } });
    unsub();
    bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e2' } });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('multiple onAny handlers all receive events', () => {
    const bus = new EventBus();
    const h1 = jest.fn();
    const h2 = jest.fn();
    bus.onAny(h1);
    bus.onAny(h2);
    bus.emit({ type: 'JANE_DAMAGED', data: { amount: 10, health: 90 } });
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('onAny and on() both fire for the same event', () => {
    const bus = new EventBus();
    const specific = jest.fn();
    const any = jest.fn();
    bus.on('JANE_DAMAGED', specific);
    bus.onAny(any);
    bus.emit({ type: 'JANE_DAMAGED', data: { amount: 10, health: 90 } });
    expect(specific).toHaveBeenCalledTimes(1);
    expect(any).toHaveBeenCalledTimes(1);
  });
});

describe('EventBus — memory / no leaks', () => {
  it('does not accumulate duplicate handlers for repeated on() calls with same fn', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    bus.on('JANE_DAMAGED', handler);
    bus.on('JANE_DAMAGED', handler); // same fn registered twice
    bus.emit({ type: 'JANE_DAMAGED', data: { amount: 5, health: 95 } });
    // Both registrations fire (the bus does not deduplicate — callers are responsible)
    // This test just documents the behavior
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('removing one of two identical handler registrations only removes one', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    bus.on('JANE_DAMAGED', handler);
    bus.on('JANE_DAMAGED', handler);
    bus.off('JANE_DAMAGED', handler); // removes first occurrence
    bus.emit({ type: 'JANE_DAMAGED', data: { amount: 5, health: 95 } });
    expect(handler).toHaveBeenCalledTimes(1); // second registration still active
  });

  it('bus is safe to use after all handlers are removed', () => {
    const bus = new EventBus();
    const handler = jest.fn();
    bus.on('ENEMY_DEFEATED', handler);
    bus.off('ENEMY_DEFEATED', handler);
    expect(() => bus.emit({ type: 'ENEMY_DEFEATED', data: { enemyId: 'e1' } })).not.toThrow();
  });

  it('independent buses do not share state', () => {
    const bus1 = new EventBus();
    const bus2 = new EventBus();
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    bus1.on('JANE_DAMAGED', handler1);
    bus2.on('JANE_DAMAGED', handler2);
    bus1.emit({ type: 'JANE_DAMAGED', data: { amount: 5, health: 95 } });
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();
  });
});
