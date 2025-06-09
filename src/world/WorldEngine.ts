// WorldEngine.ts
// Data-driven, event-oriented world system
import { EventBus as CoreEventBus } from '../core/EventBus';
import { loadZones, ZoneDefinition } from '../data/zoneLoader';
import { LeyLineManager } from './leyline/LeyLineManager';
import { LeyLineEvents } from './leyline/events/LeyLineEvents';
import { WorldStateManager } from './WorldStateManager';
import { LeyLine } from './leyline/types';

export class WorldEngine {
  public zones: ZoneDefinition[];
  public leyLineManager: LeyLineManager;
  private eventBus: CoreEventBus;
  private leyLineEvents: LeyLineEvents;
  private worldStateManager: WorldStateManager;

  constructor(eventBus: CoreEventBus, worldStateManager: WorldStateManager) {
    this.eventBus = eventBus;
    this.worldStateManager = worldStateManager;
    this.zones = loadZones();
    this.leyLineManager = new LeyLineManager(worldStateManager, eventBus);
    this.leyLineEvents = new LeyLineEvents(eventBus);
    this.eventBus.emit({ type: 'WORLD_LOADED' as any, data: { zoneCount: this.zones.length, leyLineCount: this.leyLineManager.getLeyLines().length } });
  }

  getZoneById(id: string): ZoneDefinition | undefined {
    return this.zones.find(z => z.id === id);
  }

  getLeyLineById(id: string): LeyLine | undefined {
    return this.leyLineManager.getLeyLines().find(l => l.id === id);
  }

  updateLeyLineStatus(id: string, status: 'stable' | 'unstable') {
    this.leyLineEvents.publishActivation(id); // Use activation event for status change
    // Update status via WorldStateManager
    const leyLines = this.worldStateManager.getState().leyLines.map(l =>
      l.id === id ? { ...l, status } : l
    );
    this.worldStateManager.updateState({ leyLines });
  }
}
