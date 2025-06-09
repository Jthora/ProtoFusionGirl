import { LeyLineInstabilityEvent } from '../leyline/types';
import { EventBus } from '../../core/EventBus';

// CosmicEnvSimulation: Simulates ley lines, vortices, cosmic events, and environmental hazards per branch/timeline.
// Integrates with WorldPersistence and MultiverseEventEngine.
export interface CosmicEvent {
  id: string;
  type: string;
  data: any;
  branchId: string;
  timestamp: number;
}

export interface CosmicState {
  leyLines: any[];
  vortices: any[];
  hazards: any[];
  events: CosmicEvent[];
}

export class CosmicEnvSimulation {
  private branchStates: Record<string, CosmicState> = {};
  private eventBus?: EventBus;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus;
  }

  getBranchState(branchId: string): CosmicState {
    if (!this.branchStates[branchId]) {
      this.branchStates[branchId] = { leyLines: [], vortices: [], hazards: [], events: [] };
    }
    return this.branchStates[branchId];
  }

  addCosmicEvent(branchId: string, event: Omit<CosmicEvent, 'branchId' | 'timestamp'>) {
    const state = this.getBranchState(branchId);
    const fullEvent: CosmicEvent = { ...event, branchId, timestamp: Date.now() };
    state.events.push(fullEvent);
  }

  // Artifact: leyline_instability_event_design_2025-06-08.artifact
  // Simulate ley line instability, surge, disruption, and rift events
  simulateTick(branchId: string) {
    // Simulate ley line/vortex/hazard changes, trigger events
    const state = this.getBranchState(branchId);
    // Example: randomly trigger a ley line instability event (simulation trigger)
    if (state.leyLines.length > 0 && Math.random() < 0.1) {
      const leyLine = state.leyLines[Math.floor(Math.random() * state.leyLines.length)];
      // Check for existing instability event for this ley line
      const lastEvent = state.events.filter(e => e.type.startsWith('LEYLINE_') && e.data.leyLineId === leyLine.id).sort((a, b) => b.timestamp - a.timestamp)[0];
      let nextEvent: LeyLineInstabilityEvent | null = null;
      if (!lastEvent || lastEvent.data.type === 'LEYLINE_INSTABILITY' && lastEvent.data.severity === 'minor') {
        // Escalate to moderate instability
        nextEvent = {
          id: `instab_${leyLine.id}_${Date.now()}`,
          type: 'LEYLINE_INSTABILITY',
          leyLineId: leyLine.id,
          severity: lastEvent ? 'moderate' : 'minor',
          triggeredBy: 'simulation',
          timestamp: Date.now(),
          branchId,
          data: { reason: lastEvent ? 'escalation' : 'random_tick' }
        };
      } else if (lastEvent.data.type === 'LEYLINE_INSTABILITY' && lastEvent.data.severity === 'moderate') {
        // Escalate to disruption
        nextEvent = {
          id: `disrupt_${leyLine.id}_${Date.now()}`,
          type: 'LEYLINE_DISRUPTION',
          leyLineId: leyLine.id,
          severity: 'major',
          triggeredBy: 'simulation',
          timestamp: Date.now(),
          branchId,
          data: { reason: 'escalation' }
        };
      } else if (lastEvent.data.type === 'LEYLINE_DISRUPTION' || (lastEvent.data.type === 'LEYLINE_INSTABILITY' && lastEvent.data.severity === 'major')) {
        // Escalate to rift
        nextEvent = {
          id: `rift_${leyLine.id}_${Date.now()}`,
          type: 'RIFT_FORMED',
          leyLineId: leyLine.id,
          severity: 'major',
          triggeredBy: 'simulation',
          timestamp: Date.now(),
          branchId,
          data: { reason: 'escalation' }
        };
      }
      if (nextEvent) {
        this.addCosmicEvent(branchId, {
          id: nextEvent.id,
          type: nextEvent.type,
          data: nextEvent,
        });
        if (this.eventBus) {
          this.eventBus.emit({ type: nextEvent.type, data: nextEvent });
        }
      }
    }
    // For now, just log
    // Example: this.addCosmicEvent(branchId, { id: 'tick', type: 'tick', data: {} });
  }

  mergeBranchStates(targetBranchId: string, sourceBranchId: string) {
    const target = this.getBranchState(targetBranchId);
    const source = this.getBranchState(sourceBranchId);
    // Naive merge: concat arrays, deduplicate by id
    target.leyLines = [...target.leyLines, ...source.leyLines];
    target.vortices = [...target.vortices, ...source.vortices];
    target.hazards = [...target.hazards, ...source.hazards];
    const eventIds = new Set(target.events.map(e => e.id));
    for (const e of source.events) {
      if (!eventIds.has(e.id)) target.events.push(e);
    }
  }

  rollbackBranchState(branchId: string, toTimestamp: number) {
    const state = this.getBranchState(branchId);
    state.events = state.events.filter(e => e.timestamp <= toTimestamp);
    // Optionally rollback leyLines/vortices/hazards as well
  }
}
