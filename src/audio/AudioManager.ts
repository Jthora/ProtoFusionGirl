// AudioManager.ts
// ProtoFusionGirl — Innovative spatial/adaptive audio system.
//
// Design pillars:
//   1. Sound pools — groups of variants played with smart selection strategies
//   2. Spatial ambient zones — X-position-driven ambient crossfading as Jane moves
//   3. Tension heartbeat — passive urgency layer driven by node stability
//   4. Rift contamination — intermittent glitch sounds near rifts, proximity-scaled
//   5. Positional stereo — SFX panned by world-relative source position
//   6. Cooldown registry — prevents machine-gun re-triggering
//   7. Trust-weighted variant selection — sound texture reacts to ASI trust level

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { POOLS } from './CombinatorialPool';

// ─── Asset key registry ───────────────────────────────────────────────────────

export const AUDIO_KEYS = {
  // Music / ambient loops (1st pass)
  MUSIC_MAIN_MENU:        'music_main_menu',
  MUSIC_GAMEPLAY_LOOP:    'music_gameplay_loop',
  MUSIC_HOLODECK_AMBIENT: 'music_holodeck_ambient',
  MUSIC_PSINET_AMBIENT:   'music_psinet_ambient',
  MUSIC_PSISYS_AWAKENING: 'music_psisys_awakening',
  MUSIC_TRAINING_LOOP:    'music_training_loop',
  // SFX pools — 1st pass (use pool keys without _N suffix)
  SFX_UI_CLICK:           'sfx_ui_click',
  SFX_BOOT_SEQUENCE:      'sfx_boot_sequence',
  SFX_CONNECTION_OK:      'sfx_connection_ok',
  SFX_PSINET_HANDSHAKE:   'sfx_psinet_handshake',
  SFX_PSISYS_OK:          'sfx_psisys_ok',
  SFX_WAYPOINT_PLACED:    'sfx_waypoint_placed',
  SFX_NODE_CONFIRM:       'sfx_node_confirm',
  SFX_NODE_COLLAPSED:     'sfx_node_collapsed',
  SFX_RIFT_CONTAMINATION: 'sfx_rift_contamination',
  SFX_THREAT_DETECTED:    'sfx_threat_detected',
  SFX_SHIELD_BREAK:       'sfx_shield_break',
  SFX_ATTACK:             'sfx_attack',
  SFX_ENEMY_DEATH:        'sfx_enemy_death',
  SFX_SPEEDER_SUMMON:     'sfx_speeder_summon',
  SFX_SPEEDER_BOOST:      'sfx_speeder_boost',
  SFX_FOOTSTEP:           'sfx_footstep',
  SFX_UL_CAST:            'sfx_ul_cast',
  SFX_UL_PICKUP:          'sfx_ul_pickup',
  SFX_UL_AXIOM:           'sfx_ul_axiom',
  SFX_UL_REVELATION:      'sfx_ul_revelation',
  SFX_TIMELINE_FAILURE:   'sfx_timeline_failure',
  SFX_BEU_LEVELUP:        'sfx_beu_levelup',
  // HarmonicEngine tones (12 tones × 3 variants = 36 files in audio/harmonic/)
  HM_TONE_0_V1: 'hm_tone_0_v1', HM_TONE_0_V2: 'hm_tone_0_v2', HM_TONE_0_V3: 'hm_tone_0_v3',
  HM_TONE_1_V1: 'hm_tone_1_v1', HM_TONE_1_V2: 'hm_tone_1_v2', HM_TONE_1_V3: 'hm_tone_1_v3',
  HM_TONE_2_V1: 'hm_tone_2_v1', HM_TONE_2_V2: 'hm_tone_2_v2', HM_TONE_2_V3: 'hm_tone_2_v3',
  HM_TONE_3_V1: 'hm_tone_3_v1', HM_TONE_3_V2: 'hm_tone_3_v2', HM_TONE_3_V3: 'hm_tone_3_v3',
  HM_TONE_4_V1: 'hm_tone_4_v1', HM_TONE_4_V2: 'hm_tone_4_v2', HM_TONE_4_V3: 'hm_tone_4_v3',
  HM_TONE_5_V1: 'hm_tone_5_v1', HM_TONE_5_V2: 'hm_tone_5_v2', HM_TONE_5_V3: 'hm_tone_5_v3',
  HM_TONE_6_V1: 'hm_tone_6_v1', HM_TONE_6_V2: 'hm_tone_6_v2', HM_TONE_6_V3: 'hm_tone_6_v3',
  HM_TONE_7_V1: 'hm_tone_7_v1', HM_TONE_7_V2: 'hm_tone_7_v2', HM_TONE_7_V3: 'hm_tone_7_v3',
  HM_TONE_8_V1: 'hm_tone_8_v1', HM_TONE_8_V2: 'hm_tone_8_v2', HM_TONE_8_V3: 'hm_tone_8_v3',
  HM_TONE_9_V1: 'hm_tone_9_v1', HM_TONE_9_V2: 'hm_tone_9_v2', HM_TONE_9_V3: 'hm_tone_9_v3',
  HM_TONE_10_V1: 'hm_tone_10_v1', HM_TONE_10_V2: 'hm_tone_10_v2', HM_TONE_10_V3: 'hm_tone_10_v3',
  HM_TONE_11_V1: 'hm_tone_11_v1', HM_TONE_11_V2: 'hm_tone_11_v2', HM_TONE_11_V3: 'hm_tone_11_v3',
  // Beu lifecycle stingers (audio/beu/)
  BEU_SEED_S1:   'beu_seed_s1',   BEU_SEED_S2:   'beu_seed_s2',
  BEU_SPROUT_S1: 'beu_sprout_s1', BEU_SPROUT_S2: 'beu_sprout_s2',
  BEU_GROWTH_S1: 'beu_growth_s1', BEU_GROWTH_S2: 'beu_growth_s2',
  BEU_BLOOM_S1:  'beu_bloom_s1',  BEU_BLOOM_S2:  'beu_bloom_s2',
  BEU_BOND_S1:   'beu_bond_s1',   BEU_BOND_S2:   'beu_bond_s2',
  // UL casting (audio/ul/)
  UL_CAST_INIT_1:    'ul_cast_init_1',    UL_CAST_INIT_2:    'ul_cast_init_2',
  UL_CAST_CHARGE_1:  'ul_cast_charge_1',  UL_CAST_CHARGE_2:  'ul_cast_charge_2',
  UL_CAST_RELEASE_1: 'ul_cast_release_1', UL_CAST_RELEASE_2: 'ul_cast_release_2', UL_CAST_RELEASE_3: 'ul_cast_release_3',
  UL_CAST_FAIL_1:    'ul_cast_fail_1',    UL_CAST_FAIL_2:    'ul_cast_fail_2',
  // Node events (audio/nodes/)
  NODE_DISTRESS_1: 'node_distress_1', NODE_DISTRESS_2: 'node_distress_2', NODE_DISTRESS_3: 'node_distress_3',
  NODE_COLLAPSE_1: 'node_collapse_1', NODE_COLLAPSE_2: 'node_collapse_2', NODE_COLLAPSE_3: 'node_collapse_3',
  NODE_RESTORE_1:  'node_restore_1',  NODE_RESTORE_2:  'node_restore_2',
  // Trust milestones (audio/trust/)
  TRUST_25_1: 'trust_25_1', TRUST_25_2: 'trust_25_2',
  TRUST_50_1: 'trust_50_1', TRUST_50_2: 'trust_50_2',
  TRUST_75_1: 'trust_75_1', TRUST_75_2: 'trust_75_2',
  TRUST_100_1: 'trust_100_1', TRUST_100_2: 'trust_100_2', TRUST_100_3: 'trust_100_3',
  // Rift (audio/rift/)
  RIFT_WARNING_1: 'rift_warning_1', RIFT_WARNING_2: 'rift_warning_2',
  RIFT_WARNING_3: 'rift_warning_3', RIFT_WARNING_4: 'rift_warning_4',
  RIFT_SEAL_1: 'rift_seal_1', RIFT_SEAL_2: 'rift_seal_2', RIFT_SEAL_3: 'rift_seal_3',
  // Jane physical (audio/jane/)
  JANE_HURT_1: 'jane_hurt_1', JANE_HURT_2: 'jane_hurt_2', JANE_HURT_3: 'jane_hurt_3',
  JANE_ATTACK_1: 'jane_attack_1', JANE_ATTACK_2: 'jane_attack_2', JANE_ATTACK_3: 'jane_attack_3',
  // Speeder (audio/speeder/)
  SPEEDER_BOOST_1: 'speeder_boost_1', SPEEDER_BOOST_2: 'speeder_boost_2',
  // Ley lines (audio/leylines/)
  LEYLINE_ACTIVATE_1: 'leyline_activate_1', LEYLINE_ACTIVATE_2: 'leyline_activate_2',
  // PsiNet (audio/psinet/)
  PSINET_CONNECT_1: 'psinet_connect_1', PSINET_CONNECT_2: 'psinet_connect_2',
  PSINET_ALERT_1:   'psinet_alert_1',   PSINET_ALERT_2:   'psinet_alert_2',
} as const;
export type AudioKey = typeof AUDIO_KEYS[keyof typeof AUDIO_KEYS];

/** Call in any Phaser scene's preload() to load all audio assets. */
export function preloadAllAudio(loader: Phaser.Loader.LoaderPlugin): void {
  // Single-variant sounds
  const singles = [
    'music_main_menu', 'music_gameplay_loop', 'music_holodeck_ambient',
    'music_psinet_ambient', 'music_psisys_awakening', 'music_training_loop',
    'sfx_ui_click', 'sfx_boot_sequence', 'sfx_connection_ok',
    'sfx_psinet_handshake', 'sfx_psisys_ok', 'sfx_node_confirm',
    'sfx_threat_detected', 'sfx_speeder_boost', 'sfx_ul_axiom',
    'sfx_ul_revelation', 'sfx_timeline_failure', 'sfx_beu_levelup',
  ];
  for (const key of singles) {
    loader.audio(key, [`audio/${key}.mp3`]);
  }
  // Multi-variant pools (4 variants each) — 1st pass
  const pooled = [
    'sfx_attack', 'sfx_enemy_death', 'sfx_shield_break', 'sfx_ul_cast',
    'sfx_ul_pickup', 'sfx_footstep', 'sfx_node_collapsed',
    'sfx_rift_contamination', 'sfx_waypoint_placed', 'sfx_speeder_summon',
  ];
  for (const key of pooled) {
    for (let i = 1; i <= 4; i++) {
      loader.audio(`${key}_${i}`, [`audio/${key}_${i}.mp3`]);
    }
  }

  // HarmonicEngine — 12 tones × 3 variants
  for (let t = 0; t <= 11; t++) {
    for (let v = 1; v <= 3; v++) {
      loader.audio(`hm_tone_${t}_v${v}`, [`audio/harmonic/tone_${t}_v${v}.mp3`]);
    }
  }

  // Beu lifecycle stingers
  for (const stage of ['seed', 'sprout', 'growth', 'bloom', 'bond']) {
    loader.audio(`beu_${stage}_s1`, [`audio/beu/beu_${stage}_s1.mp3`]);
    loader.audio(`beu_${stage}_s2`, [`audio/beu/beu_${stage}_s2.mp3`]);
  }

  // UL casting
  loader.audio('ul_cast_init_1',    ['audio/ul/ul_cast_init_1.mp3']);
  loader.audio('ul_cast_init_2',    ['audio/ul/ul_cast_init_2.mp3']);
  loader.audio('ul_cast_charge_1',  ['audio/ul/ul_cast_charge_1.mp3']);
  loader.audio('ul_cast_charge_2',  ['audio/ul/ul_cast_charge_2.mp3']);
  loader.audio('ul_cast_release_1', ['audio/ul/ul_cast_release_1.mp3']);
  loader.audio('ul_cast_release_2', ['audio/ul/ul_cast_release_2.mp3']);
  loader.audio('ul_cast_release_3', ['audio/ul/ul_cast_release_3.mp3']);
  loader.audio('ul_cast_fail_1',    ['audio/ul/ul_cast_fail_1.mp3']);
  loader.audio('ul_cast_fail_2',    ['audio/ul/ul_cast_fail_2.mp3']);

  // Node events
  for (const type of ['distress', 'collapse']) {
    for (let v = 1; v <= 3; v++) loader.audio(`node_${type}_${v}`, [`audio/nodes/node_${type}_${v}.mp3`]);
  }
  loader.audio('node_restore_1', ['audio/nodes/node_restore_1.mp3']);
  loader.audio('node_restore_2', ['audio/nodes/node_restore_2.mp3']);

  // Trust milestones
  loader.audio('trust_25_1',  ['audio/trust/trust_25_1.mp3']);
  loader.audio('trust_25_2',  ['audio/trust/trust_25_2.mp3']);
  loader.audio('trust_50_1',  ['audio/trust/trust_50_1.mp3']);
  loader.audio('trust_50_2',  ['audio/trust/trust_50_2.mp3']);
  loader.audio('trust_75_1',  ['audio/trust/trust_75_1.mp3']);
  loader.audio('trust_75_2',  ['audio/trust/trust_75_2.mp3']);
  loader.audio('trust_100_1', ['audio/trust/trust_100_1.mp3']);
  loader.audio('trust_100_2', ['audio/trust/trust_100_2.mp3']);
  loader.audio('trust_100_3', ['audio/trust/trust_100_3.mp3']);

  // Rift
  for (let v = 1; v <= 4; v++) loader.audio(`rift_warning_${v}`, [`audio/rift/rift_warning_${v}.mp3`]);
  for (let v = 1; v <= 3; v++) loader.audio(`rift_seal_${v}`,    [`audio/rift/rift_seal_${v}.mp3`]);

  // Jane physical
  for (let v = 1; v <= 3; v++) {
    loader.audio(`jane_hurt_${v}`,   [`audio/jane/jane_hurt_${v}.mp3`]);
    loader.audio(`jane_attack_${v}`, [`audio/jane/jane_attack_${v}.mp3`]);
  }

  // Speeder
  loader.audio('speeder_boost_1', ['audio/speeder/speeder_boost_1.mp3']);
  loader.audio('speeder_boost_2', ['audio/speeder/speeder_boost_2.mp3']);

  // Ley lines
  loader.audio('leyline_activate_1', ['audio/leylines/leyline_activate_1.mp3']);
  loader.audio('leyline_activate_2', ['audio/leylines/leyline_activate_2.mp3']);

  // PsiNet
  loader.audio('psinet_connect_1', ['audio/psinet/psinet_connect_1.mp3']);
  loader.audio('psinet_connect_2', ['audio/psinet/psinet_connect_2.mp3']);
  loader.audio('psinet_alert_1',   ['audio/psinet/psinet_alert_1.mp3']);
  loader.audio('psinet_alert_2',   ['audio/psinet/psinet_alert_2.mp3']);
}

// ─── Sound Pool ───────────────────────────────────────────────────────────────

type SelectionMode =
  | 'single'           // always the same key (no variants)
  | 'sequential'       // cycles 1→2→3→4→1 (footsteps, rhythmic actions)
  | 'random-no-repeat' // random but never same as last (enemy deaths, attacks)
  | 'trust-weighted';  // low trust → darker variants; high trust → brighter

interface SoundPoolConfig {
  baseKey: string;        // e.g. 'sfx_attack'
  variantCount: number;   // 1 for singles, 4 for pools
  mode: SelectionMode;
  cooldownMs: number;     // min ms between any play of this pool
}

class SoundPool {
  private config: SoundPoolConfig;
  private cursor = 0;
  private lastVariant = -1;
  private lastPlayedAt = 0;

  constructor(config: SoundPoolConfig) {
    this.config = config;
  }

  /** Returns the concrete audio key to play, or null if on cooldown. */
  pick(trustLevel: number): string | null {
    const now = Date.now();
    if (now - this.lastPlayedAt < this.config.cooldownMs) return null;
    this.lastPlayedAt = now;

    const { baseKey, variantCount, mode } = this.config;
    if (variantCount <= 1) return baseKey;

    let variant: number;
    switch (mode) {
      case 'sequential':
        variant = (this.cursor % variantCount) + 1;
        this.cursor++;
        break;
      case 'random-no-repeat': {
        let pick: number;
        do { pick = Math.floor(Math.random() * variantCount) + 1; }
        while (pick === this.lastVariant && variantCount > 1);
        variant = pick;
        break;
      }
      case 'trust-weighted': {
        // Trust 0–30 → variants 3–4 (harsher)
        // Trust 31–69 → variant 2 (neutral)
        // Trust 70–100 → variant 1 (cleaner/warmer)
        if (trustLevel >= 70) variant = 1;
        else if (trustLevel >= 30) variant = 2;
        else variant = Math.random() < 0.5 ? 3 : 4;
        break;
      }
      default:
        variant = 1;
    }
    this.lastVariant = variant;
    return `${baseKey}_${variant}`;
  }
}

// ─── Spatial Ambient Zone ─────────────────────────────────────────────────────

interface AmbientZone {
  key: string;
  /** World X where this zone fades in from (left edge) */
  xFadeInStart: number;
  /** World X where this zone is at full volume */
  xFullStart: number;
  /** World X where this zone starts fading out */
  xFullEnd: number;
  /** World X where this zone is fully silent (right edge) */
  xFadeOutEnd: number;
  /** Maximum volume for this zone */
  maxVolume: number;
}

// ─── AudioManager ─────────────────────────────────────────────────────────────

export class AudioManager {
  private scene: Phaser.Scene;
  private soundManager: Phaser.Sound.BaseSoundManager;
  private musicVolume = 0.45;
  private sfxVolume = 0.75;
  private muted = false;
  private trustLevel = 50;
  private subscriptions: Array<() => void> = [];

  // Current music track (crossfades into new ones)
  private currentMusic?: Phaser.Sound.WebAudioSound;

  // Ambient zone system: each zone has its own looping track instance
  private ambientTracks = new Map<string, Phaser.Sound.WebAudioSound>();
  private ambientZones: AmbientZone[] = [];
  private lastJaneX = 0;

  // Tension heartbeat system
  private tensionLevel = 0;
  private tensionTimer?: Phaser.Time.TimerEvent;
  private tensionFireCount = 0;

  // Rift contamination
  private riftProximity = 0; // 0 = none, 1 = right next to rift
  private contaminationTimer?: Phaser.Time.TimerEvent;

  // Sound pools
  private pools = new Map<string, SoundPool>();

  // Jane & enemy position references (set externally per frame)
  private getJaneX?: () => number;
  private getRiftPositions?: () => Array<{ x: number; y: number }>;

  constructor(scene: Phaser.Scene, eventBus?: EventBus) {
    this.scene = scene;
    this.soundManager = scene.sound;

    this.initPools();

    if (eventBus) {
      this.wireEvents(eventBus);
      this.wireTrustTracking(eventBus);
    }
  }

  // ── Initialise pools ────────────────────────────────────────────────────────

  private initPools(): void {
    const pool = (
      baseKey: string,
      variantCount: number,
      mode: SelectionMode,
      cooldownMs: number
    ) => this.pools.set(baseKey, new SoundPool({ baseKey, variantCount, mode, cooldownMs }));

    // Single-variant (always consistent)
    pool(AUDIO_KEYS.SFX_UI_CLICK,         1, 'single', 50);
    pool(AUDIO_KEYS.SFX_BOOT_SEQUENCE,    1, 'single', 5000);
    pool(AUDIO_KEYS.SFX_CONNECTION_OK,    1, 'single', 1000);
    pool(AUDIO_KEYS.SFX_PSINET_HANDSHAKE, 1, 'single', 500);
    pool(AUDIO_KEYS.SFX_PSISYS_OK,        1, 'single', 2000);
    pool(AUDIO_KEYS.SFX_NODE_CONFIRM,     1, 'single', 200);
    pool(AUDIO_KEYS.SFX_THREAT_DETECTED,  1, 'single', 3000);
    pool(AUDIO_KEYS.SFX_SPEEDER_BOOST,    1, 'single', 800);
    pool(AUDIO_KEYS.SFX_UL_AXIOM,         1, 'single', 1500);
    pool(AUDIO_KEYS.SFX_UL_REVELATION,    1, 'single', 1500);
    pool(AUDIO_KEYS.SFX_TIMELINE_FAILURE, 1, 'single', 3000);
    pool(AUDIO_KEYS.SFX_BEU_LEVELUP,      1, 'single', 2000);

    // Sequential (footsteps — rhythmic, satisfyingly predictable)
    pool(AUDIO_KEYS.SFX_FOOTSTEP,         4, 'sequential', 120);

    // Random-no-repeat (combat variety)
    pool(AUDIO_KEYS.SFX_ATTACK,           4, 'random-no-repeat', 80);
    pool(AUDIO_KEYS.SFX_ENEMY_DEATH,      4, 'random-no-repeat', 100);
    pool(AUDIO_KEYS.SFX_UL_CAST,          4, 'random-no-repeat', 300);
    pool(AUDIO_KEYS.SFX_UL_PICKUP,        4, 'random-no-repeat', 200);
    pool(AUDIO_KEYS.SFX_SPEEDER_SUMMON,   4, 'random-no-repeat', 2000);

    // Trust-weighted (darker sound = lower trust relationship)
    pool(AUDIO_KEYS.SFX_SHIELD_BREAK,        4, 'trust-weighted', 200);
    pool(AUDIO_KEYS.SFX_NODE_COLLAPSED,      4, 'trust-weighted', 1000);
    pool(AUDIO_KEYS.SFX_RIFT_CONTAMINATION,  4, 'trust-weighted', 4000);
    pool(AUDIO_KEYS.SFX_WAYPOINT_PLACED,     4, 'random-no-repeat', 150);
  }

  // ── Spatial ambient zones ───────────────────────────────────────────────────

  /**
   * Define the world X-axis zones for ambient sounds.
   * Call once after world coordinates are established.
   * @param platformX The X where Jane spawns (used as zone anchor)
   */
  setupAmbientZones(platformX: number): void {
    // Zone layout relative to spawn platform:
    //  ←─── PsiNet cosmos ──── Holo Deck training ──── Rift contamination ───→
    //       (far left)           (center, home)           (far right)
    this.ambientZones = [
      {
        key: AUDIO_KEYS.MUSIC_PSINET_AMBIENT,
        xFadeInStart:  platformX - 2000,
        xFullStart:    platformX - 1200,
        xFullEnd:      platformX - 400,
        xFadeOutEnd:   platformX + 200,
        maxVolume: 0.22,
      },
      {
        key: AUDIO_KEYS.MUSIC_HOLODECK_AMBIENT,
        xFadeInStart:  platformX - 600,
        xFullStart:    platformX - 100,
        xFullEnd:      platformX + 600,
        xFadeOutEnd:   platformX + 1200,
        maxVolume: 0.18,
      },
      {
        key: AUDIO_KEYS.MUSIC_TRAINING_LOOP,
        xFadeInStart:  platformX + 400,
        xFullStart:    platformX + 900,
        xFullEnd:      platformX + 1800,
        xFadeOutEnd:   platformX + 2500,
        maxVolume: 0.15,
      },
    ];

    // Start all ambient tracks at volume 0
    for (const zone of this.ambientZones) {
      if (this.scene.cache.audio.has(zone.key)) {
        const track = this.soundManager.add(zone.key, {
          loop: true, volume: 0
        }) as Phaser.Sound.WebAudioSound;
        track.play();
        this.ambientTracks.set(zone.key, track);
      }
    }

    // Seed with current position
    this.updateAmbientForPosition(platformX);
  }

  /**
   * Call every frame (or on significant X change) with Jane's world X.
   * Smoothly crossfades ambient zones.
   */
  updateAmbientForPosition(janeX: number): void {
    if (Math.abs(janeX - this.lastJaneX) < 8) return; // skip tiny movement
    this.lastJaneX = janeX;

    for (const zone of this.ambientZones) {
      const vol = this.trapezoidVolume(janeX, zone) * this.musicVolume;
      const track = this.ambientTracks.get(zone.key);
      if (!track) continue;

      // Smooth lerp to target volume (avoid jarring jumps)
      const current = (track as any).volume ?? 0;
      const target = this.muted ? 0 : vol;
      const lerped = current + (target - current) * 0.05;
      track.setVolume(lerped);
    }
  }

  /** Trapezoid volume function — returns 0–maxVolume for a given X position. */
  private trapezoidVolume(x: number, zone: AmbientZone): number {
    const { xFadeInStart, xFullStart, xFullEnd, xFadeOutEnd, maxVolume } = zone;

    if (x <= xFadeInStart || x >= xFadeOutEnd) return 0;
    if (x >= xFullStart && x <= xFullEnd) return maxVolume;

    if (x < xFullStart) {
      // Fade in region
      return maxVolume * (x - xFadeInStart) / (xFullStart - xFadeInStart);
    }
    // Fade out region
    return maxVolume * (xFadeOutEnd - x) / (xFadeOutEnd - xFullEnd);
  }

  // ── Position reference setters ──────────────────────────────────────────────

  setPositionRefs(
    getJaneX: () => number,
    getRiftPositions: () => Array<{ x: number; y: number }>
  ): void {
    this.getJaneX = getJaneX;
    this.getRiftPositions = getRiftPositions;
  }

  /** Current rift proximity (0–1). Exposed for HarmonicEngine propagation. */
  getRiftProximity(): number { return this.riftProximity; }

  // ── Tension heartbeat system ────────────────────────────────────────────────

  /**
   * Update global tension (0–1). Drives the heartbeat pulse and rift contamination.
   * Call whenever node stabilities change.
   */
  setTension(tension: number): void {
    const prev = this.tensionLevel;
    this.tensionLevel = Math.max(0, Math.min(1, tension));

    if (Math.abs(this.tensionLevel - prev) < 0.02) return; // ignore tiny drifts

    this.rescheduleTensionHeartbeat();
  }

  private rescheduleTensionHeartbeat(): void {
    this.tensionTimer?.remove(false);
    this.tensionTimer = undefined;

    if (this.tensionLevel < 0.3) return; // silent below 30% tension

    // Interval gets shorter as tension rises
    // 0.3 → 8000ms, 0.6 → 4000ms, 0.85 → 2000ms, 1.0 → 1000ms
    const intervalMs = Math.max(1000, 8000 - this.tensionLevel * 7000);

    this.tensionTimer = this.scene.time.addEvent({
      delay: intervalMs,
      loop: true,
      callback: this.fireTensionPulse,
      callbackScope: this,
    });
  }

  private fireTensionPulse(): void {
    this.tensionFireCount++;
    const vol = 0.08 + this.tensionLevel * 0.22; // 0.08–0.30

    // Alternate between threat detected and (at very high tension) node_collapsed
    const useHeavy = this.tensionLevel > 0.8 && this.tensionFireCount % 3 === 0;
    const key = useHeavy
      ? (this.pools.get(AUDIO_KEYS.SFX_NODE_COLLAPSED)?.pick(this.trustLevel) ?? null)
      : AUDIO_KEYS.SFX_THREAT_DETECTED;

    if (key) this.playRaw(key, vol);
  }

  // ── Rift contamination ──────────────────────────────────────────────────────

  /**
   * Set rift proximity 0 (no rift) → 1 (inside rift).
   * Drives intermittent contamination SFX.
   */
  setRiftProximity(proximity: number): void {
    const prev = this.riftProximity;
    this.riftProximity = Math.max(0, Math.min(1, proximity));

    if (Math.abs(this.riftProximity - prev) < 0.05) return;

    this.contaminationTimer?.remove(false);
    this.contaminationTimer = undefined;

    if (this.riftProximity < 0.1) return;

    // Fires every 8s at edge → 2s at center
    const intervalMs = Math.max(1800, 8000 - this.riftProximity * 6200);

    this.contaminationTimer = this.scene.time.addEvent({
      delay: intervalMs,
      loop: true,
      callback: () => {
        const key = this.pools.get(AUDIO_KEYS.SFX_RIFT_CONTAMINATION)?.pick(this.trustLevel);
        if (key) this.playRaw(key, 0.1 + this.riftProximity * 0.3);
      },
    });
  }

  // ── Music ───────────────────────────────────────────────────────────────────

  playMusic(key: string, fadeMs = 800): void {
    if (this.currentMusic?.key === key && this.currentMusic.isPlaying) return;

    if (this.currentMusic?.isPlaying) {
      const old = this.currentMusic;
      this.scene.tweens.add({
        targets: old, volume: 0, duration: fadeMs,
        onComplete: () => { try { old.stop(); } catch {} }
      });
    }

    if (!this.scene.cache.audio.has(key)) return;

    const track = this.soundManager.add(key, { loop: true, volume: 0 }) as Phaser.Sound.WebAudioSound;
    track.play();
    this.currentMusic = track;
    this.scene.tweens.add({
      targets: track,
      volume: this.muted ? 0 : this.musicVolume,
      duration: fadeMs,
    });
  }

  stopMusic(fadeMs = 600): void {
    if (!this.currentMusic?.isPlaying) return;
    const old = this.currentMusic;
    this.scene.tweens.add({
      targets: old, volume: 0, duration: fadeMs,
      onComplete: () => { try { old.stop(); } catch {} }
    });
    this.currentMusic = undefined;
  }

  // ── SFX ─────────────────────────────────────────────────────────────────────

  /** Play a pooled SFX. Pass the base AUDIO_KEY (without _N suffix). */
  playSfx(poolKey: string, volumeOverride?: number, panX?: number): void {
    if (this.muted) return;
    const pool = this.pools.get(poolKey);
    const key = pool ? pool.pick(this.trustLevel) : poolKey;
    if (!key) return; // on cooldown
    this.playRaw(key, volumeOverride ?? this.sfxVolume, panX);
  }

  /**
   * Play a positional SFX — automatically panned based on source X relative to Jane.
   * @param poolKey Base audio key
   * @param sourceX World X of the sound source
   * @param volume Volume (0–1)
   */
  playSfxAt(poolKey: string, sourceX: number, volume?: number): void {
    const janeX = this.getJaneX?.() ?? sourceX;
    const pan = Math.max(-1, Math.min(1, (sourceX - janeX) / 500));
    this.playSfx(poolKey, volume, pan);
  }

  private playRaw(key: string, volume: number, pan?: number): void {
    if (!this.scene.cache.audio.has(key)) return;
    try {
      const snd = this.soundManager.add(key, { volume, pan: pan ?? 0 });
      snd.play();
      // Auto-destroy one-shot sounds after they finish
      snd.once('complete', () => { try { snd.destroy(); } catch {} });
    } catch { /* audio context suspended or key not yet loaded */ }
  }

  // ── Volume / mute ────────────────────────────────────────────────────────────

  setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this.musicVolume);
    }
    // Re-apply ambient volumes
    this.updateAmbientForPosition(this.lastJaneX - 9); // force refresh
    this.updateAmbientForPosition(this.lastJaneX);
  }

  setSfxVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    const targetVol = this.muted ? 0 : this.musicVolume;
    if (this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(targetVol);
    }
    for (const track of this.ambientTracks.values()) {
      track.setVolume(this.muted ? 0 : track.volume);
    }
    return this.muted;
  }

  // ── Trust tracking ───────────────────────────────────────────────────────────

  private wireTrustTracking(eventBus: EventBus): void {
    this.subscriptions.push(
      eventBus.on('TRUST_CHANGED', (e: any) => {
        this.trustLevel = e.data?.currentLevel ?? this.trustLevel;
      })
    );
  }

  // ── Event wiring ─────────────────────────────────────────────────────────────

  private wireEvents(eventBus: EventBus): void {
    const on = (type: string, fn: (e: any) => void) => {
      this.subscriptions.push(eventBus.on(type as any, fn));
    };

    // UI / narrative
    on('JONO_FIRST_CONTACT',        () => this.playSfx(AUDIO_KEYS.SFX_PSINET_HANDSHAKE));
    on('ASI_WAYPOINT_PLACED',       () => this.playSfx(AUDIO_KEYS.SFX_WAYPOINT_PLACED));
    on('JANE_ARRIVED_AT_WAYPOINT',  () => this.playSfx(AUDIO_KEYS.SFX_NODE_CONFIRM));
    on('MISSION_COMPLETED',         () => this.playSfx(AUDIO_KEYS.SFX_PSISYS_OK));
    on('JANE_LEVEL_UP',             () => this.playSfx(AUDIO_KEYS.SFX_BEU_LEVELUP));

    // World state
    on('NODE_COLLAPSED',            () => POOLS.node_collapse.play(this.scene));
    on('RIFT_SEALED',               () => POOLS.rift_seal.play(this.scene));
    on('SURGE_WARNING',             (e) => {
      // Surge warning uses threat_detected at reduced volume proportional to stability
      const stability = e.data?.stability ?? 50;
      this.playSfx(AUDIO_KEYS.SFX_THREAT_DETECTED, 0.25 + (1 - stability / 100) * 0.4);
    });

    // Combat — positional
    on('JANE_ATTACK',               (e) => {
      const x = e.data?.x ?? this.getJaneX?.();
      const pan = x != null ? Math.max(-1, Math.min(1, (x - (this.getJaneX?.() ?? x)) / 500)) : 0;
      POOLS.jane_attack.play(this.scene, 0.85, pan);
    });
    on('ENEMY_DEFEATED',            (e) => {
      const x = e.data?.x ?? this.getJaneX?.();
      if (x != null) this.playSfxAt(AUDIO_KEYS.SFX_ENEMY_DEATH, x);
      else this.playSfx(AUDIO_KEYS.SFX_ENEMY_DEATH);
    });
    on('JANE_DAMAGED',              () => POOLS.jane_hurt.play(this.scene, 0.55));
    on('SHIELD_WINDOW_STARTED',     () => this.playSfx(AUDIO_KEYS.SFX_SHIELD_BREAK, 0.65));
    on('THREAT_DETECTED',           () => this.playSfx(AUDIO_KEYS.SFX_THREAT_DETECTED));

    // Speeder
    on('JANE_MOUNTED_SPEEDER',      () => this.playSfx(AUDIO_KEYS.SFX_SPEEDER_SUMMON));
    on('BOOST_ACTIVATED',           () => POOLS.speeder_boost.play(this.scene));

    // UL / magic
    on('UL_PUZZLE_DEPLOYED',        () => POOLS.ul_init.play(this.scene));
    on('UL_PUZZLE_SUCCESS',         () => POOLS.ul_release.play(this.scene));
    on('UL_PUZZLE_FAILURE',         () => POOLS.ul_fail.play(this.scene, 0.45));
    on('UL_RIFT_SEALED',            () => this.playSfx(AUDIO_KEYS.SFX_UL_AXIOM));
    on('UL_PUZZLE_SYMBOL_SELECTED', () => this.playSfx(AUDIO_KEYS.SFX_UL_PICKUP, 0.55));

    // World state → tension
    on('NODE_STABILITY_CHANGED',    () => this.recomputeTension());
  }

  // ── Tension from world state ─────────────────────────────────────────────────

  private nodeStabilities: Record<string, number> = {};

  updateNodeStability(nodeId: string, stability: number): void {
    this.nodeStabilities[nodeId] = stability;
    this.recomputeTension();
  }

  private recomputeTension(): void {
    const stabilities = Object.values(this.nodeStabilities);
    if (stabilities.length === 0) return;
    const min = Math.min(...stabilities);
    // Tension rises as worst node degrades: 100% stable → 0 tension, 0% stable → 1.0 tension
    this.setTension(1 - (min / 100));
  }

  // ── Frame update (call from scene update()) ──────────────────────────────────

  /**
   * Call from GameScene.update() each frame.
   * Handles spatial ambient updates and rift proximity.
   */
  update(): void {
    if (!this.getJaneX) return;
    const janeX = this.getJaneX();

    // Spatial ambient crossfade
    this.updateAmbientForPosition(janeX);

    // Rift proximity contamination
    if (this.getRiftPositions) {
      const rifts = this.getRiftPositions();
      if (rifts.length === 0) {
        this.setRiftProximity(0);
      } else {
        const closest = Math.min(...rifts.map(r => Math.abs(r.x - janeX)));
        // Full contamination within 150px, none beyond 600px
        const proximity = Math.max(0, 1 - (closest - 150) / 450);
        this.setRiftProximity(proximity);
      }
    }
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────────

  destroy(): void {
    this.tensionTimer?.remove(false);
    this.contaminationTimer?.remove(false);
    this.subscriptions.forEach(u => u());
    this.subscriptions = [];
    for (const track of this.ambientTracks.values()) {
      try { track.stop(); track.destroy(); } catch {}
    }
    this.ambientTracks.clear();
    try { this.currentMusic?.stop(); } catch {}
  }
}
