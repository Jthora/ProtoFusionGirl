// ulEventBus.ts
// Standardized event bus for Universal Language (UL) system
// Follows the event spec in ul_event_spec_2025-06-06.artifact

export type ULEventType =
  | 'ul:puzzle:loaded'
  | 'ul:puzzle:started'
  | 'ul:puzzle:attempted'
  | 'ul:puzzle:validated'
  | 'ul:puzzle:completed'
  | 'ul:context:sync'
  | 'ul:symbol:loaded'
  | 'ul:symbol:validated'
  | 'ul:animation:loaded'
  | 'ul:animation:validated';

export interface ULEventPayload {
  id?: string;
  metadata?: any;
  context?: any;
  input?: any;
  result?: any;
  errors?: string[];
  time?: number;
  stats?: any;
}

type ULEventHandler = (payload: ULEventPayload) => void;

class ULEventBus {
  private listeners: Partial<Record<ULEventType, ULEventHandler[]>> = {};

  on(type: ULEventType, handler: ULEventHandler) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type]!.push(handler);
  }

  off(type: ULEventType, handler: ULEventHandler) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type]!.filter(h => h !== handler);
  }

  emit(type: ULEventType, payload: ULEventPayload) {
    (this.listeners[type] || []).forEach(h => h(payload));
  }
}

export const ulEventBus = new ULEventBus();
