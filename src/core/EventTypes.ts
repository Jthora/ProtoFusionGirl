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
  | 'STARTING_LOCATION_SET'
  | 'MISSION_OUTCOME'
  | 'PLAYER_USED_ABILITY'
  | 'RESOURCE_COLLECTED'
  | 'STATE_UPDATED'
  | 'NARRATIVE_EVENT'
  | 'TECH_LEVEL_ADVANCED'
  | 'TECH_LEVEL_REGRESSED'
  | 'ASI_GUIDANCE_GIVEN'
  | 'GUIDANCE_ACCEPTED'
  | 'JANE_RESPONSE'
  | 'TRUST_CHANGED'
  | 'THREAT_DETECTED'
  | 'THREAT_RESOLVED'
  | 'MAGIC_CAST'
  | 'GUIDANCE_SELECTED'
  | 'COMMAND_CENTER_ACTIVATED'
  | 'COMMAND_CENTER_DEACTIVATED'
  | 'ASI_MODE_CHANGED'
  | 'SHIELD_WINDOW_STARTED'
  | 'SHIELD_WINDOW_ENDED'
  // Navigation & speed category events (added for test coverage & unification)
  | 'SPEED_CATEGORY_TRANSITION'
  | 'SUPERSONIC_ENTRY'
  | 'SUPERSONIC_EXIT'
  | 'HYPERSONIC_ENTRY'
  | 'HYPERSONIC_EXIT'
  | 'WARP_BOOM_ACTIVATED'
  | 'NAVIGATION_AUTOPILOT_ENGAGED'
  | 'NAVIGATION_AUTOPILOT_DISENGAGED'
  | 'NAVIGATION_PATH_SET'
  | 'NAVIGATION_PATH_CLEARED'
  | 'SPEED_MODE_CHANGED'
  | 'HYPERSONIC_MODE_TOGGLED'
  | 'QUICK_SPEED_SET'
  | 'SPEED_CATEGORY_CHANGED'
  | 'SPEED_UPDATE'
  | 'EMERGENCY_STOP'
  | 'NAVIGATION_UI_UPDATE'
  | 'NAVIGATION_PHYSICS_UPDATE'
  | 'EMERGENCY_DECELERATION_REQUEST'
  | 'LEYLINE_SPEED_BOOST_ACTIVE'
  | 'LEYLINE_SPEED_BOOST_INACTIVE'
  | 'LEYLINE_ENTERED'
  | 'LEYLINE_EXITED'
  | 'tileEdit' // legacy alias
  // Legacy/compat events used in older tests
  | 'WORLD_LOADED'
  | 'game_start'
  | 'UNLOCK_COSMETIC'
  | 'EQUIP_COSMETIC'
  // Jane AI state machine events (P1)
  | 'ASI_WAYPOINT_PLACED'
  | 'ASI_WAYPOINT_CLEARED'
  | 'JANE_STATE_CHANGED'
  | 'JANE_ANIMATION_CHANGED'
  | 'JANE_ARRIVED_AT_WAYPOINT'
  // P2: Combat events
  | 'JANE_ATTACK'
  | 'JANE_RETREAT_STARTED'
  | 'JANE_RETREAT_ENDED'
  | 'ENEMY_SPAWNED'
  // P2: World state events
  | 'NODE_STABILITY_CHANGED'
  | 'NODE_COLLAPSED'
  | 'SURGE_WARNING'
  | 'SURGE_TRIGGERED'
  // P2: Death/respawn events
  | 'JANE_RESPAWN'
  | 'CHECKPOINT_SET'
  // P3: UL Puzzle events
  | 'UL_PUZZLE_OPENED'
  | 'UL_PUZZLE_SYMBOL_SELECTED'
  | 'UL_PUZZLE_DEPLOYED'
  | 'UL_PUZZLE_SUCCESS'
  | 'UL_PUZZLE_FAILURE'
  | 'UL_RIFT_SEALED'
  // P3: Companion events
  | 'COMPANION_SPAWNED'
  | 'COMPANION_STATE_CHANGED'
  | 'COMPANION_SHIELD_ACTIVATED'
  | 'COMPANION_COMMAND'
  | 'ROBOT_SUMMONED'
  // P3: Rift events
  | 'RIFT_SPAWNED'
  | 'RIFT_ENEMY_WAVE'
  | 'RIFT_SEALED'
  | 'RIFT_EXPANDED'
  // P3: Emergent events
  | 'DISTRESS_SIGNAL'
  | 'SURGE_GENERATED'
  // P3: Faction events
  | 'FACTION_REPUTATION_ADJUSTED'
  | 'FACTION_THRESHOLD_REACHED'
  // P3: Jane advanced behavior
  | 'JANE_BOREDOM_TRIGGERED'
  | 'JANE_WANDER_STARTED'
  | 'UL_EXPOSURE_INCREMENTED'
  | 'JANE_REFUSED_GUIDANCE'
  | 'JANE_CALL_FOR_HELP'
  | 'BOOST_ACTIVATED'
  | 'BOOST_COOLDOWN_STARTED'
  // P4: Time Mechanics
  | 'HISTORY_RECORDED'
  | 'REWIND_STARTED'
  | 'REWIND_COMPLETED'
  // P4: Cosmic Calendar
  | 'COSMIC_DAY_CHANGED'
  | 'COSMIC_PHASE_CHANGED'
  // P4: Narrative
  | 'JONO_DIALOGUE_TRIGGERED'
  | 'JONO_FIRST_CONTACT'
  // P4: Environment
  | 'DOOR_STATE_CHANGED'
  | 'NODE_DEFENSE_STATE_CHANGED'
  | 'ENERGY_CONDUIT_REDIRECTED'
  // P4: Fast Travel
  | 'FAST_TRAVEL_STARTED'
  | 'FAST_TRAVEL_ARRIVED'
  | 'TRANSIT_EVENT'
  // P5: UL Learning
  | 'UL_MASTERY_CHANGED'
  | 'JANE_UL_ATTEMPT'
  | 'ASI_FEEDBACK_GIVEN'
  | 'UL_MISCOMMUNICATION'
  // FE-1/FE-6: Beu lifecycle events
  | 'BEU_SEED_APPEAR'
  | 'BEU_STAGE_CHANGED'
  | 'UL_GUIDED_BOUNCE'
  // P5: Scoring & Timeline
  | 'TIMELINE_SCORE_UPDATED'
  | 'PSINET_ACTION_LOGGED';

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
  STARTING_LOCATION_SET: { location: any; timestamp: number };
  MISSION_OUTCOME: { missionId: string; outcome: string };
  PLAYER_USED_ABILITY: { abilityId: string; playerId: string };
  RESOURCE_COLLECTED: { resourceId: string; amount: number };
  STATE_UPDATED: { state: any };
  NARRATIVE_EVENT: { eventId: string; data?: any };
  TECH_LEVEL_ADVANCED: { techLevel: string; branchId?: string };
  TECH_LEVEL_REGRESSED: { techLevel: string; branchId?: string };
  // ASI Control Interface Events
  ASI_GUIDANCE_GIVEN: { suggestion: any; context: any };
  GUIDANCE_ACCEPTED: { guidanceId: string; trustChange?: number };
  JANE_RESPONSE: { guidanceId: string; followed: boolean; responseTime: number; trustChange: number };
  TRUST_CHANGED: { previousLevel: number; currentLevel: number; change: number; trend: 'increasing' | 'decreasing' | 'stable' };
  THREAT_DETECTED: { threat: any };
  THREAT_RESOLVED: { threatId: string; resolution: 'avoided' | 'handled' | 'ignored' };
  MAGIC_CAST: { symbolId: string; combination?: string[]; targetPosition: { x: number; y: number }; success: boolean; trustLevel: number };
  GUIDANCE_SELECTED: { suggestion: any; timestamp: number };
  COMMAND_CENTER_ACTIVATED: { timestamp: number; mode: 'full' | 'minimal' };
  COMMAND_CENTER_DEACTIVATED: { timestamp: number; duration: number };
  ASI_MODE_CHANGED: { previousMode: string; newMode: string; timestamp: number };
  SHIELD_WINDOW_STARTED: { timestamp: number; cooldownUntil: number };
  SHIELD_WINDOW_ENDED: { timestamp: number; cooldownUntil: number };
  // Navigation & speed
  SPEED_CATEGORY_TRANSITION: { previousCategory: string; newCategory: string; speedKmh: number; mach?: number; from?: string; to?: string; timestamp?: number; oldConfig?: any; newConfig?: any };
  SUPERSONIC_ENTRY: { speedKmh?: number; mach?: number; timestamp?: number };
  SUPERSONIC_EXIT: { speedKmh?: number; mach?: number; timestamp?: number };
  HYPERSONIC_ENTRY: { speedKmh?: number; mach?: number; timestamp?: number; warpBoomArmed?: boolean };
  HYPERSONIC_EXIT: { speedKmh?: number; mach?: number; timestamp?: number; warpBoomDisarmed?: boolean };
  WARP_BOOM_ACTIVATED: { speedKmh?: number; mach?: number; energyCost?: number; timestamp?: number };
  NAVIGATION_AUTOPILOT_ENGAGED: { mode: string; timestamp: number };
  NAVIGATION_AUTOPILOT_DISENGAGED: { mode: string; timestamp: number; durationMs: number };
  NAVIGATION_PATH_SET: { waypoints: Array<{ x: number; y: number }>; totalDistance: number };
  NAVIGATION_PATH_CLEARED: { reason: string };
  SPEED_MODE_CHANGED: { mode: string; previousMode?: string };
  HYPERSONIC_MODE_TOGGLED: { enabled: boolean };
  QUICK_SPEED_SET: { speedKmh: number; level?: number };
  SPEED_CATEGORY_CHANGED: { previousCategory: string; newCategory: string; speedKmh: number; mach?: number; from?: string; to?: string; timestamp?: number };
  SPEED_UPDATE: { speedKmh: number; category: string; mach?: number; currentSpeedKmh?: number; targetSpeedKmh?: number; speedMode?: string; isAccelerating?: boolean };
  EMERGENCY_STOP: { reason?: string; speedBefore?: number; timestamp?: number };
  NAVIGATION_UI_UPDATE: { speedKmh: number; speedConfig: any; playerState: any; machNumber: number };
  NAVIGATION_PHYSICS_UPDATE: { speedConfig: any; physicsSubsteps: number; collisionMethod: string; deltaTime: number };
  EMERGENCY_DECELERATION_REQUEST: { reason?: string };
  LEYLINE_SPEED_BOOST_ACTIVE: { boostMultiplier: number; timestamp: number };
  LEYLINE_SPEED_BOOST_INACTIVE: { timestamp: number };
  LEYLINE_ENTERED: { leyLineId?: string; leylineId?: string; timestamp?: number };
  LEYLINE_EXITED: { leyLineId?: string; leylineId?: string; timestamp?: number };
  tileEdit: { x?: number; y?: number; [k: string]: any };
  // Legacy payloads for shimmed events
  WORLD_LOADED: { zoneCount?: number; leyLineCount?: number };
  game_start: {};
  UNLOCK_COSMETIC: { cosmeticId: string };
  EQUIP_COSMETIC: { cosmeticId: string };
  // Jane AI state machine events (P1)
  ASI_WAYPOINT_PLACED: { x: number; y: number; id: string };
  ASI_WAYPOINT_CLEARED: { id: string; reason: 'arrived' | 'replaced' | 'cancelled' };
  JANE_STATE_CHANGED: { previousState: string; newState: string };
  JANE_ARRIVED_AT_WAYPOINT: { waypointId: string; x: number; y: number };
  // P2: Combat events
  JANE_ATTACK: { targetId: string; damage: number; weaponType: string };
  JANE_RETREAT_STARTED: { fromX: number; fromY: number; reason: string };
  JANE_RETREAT_ENDED: { atX: number; atY: number };
  ENEMY_SPAWNED: { enemyId: string; enemyType: string; x: number; y: number };
  // P2: World state events
  NODE_STABILITY_CHANGED: { nodeId: string; previousStability: number; newStability: number };
  NODE_COLLAPSED: { nodeId: string; x: number; y: number };
  SURGE_WARNING: { nodeId: string; stability: number };
  SURGE_TRIGGERED: { nodeId: string; severity: 'minor' | 'moderate' | 'major' };
  // P2: Death/respawn events
  JANE_RESPAWN: { x: number; y: number; checkpointId: string };
  CHECKPOINT_SET: { checkpointId: string; x: number; y: number };
  // P3: UL Puzzle events
  UL_PUZZLE_OPENED: { targetId: string; targetType: string; x: number; y: number };
  UL_PUZZLE_SYMBOL_SELECTED: { symbolBase: string; symbolModifier: string };
  UL_PUZZLE_DEPLOYED: { targetId: string; symbolBase: string; symbolModifier: string; resultSymbol: string };
  UL_PUZZLE_SUCCESS: { targetId: string; effect: string; resultSymbol: string };
  UL_PUZZLE_FAILURE: { targetId: string; attempted: string; reason: string };
  UL_RIFT_SEALED: { riftId: string; nodeId: string; symbolUsed: string };
  // P3: Companion events
  COMPANION_SPAWNED: { companionId: string; companionType: string; x: number; y: number };
  COMPANION_STATE_CHANGED: { companionId: string; previousState: string; newState: string };
  COMPANION_SHIELD_ACTIVATED: { companionId: string; targetId: string; duration: number };
  COMPANION_COMMAND: { companionId: string; command: string; x?: number; y?: number };
  ROBOT_SUMMONED: { robotId: string; robotType: string; x: number; y: number };
  // P3: Rift events
  RIFT_SPAWNED: { riftId: string; nodeId: string; x: number; y: number };
  RIFT_ENEMY_WAVE: { riftId: string; enemyType: string; count: number };
  RIFT_SEALED: { riftId: string; nodeId: string; sealedBy: string };
  RIFT_EXPANDED: { riftId: string; newRadius: number };
  // P3: Emergent events
  DISTRESS_SIGNAL: { sourceId: string; sourceType: string; x: number; y: number; reason: string };
  SURGE_GENERATED: { nodeId: string; intensity: number };
  // P3: Faction events
  FACTION_REPUTATION_ADJUSTED: { factionId: string; previousRep: number; newRep: number; reason: string };
  FACTION_THRESHOLD_REACHED: { factionId: string; threshold: string; reputation: number };
  // P3: Jane advanced behavior
  JANE_BOREDOM_TRIGGERED: { idleTime: number };
  JANE_WANDER_STARTED: { targetX: number; targetY: number };
  UL_EXPOSURE_INCREMENTED: { totalExposure: number; symbolUsed: string };
  JANE_REFUSED_GUIDANCE: { reason: string; guidanceType: string };
  JANE_CALL_FOR_HELP: { enemyCount: number; x: number; y: number };
  BOOST_ACTIVATED: { speedMultiplier: number; duration: number };
  BOOST_COOLDOWN_STARTED: { cooldownMs: number };
  // FE-6: First UL Moment
  BEU_STAGE_CHANGED: { stage: string };
  UL_GUIDED_BOUNCE: { targetId: string; attempted: string };
  BEU_SEED_APPEAR: {};
}

export type GameEvent<T extends EventName = EventName> = {
  type: T;
  data: T extends keyof EventPayloads ? EventPayloads[T] : any;
};
