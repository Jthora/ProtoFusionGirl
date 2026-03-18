// NarrativeEngine.ts
// Data-driven, event-oriented narrative system
import { EventBus } from '../core/EventBus';
import { loadNarrativeEvents, NarrativeEventDefinition } from '../data/narrativeLoader';
import { GameEvent } from '../core/EventTypes';

export class NarrativeEngine {
  private eventBus: EventBus;
  private events: NarrativeEventDefinition[] = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    try {
      const loaded = loadNarrativeEvents();
      if (Array.isArray(loaded) && loaded.length > 0) this.events = loaded;
      else {
        this.events = [
          { id: 'intro_event', trigger: 'game_start', actions: ['show_intro_cinematic'] }
        ];
      }
    } catch (e) {
      console.warn('NarrativeEngine: failed to load narrative events', e);
      this.events = [];
    }
    this.eventBus.onAny(this.handleEvent.bind(this));
  }

  private handleEvent(event: GameEvent) {
    // Check for narrative events triggered by this event
    // Debug instrumentation: log available narrative events count once for troubleshooting tests
    if ((this as any)._debugLogged !== true) {
      console.debug('[NarrativeEngine] Loaded narrative events:', this.events.length);
      (this as any)._debugLogged = true;
    }
    for (const narrative of this.events) {
      if (this.isTriggerMatch(narrative.trigger, event)) {
        this.executeActions(narrative.actions, event);
      }
    }
  }

  private isTriggerMatch(trigger: string, event: GameEvent): boolean {
    // Normalize legacy trigger forms to canonical event names (e.g., tech_level_advanced -> TECH_LEVEL_ADVANCED)
    const normalizedType = event.type.toLowerCase();
    const triggerLower = trigger.toLowerCase();
    if (triggerLower === normalizedType) return true;
    if (triggerLower.startsWith(normalizedType + ':')) {
      const triggerSuffix = triggerLower.split(':')[1];
      return event.data && Object.values(event.data).map(v => String(v).toLowerCase()).includes(triggerSuffix);
    }
    return false;
  }

  private executeActions(actions: string[], event: GameEvent) {
    for (const action of actions) {
      // For now, just log; in future, emit events or call systems
      console.log(`[Narrative] Executing action: ${action} (triggered by ${event.type})`);
      // TODO: Emit events or call systems as needed
    }
  }
}
