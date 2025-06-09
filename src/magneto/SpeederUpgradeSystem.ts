// SpeederUpgradeSystem.ts
// Manages Magneto Speeder upgrades, unlocks, and customization
// References: magneto_speeder_gameplay_foundation_2025-06-06.artifact

import { MagnetoSpeeder, SpeederUpgrade } from './MagnetoSpeeder';

export class SpeederUpgradeSystem {
  private speeder: MagnetoSpeeder;
  private availableUpgrades: SpeederUpgrade[] = [];

  constructor(speeder: MagnetoSpeeder) {
    this.speeder = speeder;
    // TODO: Load available upgrades from data/mods
  }

  /**
   * Unlocks and applies an upgrade to the speeder.
   */
  unlockUpgrade(upgradeId: string) {
    const upgrade = this.availableUpgrades.find(u => u.id === upgradeId);
    if (upgrade) {
      this.speeder.applyUpgrade(upgrade);
      // TODO: Emit event, update UI, persist state
    }
  }

  /**
   * Returns all upgrades (locked/unlocked) for UI display.
   */
  getAllUpgrades() {
    return this.availableUpgrades;
  }

  /**
   * Stub: Add a new upgrade (for modding support)
   */
  addUpgrade(upgrade: SpeederUpgrade) {
    this.availableUpgrades.push(upgrade);
  }
}
