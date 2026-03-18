// GameBootstrap.ts
// Centralized initialization for shared singletons (EventBus, InputManager, WorldStateManager, TilemapManager placeholder)
// Phase 1: Focus on unifying EventBus + preventing premature 'minimal' UI mode.
// Future phases will migrate additional managers here (TrustManager, UIManager, Navigation, etc.).

import { EventBus } from './EventBus';
import { InputManager } from './controls/InputManager';
import { WorldStateManager, WorldState } from '../world/WorldStateManager';
import { TilemapManager } from '../world/tilemap/TilemapManager';

export interface BootstrapContext {
  eventBus: EventBus;
  inputManager: InputManager;
  worldStateManager: WorldStateManager;
  tilemapManager: TilemapManager; // Injected with shared worldState/eventBus when possible
}

/**
 * Singleton responsible for creating and caching cross-scene systems.
 * Keeps GameScene light and prevents EventBus fragmentation.
 */
export class GameBootstrap {
  private static _instance: GameBootstrap | null = null;
  private ctx: BootstrapContext | null = null;

  static get(): GameBootstrap {
    if (!this._instance) this._instance = new GameBootstrap();
    return this._instance;
  }

  /** Ensure core systems exist. Safe to call repeatedly from any scene. */
  ensure(scene: Phaser.Scene): BootstrapContext {
    if (!this.ctx) {
      const eventBus = new EventBus();
      // Minimal initial world state; can be replaced by save-game load later.
      const initialState: WorldState = {
        version: 1,
        leyLines: [],
        rifts: [],
        players: [],
        economy: { resources: {}, marketPrices: {}, scarcity: {} },
        events: [],
        meta: { online: false, aiAgents: [], mods: [] },
        techLevelState: { playerTechLevel: 'neolithic', factionTechLevel: 'neolithic', unlocks: [] }
      };
      const worldStateManager = new WorldStateManager(initialState, eventBus);
      // Inject shared worldState/eventBus into TilemapManager (new optional constructor args)
      const tilemapManager = new TilemapManager({ worldStateManager, eventBus });
      const inputManager = InputManager.getInstance(scene);
      this.ctx = { eventBus, inputManager, worldStateManager, tilemapManager };
      console.log('[Bootstrap] Core systems initialized.');
    } else {
      // Update InputManager scene binding if necessary (scene changed)
      if (this.ctx.inputManager && (this.ctx.inputManager as any).scene !== scene) {
        // Re-bind underlying Phaser input if needed (simple reassignment)
        (this.ctx.inputManager as any).scene = scene;
      }
    }
    return this.ctx;
  }
}

export function getBootstrapContext(scene: Phaser.Scene): BootstrapContext {
  return GameBootstrap.get().ensure(scene);
}
