// Terra.ts
// Terra — Earth Hero robot companion with shield ability.
// Activated when player successfully repairs a damaged robot via UL puzzle.
// See: progress-tracker tasks 5221-5225

import { EventBus } from '../core/EventBus';
import { CompanionAI, CompanionConfig, DEFAULT_COMPANION_CONFIG } from './CompanionAI';

export const TERRA_CONFIG: CompanionConfig = {
  id: 'terra',
  type: 'terra',
  followDistance: DEFAULT_COMPANION_CONFIG.followDistance,
  shieldDuration: 4000, // 4 seconds shield
  shieldCooldown: 10000, // 10 second cooldown
  moveSpeed: 110,
};

export class Terra {
  readonly ai: CompanionAI;
  private eventBus: EventBus;
  private activated: boolean = false;
  private autoShieldEnabled: boolean = true;
  private autoShieldRange: number = 150; // pixels

  constructor(eventBus: EventBus, config?: CompanionConfig) {
    this.eventBus = eventBus;
    this.ai = new CompanionAI(eventBus, config ?? TERRA_CONFIG);
  }

  /** Activate Terra (called after repair puzzle success) */
  activate(x: number, y: number): void {
    this.activated = true;
    this.ai.setPosition(x, y);
    this.ai.setState('follow');
    this.eventBus.emit({
      type: 'COMPANION_SPAWNED',
      data: { companionId: this.ai.config.id, companionType: 'terra', x, y }
    });
  }

  isActivated(): boolean {
    return this.activated;
  }

  /** Update Terra each frame. enemyPositions: array of {id, x, y} */
  update(dtMs: number, janeX: number, janeY: number, enemyPositions: Array<{ id: string; x: number; y: number }>): void {
    if (!this.activated) return;
    this.ai.update(dtMs, janeX, janeY);

    // Auto-shield: if any enemy is within range of Jane and shield is available
    if (this.autoShieldEnabled) {
      const nearbyEnemy = enemyPositions.find(e => {
        const dx = e.x - janeX;
        const dy = e.y - janeY;
        return Math.sqrt(dx * dx + dy * dy) < this.autoShieldRange;
      });
      if (nearbyEnemy) {
        this.ai.autoShieldCheck(true, 'player');
      }
    }
  }

  /** Respond to "defend here" command */
  defendHere(x: number, y: number): void {
    this.ai.command('defend_here', x, y);
  }

  /** Respond to "follow" command */
  follow(): void {
    this.ai.command('follow');
  }

  getState() { return this.ai.getState(); }
  getPosition() { return this.ai.getPosition(); }
  isShielding() { return this.ai.isShielding(); }

  destroy(): void {
    this.activated = false;
    this.ai.destroy();
  }
}
