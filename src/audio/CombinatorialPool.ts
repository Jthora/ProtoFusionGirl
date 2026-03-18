/**
 * CombinatorialPool.ts
 *
 * Layered stochastic sound engine for ProtoFusionGirl.
 *
 * CONCEPT:
 *   Each "sound case" (e.g. node_collapse) was generated from multiple ElevenLabs prompts,
 *   each describing a different physical source for the same emotional intent.
 *   Each prompt produced 4 variants (#1–#4).
 *
 *   Rather than picking ONE file and playing it, this engine:
 *     1. Picks one random variant from each prompt group (the "layers")
 *     2. Plays all layers simultaneously at RMS-balanced volume (1/√N per layer)
 *     3. Applies independent pitch jitter to each layer via playback rate
 *     4. Spreads layers across the stereo field (micro-spread)
 *     5. Staggers attack onset per layer (natural reflection simulation)
 *
 *   Result: effectively infinite perceptual combinations from a small file set,
 *   where no two plays ever sound identical.
 *
 * PERFORMANCE:
 *   Playing 2–3 Web Audio nodes simultaneously is trivial on all platforms.
 *   Files are pre-decoded at load time (Phaser handles this). Zero CPU overhead
 *   beyond what a single sound requires. The only cost is memory (~40KB per file).
 *
 * LAYERING MATH:
 *   RMS volume per layer = 1 / sqrt(N) where N = number of active layers.
 *   This maintains perceived loudness equal to a single full-volume sound.
 *   Linear (1/N) is also safe — slightly quieter but zero clip risk.
 */

import Phaser from 'phaser';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * One prompt group — all variants from a single ElevenLabs prompt run.
 * The pool picks ONE random key from this array per play.
 */
export interface PromptGroup {
  /** All variant keys for this prompt: e.g. ['tone_0_p1_v1','tone_0_p1_v2','tone_0_p1_v3','tone_0_p1_v4'] */
  variants: string[];
  /**
   * Volume multiplier for this layer relative to the RMS-balanced base.
   * Default 1.0. Adjust to make one layer more prominent than others.
   */
  volumeWeight?: number;
  /**
   * ±fraction for random pitch jitter via playback rate.
   * 0.02 = ±2% (imperceptible tempo shift on short sounds, audible pitch color).
   * 0 = no pitch variation.
   */
  pitchJitter?: number;
  /**
   * Stereo pan offset for this layer: -1 (full left) to +1 (full right).
   * Used to spread layers across the field. Default 0 (center).
   */
  panOffset?: number;
  /**
   * Milliseconds to delay this layer's onset after the trigger.
   * Simulates natural acoustic reflections / gives layers a "flam" quality.
   * Keep under 50ms to avoid perceiving it as separate events.
   */
  attackDelayMs?: number;
}

export interface CombinatorialPoolOptions {
  /**
   * When true: always pick exactly 2 layers regardless of prompt group count,
   * selecting from all available groups combined. Useful for large group sets
   * where full layering would be muddy.
   */
  maxLayers?: number;
  /**
   * Whether to use RMS (1/√N) or linear (1/N) volume scaling.
   * RMS = matched loudness. Linear = safe/quiet. Default: 'rms'.
   */
  volumeMode?: 'rms' | 'linear';
  /**
   * Global cooldown in ms — prevents re-triggering within this window.
   * Randomized by ±20% each trigger for organic feel.
   */
  cooldownMs?: number;
}

// ─── CombinatorialPool ───────────────────────────────────────────────────────

export class CombinatorialPool {
  private groups: PromptGroup[];
  private options: Required<CombinatorialPoolOptions>;
  private lastPlayedAt = 0;
  private activeSounds: Phaser.Sound.BaseSound[] = [];

  constructor(groups: PromptGroup[], options: CombinatorialPoolOptions = {}) {
    this.groups = groups;
    this.options = {
      maxLayers: options.maxLayers ?? groups.length,
      volumeMode: options.volumeMode ?? 'rms',
      cooldownMs: options.cooldownMs ?? 0,
    };
  }

  /**
   * Play a combinatorial instance of this sound.
   *
   * @param scene      Active Phaser scene (for sound.add)
   * @param baseVolume Master volume scalar (0–1). Default 1.
   * @param basePan    World-position stereo pan (-1 to +1). Default 0 (center).
   * @returns          Array of keys that were selected (useful for debugging/logging).
   */
  play(scene: Phaser.Scene, baseVolume = 1.0, basePan = 0): string[] {
    // Cooldown check with ±20% randomization
    const now = Date.now();
    const jitteredCooldown = this.options.cooldownMs * (0.8 + Math.random() * 0.4);
    if (this.options.cooldownMs > 0 && now - this.lastPlayedAt < jitteredCooldown) {
      return [];
    }
    this.lastPlayedAt = now;

    // Select which groups to use (capped at maxLayers)
    const selectedGroups = this._selectGroups();
    const N = selectedGroups.length;
    if (N === 0) return [];

    const volumeScale = this.options.volumeMode === 'rms'
      ? 1 / Math.sqrt(N)
      : 1 / N;

    const selectedKeys: string[] = [];

    for (const group of selectedGroups) {
      // Pick a random available variant from this group
      const key = this._pickAvailable(scene, group.variants);
      if (!key) continue;
      selectedKeys.push(key);

      const layerVolume = baseVolume * volumeScale * (group.volumeWeight ?? 1.0);

      // Pitch jitter: small random rate multiplier
      const jitter = group.pitchJitter ?? 0;
      const rate = jitter > 0
        ? 1.0 + (Math.random() * 2 - 1) * jitter
        : 1.0;

      // Stereo: world pan + per-layer micro-spread
      const pan = Math.max(-1, Math.min(1, basePan + (group.panOffset ?? 0)));

      const delayMs = group.attackDelayMs ?? 0;

      if (delayMs > 0) {
        scene.time.delayedCall(delayMs, () => {
          this._playLayer(scene, key, layerVolume, rate, pan);
        });
      } else {
        this._playLayer(scene, key, layerVolume, rate, pan);
      }
    }

    return selectedKeys;
  }

  /** Stop all currently playing layers (e.g. for looping charge sounds). */
  stopAll(): void {
    for (const s of this.activeSounds) {
      try { s.stop(); s.destroy(); } catch { /* already destroyed */ }
    }
    this.activeSounds = [];
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private _selectGroups(): PromptGroup[] {
    if (this.groups.length <= this.options.maxLayers) return this.groups;
    // Randomly pick maxLayers from available groups (no repeat)
    const shuffled = [...this.groups].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, this.options.maxLayers);
  }

  private _pickAvailable(scene: Phaser.Scene, variants: string[]): string | null {
    // Filter to only cached variants — supports tiered loading
    const available = variants.filter(k => scene.cache.audio.has(k));
    if (available.length === 0) {
      // Fall back to any variant key if cache check fails (e.g. different scene)
      return variants[Math.floor(Math.random() * variants.length)] ?? null;
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  private _playLayer(
    scene: Phaser.Scene,
    key: string,
    volume: number,
    rate: number,
    pan: number,
  ): void {
    if (!scene.cache.audio.has(key)) return;
    const s = scene.sound.add(key, { volume, rate, loop: false });
    // Phaser's WebAudioSound supports pan via the underlying AudioNode
    if ('setPan' in s && typeof (s as any).setPan === 'function') {
      (s as any).setPan(pan);
    }
    this.activeSounds.push(s);
    s.once('complete', () => {
      s.destroy();
      this.activeSounds = this.activeSounds.filter(x => x !== s);
    });
    s.play();
  }
}

// ─── Factory helpers ─────────────────────────────────────────────────────────

/** Build variant key arrays for a prompt group given a stem and variant count. */
export function promptGroup(
  stem: string,
  variantCount = 4,
  overrides: Partial<PromptGroup> = {},
): PromptGroup {
  return {
    variants: Array.from({ length: variantCount }, (_, i) => `${stem}_v${i + 1}`),
    ...overrides,
  };
}

/**
 * Pre-built pool definitions for every 2ndPass sound case.
 * Use these directly or as a reference for constructing CombinatorialPool instances.
 *
 * LAYER DESIGN RATIONALE:
 *   - Harmonic tones: 2 layers (p1 + p2), micro-spread, minimal pitch jitter
 *     (pure tones degrade with too much detuning; 2 layers = rich without mud)
 *   - Stingers (beu, trust): 2 layers, slightly more jitter (alive but not off-key)
 *   - Impacts (hurt, attack): 3 layers, more jitter (hits should feel punchy + varied)
 *   - Rift/collapse: 2 layers, generous jitter (corruption = instability)
 *   - Milestones 100: 3 layers, minimal jitter (emotional peak = clarity + richness)
 */
export const POOLS = {

  // ── Harmonic Tones ──────────────────────────────────────────────────────────
  // 2 layers, micro-spread, ±1.5% pitch jitter. Third prompt available as fallback.

  ...Object.fromEntries(
    Array.from({ length: 12 }, (_, t) => [
      `tone_${t}`,
      new CombinatorialPool([
        promptGroup(`tone_${t}_p1`, 4, { pitchJitter: 0.015, panOffset: -0.12, volumeWeight: 1.0 }),
        promptGroup(`tone_${t}_p2`, 4, { pitchJitter: 0.015, panOffset:  0.12, attackDelayMs: 15 }),
        // p3 included as 3rd layer but maxLayers=2 means it's only used if randomly selected
        promptGroup(`tone_${t}_p3`, 4, { pitchJitter: 0.015, panOffset:  0.0,  attackDelayMs: 8 }),
      ], { maxLayers: 2, volumeMode: 'rms', cooldownMs: 200 }),
    ])
  ),

  // ── Beu Lifecycle Stingers ──────────────────────────────────────────────────

  beu_seed:   new CombinatorialPool([
    promptGroup('beu_seed_p1',   4, { pitchJitter: 0.01, panOffset: -0.1 }),
    promptGroup('beu_seed_p2',   4, { pitchJitter: 0.01, panOffset:  0.1, attackDelayMs: 20 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  beu_sprout: new CombinatorialPool([
    promptGroup('beu_sprout_p1', 4, { pitchJitter: 0.02, panOffset: -0.1 }),
    promptGroup('beu_sprout_p2', 4, { pitchJitter: 0.02, panOffset:  0.1, attackDelayMs: 10 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  beu_growth: new CombinatorialPool([
    promptGroup('beu_growth_p1', 4, { pitchJitter: 0.02, panOffset: -0.12 }),
    promptGroup('beu_growth_p2', 4, { pitchJitter: 0.02, panOffset:  0.12, attackDelayMs: 12 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  beu_bloom:  new CombinatorialPool([
    promptGroup('beu_bloom_p1',  4, { pitchJitter: 0.015, panOffset: -0.15 }),
    promptGroup('beu_bloom_p2',  4, { pitchJitter: 0.015, panOffset:  0.15, attackDelayMs: 18 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  beu_bond:   new CombinatorialPool([
    promptGroup('beu_bond_p1',   4, { pitchJitter: 0.01, panOffset: -0.2 }),
    promptGroup('beu_bond_p2',   4, { pitchJitter: 0.01, panOffset:  0.2,  attackDelayMs: 25 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  // ── UL Casting ──────────────────────────────────────────────────────────────

  ul_init: new CombinatorialPool([
    promptGroup('ul_init_p1',    4, { pitchJitter: 0.02, panOffset: -0.1 }),
    promptGroup('ul_init_p2',    4, { pitchJitter: 0.02, panOffset:  0.1, attackDelayMs: 8 }),
  ], { maxLayers: 2, volumeMode: 'rms', cooldownMs: 100 }),

  ul_charge: new CombinatorialPool([
    promptGroup('ul_charge_p1',  4, { pitchJitter: 0.01, panOffset: -0.08 }),
    promptGroup('ul_charge_p2',  4, { pitchJitter: 0.01, panOffset:  0.08 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  ul_release: new CombinatorialPool([
    promptGroup('ul_release_p1', 4, { pitchJitter: 0.015, panOffset: -0.1 }),
    promptGroup('ul_release_p2', 4, { pitchJitter: 0.015, panOffset:  0.1, attackDelayMs: 10 }),
    promptGroup('ul_release_p3', 4, { pitchJitter: 0.01,  panOffset:  0.0, attackDelayMs: 20 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  ul_fail: new CombinatorialPool([
    promptGroup('ul_fail_p1',    4, { pitchJitter: 0.03, panOffset: -0.15 }),
    promptGroup('ul_fail_p2',    4, { pitchJitter: 0.03, panOffset:  0.15, attackDelayMs: 5 }),
  ], { maxLayers: 2, volumeMode: 'rms', cooldownMs: 150 }),

  // ── Node Events ──────────────────────────────────────────────────────────────

  node_distress: new CombinatorialPool([
    promptGroup('node_distress_p1', 4, { pitchJitter: 0.025, panOffset: -0.1 }),
    promptGroup('node_distress_p2', 4, { pitchJitter: 0.025, panOffset:  0.1, attackDelayMs: 10 }),
    promptGroup('node_distress_p3', 4, { pitchJitter: 0.02,  panOffset:  0.0, attackDelayMs: 20 }),
  ], { maxLayers: 2, volumeMode: 'rms', cooldownMs: 500 }),

  node_collapse: new CombinatorialPool([
    promptGroup('node_collapse_p1', 4, { pitchJitter: 0.03, panOffset: -0.15 }),
    promptGroup('node_collapse_p2', 4, { pitchJitter: 0.03, panOffset:  0.15, attackDelayMs: 15 }),
    promptGroup('node_collapse_p3', 4, { pitchJitter: 0.025, panOffset: 0.0,  attackDelayMs: 30 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  node_restore: new CombinatorialPool([
    promptGroup('node_restore_p1',  4, { pitchJitter: 0.015, panOffset: -0.1 }),
    promptGroup('node_restore_p2',  4, { pitchJitter: 0.015, panOffset:  0.1, attackDelayMs: 12 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  // ── Trust Milestones ─────────────────────────────────────────────────────────
  // Milestones escalate: 25 = 1 layer (intimate), 100 = 3 layers (transcendent)

  trust_25: new CombinatorialPool([
    promptGroup('trust_25_p1', 4, { pitchJitter: 0.01 }),
    promptGroup('trust_25_p2', 4, { pitchJitter: 0.01, attackDelayMs: 15 }),
  ], { maxLayers: 1, volumeMode: 'rms' }),  // single layer — quiet, personal

  trust_50: new CombinatorialPool([
    promptGroup('trust_50_p1', 4, { pitchJitter: 0.012, panOffset: -0.1 }),
    promptGroup('trust_50_p2', 4, { pitchJitter: 0.012, panOffset:  0.1, attackDelayMs: 12 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  trust_75: new CombinatorialPool([
    promptGroup('trust_75_p1', 4, { pitchJitter: 0.012, panOffset: -0.15 }),
    promptGroup('trust_75_p2', 4, { pitchJitter: 0.012, panOffset:  0.15, attackDelayMs: 15 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  trust_100: new CombinatorialPool([
    promptGroup('trust_100_p1', 4, { pitchJitter: 0.008, panOffset: -0.2  }),
    promptGroup('trust_100_p2', 4, { pitchJitter: 0.008, panOffset:  0.2,  attackDelayMs: 20 }),
    promptGroup('trust_100_p3', 4, { pitchJitter: 0.008, panOffset:  0.0,  attackDelayMs: 40 }),
  ], { maxLayers: 3, volumeMode: 'rms' }),  // 3 layers — full, transcendent

  // ── Rift ─────────────────────────────────────────────────────────────────────
  // Generous jitter — corruption is inherently unstable

  rift_warning: new CombinatorialPool([
    promptGroup('rift_warning_p1', 4, { pitchJitter: 0.04, panOffset: -0.15 }),
    promptGroup('rift_warning_p2', 4, { pitchJitter: 0.04, panOffset:  0.1,  attackDelayMs: 8 }),
    promptGroup('rift_warning_p3', 4, { pitchJitter: 0.05, panOffset:  0.0 }),
    promptGroup('rift_warning_p4', 4, { pitchJitter: 0.04, panOffset: -0.1,  attackDelayMs: 15 }),
  ], { maxLayers: 2, volumeMode: 'rms', cooldownMs: 300 }),

  rift_seal: new CombinatorialPool([
    promptGroup('rift_seal_p1', 4, { pitchJitter: 0.02, panOffset: -0.12 }),
    promptGroup('rift_seal_p2', 4, { pitchJitter: 0.02, panOffset:  0.12, attackDelayMs: 10 }),
    promptGroup('rift_seal_p3', 4, { pitchJitter: 0.015, panOffset: 0.0,  attackDelayMs: 25 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  // ── Jane Physical ─────────────────────────────────────────────────────────────
  // 3 groups available — layer 2 of them, higher jitter (hits should feel punchy/varied)

  jane_hurt: new CombinatorialPool([
    promptGroup('jane_hurt_p1', 4, { pitchJitter: 0.04, panOffset: -0.05 }),
    promptGroup('jane_hurt_p2', 4, { pitchJitter: 0.04, panOffset:  0.05, attackDelayMs: 5 }),
    promptGroup('jane_hurt_p3', 4, { pitchJitter: 0.05, panOffset:  0.0 }),
  ], { maxLayers: 2, volumeMode: 'linear', cooldownMs: 80 }),  // linear = safer for percussive

  jane_attack: new CombinatorialPool([
    promptGroup('jane_attack_p1', 4, { pitchJitter: 0.04, panOffset: -0.08 }),
    promptGroup('jane_attack_p2', 4, { pitchJitter: 0.04, panOffset:  0.08, attackDelayMs: 8 }),
    promptGroup('jane_attack_p3', 4, { pitchJitter: 0.05, panOffset:  0.0 }),
  ], { maxLayers: 2, volumeMode: 'linear', cooldownMs: 60 }),

  // ── Speeder ──────────────────────────────────────────────────────────────────

  speeder_boost: new CombinatorialPool([
    promptGroup('speeder_boost_p1', 4, { pitchJitter: 0.03, panOffset: -0.1 }),
    promptGroup('speeder_boost_p2', 4, { pitchJitter: 0.03, panOffset:  0.1, attackDelayMs: 10 }),
  ], { maxLayers: 2, volumeMode: 'rms', cooldownMs: 200 }),

  // ── Ley Lines ────────────────────────────────────────────────────────────────

  leyline_activate: new CombinatorialPool([
    promptGroup('leyline_activate_p1', 4, { pitchJitter: 0.02, panOffset: -0.15 }),
    promptGroup('leyline_activate_p2', 4, { pitchJitter: 0.02, panOffset:  0.15, attackDelayMs: 20 }),
  ], { maxLayers: 2, volumeMode: 'rms' }),

  // ── PsiNet ───────────────────────────────────────────────────────────────────

  psinet_connect: new CombinatorialPool([
    promptGroup('psinet_connect_p1', 4, { pitchJitter: 0.02, panOffset: -0.08 }),
    promptGroup('psinet_connect_p2', 4, { pitchJitter: 0.02, panOffset:  0.08, attackDelayMs: 8 }),
  ], { maxLayers: 2, volumeMode: 'rms', cooldownMs: 200 }),

  psinet_alert: new CombinatorialPool([
    promptGroup('psinet_alert_p1', 4, { pitchJitter: 0.025, panOffset: -0.1 }),
    promptGroup('psinet_alert_p2', 4, { pitchJitter: 0.025, panOffset:  0.1, attackDelayMs: 5 }),
  ], { maxLayers: 2, volumeMode: 'rms', cooldownMs: 150 }),

} satisfies Record<string, CombinatorialPool>;

// ─── preload helper ───────────────────────────────────────────────────────────

/**
 * Load all CombinatorialPool audio files into a Phaser scene.
 * Call in scene preload(). Skips keys already in cache.
 */
export function preloadCombinatorialAudio(loader: Phaser.Loader.LoaderPlugin): void {
  // Harmonic tones: 12 tones × 3 prompts × 4 variants
  for (let t = 0; t <= 11; t++) {
    for (let p = 1; p <= 3; p++) {
      for (let v = 1; v <= 4; v++) {
        const key = `tone_${t}_p${p}_v${v}`;
        if (!loader.cacheManager?.audio?.has(key)) {
          loader.audio(key, [`audio/harmonic/tone_${t}_p${p}_v${v}.mp3`]);
        }
      }
    }
  }

  // All other categories: 2 prompt groups × 4 variants
  const twoGroup: [string, string][] = [
    ['beu_seed',    'audio/beu/beu_seed'],
    ['beu_sprout',  'audio/beu/beu_sprout'],
    ['beu_growth',  'audio/beu/beu_growth'],
    ['beu_bloom',   'audio/beu/beu_bloom'],
    ['beu_bond',    'audio/beu/beu_bond'],
    ['ul_init',     'audio/ul/ul_init'],
    ['ul_charge',   'audio/ul/ul_charge'],
    ['ul_fail',     'audio/ul/ul_fail'],
    ['node_restore','audio/nodes/node_restore'],
    ['speeder_boost','audio/speeder/speeder_boost'],
    ['leyline_activate','audio/leylines/leyline_activate'],
    ['psinet_connect','audio/psinet/psinet_connect'],
    ['psinet_alert', 'audio/psinet/psinet_alert'],
  ];
  for (const [stem, path] of twoGroup) {
    for (let p = 1; p <= 2; p++) {
      for (let v = 1; v <= 4; v++) {
        loader.audio(`${stem}_p${p}_v${v}`, [`${path}_p${p}_v${v}.mp3`]);
      }
    }
  }

  // 3-group sounds
  const threeGroup: [string, string][] = [
    ['ul_release',     'audio/ul/ul_release'],
    ['node_distress',  'audio/nodes/node_distress'],
    ['node_collapse',  'audio/nodes/node_collapse'],
    ['jane_hurt',      'audio/jane/jane_hurt'],
    ['jane_attack',    'audio/jane/jane_attack'],
    ['rift_seal',      'audio/rift/rift_seal'],
  ];
  for (const [stem, path] of threeGroup) {
    for (let p = 1; p <= 3; p++) {
      for (let v = 1; v <= 4; v++) {
        loader.audio(`${stem}_p${p}_v${v}`, [`${path}_p${p}_v${v}.mp3`]);
      }
    }
  }

  // 4-group: rift_warning
  for (let p = 1; p <= 4; p++) {
    for (let v = 1; v <= 4; v++) {
      loader.audio(`rift_warning_p${p}_v${v}`, [`audio/rift/rift_warning_p${p}_v${v}.mp3`]);
    }
  }

  // Trust milestones (p1+p2 for 25/50/75, p1+p2+p3 for 100)
  for (const [ms, pCount] of [[25, 2], [50, 2], [75, 2], [100, 3]] as [number, number][]) {
    for (let p = 1; p <= pCount; p++) {
      for (let v = 1; v <= 4; v++) {
        loader.audio(`trust_${ms}_p${p}_v${v}`, [`audio/trust/trust_${ms}_p${p}_v${v}.mp3`]);
      }
    }
  }
}
