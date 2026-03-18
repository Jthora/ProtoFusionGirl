// EventBus: Generic event bus for decoupled communication across systems.
// Moved to core/ as part of architecture refactor (2025-06-04). See core/README.md.

import { EventName, GameEvent } from './EventTypes';

export class EventBus {
  private listeners: Map<EventName, ((event: GameEvent) => void)[]> = new Map();
  private anyListeners: Array<(event: GameEvent) => void> = [];

  /**
   * Subscribe to an event. Returns an unsubscribe function for cleanup.
   */
  on<T extends EventName>(type: T, handler: (event: GameEvent<T>) => void): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    // Type assertion is safe due to T constraint
    (this.listeners.get(type) as ((event: GameEvent<T>) => void)[]).push(handler);
    return () => this.off(type, handler as unknown as (event: GameEvent) => void);
  }

  emit<T extends EventName>(event: GameEvent<T>) {
  (this.listeners.get(event.type) || []).forEach(fn => fn(event));
  // Fire onAny listeners
  for (const fn of this.anyListeners) fn(event);
  }

  /**
   * Remove a specific handler for an event type.
   */
  off<T extends EventName>(type: T, handler: (event: GameEvent<T>) => void): void {
    const arr = this.listeners.get(type);
    if (!arr) return;
    const idx = (arr as ((event: GameEvent<T>) => void)[]).indexOf(handler);
    if (idx > -1) {
      (arr as ((event: GameEvent<T>) => void)[]).splice(idx, 1);
      if (arr.length === 0) this.listeners.delete(type);
    }
  }

  /**
   * Subscribe to an event only once; handler removed after first invocation.
   */
  once<T extends EventName>(type: T, handler: (event: GameEvent<T>) => void): () => void {
    const wrapped = (event: GameEvent<T>) => {
      this.off(type, wrapped);
      handler(event);
    };
    return this.on(type, wrapped);
  }

  /**
   * Subscribe to all events (debug/narrative systems). Returns unsubscribe.
   */
  onAny(handler: (event: GameEvent) => void): () => void {
    this.anyListeners.push(handler);
    return () => {
      const idx = this.anyListeners.indexOf(handler);
      if (idx > -1) this.anyListeners.splice(idx, 1);
    };
  }
}
