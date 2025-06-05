// EventBus.ts
// Publish/subscribe event system for ProtoFusionGirl
// See: event_bus_spec_2025-06-04.artifact

import Ajv from 'ajv';

export interface WorldEvent {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  version?: number;
}

type EventHandler = (event: WorldEvent) => void;

// --- Event Schema (permissive, see artifact for stricter version) ---
const eventSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    type: { type: 'string' },
    data: {},
    timestamp: { type: 'number' },
    version: { type: 'number' }
  },
  required: ['id', 'type', 'data', 'timestamp'],
  additionalProperties: true
};

const ajv = new Ajv();
const validateEvent = ajv.compile(eventSchema);

// Permission check stub
function hasEventPermission(_event: WorldEvent, _userId?: string): boolean {
  // TODO: Implement real permission logic
  return true;
}

export class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private eventLog: WorldEvent[] = [];

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    this.listeners.get(eventType)?.delete(handler);
  }

  publish(event: WorldEvent, userId?: string): void {
    if (!hasEventPermission(event, userId)) {
      throw new Error('Permission denied for event publish');
    }
    if (!validateEvent(event)) {
      throw new Error('Event validation failed: ' + JSON.stringify(validateEvent.errors));
    }
    this.eventLog.push(event);
    (this.listeners.get(event.type) || []).forEach(handler => handler(event));
  }

  async publishAsync(event: WorldEvent, userId?: string): Promise<void> {
    if (!hasEventPermission(event, userId)) {
      throw new Error('Permission denied for event publish');
    }
    if (!validateEvent(event)) {
      throw new Error('Event validation failed: ' + JSON.stringify(validateEvent.errors));
    }
    this.eventLog.push(event);
    const handlers = Array.from(this.listeners.get(event.type) || []);
    await Promise.all(handlers.map(async handler => handler(event)));
  }

  replay(eventType: string, since?: number): WorldEvent[] {
    return this.eventLog.filter(e => e.type === eventType && (!since || e.timestamp >= since));
  }
}
