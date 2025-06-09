// WorldTraversalSystem.ts
// Integrates Magneto Speeder and Jane traversal with ley lines and world state
// References: magneto_speeder_gameplay_foundation_2025-06-06.artifact

import { Jane } from '../core/Jane';
import { MagnetoSpeeder } from '../magneto/MagnetoSpeeder';
import { SpeederManager } from '../magneto/SpeederManager';
import { LeyLineManager } from './leyline/LeyLineManager';
import { TilemapManager } from './tilemap/TilemapManager';
import { WorldStateManager } from './WorldStateManager';
import { EventBus } from '../core/EventBus';
import { EventName, GameEvent } from '../core/EventTypes';

export class WorldTraversalSystem {
  private jane: Jane;
  private speederManager: SpeederManager;
  private leyLineManager: LeyLineManager;
  private tilemapManager: TilemapManager;
  private worldStateManager: WorldStateManager;
  private eventBus: EventBus;

  constructor(jane: Jane, speederManager: SpeederManager, leyLineManager: LeyLineManager, tilemapManager: TilemapManager, worldStateManager: WorldStateManager, eventBus: EventBus) {
    this.jane = jane;
    this.speederManager = speederManager;
    this.leyLineManager = leyLineManager;
    this.tilemapManager = tilemapManager;
    this.worldStateManager = worldStateManager;
    this.eventBus = eventBus;
  }

  /**
   * Plan and move Jane or the speeder using hybrid ley line + tile pathfinding.
   * Applies ley line and terrain effects.
   */
  moveToHybrid(targetX: number, targetY: number) {
    const start = this.jane.position;
    const end = { x: targetX, y: targetY };
    // Use hybrid pathfinding
    const pathResult = this.leyLineManager.findHybridLeyLinePath(
      start,
      end,
      (x, y) => this.tilemapManager.isTileWalkable(x, y)
    );
    // Move Jane/speeder along the path (stub: just move to end for now)
    const leyLineStrength = this.leyLineManager.getLeyLineStrength(targetX, targetY);
    const terrainModifier = 0; // TODO: calculate from tile/biome
    if (this.jane.isMounted && this.jane.speeder) {
      this.speederManager.updateSpeederEnergy(leyLineStrength, terrainModifier);
      // Update via WorldStateManager
      this.worldStateManager.updateState({
        players: this.worldStateManager.getState().players.map(p =>
          p.id === this.jane.id ? { ...p, position: { x: targetX, y: targetY } } : p
        )
      });
      // Emit movement event
      const event: GameEvent<'JANE_MOVED'> = { type: 'JANE_MOVED', data: { x: targetX, y: targetY } };
      this.eventBus.emit(event);
    } else {
      this.worldStateManager.updateState({
        players: this.worldStateManager.getState().players.map(p =>
          p.id === this.jane.id ? { ...p, position: { x: targetX, y: targetY } } : p
        )
      });
      const event: GameEvent<'JANE_MOVED'> = { type: 'JANE_MOVED', data: { x: targetX, y: targetY } };
      this.eventBus.emit(event);
    }
    // TODO: Emit movement events, update UI, trigger world logic, animate path traversal
    return pathResult;
  }
}
