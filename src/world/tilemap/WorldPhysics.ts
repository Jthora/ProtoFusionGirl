// WorldPhysics.ts
// Centralizes world physics configuration and helpers (gravity, collision, etc.)
import Phaser from 'phaser';

export const DEFAULT_GRAVITY_Y = 900;

export class WorldPhysics {
  static setupGravity(scene: Phaser.Scene, gravityY: number = DEFAULT_GRAVITY_Y) {
    if (scene.physics && scene.physics.world) {
      scene.physics.world.gravity.y = gravityY;
    }
  }

  static setupPlayerCollision(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite, groundGroup: Phaser.Physics.Arcade.StaticGroup) {
    if (scene.physics && scene.physics.add) {
      scene.physics.add.collider(player, groundGroup);
    }
  }
}
