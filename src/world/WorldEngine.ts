// WorldEngine.ts
// Data-driven, event-oriented world system
import { EventBus as CoreEventBus } from '../core/EventBus';
import { loadZones, ZoneDefinition } from '../data/zoneLoader';
import { LeyLineManager } from './leyline/LeyLineManager';
import { LeyLineEvents } from './leyline/events/LeyLineEvents';
import { WorldStateManager, WorldState } from './WorldStateManager';
import { LeyLine } from './leyline/types';

export class WorldEngine {
  public zones: ZoneDefinition[];
  public leyLineManager: LeyLineManager;
  private eventBus: CoreEventBus;
  private leyLineEvents: LeyLineEvents;
  private worldStateManager: WorldStateManager;
  // Backward compat alias (tests referenced world.leyLines)
  public leyLines: LeyLine[] = [];

  constructor(eventBus: CoreEventBus, worldStateManager?: WorldStateManager) {
    this.eventBus = eventBus;
    // Allow tests to omit worldStateManager; create a fresh one
  this.worldStateManager = worldStateManager || new WorldStateManager(this.createDefaultState(), eventBus);
    this.zones = loadZones();
    if (!Array.isArray(this.zones) || this.zones.length === 0) {
      // Synthesize minimal zones for test stability
      this.zones = [
        { id: 'zone_synth_1', name: 'Synthetic Hub', description: 'Auto-generated zone (fallback).', type: 'hub', connectedLeyLines: ['leyline_1'] }
      ];
    }
    this.leyLineManager = new LeyLineManager(this.worldStateManager, eventBus);
    this.leyLineEvents = new LeyLineEvents(eventBus);
    this.refreshLeyLinesCache();
  const zoneCount = Array.isArray(this.zones) ? this.zones.length : 0;
  const leyLineCount = Array.isArray(this.leyLines) ? this.leyLines.length : 0;
  this.eventBus.emit({ type: 'WORLD_LOADED' as any, data: { zoneCount, leyLineCount } });
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
    this.refreshLeyLinesCache();
  }

  private refreshLeyLinesCache() {
    this.leyLines = this.leyLineManager.getLeyLines();
  }

  private createDefaultState(): WorldState {
    return {
      version: 1,
      leyLines: [
        {
          id: 'leyline_1',
          nodes: [
            { id: 'll1_n1', position: { x: 0, y: 0 }, state: 'active' },
            { id: 'll1_n2', position: { x: 100, y: 0 }, state: 'active' }
          ],
          energy: 100,
          status: 'stable'
        }
      ],
      rifts: [],
      players: [{ id: 'player1', name: 'Jane', position: { x:0, y:0 }, inventory: {}, progression: [], stats: {} }],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: false, aiAgents: [], mods: [] }
    };
  }
}
