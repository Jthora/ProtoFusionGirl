import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { PlayerManager } from '../core/PlayerManager';
import { TrustManager } from '../asiControl/systems/TrustManager';
import { ThreatDetector } from '../asiControl/systems/ThreatDetector';
import { GuidanceEngine } from '../asiControl/systems/GuidanceEngine';
import { CommandCenterUI } from '../asiControl/ui/components/CommandCenterUI';
import { ASIOverlay } from '../ui/components/ASIOverlay';
import { GuidanceViz } from '../asiControl/visuals/GuidanceViz';
import { UILayoutManager } from '../ui/layout/UILayoutManager';
import {
  GUIDANCE_ARRIVAL_EPS, GUIDANCE_TIMEOUT_MS,
  SHIELD_COOLDOWN_MS, SHIELD_DURATION_MS, SHIELD_IMMINENT_MS,
  SHIELD_TIMESCALE, TRUST_THRESHOLD_EMERGENCY
} from '../asiControl/config';

export interface ASISceneIntegrationConfig {
  scene: Phaser.Scene;
  eventBus: EventBus;
  playerManager: PlayerManager;
  uiLayoutManager: UILayoutManager;
  uiShowFeedback: (msg: string) => void;
  getSpeederState: () => { isOnSpeeder: boolean; sprite?: Phaser.Physics.Arcade.Sprite };
}

export class ASISceneIntegration {
  private scene: Phaser.Scene;
  private eventBus: EventBus;
  private playerManager: PlayerManager;
  private uiLayoutManager: UILayoutManager;
  private getSpeederState: () => { isOnSpeeder: boolean; sprite?: Phaser.Physics.Arcade.Sprite };

  // ASI systems
  trustManager: TrustManager;
  private threatDetector: ThreatDetector;
  private guidanceEngine: GuidanceEngine;
  private commandCenterUI: CommandCenterUI;
  private asiOverlay: ASIOverlay;

  // Guidance tracking
  private activeGuidance?: { id: string; target: { x: number; y: number }; startAt: number; timeoutAt: number };
  private guidanceTimeoutEvent?: Phaser.Time.TimerEvent;
  private guidanceViz?: GuidanceViz;
  private shieldWindowCooldownUntil: number = 0;

  constructor(config: ASISceneIntegrationConfig) {
    this.scene = config.scene;
    this.eventBus = config.eventBus;
    this.playerManager = config.playerManager;
    this.uiLayoutManager = config.uiLayoutManager;
    this.getSpeederState = config.getSpeederState;

    // Initialize ASI systems
    this.trustManager = new TrustManager({
      eventBus: this.eventBus,
      initialTrust: 50,
      maxTrust: 100,
      minTrust: 0,
      decayRate: 1,
      updateInterval: 1000
    });

    this.threatDetector = new ThreatDetector({
      scene: this.scene,
      eventBus: this.eventBus,
      detectionRadius: 300,
      updateInterval: 500,
      threatTypes: ['enemy', 'environmental', 'mission']
    });

    this.guidanceEngine = new GuidanceEngine({
      scene: this.scene,
      eventBus: this.eventBus,
      trustManager: this.trustManager,
      threatDetector: this.threatDetector,
      contextUpdateInterval: 1000,
      maxSuggestions: 3,
      simulateResponses: false
    });

    this.commandCenterUI = new CommandCenterUI({
      scene: this.scene,
      width: this.scene.scale.width,
      height: this.scene.scale.height,
      eventBus: this.eventBus,
      playerManager: this.playerManager,
      trustManager: this.trustManager,
      threatDetector: this.threatDetector,
      guidanceEngine: this.guidanceEngine
    });

    // ASI Overlay
    this.asiOverlay = new ASIOverlay({
      scene: this.scene,
      width: this.scene.scale.width,
      height: this.scene.scale.height,
      eventBus: this.eventBus
    });
    this.asiOverlay.setASIState(this.playerManager.isJaneASIControlled());
    this.asiOverlay.onConsent(() => {
      const current = this.playerManager.isJaneASIControlled();
      this.playerManager.setJaneASIOverride(!current);
    });

    // Register with layout manager
    this.uiLayoutManager.registerComponent('asiOverlay', this.asiOverlay, 'overlays', 'contextual');
    this.uiLayoutManager.registerComponent('commandCenterUI', this.commandCenterUI, 'overlays', 'contextual');

    // Wire events
    this.wireStateEvents();
    this.wireGuidanceEvents();
    this.wireShieldWindow();
    this.wireKeyBindings(config.uiShowFeedback);

    // Update app icon
    import('../core/AppIconManager').then(({ AppIconManager }) => {
      AppIconManager.getInstance().updateIconForGameState('asi_active');
    });
  }

  private wireStateEvents(): void {
    this.eventBus.on('JANE_ASI_OVERRIDE', (event: any) => {
      this.asiOverlay.setASIState(event.data.enabled);
    });
  }

  private wireGuidanceEvents(): void {
    this.eventBus.on('ASI_GUIDANCE_GIVEN', (event: any) => {
      const suggestion = event?.data?.suggestion;
      const pos = suggestion?.position;
      if (!pos) return;
      const now = Date.now();

      this.activeGuidance = {
        id: suggestion?.id || 'guidance',
        target: { x: pos.x, y: pos.y },
        startAt: now,
        timeoutAt: now + GUIDANCE_TIMEOUT_MS
      };

      if (this.guidanceTimeoutEvent) {
        this.guidanceTimeoutEvent.remove(false);
        this.guidanceTimeoutEvent = undefined;
      }

      this.guidanceTimeoutEvent = this.scene.time.delayedCall(GUIDANCE_TIMEOUT_MS, () => {
        if (!this.activeGuidance) return;
        const elapsed = Date.now() - this.activeGuidance.startAt;
        this.eventBus.emit({
          type: 'JANE_RESPONSE',
          data: { guidanceId: this.activeGuidance.id, followed: false, responseTime: elapsed, trustChange: -1 }
        });
        this.activeGuidance = undefined;
      });

      const janeSprite = this.playerManager.getJaneSprite();
      const speeder = this.getSpeederState();
      if (speeder.isOnSpeeder && speeder.sprite) {
        this.scene.physics.moveTo(speeder.sprite, pos.x, pos.y, 300);
      } else if (janeSprite) {
        this.scene.physics.moveTo(janeSprite, pos.x, pos.y, 200);
      }

      if (!this.guidanceViz) this.guidanceViz = new GuidanceViz(this.scene);
      const fromX = speeder.isOnSpeeder && speeder.sprite ? speeder.sprite.x : (janeSprite?.x ?? pos.x);
      const fromY = speeder.isOnSpeeder && speeder.sprite ? speeder.sprite.y : (janeSprite?.y ?? pos.y);
      this.guidanceViz.drawPath({ x: fromX, y: fromY }, { x: pos.x, y: pos.y });
    });
  }

  private wireShieldWindow(): void {
    this.eventBus.on('THREAT_DETECTED', (event: any) => {
      const threat = event?.data?.threat ?? event?.data;
      if (!threat) return;
      const now = Date.now();
      const trustOk = this.trustManager?.canPerformAction(TRUST_THRESHOLD_EMERGENCY);
      const imminent = typeof threat.timeToImpact === 'number' && threat.timeToImpact >= 0 && threat.timeToImpact < SHIELD_IMMINENT_MS;
      if (trustOk && imminent && threat.severity === 'critical' && now > this.shieldWindowCooldownUntil) {
        const originalTimeScale = this.scene.time.timeScale ?? 1;
        this.scene.time.timeScale = SHIELD_TIMESCALE;
        this.shieldWindowCooldownUntil = now + SHIELD_COOLDOWN_MS;
        this.eventBus.emit({ type: 'SHIELD_WINDOW_STARTED', data: { timestamp: now, cooldownUntil: this.shieldWindowCooldownUntil } });

        const g = this.scene.add.graphics().setDepth(1300);
        g.fillStyle(0x00ffff, 0.2).fillRect(0, 0, this.scene.scale.width, this.scene.scale.height).setScrollFactor(0);
        this.scene.tweens.add({ targets: g, alpha: 0, duration: SHIELD_DURATION_MS, onComplete: () => g.destroy() });

        this.scene.time.delayedCall(SHIELD_DURATION_MS, () => {
          this.scene.time.timeScale = originalTimeScale;
          this.eventBus.emit({ type: 'SHIELD_WINDOW_ENDED', data: { timestamp: Date.now(), cooldownUntil: this.shieldWindowCooldownUntil } });
        });
      }
    });
  }

  private wireKeyBindings(showFeedback: (msg: string) => void): void {
    // Q: Toggle ASI override + overlay
    this.scene.input.keyboard?.on('keydown-Q', () => {
      const current = this.playerManager.isJaneASIControlled();
      this.playerManager.setJaneASIOverride(!current);
      this.uiLayoutManager.toggleComponent('asiOverlay');
    });

    // C: Toggle Command Center
    this.scene.input.keyboard?.on('keydown-C', () => {
      this.uiLayoutManager.toggleComponent('commandCenterUI');
    });

    // M: Cycle UI mode
    this.scene.input.keyboard?.on('keydown-M', () => {
      const current = this.uiLayoutManager.getMode();
      const next = current === 'minimal' ? 'standard' : current === 'standard' ? 'debug' : 'minimal';
      this.uiLayoutManager.setMode(next);
      showFeedback(`UI mode: ${next.toUpperCase()}`);
    });

    // TAB: Quick guidance suggestions
    this.scene.input.keyboard?.on('keydown-TAB', () => {
      const janeSprite = this.playerManager.getJaneSprite();
      const currentContext = {
        janeState: {
          position: { x: janeSprite?.x || 400, y: janeSprite?.y || 300 },
          health: 100, maxHealth: 100, psi: 75, maxPsi: 100,
          emotionalState: { confidence: 70, stress: 30, curiosity: 80, trust: this.trustManager.getTrustLevel(), fear: 20 },
          isMoving: false, isInCombat: false, currentAction: 'exploring',
          trustLevel: this.trustManager.getTrustLevel(),
          asiControlled: this.playerManager.isJaneASIControlled()
        },
        nearbyThreats: [],
        availableActions: ['move', 'interact', 'magic', 'rest'],
        environmentalFactors: [],
        socialContext: { nearbyNPCs: [], relationships: [], reputation: [] },
        missionContext: undefined
      };
      this.guidanceEngine.generateSuggestions(currentContext);
    });
  }

  /**
   * Call from scene update() to check if guidance target was reached.
   */
  checkGuidanceArrival(): void {
    if (!this.activeGuidance) return;

    const speeder = this.getSpeederState();
    const actor = speeder.isOnSpeeder && speeder.sprite
      ? speeder.sprite
      : this.playerManager.getJaneSprite();
    const target = this.activeGuidance.target;

    if (actor && typeof actor.x === 'number' && typeof actor.y === 'number') {
      const dist = Phaser.Math.Distance.Between(actor.x, actor.y, target.x, target.y);
      if (dist <= GUIDANCE_ARRIVAL_EPS) {
        const body = (actor as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body | undefined;
        if (body) body.setVelocity(0, 0);

        const elapsed = Date.now() - this.activeGuidance.startAt;
        this.eventBus.emit({
          type: 'JANE_RESPONSE',
          data: { guidanceId: this.activeGuidance.id, followed: true, responseTime: elapsed, trustChange: 2 }
        });
        this.activeGuidance = undefined;
        if (this.guidanceTimeoutEvent) {
          this.guidanceTimeoutEvent.remove(false);
          this.guidanceTimeoutEvent = undefined;
        }
      }
    }
  }

  getTrustLevel(): number {
    return this.trustManager.getTrustLevel();
  }
}
