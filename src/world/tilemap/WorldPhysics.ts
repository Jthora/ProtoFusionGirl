// WorldPhysics.ts
// Centralizes world physics configuration and helpers (gravity, collision, etc.)
import Phaser from 'phaser';

export class WorldPhysics {
  static setupGravity(scene: Phaser.Scene, gravityY: number = 900) {
    scene.physics.world.gravity.y = gravityY;
  }

  static setupPlayerCollision(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite, groundGroup: Phaser.Physics.Arcade.StaticGroup) {
    scene.physics.add.collider(player, groundGroup);
  }
}
