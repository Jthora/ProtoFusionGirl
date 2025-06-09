// MultiverseEventEngine: Branch-aware event and quest state engine for ProtoFusionGirl
// Integrates with WorldPersistence for per-branch event/quest state and propagation/merge logic.
import { WorldPersistence } from '../tilemap/WorldPersistence';
import { EventBus, Event } from '../../core/EventBus';

export interface QuestState {
  id: string;
  status: 'active' | 'completed' | 'failed';
  progress?: any;
  branchId: string;
}

export interface MultiverseEventState {
  quests: Record<string, QuestState>;
  events: Record<string, any>; // Arbitrary event state per branch
}

export class MultiverseEventEngine {
  private worldPersistence: WorldPersistence;
  private eventBus: EventBus;
  // Per-branch event/quest state
  private branchEventState: Record<string, MultiverseEventState> = {};

  constructor(worldPersistence: WorldPersistence, eventBus: EventBus) {
    this.worldPersistence = worldPersistence;
    this.eventBus = eventBus;
  }

  // --- Event/Quest State Tracking ---
  getBranchEventState(branchId: string): MultiverseEventState {
    if (!this.branchEventState[branchId]) {
      this.branchEventState[branchId] = { quests: {}, events: {} };
    }
    return this.branchEventState[branchId];
  }

  setQuestState(branchId: string, quest: QuestState) {
    this.getBranchEventState(branchId).quests[quest.id] = quest;
    // Optionally persist to WorldPersistence meta or a dedicated event log
  }

  getQuestState(branchId: string, questId: string): QuestState | undefined {
    return this.getBranchEventState(branchId).quests[questId];
  }

  // --- Event/Quest Propagation & Merge Logic ---
  propagateEventToBranch(eventId: string, data: any, targetBranchId: string) {
    this.getBranchEventState(targetBranchId).events[eventId] = data;
    // Optionally emit event on eventBus
    this.eventBus.emit({ type: eventId, data });
  }

  mergeBranchEvents(targetBranchId: string, sourceBranchId: string) {
    const target = this.getBranchEventState(targetBranchId);
    const source = this.getBranchEventState(sourceBranchId);
    // Naive merge: copy over quests/events not present in target
    for (const qid in source.quests) {
      if (!target.quests[qid]) target.quests[qid] = source.quests[qid];
      // TODO: Handle conflicting quest states (e.g., fail in one, success in another)
    }
    for (const eid in source.events) {
      if (!target.events[eid]) target.events[eid] = source.events[eid];
    }
  }

  // --- Narrative Triggers & World Changes ---
  triggerNarrativeEvent(branchId: string, eventId: string, data: any) {
    // Record event in branch state
    this.getBranchEventState(branchId).events[eventId] = data;
    // Emit on event bus for listeners (e.g., UI, simulation, analytics)
    this.eventBus.emit({ type: eventId, data });
  }

  // --- Narrative Triggers & World Change Hooks ---
  onNarrativeTrigger(branchId: string, eventId: string, handler: (data: any) => void) {
    // Listen for narrative event on the event bus, scoped to branch
    this.eventBus.on(eventId, (event) => {
      // Optionally filter by branchId if event data includes it
      if (!event.data || event.data.branchId === branchId) {
        handler(event.data);
      }
    });
  }

  triggerWorldChange(branchId: string, changeId: string, data: any) {
    // Record world change event and emit for listeners
    this.getBranchEventState(branchId).events[changeId] = data;
    this.eventBus.emit({ type: changeId, data: { ...data, branchId } });
  }

  /**
   * Propagate ley line instability event to a branch (artifact-driven)
   * Artifact: leyline_instability_event_integration_points_2025-06-08.artifact
   */
  propagateLeyLineInstability(event: import('../../world/leyline/types').LeyLineInstabilityEvent, targetBranchId: string) {
    // Example: propagate event to branch event state and emit on eventBus
    this.getBranchEventState(targetBranchId).events[event.id] = event;
    this.eventBus.emit({ type: event.type, data: event });
    // Escalation/mission/narrative hooks (stub)
    // TODO: If event.severity escalates, trigger mission/narrative consequences
  }

  /**
   * Modding/event hook: Register a callback for ley line instability events (artifact-driven)
   * Artifact: leyline_instability_event_api_reference_2025-06-08.artifact
   * @param handler Callback to invoke with LeyLineInstabilityEvent
   */
  static instabilityEventHandlers: Array<(event: any) => void> = [];
  static onInstabilityEvent(handler: (event: any) => void) {
    MultiverseEventEngine.instabilityEventHandlers.push(handler);
  }
  /**
   * Emit a ley line instability event to all registered handlers (for mods, systems, etc.)
   * @param event Canonical LeyLineInstabilityEvent
   */
  static emitInstabilityEvent(event: any) {
    for (const handler of MultiverseEventEngine.instabilityEventHandlers) handler(event);
  }
  // Example usage for designers/modders:
  // MultiverseEventEngine.onInstabilityEvent((event) => { /* custom logic */ });
}
