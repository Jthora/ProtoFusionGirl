// Centralized InputManager for all input sources
import { KeyboardInput } from './KeyboardInput';
import { TouchInput } from './TouchInput';
import { GamepadInput } from './GamepadInput';
import { AIInput } from './AIInput';

export type InputSource = 'keyboard' | 'touch' | 'gamepad' | 'ai';

export class InputManager {
  private static instance: InputManager;
  private keyboard: KeyboardInput;
  private touch: TouchInput;
  private gamepad: GamepadInput;
  private ai: AIInput;

  private constructor(scene: Phaser.Scene) {
    this.keyboard = new KeyboardInput(scene);
    this.touch = new TouchInput(scene);
    this.gamepad = new GamepadInput(scene);
    this.ai = new AIInput(scene);
  }

  static getInstance(scene: Phaser.Scene): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager(scene);
    }
    return InputManager.instance;
  }

  // Returns -1 for left, 1 for right, 0 for none
  getDirection(): number {
    // Priority: touch > keyboard > gamepad > ai
    return (
      this.touch.getDirection() ||
      this.keyboard.getDirection() ||
      this.gamepad.getDirection() ||
      this.ai.getDirection() ||
      0
    );
  }

  // Returns true if jump is pressed
  isJumpPressed(): boolean {
    return (
      this.touch.isJumpPressed() ||
      this.keyboard.isJumpPressed() ||
      this.gamepad.isJumpPressed() ||
      this.ai.isJumpPressed()
    );
  }

  // For UI components to emit events (e.g., TouchControls)
  getTouchInput(): TouchInput {
    return this.touch;
  }
}
