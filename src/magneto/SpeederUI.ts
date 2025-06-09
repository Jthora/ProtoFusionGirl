// SpeederUI.ts
// UI module for displaying Magneto Speeder status, upgrades, and ley line effects
// References: magneto_speeder_gameplay_foundation_2025-06-06.artifact

import { MagnetoSpeeder } from './MagnetoSpeeder';

export class SpeederUI {
  private speeder: MagnetoSpeeder;

  constructor(speeder: MagnetoSpeeder) {
    this.speeder = speeder;
  }

  /**
   * Returns a UI-ready object for rendering the speeder HUD.
   */
  getHUDData() {
    return {
      energy: this.speeder.energy,
      mode: this.speeder.mode,
      upgrades: this.speeder.upgrades,
      position: this.speeder.position,
      // Extend with ley line effects, hazards, etc.
    };
  }

  /**
   * Stub: Render the HUD (to be integrated with game UI framework)
   */
  renderHUD() {
    const hud = this.getHUDData();
    // TODO: Integrate with actual UI system (React, PixiJS, etc.)
    // Example: console.log for now
    console.log('[Speeder HUD]', hud);
  }
}
