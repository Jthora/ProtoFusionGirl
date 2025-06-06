// PlayerFactory.ts
// Factory for creating PlayerController instances with modular config structure
// See artifacts and .primer for design rationale

import { PlayerController } from './PlayerController';
import { InputManager } from '../../core/controls/InputManager';
import Phaser from 'phaser';

// Modular config sections for clarity and extensibility
export interface PlayerMovementConfig {
  moveSpeed: number;
  jumpForce: number;
}

export interface PlayerAnimationConfig {
  animations: Array<{ key: string; frames: { start: number; end: number }; frameRate: number; repeat: number }>;
}

export interface PlayerStatsConfig {
  maxHealth: number;
}

export interface PlayerInputConfig {
  inputManager: InputManager;
}

export interface PlayerFactoryConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string;
  frame: number;
  movement: PlayerMovementConfig;
  animation: PlayerAnimationConfig;
  stats: PlayerStatsConfig;
  input: PlayerInputConfig;
}

export class PlayerFactory {
  /**
   * Creates a PlayerController using modular config sections.
   * @param config PlayerFactoryConfig
   */
  static createPlayerController(config: PlayerFactoryConfig): PlayerController {
    return new PlayerController({
      scene: config.scene,
      x: config.x,
      y: config.y,
      texture: config.texture,
      frame: config.frame,
      animations: config.animation.animations,
      maxHealth: config.stats.maxHealth,
      moveSpeed: config.movement.moveSpeed,
      jumpForce: config.movement.jumpForce,
      inputManager: config.input.inputManager
    });
  }
}
