// animationCatalog.ts
// Single source of truth for all Phaser animation keys and their config.
// Matches sprite-catalog.json exactly — update both together.

import { JaneAIState } from '../ai/JaneAIState';

// ─── Jane animation keys ────────────────────────────────────────────────────

export const JANE_ANIMATION_KEYS = {
  IDLE:         'jane_idle',
  WALK:         'jane_walk',
  RUN:          'jane_run',
  STAND:        'jane_stand',
  COMBAT_IDLE:  'jane_combat_idle',
  ATTACK_1:     'jane_attack_1',
  ATTACK_2:     'jane_attack_2',
  COMBO:        'jane_combo',
  DASH:         'jane_dash',
  SKID:         'jane_skid',
  LEAP_START:   'jane_leap_start',
  RETREAT:      'jane_retreat',
  JUMP_START:   'jane_jump_start',
  JUMP_APEX:    'jane_jump_apex',
  FALL:         'jane_fall',
  LAND_HARD:    'jane_land_hard',
  LAND_MID:     'jane_land_mid',
  LAND_LIGHT:   'jane_land_light',
  DEATH:        'jane_death',
  BORED:        'jane_bored',
  REFUSING:     'jane_refusing',
  UL_GESTURE:   'jane_ul_gesture',
  CELEBRATE:    'jane_celebrate',
} as const;

export type JaneAnimationKey = typeof JANE_ANIMATION_KEYS[keyof typeof JANE_ANIMATION_KEYS];

// ─── Jane animation specs (fps + loop + hold) ────────────────────────────────

export interface AnimSpec {
  fps: number;
  frames: number;
  loop: boolean;
  hold: boolean;
}

export const JANE_ANIM_SPEC: Record<JaneAnimationKey, AnimSpec> = {
  jane_idle:        { fps: 8,  frames: 8,  loop: true,  hold: false },
  jane_walk:        { fps: 12, frames: 12, loop: true,  hold: false },
  jane_run:         { fps: 16, frames: 16, loop: true,  hold: false },
  jane_stand:       { fps: 6,  frames: 4,  loop: true,  hold: false },
  jane_combat_idle: { fps: 8,  frames: 8,  loop: true,  hold: false },
  jane_attack_1:    { fps: 16, frames: 8,  loop: false, hold: true  },
  jane_attack_2:    { fps: 16, frames: 8,  loop: false, hold: true  },
  jane_combo:       { fps: 16, frames: 16, loop: false, hold: true  },
  jane_dash:        { fps: 16, frames: 6,  loop: false, hold: true  },
  jane_skid:        { fps: 12, frames: 8,  loop: false, hold: true  },
  jane_leap_start:  { fps: 12, frames: 6,  loop: false, hold: true  },
  jane_retreat:     { fps: 12, frames: 12, loop: true,  hold: false },
  jane_jump_start:  { fps: 16, frames: 6,  loop: false, hold: true  },
  jane_jump_apex:   { fps: 8,  frames: 4,  loop: true,  hold: false },
  jane_fall:        { fps: 8,  frames: 6,  loop: true,  hold: false },
  jane_land_hard:   { fps: 16, frames: 8,  loop: false, hold: true  },
  jane_land_mid:    { fps: 16, frames: 6,  loop: false, hold: true  },
  jane_land_light:  { fps: 16, frames: 4,  loop: false, hold: true  },
  jane_death:       { fps: 12, frames: 16, loop: false, hold: true  },
  jane_bored:       { fps: 8,  frames: 20, loop: false, hold: true  },
  jane_refusing:    { fps: 12, frames: 12, loop: false, hold: true  },
  jane_ul_gesture:  { fps: 12, frames: 16, loop: false, hold: true  },
  jane_celebrate:   { fps: 12, frames: 20, loop: false, hold: false },
};

// ─── JaneAI state → animation mapping ───────────────────────────────────────

export const JANE_STATE_TO_ANIMATION: Record<JaneAIState, JaneAnimationKey> = {
  [JaneAIState.Idle]:            'jane_idle',
  [JaneAIState.Navigate]:        'jane_walk',
  [JaneAIState.FollowGuidance]:  'jane_walk',
  [JaneAIState.Combat]:          'jane_combat_idle',
  [JaneAIState.Retreat]:         'jane_retreat',
  [JaneAIState.Bored]:           'jane_bored',
  [JaneAIState.Refusing]:        'jane_refusing',
};

// ─── Walk / run speed threshold ──────────────────────────────────────────────

/** Switch from jane_walk to jane_run above this horizontal speed (px/s). */
export const WALK_RUN_THRESHOLD_PX_S = 200;

// ─── Looping animations ──────────────────────────────────────────────────────

export const LOOPING_ANIMATIONS = new Set<JaneAnimationKey>([
  'jane_idle',
  'jane_walk',
  'jane_run',
  'jane_stand',
  'jane_combat_idle',
  'jane_retreat',
  'jane_jump_apex',
  'jane_fall',
]);
