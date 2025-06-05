// RealityWarpSystem.ts
// Handles reality warping logic, seed management, and integration with WorldGen and narrative hooks.

import { TilemapManager } from './tilemap/TilemapManager';
import { WorldGen } from './tilemap/WorldGen';

export interface RealityWarpEvent {
  initiator: 'jane' | 'anchor' | 'portal' | 'narrative';
  gridCenter: { x: number, y: number };
  gridSize: { width: number, height: number };
  gridShape?: 'rectangle' | 'circle' | 'custom';
  tileData: any[];
  environmentData?: any;
  seed: string;
  timestamp: number;
  resultingWorldId: string;
  previousWorldId?: string;
  branchId?: string;
}

export class RealityWarpSystem {
  private static worldStateMap: Map<string, any> = new Map();
  private tilemapManager: TilemapManager;
  private worldGen: WorldGen;

  constructor(tilemapManager: TilemapManager) {
    this.tilemapManager = tilemapManager;
    this.worldGen = tilemapManager.worldGen;
  }

  warpToReality(seed: string, options: Partial<RealityWarpEvent> = {}): void {
    // Regenerate the world using the new seed
    // @ts-expect-error: partial is an internal extension for warp options
    if (options.gridCenter && options.gridSize && options.partial) {
      this.worldGen.regenerateWorldFromSeed(seed, {
        center: options.gridCenter,
        radius: Math.max(options.gridSize.width, options.gridSize.height) / 2,
        // @ts-expect-error: partial is an internal extension
        partial: options.partial
      });
    } else {
      this.worldGen.regenerateWorldFromSeed(seed);
    }
    // Save previous world state, handle rollback/branching (TODO)
    // --- Narrative & Multiplayer Hooks ---
    if (options.initiator === 'jane') {
      // Example: trigger a story event or quest update
      // TODO: Integrate with quest/progression system
      console.log('[Narrative] Jane warped reality!');
    }
    // TODO: Multiplayer sync (emit warp event to other players)
    // TODO: Analytics/telemetry hook
    // Log the warp event
    console.log(`[RealityWarpSystem] Warped to reality with seed: ${seed}`, options);
  }

  saveWorldState(seed: string, worldState: any): void {
    RealityWarpSystem.worldStateMap.set(seed, worldState);
  }

  getWorldState(seed: string): any | undefined {
    return RealityWarpSystem.worldStateMap.get(seed);
  }
}
