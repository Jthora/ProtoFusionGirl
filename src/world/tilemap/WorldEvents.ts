// WorldEvents: Event bus for world/tilemap changes (edit, chunk load/unload, etc.)
type WorldEventType = 'tileEdit' | 'chunkLoad' | 'chunkUnload' | 'worldSave' | 'worldLoad';

export interface WorldEvent {
  type: WorldEventType;
  data: any;
}

export class WorldEvents {
  private listeners: Map<WorldEventType, ((event: WorldEvent) => void)[]> = new Map();

  on(type: WorldEventType, handler: (event: WorldEvent) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(handler);
  }

  emit(event: WorldEvent) {
    (this.listeners.get(event.type) || []).forEach(fn => fn(event));
  }
}
