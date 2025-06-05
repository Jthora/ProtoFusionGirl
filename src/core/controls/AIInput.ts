import { TilemapManager } from '../../world/tilemap/TilemapManager';

// AI input abstraction (stub)
export class AIInput {
  constructor(scene: Phaser.Scene) {
    // TODO: Implement AI input logic
  }

  getDirection(): number {
    // TODO: Implement AI left/right
    return 0;
  }

  isJumpPressed(): boolean {
    // TODO: Implement AI jump
    return false;
  }

  // --- Toroidal-aware AI movement logic ---
  /**
   * Computes the direction (-1 for left, 1 for right, 0 for idle) for the AI to move toward a target X position,
   * using toroidal math for seamless world wrapping.
   * @param selfX The AI's current X position
   * @param targetX The target's X position
   * @returns -1 (move left), 1 (move right), or 0 (idle)
   */
  static getToroidalDirection(selfX: number, targetX: number): number {
    const dx = TilemapManager.toroidalDistanceX(targetX, selfX);
    if (dx === 0) return 0;
    // Determine shortest direction (left or right) using wrapped coordinates
    const w = TilemapManager.WORLD_WIDTH;
    const delta = (TilemapManager.wrapX(targetX) - TilemapManager.wrapX(selfX) + w) % w;
    // If delta < w/2, move right; else, move left
    return delta === 0 ? 0 : (delta < w / 2 ? 1 : -1);
  }

  // Example usage in AI logic:
  // const dir = AIInput.getToroidalDirection(ai.x, player.x);
  // Use dir to set movement direction for seamless pursuit across the seam.
}
