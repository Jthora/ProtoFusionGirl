// InputManagerModule.ts
// Handles all input setup and event wiring for GameScene
// References: artifacts/agent_optimized_ui_ux_2025-06-05.artifact

import { InputManager } from '../core/controls/InputManager';
import { TouchControls } from '../ui/components';
import Phaser from 'phaser';

export class InputManagerModule {
  private scene: Phaser.Scene;
  private inputManager: InputManager;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.inputManager = InputManager.getInstance(scene);
  }

  setupTouchControls() {
    if (this.scene.sys.game.device.input.touch) {
      const width = this.scene.scale.width;
      const height = this.scene.scale.height;
      const touchInput = this.inputManager.getTouchInput();
      new TouchControls({
        scene: this.scene,
        width,
        height,
        onLeft: (down) => touchInput.setLeft(down),
        onRight: (down) => touchInput.setRight(down),
        onJump: (down) => touchInput.setJump(down),
      }).create();
      this.scene.input.addPointer(2);
    }
  }

  getInputManager() {
    return this.inputManager;
  }
}
