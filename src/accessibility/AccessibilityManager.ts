// AccessibilityManager.ts
// Manages accessibility and remapping for Jane and Magneto Speeder
// References: magneto_speeder_gameplay_foundation_2025-06-06.artifact

import { Jane } from '../core/Jane';
import { MagnetoSpeeder } from '../magneto/MagnetoSpeeder';

export class AccessibilityManager {
  private jane: Jane;
  private speeder: MagnetoSpeeder;

  constructor(jane: Jane, speeder: MagnetoSpeeder) {
    this.jane = jane;
    this.speeder = speeder;
  }

  /**
   * Sets an accessibility option for both Jane and the speeder.
   */
  setOption(option: string, value: any) {
    this.jane.setAccessibilityOption(option, value);
    if (typeof this.speeder.setAccessibilityFeature === 'function') {
      this.speeder.setAccessibilityFeature(option, value);
    }
  }
}
