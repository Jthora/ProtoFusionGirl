// MissionSystem.ts
// Event-driven mission/quest system using WorldStateManager and EventBus
// See: world_state_system_design_2025-06-04.artifact

import { WorldStateManager } from '../WorldStateManager';
import { EventBus, WorldEvent } from '../EventBus';

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
    this.eventBus.subscribe('ENEMY_DEFEATED', this.onEnemyDefeated);
    this.eventBus.subscribe('ITEM_COLLECTED', this.onItemCollected);
    // Listen for ability use events
    // Use .subscribe instead of .on for event bus
    this.eventBus.subscribe('PLAYER_USED_ABILITY', this.onPlayerUsedAbility);
  }

  startMission(mission: Mission) {
    // Add mission to player state in world state
    const state = this.worldStateManager.getState();
    const player = state.players.find(p => p.id === this.playerId);
    if (player) {
      if (!('missions' in player)) (player as any).missions = [];
      (player as any).missions.push(mission);
      this.worldStateManager.updateState({ players: state.players });
      this.eventBus.publish({
        id: `mission_started_${mission.id}`,
        type: 'MISSION_STARTED',
        data: { missionId: mission.id, playerId: this.playerId },
        timestamp: Date.now(),
        version: state.version
      });
    }
  }

  private onEnemyDefeated = (event: WorldEvent) => {
    this.updateObjectives('defeat', event.data.enemyType);
  };

  private onItemCollected = (event: WorldEvent) => {
    this.updateObjectives('collect', event.data.itemType);
  };

  private onPlayerUsedAbility = (event: { type: string; data: { playerId: string; abilityId: string } }) => {
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
            this.eventBus.publish({
              id: `objective_completed_${obj.id}`,
              type: 'MISSION_OBJECTIVE_COMPLETED',
              data: { missionId: mission.id, objectiveId: obj.id, playerId: this.playerId },
              timestamp: Date.now(),
              version: state.version
            });
          }
        }
      }
      // Check if all objectives complete
      if (mission.objectives.every(o => o.completed) && mission.status === 'active') {
        mission.status = 'completed';
        this.handleMissionOutcome(mission, 'victory_by_defeat');
        this.eventBus.publish({
          id: `mission_completed_${mission.id}`,
          type: 'MISSION_COMPLETED',
          data: { missionId: mission.id, playerId: this.playerId },
          timestamp: Date.now(),
          version: state.version
        });
      }
    }
    if (updated) {
      this.worldStateManager.updateState({ players: state.players });
    }
  }

  private handleMissionOutcome(mission: Mission, outcome: MissionOutcomeType) {
    mission.outcome = outcome;
    // Publish a generic outcome event for other systems to react
    this.eventBus.publish({
      id: `mission_outcome_${mission.id}`,
      type: 'MISSION_OUTCOME',
      data: { missionId: mission.id, playerId: this.playerId, outcome },
      timestamp: Date.now(),
      version: this.worldStateManager.getState().version
    });

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
}
