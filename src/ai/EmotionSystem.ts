import { EventBus } from '../core/EventBus';

export enum JaneEmotion {
  Confident = 'Confident',
  Anxious = 'Anxious',
  Determined = 'Determined',
  Curious = 'Curious',
  Protective = 'Protective',
  Melancholic = 'Melancholic',
}

/** Cosmic phase modifiers for emotion transitions (P4, task 6222) */
export type CosmicPhase = 'Fire' | 'Earth' | 'Air' | 'Water';

const PHASE_EMOTION_BIAS: Record<CosmicPhase, Partial<Record<JaneEmotion, number>>> = {
  Fire:  { Determined: 0.3, Confident: 0.2, Anxious: -0.1 },
  Earth: { Confident: 0.2, Protective: 0.2, Curious: -0.1 },
  Air:   { Curious: 0.3, Confident: 0.1, Melancholic: -0.1 },
  Water: { Protective: 0.3, Melancholic: 0.2, Determined: -0.1 },
};

/** Dialogue tone for each emotion state (task 6223) */
export const EMOTION_DIALOGUE_TONE: Record<JaneEmotion, string> = {
  [JaneEmotion.Confident]: 'upbeat',
  [JaneEmotion.Anxious]: 'nervous',
  [JaneEmotion.Determined]: 'resolute',
  [JaneEmotion.Curious]: 'inquisitive',
  [JaneEmotion.Protective]: 'nurturing',
  [JaneEmotion.Melancholic]: 'subdued',
};

/** Speed modifier for each emotion state (task 6223) */
export const EMOTION_SPEED_MODIFIER: Record<JaneEmotion, number> = {
  [JaneEmotion.Confident]: 1.0,
  [JaneEmotion.Anxious]: 0.85,
  [JaneEmotion.Determined]: 1.15,
  [JaneEmotion.Curious]: 0.95,
  [JaneEmotion.Protective]: 0.9,
  [JaneEmotion.Melancholic]: 0.8,
};

export interface EmotionConfig {
  eventBus: EventBus;
  /** Function returning Jane's health ratio (0-1). */
  getHealthRatio: () => number;
  /** Health ratio threshold below which Jane becomes Anxious. Default 0.4 */
  anxiousThreshold?: number;
  /** Health ratio above which Jane recovers Confidence. Default 0.6 */
  confidentThreshold?: number;
  /** Optional: function returning current cosmic phase */
  getCosmicPhase?: () => CosmicPhase | null;
  /** Optional: function returning ally count nearby */
  getAllyCount?: () => number;
  /** Optional: function returning whether Jane is exploring new area */
  isExploring?: () => boolean;
}

/**
 * EmotionSystem — basic emotion states for Jane (P2).
 * Confident (default), Anxious (on damage / low health).
 */
export class EmotionSystem {
  private eventBus: EventBus;
  private _emotion: JaneEmotion = JaneEmotion.Confident;
  private getHealthRatio: () => number;
  private anxiousThreshold: number;
  private confidentThreshold: number;
  private getCosmicPhase: () => CosmicPhase | null;
  private getAllyCount: () => number;
  private isExploring: () => boolean;
  private recentDamageCount = 0;
  private damageWindow = 0;
  private unsubs: Array<() => void> = [];

  constructor(config: EmotionConfig) {
    this.eventBus = config.eventBus;
    this.getHealthRatio = config.getHealthRatio;
    this.anxiousThreshold = config.anxiousThreshold ?? 0.4;
    this.confidentThreshold = config.confidentThreshold ?? 0.6;
    this.getCosmicPhase = config.getCosmicPhase ?? (() => null);
    this.getAllyCount = config.getAllyCount ?? (() => 0);
    this.isExploring = config.isExploring ?? (() => false);

    // Track damage events
    this.unsubs.push(
      this.eventBus.on('JANE_ATTACK', () => {
        // Jane attacking → stays confident (she's fighting back)
      })
    );
  }

  get emotion(): JaneEmotion {
    return this._emotion;
  }

  /** Get the dialogue tone for current emotion (task 6223) */
  getDialogueTone(): string {
    return EMOTION_DIALOGUE_TONE[this._emotion];
  }

  /** Get speed modifier for current emotion (task 6223) */
  getSpeedModifier(): number {
    return EMOTION_SPEED_MODIFIER[this._emotion];
  }

  /**
   * Called on damage taken to track rapid-damage anxiety.
   */
  onDamageTaken(): void {
    this.recentDamageCount++;
    this.damageWindow = 3000; // 3-second window
  }

  /**
   * Update emotion state. Call each frame.
   * @param dtMs Delta time in milliseconds
   */
  update(dtMs: number): void {
    // Decay damage window
    if (this.damageWindow > 0) {
      this.damageWindow -= dtMs;
      if (this.damageWindow <= 0) {
        this.recentDamageCount = 0;
      }
    }

    const healthRatio = this.getHealthRatio();
    const prevEmotion = this._emotion;
    const phase = this.getCosmicPhase();
    const allyCount = this.getAllyCount();
    const exploring = this.isExploring();

    // Priority-based emotion resolution (highest priority first):
    // 1. Anxious: low health or rapid damage
    if (healthRatio <= this.anxiousThreshold || this.recentDamageCount >= 3) {
      this._emotion = JaneEmotion.Anxious;
    }
    // 2. Determined: in combat (recent damage) but health OK
    else if (this.recentDamageCount >= 1 && healthRatio > this.anxiousThreshold) {
      this._emotion = JaneEmotion.Determined;
    }
    // 3. Protective: allies nearby and health good
    else if (allyCount > 0 && healthRatio >= this.confidentThreshold) {
      this._emotion = JaneEmotion.Protective;
    }
    // 4. Curious: exploring new area
    else if (exploring) {
      this._emotion = JaneEmotion.Curious;
    }
    // 5. Melancholic: low-ish health, no allies, not exploring
    else if (healthRatio < this.confidentThreshold && allyCount === 0) {
      this._emotion = JaneEmotion.Melancholic;
    }
    // 6. Default: Confident
    else {
      this._emotion = JaneEmotion.Confident;
    }

    // Apply cosmic phase bias (task 6222): can nudge toward a neighboring emotion
    if (phase) {
      const biases = PHASE_EMOTION_BIAS[phase];
      const currentBias = biases[this._emotion] ?? 0;
      // If current emotion has negative bias in this phase and health allows, try to shift
      if (currentBias < 0 && healthRatio >= this.confidentThreshold) {
        // Find the emotion with highest positive bias in this phase
        let bestEmotion: JaneEmotion | null = null;
        let bestBias = 0;
        for (const [emotion, bias] of Object.entries(biases)) {
          if ((bias as number) > bestBias && emotion !== this._emotion) {
            bestBias = bias as number;
            bestEmotion = emotion as JaneEmotion;
          }
        }
        if (bestEmotion) {
          this._emotion = bestEmotion;
        }
      }
    }

    if (prevEmotion !== this._emotion) {
      this.eventBus.emit({
        type: 'JANE_STATE_CHANGED',
        data: { newState: `emotion_${this._emotion}`, previousState: `emotion_${prevEmotion}` }
      });
    }
  }

  destroy(): void {
    for (const unsub of this.unsubs) unsub();
    this.unsubs = [];
  }
}
