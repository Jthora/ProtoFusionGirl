// PlayerManager.ts
// See artifacts/player_manager_module_2025-06-05.artifact and player_manager_api_2025-06-05.artifact for rationale and API.
// Supports ASI (player) and Jane (Fusion Girl) duality, event-driven architecture, and extensibility.

import { EventBus } from './EventBus';
import { Jane } from './Jane';
import { PlayerController } from '../world/player/PlayerController';
import { ulEventBus } from '../ul/ulEventBus';
// ...import other dependencies as needed...

export interface PlayerManagerConfig {
  scene: any;
  eventBus: EventBus;
  inputManager: any;
  enemyManager: any;
  attackRegistry: any;
  playerConfig?: any;
}

export class PlayerManager {
  private scene: any;
  private eventBus: EventBus;
  private inputManager: any;
  private enemyManager: any;
  private attackRegistry: any;
  private playerConfig: any;

  // Internal state for Jane, ASI(s), and controllers
  private janeController: any;
  private asiControllers: Map<string, any> = new Map();
  private attackControllers: Map<string, any> = new Map();
  private jane: Jane | undefined;

  constructor(config: PlayerManagerConfig) {
    this.scene = config.scene;
    this.eventBus = config.eventBus;
    this.inputManager = config.inputManager;
    this.enemyManager = config.enemyManager;
    this.attackRegistry = config.attackRegistry;
    this.playerConfig = config.playerConfig || {};
  }

  initialize() {
    // Instantiate Jane (Fusion Girl) and ASI(s), set up controllers, wire events
    if (!this.jane) {
      this.jane = new Jane({
        eventBus: this.eventBus,
        name: 'Jane Tho\'ra',
        // Optionally pass initialStats or config
      });
    }
    // Attach a PlayerController and sprite to Jane if not present
    if (!(this.jane as any).sprite) {
      const cfg = this.playerConfig || {};
      (this.jane as any).playerController = new PlayerController({
        scene: this.scene,
        x: cfg.x ?? 0,
        y: cfg.y ?? 300,
        texture: cfg.texture ?? 'player',
        frame: cfg.frame ?? 0,
        animations: cfg.animation?.animations ?? [],
        maxHealth: cfg.stats?.maxHealth ?? 100,
        moveSpeed: cfg.movement?.moveSpeed ?? 200,
        jumpForce: cfg.movement?.jumpForce ?? 350,
        inputManager: this.inputManager
      });
      (this.jane as any).sprite = (this.jane as any).playerController.sprite;
    }
    // Wire up UL event handlers for animation and feedback
    this.eventBus.on('UL_ANIMATION', (event: { type: string; data: any }) => {
      const janeSprite = this.getJaneSprite();
      if (janeSprite && event.data && event.data.animation) {
        // Play the animation on Jane's sprite if it exists
        if (janeSprite.anims && janeSprite.anims.exists && janeSprite.anims.exists(event.data.animation)) {
          janeSprite.play(event.data.animation, true);
        } else if (janeSprite.anims && janeSprite.anims.play) {
          // Try to play even if not pre-registered (Phaser will warn if missing)
          janeSprite.anims.play(event.data.animation, true);
        }
      }
    });
    // Optionally, wire up UL_FEEDBACK to UIManager if available
    if (this.scene && this.scene.uiManager && this.scene.uiManager.showULFeedback) {
      this.eventBus.on('UL_FEEDBACK', (event: { type: string; data: any }) => {
        this.scene.uiManager.showULFeedback(event.data);
      });
    }
    // Cross-system integration: Listen for UL puzzle completion/validation
    ulEventBus.on('ul:puzzle:completed', (payload) => {
      // Example: grant reward, unlock area, trigger world/AI event
      if (payload && payload.id) {
        // TODO: Integrate with progression, analytics, or world state
        console.log(`[UL] Puzzle completed: ${payload.id}`);
        // Example: this.grantULReward(payload.id);
      }
    });
    ulEventBus.on('ul:puzzle:validated', (payload) => {
      if (payload && payload.result === false && payload.errors) {
        // Optionally: track failed attempts, provide feedback, or trigger consequences
        console.log(`[UL] Puzzle validation failed: ${payload.id} - ${payload.errors.join(', ')}`);
      }
    });
  }

  getJane() {
    return this.jane;
  }

  setJaneASIOverride(enabled: boolean) {
    this.jane?.setASIOverride(enabled);
  }

  isJaneASIControlled() {
    return this.jane?.isASIControlled() ?? false;
  }

  getASIController(id?: string) {
    if (id) return this.asiControllers.get(id);
    // Return default/primary ASI if only one
    return this.asiControllers.values().next().value;
  }

  getPlayerAttackController(id?: string) {
    if (id) return this.attackControllers.get(id);
    // Return default/primary attack controller
    return this.attackControllers.values().next().value;
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.eventBus.on(event, handler);
  }

  emit(event: string, payload: any) {
    this.eventBus.emit({ type: event, data: payload });
  }

  addASI(config: any) {
    // Add a new ASI (for multiplayer/modding)
    // ...stub: to be implemented...
  }

  removeASI(id: string) {
    // Remove an ASI
    // ...stub: to be implemented...
  }

  addJane(config: any) {
    // Add an alternate Jane (for multiverse/multiplayer)
    // ...stub: to be implemented...
  }

  removeJane(id: string) {
    // Remove a Jane
    // ...stub: to be implemented...
  }

  getJaneSprite() {
    // If Jane is associated with a PlayerController or sprite, return it
    // This is a stub; update as needed when Jane is fully integrated with a sprite
    return (this.jane as any)?.sprite || undefined;
  }

  // ...additional methods and extension points as per artifacts...
}
