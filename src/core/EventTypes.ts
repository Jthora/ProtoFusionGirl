// EventTypes.ts
// Defines all event names and payload types for the event-driven architecture.
// Artifact-driven extension for test system overhaul (see artifacts/test_system_traceability_2025-06-08.artifact)

export type EventName =
  | 'JANE_LEVEL_UP'
  | 'CHARACTER_MOVED'
  | 'COMBAT_STARTED'
  | 'NARRATIVE_TRIGGER'
  | 'ITEM_COLLECTED'
  | 'FACTION_REPUTATION_CHANGED'
  | 'JANE_ASI_OVERRIDE'
  | 'JANE_DAMAGED'
  | 'JANE_DEFEATED'
  | 'JANE_HEALED'
  | 'JANE_PSI_USED'
  | 'JANE_PSI_RESTORED'
  | 'JANE_MOUNTED_SPEEDER'
  | 'JANE_DISMOUNTED_SPEEDER'
  | 'SPEEDER_MODE_CHANGED'
  | 'JANE_PSI_USED_FOR_SPEEDER'
  | 'SPEEDER_MOVED'
  | 'JANE_MOVED'
  | 'SPEEDER_ATTACK'
  | 'SPEEDER_PSI_ATTACK'
  | 'SPEEDER_ATTACK_FAILED'
  | 'SPEEDER_DAMAGED'
  | 'SPEEDER_DISABLED'
  | 'PLAYER_ATTACKED'
  | 'ENEMY_ATTACKED'
  | 'ENEMY_DEFEATED'
  | 'PLAYER_DEFEATED'
  | 'LEYLINE_ACTIVATED'
  | 'LEYLINE_SURGE'
  | 'LEYLINE_DISRUPTION'
  | 'LEYLINE_MANIPULATION'
  | 'TILE_EDITED'
  | 'SPEEDER_ENERGY_UPDATED'
  | 'SPEEDER_HAZARD'
  | 'OVERLAY_SHOW'
  | 'OVERLAY_HIDE'
  | 'NOTIFICATION_SHOW'
  | 'MINIMAP_LEYLINE_UPDATE'
  | 'MINIMAP_OVERLAY_TOGGLE'
  | 'GAMELOOP_POST_UPDATE'
  | 'LEYLINE_INSTABILITY'
  | 'RIFT_FORMED'
  | 'MISSION_STARTED'
  | 'MISSION_OBJECTIVE_COMPLETED'
  | 'MISSION_COMPLETED'
  | 'MISSION_OUTCOME'
  | 'PLAYER_USED_ABILITY'
  | 'RESOURCE_COLLECTED'
  | 'STATE_UPDATED'
  | 'NARRATIVE_EVENT'
  | 'TECH_LEVEL_ADVANCED'
  | 'TECH_LEVEL_REGRESSED';

export interface EventPayloads {
  JANE_LEVEL_UP: { level: number };
  CHARACTER_MOVED: { id: string; x: number; y: number };
  COMBAT_STARTED: { participants: string[] };
  NARRATIVE_TRIGGER: { eventId: string };
  ITEM_COLLECTED: { itemId: string; ownerId: string };
  FACTION_REPUTATION_CHANGED: { factionId: string; value: number };
  JANE_ASI_OVERRIDE: { enabled: boolean };
  JANE_DAMAGED: { amount: number; health: number };
  JANE_DEFEATED: {};
  JANE_HEALED: { amount: number; health: number };
  JANE_PSI_USED: { amount: number; psi: number };
  JANE_PSI_RESTORED: { amount: number; psi: number };
  JANE_MOUNTED_SPEEDER: {};
  JANE_DISMOUNTED_SPEEDER: {};
  SPEEDER_MODE_CHANGED: { mode: 'manual' | 'auto' };
  JANE_PSI_USED_FOR_SPEEDER: { psiAmount: number };
  SPEEDER_MOVED: { x: number; y: number };
  JANE_MOVED: { x: number; y: number };
  SPEEDER_ATTACK: { type: string };
  SPEEDER_PSI_ATTACK: { type: string; psiCost: number };
  SPEEDER_ATTACK_FAILED: { reason: string };
  SPEEDER_DAMAGED: { amount: number; energy: number };
  SPEEDER_DISABLED: {};
  PLAYER_ATTACKED: { attackerId: string; targetId: string; attackId: string; damage: number };
  ENEMY_ATTACKED: { attackerId: string; targetId: string; attackId: string; damage: number };
  ENEMY_DEFEATED: { enemyId: string };
  PLAYER_DEFEATED: { playerId: string };
  LEYLINE_ACTIVATED: { leyLineId: string };
  LEYLINE_SURGE: { leyLineId: string; magnitude?: number; narrativeContext?: string; affectedTiles?: Array<{ x: number; y: number }>; triggeredBy?: string };
  LEYLINE_DISRUPTION: { leyLineId: string; narrativeContext?: string; affectedTiles?: Array<{ x: number; y: number }>; triggeredBy?: string };
  LEYLINE_MANIPULATION: { leyLineId: string; status: 'stable' | 'unstable'; narrativeContext?: string };
  TILE_EDITED: { x: number; y: number; prevTile: string; newTile: string };
  SPEEDER_ENERGY_UPDATED: { energy: number };
  SPEEDER_HAZARD: { hazard: string; effect: string };
  OVERLAY_SHOW: import('../ui/AgentOptimizedUI').OverlayConfig;
  OVERLAY_HIDE: { id: string };
  NOTIFICATION_SHOW: { role: 'ASI' | 'Jane'; message: string; context?: any };
  MINIMAP_LEYLINE_UPDATE: { leyLines: import('../world/leyline/types').LeyLine[]; eventOverlays?: any[] };
  MINIMAP_OVERLAY_TOGGLE: { visible?: boolean };
  GAMELOOP_POST_UPDATE: { dt: number };
  LEYLINE_INSTABILITY: import('../world/leyline/types').LeyLineInstabilityEvent;
  RIFT_FORMED: { leyLineId: string; nodeId?: string; severity: 'minor' | 'moderate' | 'major'; timestamp: number; narrativeContext?: string };
  MISSION_STARTED: { missionId: string };
  MISSION_OBJECTIVE_COMPLETED: { missionId: string; objectiveId: string };
  MISSION_COMPLETED: { missionId: string };
  MISSION_OUTCOME: { missionId: string; outcome: string };
  PLAYER_USED_ABILITY: { abilityId: string; playerId: string };
  RESOURCE_COLLECTED: { resourceId: string; amount: number };
  STATE_UPDATED: { state: any };
  NARRATIVE_EVENT: { eventId: string; data?: any };
  TECH_LEVEL_ADVANCED: { techLevel: string; branchId?: string };
  TECH_LEVEL_REGRESSED: { techLevel: string; branchId?: string };
}

export type GameEvent<T extends EventName = EventName> = {
  type: T;
  data: EventPayloads[T];
};
