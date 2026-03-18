// JaneAI.ts
// Autonomous behavior and decision-making for Jane Tho'ra.
// State machine: Idle → Navigate → FollowGuidance → Combat → Retreat → Bored → Refusing
// See: docs/rebuild/01-systems/jane-ai/behavior-model.md

import { EventBus } from '../core/EventBus';
import { BoredomSystem, BoredomConfig } from './BoredomSystem';
import { RefusalSystem, RefusalConfig, GuidanceContext } from './RefusalSystem';
import { JANE_STATE_TO_ANIMATION } from '../data/animationCatalog';
export { JaneAIState } from './JaneAIState';
import { JaneAIState } from './JaneAIState';

export interface EnemyTarget {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
}

export interface JaneAIConfig {
  eventBus: EventBus;
  getSprite: () => { x: number; y: number; body?: { velocity: { x: number; y: number } } } | undefined;
  getHealth?: () => { current: number; max: number };
  getEnemiesInRange?: (range: number) => EnemyTarget[];
  moveSpeed?: number;
  arrivalThreshold?: number;
  detectionRange?: number;
  attackRange?: number;
  attackCooldown?: number;
  attackDamage?: number;
  retreatHealthThreshold?: number;
  retreatTarget?: () => { x: number; y: number } | undefined;
  // P5 additions
  boredomConfig?: Partial<BoredomConfig>;
  refusalConfig?: Partial<RefusalConfig>;
  // Personality modifiers (0-1, default 0.5)
  personality?: {
    aggression?: number;   // higher = engages combat faster, retreats less
    caution?: number;      // higher = refuses more, retreats earlier
    curiosity?: number;    // higher = less boredom, explores more
  };
  // Guidance context providers for refusal evaluation
  getNearbyEnemyCount?: (x: number, y: number) => number;
  getNearestRiftDistance?: (x: number, y: number) => number | null;
}

interface Waypoint {
  id: string;
  x: number;
  y: number;
}

export class JaneAI {
  private eventBus: EventBus;
  private getSprite: JaneAIConfig['getSprite'];
  private getHealth: () => { current: number; max: number };
  private getEnemiesInRange: (range: number) => EnemyTarget[];
  private moveSpeed: number;
  private arrivalThreshold: number;
  private detectionRange: number;
  private attackRange: number;
  private attackCooldown: number;
  private attackDamage: number;
  private retreatHealthThreshold: number;
  private retreatTarget: () => { x: number; y: number } | undefined;

  // P5: Sub-systems
  private boredomSystem: BoredomSystem;
  private refusalSystem: RefusalSystem;
  private personality: { aggression: number; caution: number; curiosity: number };
  private getNearbyEnemyCount: (x: number, y: number) => number;
  private getNearestRiftDistance: (x: number, y: number) => number | null;
  private refusingUntil: number = 0;
  private wanderTarget: { x: number; y: number } | null = null;

  private _state: JaneAIState = JaneAIState.Idle;
  private activeWaypoint: Waypoint | null = null;
  private combatTarget: EnemyTarget | null = null;
  private lastAttackTime: number = 0;
  private preRetreatState: JaneAIState = JaneAIState.Idle;
  private unsubscribers: (() => void)[] = [];

  get state(): JaneAIState {
    return this._state;
  }

  constructor(config: JaneAIConfig) {
    this.eventBus = config.eventBus;
    this.getSprite = config.getSprite;
    this.getHealth = config.getHealth ?? (() => ({ current: 100, max: 100 }));
    this.getEnemiesInRange = config.getEnemiesInRange ?? (() => []);
    this.moveSpeed = config.moveSpeed ?? 200;
    this.arrivalThreshold = config.arrivalThreshold ?? 20;
    this.detectionRange = config.detectionRange ?? 200;
    this.attackRange = config.attackRange ?? 80;
    this.attackCooldown = config.attackCooldown ?? 800;
    this.attackDamage = config.attackDamage ?? 20;
    this.retreatHealthThreshold = config.retreatHealthThreshold ?? 0.25;
    this.retreatTarget = config.retreatTarget ?? (() => undefined);

    // P5: Personality modifiers
    const p = config.personality ?? {};
    this.personality = {
      aggression: p.aggression ?? 0.5,
      caution: p.caution ?? 0.5,
      curiosity: p.curiosity ?? 0.5,
    };

    // P5: Sub-systems
    this.boredomSystem = new BoredomSystem(this.eventBus, {
      ...config.boredomConfig,
      // More curious = longer boredom threshold
      boredomThresholdMs: (config.boredomConfig?.boredomThresholdMs ?? 50000) * (0.5 + this.personality.curiosity),
    });
    this.refusalSystem = new RefusalSystem(this.eventBus, {
      ...config.refusalConfig,
      // More cautious = higher health threshold for refusal
      healthDangerThreshold: (config.refusalConfig?.healthDangerThreshold ?? 0.2) + this.personality.caution * 0.15,
    });
    this.getNearbyEnemyCount = config.getNearbyEnemyCount ?? (() => 0);
    this.getNearestRiftDistance = config.getNearestRiftDistance ?? (() => null);

    this.wireEvents();
  }

  private wireEvents(): void {
    this.unsubscribers.push(
      this.eventBus.on('ASI_WAYPOINT_PLACED', (event) => {
        this.onWaypointPlaced(event.data);
      })
    );
  }

  private onWaypointPlaced(data: { x: number; y: number; id: string }): void {
    const oldWaypoint = this.activeWaypoint;

    // Clear previous waypoint
    if (oldWaypoint) {
      this.eventBus.emit({
        type: 'ASI_WAYPOINT_CLEARED',
        data: { id: oldWaypoint.id, reason: 'replaced' }
      });
    }

    // P5: Evaluate refusal before accepting guidance
    const sprite = this.getSprite();
    if (sprite) {
      const health = this.getHealth();
      const ctx: GuidanceContext = {
        targetX: data.x,
        targetY: data.y,
        janeHealth: health.current,
        janeMaxHealth: health.max,
        nearbyEnemyCount: this.getNearbyEnemyCount(data.x, data.y),
        nearestRiftDistance: this.getNearestRiftDistance(data.x, data.y),
        guidanceType: 'waypoint',
      };
      const result = this.refusalSystem.evaluate(ctx);
      if (result.refused) {
        this.activeWaypoint = null;
        this.refusingUntil = Date.now() + 3000; // Refuse state lasts 3s
        this.transitionTo(JaneAIState.Refusing);
        return;
      }
    }

    this.activeWaypoint = { id: data.id, x: data.x, y: data.y };
    // Waypoint interrupts combat or retreat — ASI guidance takes priority
    if (this._state === JaneAIState.Combat || this._state === JaneAIState.Retreat) {
      this.combatTarget = null;
    }
    this.transitionTo(JaneAIState.FollowGuidance);
  }

  /** Set Jane's initial state before gameplay begins (no event emission for history). */
  setInitialState(state: JaneAIState): void {
    this._state = state;
  }

  /** Place a scripted (non-player) waypoint — bypasses refusal, doesn't emit ASI_WAYPOINT_PLACED. */
  setScriptedWaypoint(x: number, y: number): void {
    this.activeWaypoint = { id: 'scripted', x, y };
    this._state = JaneAIState.Navigate;
  }

  /** Clear a scripted waypoint and return Jane to Bored if it hasn't been superseded. */
  clearScriptedWaypoint(): void {
    if (this.activeWaypoint?.id === 'scripted') {
      this.activeWaypoint = null;
      this._state = JaneAIState.Bored;
    }
  }

  private transitionTo(newState: JaneAIState): void {
    if (this._state === newState) return;
    const previous = this._state;
    this._state = newState;
    this.eventBus.emit({
      type: 'JANE_STATE_CHANGED',
      data: { previousState: previous, newState }
    });
    this.eventBus.emit({
      type: 'JANE_ANIMATION_CHANGED',
      data: { animKey: JANE_STATE_TO_ANIMATION[newState] }
    });
  }

  /**
   * Called each frame from ModularGameLoop.
   */
  update(dt: number): void {
    const sprite = this.getSprite();
    const dtMs = dt * 1000;

    // Priority check: retreat if health is critical (unless already retreating/refusing)
    if (this._state !== JaneAIState.Retreat && this._state !== JaneAIState.Refusing && this.shouldRetreat()) {
      this.boredomSystem.recordActivity();
      this.startRetreat();
    }

    switch (this._state) {
      case JaneAIState.Idle:
        this.updateIdle();
        // P5: Boredom check during idle
        if (this._state === JaneAIState.Idle && sprite) {
          const wander = this.boredomSystem.update(dtMs, sprite.x, sprite.y);
          if (wander) {
            this.wanderTarget = { x: wander.wanderX, y: wander.wanderY };
            this.transitionTo(JaneAIState.Bored);
          }
        }
        break;
      case JaneAIState.Navigate:
        this.updateNavigate(dt);
        break;
      case JaneAIState.FollowGuidance:
        this.boredomSystem.recordActivity();
        this.updateFollowGuidance(dt);
        break;
      case JaneAIState.Combat:
        this.boredomSystem.recordActivity();
        this.updateCombat(dt);
        break;
      case JaneAIState.Retreat:
        this.boredomSystem.recordActivity();
        this.updateRetreat(dt);
        break;
      case JaneAIState.Bored:
        this.updateBored(dt);
        break;
      case JaneAIState.Refusing:
        this.updateRefusing();
        break;
    }
  }

  // P5: Bored state — wander to random nearby point, then return to idle
  private updateBored(dt: number): void {
    const sprite = this.getSprite();
    if (!sprite || !this.wanderTarget) {
      this.boredomSystem.reset();
      this.transitionTo(JaneAIState.Idle);
      return;
    }

    // Interrupt boredom if enemies appear (aggression-dependent)
    const enemies = this.getEnemiesInRange(this.detectionRange);
    if (enemies.length > 0 && Math.random() < this.personality.aggression) {
      this.combatTarget = enemies[0];
      this.boredomSystem.recordActivity();
      this.transitionTo(JaneAIState.Combat);
      return;
    }

    const dx = this.wanderTarget.x - sprite.x;
    const dy = this.wanderTarget.y - sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.arrivalThreshold) {
      if (sprite.body) {
        sprite.body.velocity.x = 0;
        sprite.body.velocity.y = 0;
      }
      this.wanderTarget = null;
      this.boredomSystem.reset();
      this.transitionTo(JaneAIState.Idle);
      return;
    }

    // Wander at half speed
    if (sprite.body) {
      const nx = dx / dist;
      const ny = dy / dist;
      sprite.body.velocity.x = nx * this.moveSpeed * 0.5;
      sprite.body.velocity.y = ny * this.moveSpeed * 0.5;
    }
  }

  // P5: Refusing state — brief pause before returning to idle
  private updateRefusing(): void {
    if (Date.now() >= this.refusingUntil) {
      this.transitionTo(JaneAIState.Idle);
    }
  }

  private shouldRetreat(): boolean {
    const health = this.getHealth();
    // P5: Personality — more cautious = higher retreat threshold, more aggressive = lower
    const adjustedThreshold = this.retreatHealthThreshold + (this.personality.caution - this.personality.aggression) * 0.1;
    return health.current > 0 && health.current / health.max <= adjustedThreshold;
  }

  private startRetreat(): void {
    const sprite = this.getSprite();
    this.preRetreatState = this._state;
    this.combatTarget = null;
    this.transitionTo(JaneAIState.Retreat);
    if (sprite) {
      this.eventBus.emit({
        type: 'JANE_RETREAT_STARTED',
        data: { fromX: sprite.x, fromY: sprite.y, reason: 'low_health' }
      });
    }
  }

  private updateIdle(): void {
    // P5: Personality-adjusted detection range — more aggressive = wider scan
    const adjustedRange = this.detectionRange * (0.8 + this.personality.aggression * 0.4);
    const enemies = this.getEnemiesInRange(adjustedRange);
    if (enemies.length > 0) {
      this.combatTarget = enemies[0];
      this.boredomSystem.recordActivity();
      this.transitionTo(JaneAIState.Combat);
      return;
    }
    // P1: In Idle, Jane doesn't override velocity — allows WASD dev controls.
  }

  private updateNavigate(_dt: number): void {
    const sprite = this.getSprite();
    const wp = this.activeWaypoint;
    if (!sprite || !wp) {
      this.transitionTo(JaneAIState.Idle);
      return;
    }
    const dx = wp.x - sprite.x;
    const dy = wp.y - sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= this.arrivalThreshold) {
      this.arrive();
      return;
    }
    if (sprite.body) {
      const nx = dx / dist;
      const ny = dy / dist;
      sprite.body.velocity.x = nx * this.moveSpeed;
      sprite.body.velocity.y = ny * this.moveSpeed;
    }
  }

  private updateFollowGuidance(_dt: number): void {
    const sprite = this.getSprite();
    const wp = this.activeWaypoint;
    if (!sprite || !wp) {
      this.transitionTo(JaneAIState.Idle);
      return;
    }

    // Check for nearby enemies while following guidance — interrupt if threatened
    const enemies = this.getEnemiesInRange(this.detectionRange * 0.6);
    if (enemies.length > 0) {
      this.combatTarget = enemies[0];
      this.transitionTo(JaneAIState.Combat);
      return;
    }

    const dx = wp.x - sprite.x;
    const dy = wp.y - sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.arrivalThreshold) {
      this.arrive();
      return;
    }

    // Move toward waypoint
    if (sprite.body) {
      const nx = dx / dist;
      const ny = dy / dist;
      sprite.body.velocity.x = nx * this.moveSpeed;
      sprite.body.velocity.y = ny * this.moveSpeed;
    }
  }

  private updateCombat(_dt: number): void {
    const sprite = this.getSprite();
    if (!sprite) {
      this.transitionTo(JaneAIState.Idle);
      return;
    }

    // Re-scan for enemies if current target is dead, gone, or out of range
    const currentEnemies = this.getEnemiesInRange(this.detectionRange);
    const targetStillValid = this.combatTarget && this.combatTarget.health > 0 &&
      currentEnemies.some(e => e.id === this.combatTarget!.id);
    if (!targetStillValid) {
      const enemies = currentEnemies;
      if (enemies.length === 0) {
        this.combatTarget = null;
        // Return to previous activity
        if (this.activeWaypoint) {
          this.transitionTo(JaneAIState.FollowGuidance);
        } else {
          this.transitionTo(JaneAIState.Idle);
        }
        return;
      }
      this.combatTarget = enemies[0];
    }

    const target = this.combatTarget!;
    const dx = target.x - sprite.x;
    const dy = target.y - sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.attackRange) {
      // In attack range — stop and fire
      if (sprite.body) {
        sprite.body.velocity.x = 0;
        sprite.body.velocity.y = 0;
      }
      this.tryAttack();
    } else {
      // Move toward enemy
      if (sprite.body) {
        const nx = dx / dist;
        const ny = dy / dist;
        sprite.body.velocity.x = nx * this.moveSpeed;
        sprite.body.velocity.y = ny * this.moveSpeed;
      }
    }
  }

  private tryAttack(): void {
    const now = Date.now();
    if (now - this.lastAttackTime < this.attackCooldown) return;
    if (!this.combatTarget) return;

    this.lastAttackTime = now;

    // P5 Combat tactics: weapon switching based on distance and enemy count
    const sprite = this.getSprite();
    const enemies = this.getEnemiesInRange(this.detectionRange);
    let weaponType = 'blast_pistol';
    let damage = this.attackDamage;

    if (sprite && this.combatTarget) {
      const dx = this.combatTarget.x - sprite.x;
      const dy = this.combatTarget.y - sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.attackRange * 0.4) {
        // Close range — melee strike (higher damage)
        weaponType = 'energy_blade';
        damage = Math.round(this.attackDamage * 1.5);
      } else if (enemies.length >= 3) {
        // Surrounded — AoE pulse (lower single-target damage)
        weaponType = 'pulse_wave';
        damage = Math.round(this.attackDamage * 0.7);
      }

      // Call for help when outnumbered (aggression < 0.7 only)
      if (enemies.length >= 3 && this.personality.aggression < 0.7) {
        this.eventBus.emit({
          type: 'JANE_CALL_FOR_HELP',
          data: { enemyCount: enemies.length, x: sprite.x, y: sprite.y }
        });
      }
    }

    this.eventBus.emit({
      type: 'JANE_ATTACK',
      data: {
        targetId: this.combatTarget.id,
        damage,
        weaponType,
      }
    });
  }

  private updateRetreat(_dt: number): void {
    const sprite = this.getSprite();
    if (!sprite) {
      this.transitionTo(JaneAIState.Idle);
      return;
    }

    // Check if health recovered above threshold
    const health = this.getHealth();
    if (health.current / health.max > this.retreatHealthThreshold + 0.1) {
      if (sprite.body) {
        sprite.body.velocity.x = 0;
        sprite.body.velocity.y = 0;
      }
      this.eventBus.emit({
        type: 'JANE_RETREAT_ENDED',
        data: { atX: sprite.x, atY: sprite.y }
      });
      // Return to previous state
      if (this.activeWaypoint) {
        this.transitionTo(JaneAIState.FollowGuidance);
      } else {
        this.transitionTo(JaneAIState.Idle);
      }
      return;
    }

    // Move toward retreat target (safe zone)
    const target = this.retreatTarget();
    if (!target) {
      // No retreat target — flee away from nearest enemy
      const enemies = this.getEnemiesInRange(this.detectionRange);
      if (enemies.length > 0 && sprite.body) {
        const dx = sprite.x - enemies[0].x;
        const dy = sprite.y - enemies[0].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        sprite.body.velocity.x = (dx / dist) * this.moveSpeed;
        sprite.body.velocity.y = (dy / dist) * this.moveSpeed;
      }
      return;
    }

    const dx = target.x - sprite.x;
    const dy = target.y - sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.arrivalThreshold) {
      if (sprite.body) {
        sprite.body.velocity.x = 0;
        sprite.body.velocity.y = 0;
      }
      this.eventBus.emit({
        type: 'JANE_RETREAT_ENDED',
        data: { atX: sprite.x, atY: sprite.y }
      });
      this.transitionTo(JaneAIState.Idle);
      return;
    }

    if (sprite.body) {
      const nx = dx / dist;
      const ny = dy / dist;
      sprite.body.velocity.x = nx * this.moveSpeed * 1.2; // Slightly faster when fleeing
      sprite.body.velocity.y = ny * this.moveSpeed * 1.2;
    }
  }

  private arrive(): void {
    const sprite = this.getSprite();
    const wp = this.activeWaypoint;

    // Stop movement
    if (sprite?.body) {
      sprite.body.velocity.x = 0;
      sprite.body.velocity.y = 0;
    }

    if (wp) {
      this.eventBus.emit({
        type: 'JANE_ARRIVED_AT_WAYPOINT',
        data: { waypointId: wp.id, x: wp.x, y: wp.y }
      });
      this.eventBus.emit({
        type: 'ASI_WAYPOINT_CLEARED',
        data: { id: wp.id, reason: 'arrived' }
      });
    }

    this.activeWaypoint = null;
    this.transitionTo(JaneAIState.Idle);
  }

  getActiveWaypoint(): Waypoint | null {
    return this.activeWaypoint;
  }

  getCombatTarget(): EnemyTarget | null {
    return this.combatTarget;
  }

  // P5: expose personality for testing/inspection
  getPersonality(): { aggression: number; caution: number; curiosity: number } {
    return { ...this.personality };
  }

  getBoredomSystem(): BoredomSystem {
    return this.boredomSystem;
  }

  getRefusalSystem(): RefusalSystem {
    return this.refusalSystem;
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
    this.boredomSystem.destroy();
  }
}
