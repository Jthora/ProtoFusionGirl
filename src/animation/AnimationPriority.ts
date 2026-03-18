// AnimationPriority.ts
// Numeric priority levels for all character animations.
// Higher number = higher priority = harder to interrupt.

export const AnimationPriority = {
  // One-shot terminal
  DEATH:        10,
  // Combat actions
  ATTACK:        8,
  COMBO:         8,
  // Expressive / reactive
  REFUSING:      6,
  CELEBRATE:     5,
  BORED:         5,
  UL_GESTURE:    5,
  // Movement
  DASH:          5,
  SKID:          5,
  LEAP:          5,
  // Air states
  LAND_HARD:     5,
  LAND_MID:      4,
  LAND_LIGHT:    4,
  JUMP_START:    4,
  JUMP_APEX:     3,
  FALL:          3,
  // Ground locomotion
  RETREAT:       4,
  COMBAT_IDLE:   3,
  RUN:           3,
  WALK:          2,
  STAND:         2,
  IDLE:          1,
} as const;

export type PriorityLevel = (typeof AnimationPriority)[keyof typeof AnimationPriority];

/** Map from animation key prefix to priority level. */
const KEY_PRIORITY_MAP: Record<string, PriorityLevel> = {
  jane_death:       AnimationPriority.DEATH,
  jane_attack_1:    AnimationPriority.ATTACK,
  jane_attack_2:    AnimationPriority.ATTACK,
  jane_combo:       AnimationPriority.COMBO,
  jane_refusing:    AnimationPriority.REFUSING,
  jane_celebrate:   AnimationPriority.CELEBRATE,
  jane_bored:       AnimationPriority.BORED,
  jane_ul_gesture:  AnimationPriority.UL_GESTURE,
  jane_dash:        AnimationPriority.DASH,
  jane_skid:        AnimationPriority.SKID,
  jane_leap_start:  AnimationPriority.LEAP,
  jane_land_hard:   AnimationPriority.LAND_HARD,
  jane_land_mid:    AnimationPriority.LAND_MID,
  jane_land_light:  AnimationPriority.LAND_LIGHT,
  jane_jump_start:  AnimationPriority.JUMP_START,
  jane_jump_apex:   AnimationPriority.JUMP_APEX,
  jane_fall:        AnimationPriority.FALL,
  jane_retreat:     AnimationPriority.RETREAT,
  jane_combat_idle: AnimationPriority.COMBAT_IDLE,
  jane_run:         AnimationPriority.RUN,
  jane_walk:        AnimationPriority.WALK,
  jane_stand:       AnimationPriority.STAND,
  jane_idle:        AnimationPriority.IDLE,
};

/** Look up priority for an animation key (default: 1 if unknown). */
export function getPriority(animKey: string): PriorityLevel {
  return (KEY_PRIORITY_MAP[animKey] as PriorityLevel | undefined) ?? AnimationPriority.IDLE;
}

/**
 * Returns true if `incoming` animation is allowed to interrupt `current`.
 * Same priority allows interruption (e.g. attack→attack for combos).
 */
export function canInterrupt(currentKey: string, incomingKey: string): boolean {
  const currentPriority = getPriority(currentKey);
  const incomingPriority = getPriority(incomingKey);
  return incomingPriority >= currentPriority;
}
