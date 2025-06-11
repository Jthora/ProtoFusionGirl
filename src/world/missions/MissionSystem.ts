// MissionSystem.ts
// Event-driven mission/quest system using WorldStateManager and EventBus
// See: artifacts/test_system_traceability_2025-06-08.artifact
import { EventBus } from '../../core/EventBus';
import { GameEvent } from '../../core/EventTypes';
import { ulEventBus } from '../../ul/ulEventBus';
import { WorldStateManager } from '../WorldStateManager';

export interface MissionObjective {
  id: string;
  type: 'defeat' | 'collect' | 'explore' | 'use_ability' | 'location' | 'interact' | 'escort' | 'activate' | 'survive' | 'custom';
  target: string;
  count: number;
  progress: number;
  completed: boolean;
}

export type MissionOutcomeType =
  | 'victory_by_defeat'
  | 'defeat_by_death'
  | 'retreat_escape'
  | 'surrender'
  | 'capture_rescue'
  | 'stalemate'
  | 'diplomatic_resolution'
  | 'objective_accomplished'
  | 'environmental_outcome'
  | 'transformation'
  | 'betrayal_ally_switch'
  | 'special_condition'
  | 'mercy_spare'
  | 'recruitment'
  | 'resource_depletion';

export interface Mission {
  id: string;
  title: string;
  description: string;
  objectives: MissionObjective[];
  status: 'active' | 'completed' | 'failed';
  outcome?: MissionOutcomeType;
}

export class MissionSystem {
  private worldStateManager: WorldStateManager;
  private eventBus: EventBus;
  private playerId: string;

  constructor(worldStateManager: WorldStateManager, eventBus: EventBus, playerId: string) {
    this.worldStateManager = worldStateManager;
    this.eventBus = eventBus;
    this.playerId = playerId;
    this.eventBus.on('ENEMY_DEFEATED', (e: GameEvent<'ENEMY_DEFEATED'>) => this.onEnemyDefeated(e));
    this.eventBus.on('ITEM_COLLECTED', (e: GameEvent<'ITEM_COLLECTED'>) => this.onItemCollected(e));
    this.eventBus.on('PLAYER_USED_ABILITY', (e: GameEvent<'PLAYER_USED_ABILITY'>) => this.onPlayerUsedAbility(e));
    this.eventBus.on('LEYLINE_INSTABILITY', (e: GameEvent<'LEYLINE_INSTABILITY'>) => this.onLeyLineInstability(e.data));
    this.eventBus.on('LEYLINE_SURGE', (e: GameEvent<'LEYLINE_SURGE'>) => this.onLeyLineInstability({
      id: 'auto',
      type: 'LEYLINE_SURGE',
      leyLineId: e.data.leyLineId,
      severity: 'moderate',
      triggeredBy: (e.data.triggeredBy as 'simulation' | 'player' | 'environment' | 'narrative') || 'simulation',
      timestamp: Date.now(),
      branchId: undefined,
      data: e.data
    }));
    this.eventBus.on('LEYLINE_DISRUPTION', (e: GameEvent<'LEYLINE_DISRUPTION'>) => this.onLeyLineInstability({
      id: 'auto',
      type: 'LEYLINE_DISRUPTION',
      leyLineId: e.data.leyLineId,
      severity: 'major',
      triggeredBy: (e.data.triggeredBy as 'simulation' | 'player' | 'environment' | 'narrative') || 'simulation',
      timestamp: Date.now(),
      branchId: undefined,
      data: e.data
    }));
    this.eventBus.on('RIFT_FORMED', (e: GameEvent<'RIFT_FORMED'>) => this.onLeyLineInstability({
      id: 'auto',
      type: 'RIFT_FORMED',
      leyLineId: e.data.leyLineId,
      severity: e.data.severity,
      triggeredBy: 'simulation',
      timestamp: e.data.timestamp,
      branchId: undefined,
      data: e.data
    }));
    // Cross-system integration: Listen for UL puzzle completion/validation
    ulEventBus.on('ul:puzzle:completed', (payload) => {
      // Example: advance mission, unlock branch, or trigger special outcome
      if (payload && payload.id) {
        // TODO: Map puzzle IDs to mission objectives or outcomes
        console.log(`[UL] MissionSystem: Puzzle completed: ${payload.id}`);
        // Example: this.advanceMissionForULPuzzle(payload.id);
      }
    });
    ulEventBus.on('ul:puzzle:validated', (payload) => {
      if (payload && payload.result === false && payload.errors) {
        // Optionally: fail or branch mission on repeated puzzle failure
        console.log(`[UL] MissionSystem: Puzzle validation failed: ${payload.id} - ${payload.errors.join(', ')}`);
      }
    });
  }

  startMission(mission: Mission) {
    // Add mission to player state in world state
    const state = this.worldStateManager.getState();
    const player = state.players.find(p => p.id === this.playerId);
    if (player) {
      if (!('missions' in player)) (player as any).missions = [];
      (player as any).missions.push(mission);
      this.worldStateManager.updateState({ players: state.players });
      this.eventBus.emit({ type: 'MISSION_STARTED', data: { missionId: mission.id } });
    }
  }

  private onEnemyDefeated = (event: GameEvent<'ENEMY_DEFEATED'>) => {
    this.updateObjectives('defeat', event.data.enemyId);
  };

  private onItemCollected = (event: GameEvent<'ITEM_COLLECTED'>) => {
    this.updateObjectives('collect', event.data.itemId);
  };

  private onPlayerUsedAbility = (event: GameEvent<'PLAYER_USED_ABILITY'>) => {
    // Example: update mission objectives for ability use
    // Extend MissionObjective type as needed for 'use_ability' objectives
    this.updateObjectives('use_ability', event.data.abilityId);
  };

  private updateObjectives(type: 'defeat' | 'collect' | 'use_ability', target: string) {
    const state = this.worldStateManager.getState();
    const player = state.players.find(p => p.id === this.playerId);
    if (!player || !(player as any).missions) return;
    let updated = false;
    for (const mission of (player as any).missions as Mission[]) {
      if (mission.status !== 'active') continue;
      for (const obj of mission.objectives) {
        if (obj.type === type && obj.target === target && !obj.completed) {
          obj.progress++;
          updated = true;
          if (obj.progress >= obj.count) {
            obj.completed = true;
            this.eventBus.emit({ type: 'MISSION_OBJECTIVE_COMPLETED', data: { missionId: mission.id, objectiveId: obj.id } });
          }
        }
      }
      // Check if all objectives complete
      if (mission.objectives.every(o => o.completed) && mission.status === 'active') {
        mission.status = 'completed';
        this.handleMissionOutcome(mission, 'victory_by_defeat');
        this.eventBus.emit({ type: 'MISSION_COMPLETED', data: { missionId: mission.id } });
      }
    }
    if (updated) {
      this.worldStateManager.updateState({ players: state.players });
    }
  }

  private handleMissionOutcome(mission: Mission, outcome: MissionOutcomeType) {
    mission.outcome = outcome;
    // Publish a generic outcome event for other systems to react
    this.eventBus.emit({ type: 'MISSION_OUTCOME', data: { missionId: mission.id, outcome } });

    // --- Outcome-specific logic (branching, rewards, world state, narrative, etc.) ---
    switch (outcome) {
      case 'victory_by_defeat':
        // Standard win: grant rewards, advance story
        this.handleVictory(mission);
        break;
      case 'defeat_by_death':
        // Player/party defeated: trigger fail state, respawn, or narrative consequences
        this.handleDefeat(mission);
        break;
      case 'retreat_escape':
        // Player escapes: partial rewards, update world state, possible consequences
        this.handleRetreat(mission);
        break;
      case 'surrender':
        // Surrender: negotiation, capture, or alternate path
        this.handleSurrender(mission);
        break;
      case 'capture_rescue':
        // Capture or rescue: unlock new objectives, allies, or story branches
        this.handleCaptureRescue(mission);
        break;
      case 'stalemate':
        // Stalemate: no clear winner, possible retry or consequences
        this.handleStalemate(mission);
        break;
      case 'diplomatic_resolution':
        // Diplomacy: avoid combat, unlock unique rewards or branches
        this.handleDiplomaticResolution(mission);
        break;
      case 'objective_accomplished':
        // Non-combat objective completed during combat
        this.handleObjectiveAccomplished(mission);
        break;
      case 'environmental_outcome':
        // Environment changes outcome (collapse, fire, etc.)
        this.handleEnvironmentalOutcome(mission);
        break;
      case 'transformation':
        // Player/enemy transformed (mind control, corruption, etc.)
        this.handleTransformation(mission);
        break;
      case 'betrayal_ally_switch':
        // Ally/enemy switches sides
        this.handleBetrayalAllySwitch(mission);
        break;
      case 'special_condition':
        // Custom/puzzle/ritual outcome
        this.handleSpecialCondition(mission);
        break;
      case 'mercy_spare':
        // Player spares enemy: future consequences
        this.handleMercySpare(mission);
        break;
      case 'recruitment':
        // Recruit enemy/NPC
        this.handleRecruitment(mission);
        break;
      case 'resource_depletion':
        // Player runs out of resources: force retreat or alternate path
        this.handleResourceDepletion(mission);
        break;
      default:
        // Unknown/custom outcome: modding hook
        this.handleCustomOutcome(mission, outcome);
        break;
    }

    // --- UI Feedback/Player Communication ---
    this.showOutcomeFeedback(mission, outcome);
  }

  // --- Outcome Handlers (stubs, extensible for modding) ---
  private handleVictory(_mission: Mission) {
    // Grant rewards, update world state, trigger narrative, etc.
    // TODO: Integrate with reward system and narrative engine
  }
  private handleDefeat(_mission: Mission) {
    // Trigger fail state, respawn, or alternate narrative
  }
  private handleRetreat(_mission: Mission) {
    // Partial rewards, update world state
  }
  private handleSurrender(_mission: Mission) {
    // Negotiation/capture logic
  }
  private handleCaptureRescue(_mission: Mission) {
    // Unlock new objectives/allies
  }
  private handleStalemate(_mission: Mission) {
    // Retry or consequences
  }
  private handleDiplomaticResolution(_mission: Mission) {
    // Unlock unique rewards/branches
  }
  private handleObjectiveAccomplished(_mission: Mission) {
    // Non-combat objective completed
  }
  private handleEnvironmentalOutcome(_mission: Mission) {
    // Environment-driven outcome
  }
  private handleTransformation(_mission: Mission) {
    // Mind control/corruption/etc.
  }
  private handleBetrayalAllySwitch(_mission: Mission) {
    // Ally/enemy switches sides
  }
  private handleSpecialCondition(_mission: Mission) {
    // Custom/puzzle/ritual
  }
  private handleMercySpare(_mission: Mission) {
    // Spare enemy, future consequences
  }
  private handleRecruitment(_mission: Mission) {
    // Recruit enemy/NPC
  }
  private handleResourceDepletion(_mission: Mission) {
    // Out of resources, force alternate path
  }
  private handleCustomOutcome(_mission: Mission, _outcome: MissionOutcomeType) {
    // Modding/extensibility hook for custom outcomes
  }

  // --- UI Feedback/Player Communication Stub ---
  private showOutcomeFeedback(_mission: Mission, _outcome: MissionOutcomeType) {
    // TODO: Integrate with UI system to show outcome to player
    // e.g., display modal, toast, or log entry
  }

  /**
   * Handle ley line instability event as a mission/narrative trigger (artifact-driven)
   * Artifact: leyline_instability_event_narrative_examples_2025-06-08.artifact
   */
  onLeyLineInstability(event: import('../leyline/types').LeyLineInstabilityEvent) {
    // Find active missions with ley line objectives
    const state = this.worldStateManager.getState();
    const player = state.players.find(p => p.id === this.playerId);
    if (!player || !(player as any).missions) return;
    for (const mission of (player as any).missions as Mission[]) {
      if (mission.status !== 'active') continue;
      // Example: objective type 'activate', 'custom', or target matches leyLineId
      const leyObj = mission.objectives.find(obj =>
        (obj.type === 'activate' || obj.type === 'custom') &&
        obj.target === event.leyLineId &&
        !obj.completed
      );
      if (leyObj) {
        // Progress or fail objective based on event type/severity
        if (event.type === 'LEYLINE_INSTABILITY' && event.severity === 'minor') {
          this.showOutcomeFeedback(mission, 'environmental_outcome');
        } else if (event.type === 'LEYLINE_SURGE' || event.severity === 'moderate') {
          this.showOutcomeFeedback(mission, 'special_condition');
        } else if (event.type === 'RIFT_FORMED' || event.severity === 'major') {
          this.showOutcomeFeedback(mission, 'resource_depletion');
        }
        // Optionally: mark objective as failed or escalate mission
        // TODO: Advance/fail/branch mission based on design
      }
    }
    // Global narrative feedback (if no mission matches)
    // (Optional: show generic feedback as before)
  }
}
