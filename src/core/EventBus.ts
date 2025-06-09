// EventBus: Generic event bus for decoupled communication across systems.
// Moved to core/ as part of architecture refactor (2025-06-04). See core/README.md.

import { EventName, GameEvent } from './EventTypes';

export class EventBus {
  private listeners: Map<EventName, ((event: GameEvent) => void)[]> = new Map();

  on<T extends EventName>(type: T, handler: (event: GameEvent<T>) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    // Type assertion is safe due to T constraint
    (this.listeners.get(type) as ((event: GameEvent<T>) => void)[]).push(handler);
  }

  emit<T extends EventName>(event: GameEvent<T>) {
    (this.listeners.get(event.type) || []).forEach(fn => fn(event));
  }
}
