/**
 * HarmonicEngine.ts
 *
 * Lore-grounded combinatorial audio system for ProtoFusionGirl.
 *
 * DESIGN PHILOSOPHY (from wiki.fusiongirl.app lore):
 * - Universal Language: Emotions ARE Angles. 12 chromatic positions at 30° each.
 * - Base-12 Harmonic Tonality: 12 notes map directly to 12 emotional states.
 * - Beu Lifecycle: 5 stages (Seed→Sprout→Growth→Bloom→Bond) each with unique timbre.
 * - Psi Music: Jane/Jono psychic bond expressed as intertwined harmonic voices.
 * - Short sounds (0.5–4s) are the atoms. This engine composes them into complex states.
 *
 * LAYER ARCHITECTURE:
 *   Layer A — Harmonic Root   : current emotional tone (12 chromatic micro-tones)
 *   Layer B — Beu Voice       : Beu's lifecycle stage texture (5 stage ambients)
 *   Layer C — Event Stingers  : instant one-shot feedback on game events
 *
 * All layers run simultaneously. Volume, pitch, and selection are driven by game state.
 */

import Phaser from 'phaser';

// ─── Emotional Angle → Tone Index (0–11, Base-12) ────────────────────────────

export const UL_ANGLE_TO_TONE: Record<number, number> = {
  0: 0,   // Stillness / Root
  30: 1,  // Tension / Dissonance
  60: 2,  // Curiosity / Movement
  90: 3,  // Melancholy / Empathy
  120: 4, // Hope / Warmth
  150: 5, // Balance / Structure
  180: 6, // Chaos / Transformation
  210: 7, // Power / Clarity
  240: 8, // Mystery / Wonder
  270: 9, // Connection / Belonging
  300: 10,// Longing / Unresolved
  330: 11,// Anticipation / Threshold
};

// ─── Key constants ────────────────────────────────────────────────────────────

/** Chromatic tone micro-samples — 3 variants each, 36 total files */
const TONE_KEYS = Array.from({ length: 12 }, (_, i) =>
  Array.from({ length: 3 }, (__, v) => `hm_tone_${i}_v${v + 1}`)
);

/** Beu lifecycle ambient keys — 2 variants per stage */
const BEU_AMBIENT_KEYS: Record<BeuStage, string[]> = {
  seed:   ['beu_seed_a1', 'beu_seed_a2'],
  sprout: ['beu_sprout_a1', 'beu_sprout_a2'],
  growth: ['beu_growth_a1', 'beu_growth_a2'],
  bloom:  ['beu_bloom_a1', 'beu_bloom_a2'],
  bond:   ['beu_bond_a1', 'beu_bond_a2'],
};

/** Beu stage transition stingers — 2 variants per stage */
const BEU_STINGER_KEYS: Record<BeuStage, string[]> = {
  seed:   ['beu_seed_s1', 'beu_seed_s2'],
  sprout: ['beu_sprout_s1', 'beu_sprout_s2'],
  growth: ['beu_growth_s1', 'beu_growth_s2'],
  bloom:  ['beu_bloom_s1', 'beu_bloom_s2'],
  bond:   ['beu_bond_s1', 'beu_bond_s2'],
};

/** UL cast keys */
const UL_CAST_KEYS = {
  initiate: ['ul_cast_init_1', 'ul_cast_init_2'],
  charge:   ['ul_cast_charge_1', 'ul_cast_charge_2'],
  release:  ['ul_cast_release_1', 'ul_cast_release_2', 'ul_cast_release_3'],
  fail:     ['ul_cast_fail_1', 'ul_cast_fail_2'],
};

/** Trust milestone stingers */
const TRUST_MILESTONE_KEYS: Record<number, string[]> = {
  25:  ['trust_25_1', 'trust_25_2'],
  50:  ['trust_50_1', 'trust_50_2'],
  75:  ['trust_75_1', 'trust_75_2'],
  100: ['trust_100_1', 'trust_100_2', 'trust_100_3'],
};

/** Node event stingers */
const NODE_STINGER_KEYS = {
  distress:  ['node_distress_1', 'node_distress_2', 'node_distress_3'],
  collapse:  ['node_collapse_1', 'node_collapse_2', 'node_collapse_3'],
  restore:   ['node_restore_1', 'node_restore_2'],
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type BeuStage = 'seed' | 'sprout' | 'growth' | 'bloom' | 'bond';

export interface HarmonicState {
  /** Current UL emotional angle (0, 30, 60 … 330) */
  emotionalAngle: number;
  /** Beu's current lifecycle stage */
  beuStage: BeuStage;
  /** Trust level 0–100 */
  trustLevel: number;
  /** Lowest node stability 0–100 (drives tension) */
  lowestNodeStability: number;
  /** Whether Jane is near a rift (0–1) */
  riftProximity: number;
}

// ─── HarmonicEngine ──────────────────────────────────────────────────────────

export class HarmonicEngine {
  private scene: Phaser.Scene;

  private state: HarmonicState = {
    emotionalAngle: 0,
    beuStage: 'seed',
    trustLevel: 50,
    lowestNodeStability: 100,
    riftProximity: 0,
  };

  // Active looping sounds
  private toneSound: Phaser.Sound.BaseSound | null = null;
  private beuAmbient: Phaser.Sound.BaseSound | null = null;
  private chargeSound: Phaser.Sound.BaseSound | null = null;

  // Last played tone index (avoid repeating)
  private lastToneIndex = -1;
  private lastBeuVariant = -1;

  // Trust milestone tracking
  private triggeredMilestones = new Set<number>();

  // Crossfade timing
  private toneUpdateTimer = 0;
  private readonly TONE_FADE_MS = 800;
  private readonly TONE_UPDATE_INTERVAL_MS = 4000;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ─── Preload helper ─────────────────────────────────────────────────────────

  /** Call in scene preload() — loads all HarmonicEngine audio files */
  static preload(load: Phaser.Loader.LoaderPlugin): void {
    // 12 tones × 3 variants
    for (let t = 0; t < 12; t++) {
      for (let v = 1; v <= 3; v++) {
        load.audio(`hm_tone_${t}_v${v}`, `audio/harmonic/tone_${t}_v${v}.mp3`);
      }
    }

    // Beu stage ambients and stingers
    for (const stage of ['seed', 'sprout', 'growth', 'bloom', 'bond'] as BeuStage[]) {
      load.audio(`beu_${stage}_a1`, `audio/beu/${stage}_ambient_1.mp3`);
      load.audio(`beu_${stage}_a2`, `audio/beu/${stage}_ambient_2.mp3`);
      load.audio(`beu_${stage}_s1`, `audio/beu/${stage}_stinger_1.mp3`);
      load.audio(`beu_${stage}_s2`, `audio/beu/${stage}_stinger_2.mp3`);
    }

    // UL cast sounds
    load.audio('ul_cast_init_1',    'audio/ul/cast_init_1.mp3');
    load.audio('ul_cast_init_2',    'audio/ul/cast_init_2.mp3');
    load.audio('ul_cast_charge_1',  'audio/ul/cast_charge_1.mp3');
    load.audio('ul_cast_charge_2',  'audio/ul/cast_charge_2.mp3');
    load.audio('ul_cast_release_1', 'audio/ul/cast_release_1.mp3');
    load.audio('ul_cast_release_2', 'audio/ul/cast_release_2.mp3');
    load.audio('ul_cast_release_3', 'audio/ul/cast_release_3.mp3');
    load.audio('ul_cast_fail_1',    'audio/ul/cast_fail_1.mp3');
    load.audio('ul_cast_fail_2',    'audio/ul/cast_fail_2.mp3');

    // Trust milestones
    for (const pct of [25, 50, 75, 100]) {
      const variants = pct === 100 ? 3 : 2;
      for (let v = 1; v <= variants; v++) {
        load.audio(`trust_${pct}_${v}`, `audio/trust/milestone_${pct}_v${v}.mp3`);
      }
    }

    // Node stingers
    for (const type of ['distress', 'collapse', 'restore']) {
      const count = type === 'restore' ? 2 : 3;
      for (let v = 1; v <= count; v++) {
        load.audio(`node_${type}_${v}`, `audio/nodes/${type}_v${v}.mp3`);
      }
    }
  }

  // ─── State updates ──────────────────────────────────────────────────────────

  setState(patch: Partial<HarmonicState>): void {
    const prev = { ...this.state };
    this.state = { ...this.state, ...patch };

    // Beu stage changed → play stinger + swap ambient
    if (patch.beuStage && patch.beuStage !== prev.beuStage) {
      this._playStinger(BEU_STINGER_KEYS[patch.beuStage]);
      this._crossfadeBeuAmbient(patch.beuStage);
    }

    // Trust milestone crossed upward
    if (patch.trustLevel !== undefined) {
      for (const milestone of [25, 50, 75, 100]) {
        if (
          patch.trustLevel >= milestone &&
          prev.trustLevel < milestone &&
          !this.triggeredMilestones.has(milestone)
        ) {
          this.triggeredMilestones.add(milestone);
          this.scene.time.delayedCall(300, () => {
            this._playStinger(TRUST_MILESTONE_KEYS[milestone]);
          });
        }
      }
      // Trust dropped back below a milestone → allow re-trigger later
      for (const milestone of [25, 50, 75, 100]) {
        if (patch.trustLevel < milestone - 5) {
          this.triggeredMilestones.delete(milestone);
        }
      }
    }
  }

  setEmotionalAngle(angle: number): void {
    // Snap to nearest 30°
    const snapped = Math.round(angle / 30) * 30 % 360;
    if (snapped !== this.state.emotionalAngle) {
      this.state.emotionalAngle = snapped;
      // Tone will update on next TONE_UPDATE_INTERVAL_MS tick
    }
  }

  // ─── Node events ────────────────────────────────────────────────────────────

  onNodeDistress(nodeId: string): void {
    this._playStinger(NODE_STINGER_KEYS.distress);
  }

  onNodeCollapse(nodeId: string): void {
    this._playStinger(NODE_STINGER_KEYS.collapse, 0.9);
    // Snap angle toward Chaos (180°) briefly
    const prevAngle = this.state.emotionalAngle;
    this.setEmotionalAngle(180);
    this.scene.time.delayedCall(3000, () => {
      if (this.state.emotionalAngle === 180) {
        this.setEmotionalAngle(prevAngle);
      }
    });
  }

  onNodeRestore(nodeId: string): void {
    this._playStinger(NODE_STINGER_KEYS.restore, 0.85);
  }

  // ─── UL casting events ──────────────────────────────────────────────────────

  onULCastInitiate(): void {
    this._playStinger(UL_CAST_KEYS.initiate, 0.7);
  }

  onULCastCharge(): void {
    if (this.chargeSound) return; // already charging
    const key = this._pick(UL_CAST_KEYS.charge);
    this.chargeSound = this.scene.sound.add(key, { loop: true, volume: 0.5 });
    this.chargeSound.play();
  }

  onULCastRelease(success: boolean): void {
    this.chargeSound?.stop();
    this.chargeSound?.destroy();
    this.chargeSound = null;
    if (success) {
      this._playStinger(UL_CAST_KEYS.release, 0.85);
    } else {
      this._playStinger(UL_CAST_KEYS.fail, 0.75);
    }
  }

  // ─── Update (call each frame) ────────────────────────────────────────────────

  update(deltaMs: number): void {
    this.toneUpdateTimer += deltaMs;
    if (this.toneUpdateTimer >= this.TONE_UPDATE_INTERVAL_MS) {
      this.toneUpdateTimer = 0;
      this._updateHarmonicTone();
    }
  }

  // ─── Internal helpers ────────────────────────────────────────────────────────

  private _updateHarmonicTone(): void {
    const toneIndex = UL_ANGLE_TO_TONE[this.state.emotionalAngle] ?? 0;
    if (toneIndex === this.lastToneIndex && this.toneSound?.isPlaying) return;

    // Pick variant — weight toward cleaner variants at high trust
    const variants = TONE_KEYS[toneIndex];
    const key = this._pickTrustWeighted(variants);

    const vol = this._toneVolume();
    this.lastToneIndex = toneIndex;

    if (this.toneSound) {
      const old = this.toneSound;
      this.scene.tweens.add({ targets: old, volume: 0, duration: this.TONE_FADE_MS,
        onComplete: () => { old.stop(); old.destroy(); } });
    }

    const next = this.scene.sound.add(key, { volume: 0, loop: true });
    next.play();
    this.scene.tweens.add({ targets: next, volume: vol, duration: this.TONE_FADE_MS });
    this.toneSound = next;
  }

  private _crossfadeBeuAmbient(stage: BeuStage): void {
    if (this.beuAmbient) {
      const old = this.beuAmbient;
      this.scene.tweens.add({ targets: old, volume: 0, duration: 1200,
        onComplete: () => { old.stop(); old.destroy(); } });
    }

    const keys = BEU_AMBIENT_KEYS[stage];
    const idx = Math.random() < 0.5 ? 0 : 1;
    this.lastBeuVariant = idx;
    const key = keys[idx];

    const next = this.scene.sound.add(key, { volume: 0, loop: true });
    next.play();
    this.scene.tweens.add({ targets: next, volume: 0.35, duration: 1200 });
    this.beuAmbient = next;
  }

  private _playStinger(pool: string[], volume = 0.8): void {
    const key = this._pick(pool);
    if (!key || !this.scene.cache.audio.has(key)) return;
    const s = this.scene.sound.add(key, { volume, loop: false });
    s.once('complete', () => s.destroy());
    s.play();
  }

  /** Volume of harmonic root tone: tension increases volume slightly */
  private _toneVolume(): number {
    const tension = 1 - (this.state.lowestNodeStability / 100);
    return 0.18 + tension * 0.12;
  }

  /** Prefer variant 0 at high trust, variant 2 at low trust */
  private _pickTrustWeighted(pool: string[]): string {
    const t = this.state.trustLevel / 100;
    const r = Math.random();
    let idx: number;
    if (pool.length === 1) {
      idx = 0;
    } else if (pool.length === 2) {
      idx = r < t ? 0 : 1;
    } else {
      // 3 variants: high trust → v0, mid → v1, low → v2
      if (r < t * 0.6) idx = 0;
      else if (r < t * 0.6 + 0.3) idx = 1;
      else idx = 2;
    }
    return pool[idx];
  }

  private _pick(pool: string[]): string {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  destroy(): void {
    this.toneSound?.stop();
    this.toneSound?.destroy();
    this.beuAmbient?.stop();
    this.beuAmbient?.destroy();
    this.chargeSound?.stop();
    this.chargeSound?.destroy();
    this.toneSound = null;
    this.beuAmbient = null;
    this.chargeSound = null;
  }
}
