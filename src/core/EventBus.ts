// EventBus: Generic event bus for decoupled communication across systems.
// Moved to core/ as part of architecture refactor (2025-06-04). See core/README.md.

export type EventType = string;

export interface Event<T = any> {
  type: EventType;
  data: T;
}

export class EventBus<T = any> {
  private listeners: Map<EventType, ((event: Event<T>) => void)[]> = new Map();

  on(type: EventType, handler: (event: Event<T>) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(handler);
  }

  emit(event: Event<T>) {
    (this.listeners.get(event.type) || []).forEach(fn => fn(event));
  }
}
