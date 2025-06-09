// MagnetoSpeeder.ts
// Core module for Magneto Speeder traversal, upgrades, and energy management

import { LeyLineManager } from '../world/leyline/LeyLineManager';

export type ControlMode = 'manual' | 'auto';

export interface SpeederUpgrade {
  id: string;
  name: string;
  effect: string;
}

export class MagnetoSpeeder {
  mode: ControlMode = 'manual';
  energy: number = 100;
  upgrades: SpeederUpgrade[] = [];
  leyLineManager?: LeyLineManager;

  // Add world position for traversal
  public position: { x: number; y: number } = { x: 0, y: 0 };

  constructor(leyLineManager?: LeyLineManager) {
    this.leyLineManager = leyLineManager;
  }

  setMode(mode: ControlMode) {
    this.mode = mode;
  }

  applyUpgrade(upgrade: SpeederUpgrade) {
    this.upgrades.push(upgrade);
  }

  updateEnergy(delta: number) {
    this.energy = Math.max(0, Math.min(100, this.energy + delta));
  }

  /**
   * Adjusts energy based on proximity to ley lines.
   * @param leyLineStrength The strength of the nearest ley line (0-100)
   */
  adjustEnergyByLeyLine(leyLineStrength: number) {
    // Example: more energy near strong ley lines, less when far
    const delta = Math.floor((leyLineStrength - 50) / 10); // -5 to +5
    this.updateEnergy(delta);
  }

  /**
   * Updates energy based on current position and ley line manager.
   */
  updateEnergyFromLeyLine() {
    if (this.leyLineManager) {
      const strength = this.leyLineManager.getLeyLineStrength(this.position.x, this.position.y);
      this.adjustEnergyByLeyLine(strength);
    }
  }

  /**
   * Applies all upgrade effects to the speeder's stats.
   * (Stub: In a real system, parse effect strings or use effect objects)
   * Artifact: magneto_speeder_mechanics_2025-06-06.artifact
   */
  applyAllUpgrades() {
    // TODO: Implement stat modification logic based on upgrade.effect
    // (Required by artifact: upgrades affect performance and are visible in UI)
    // Placeholder: upgrades are tracked but not yet applied to stats
    // for (const upg of this.upgrades) { /* see artifact for effect parsing */ }
  }

  /**
   * Toggles accessibility features (e.g., remapping, colorblind mode).
   * Artifact: ui_ux_accessibility_2025-06-06.artifact
   */
  setAccessibilityFeature(_feature: string, _enabled: boolean) {
    // TODO: Integrate with UI/UX/accessibility manager
    // Placeholder for artifact-driven accessibility features
  }

  /**
   * Called by world/manager to apply terrain or environmental modifiers.
   * E.g., sandstorm, road, ley line node, rift, etc.
   */
  applyTerrainModifier(modifier: number) {
    this.energy = Math.max(0, Math.min(100, this.energy + modifier));
  }

  /**
   * Called by world/manager to apply a hazard (e.g., storm, rift disables).
   */
  applyHazard(hazard: string) {
    if (hazard === 'storm') {
      this.updateEnergy(-10);
    } else if (hazard === 'rift') {
      this.energy = 0;
    }
    // Extend for more hazard types
  }

  setLeyLineManager(manager: LeyLineManager) {
    this.leyLineManager = manager;
  }

  setPosition(x: number, y: number) {
    this.position = { x, y };
    this.updateEnergyFromLeyLine();
  }

  // UI/UX and artifact/documentation sync hooks would go here

  // ...additional methods for traversal, ley line integration, UI hooks
}

// Reference: artifacts/copilot_anchor_leyline_system_2025-06-06.artifact
// See: artifacts/copilot_leyline_unification_plan_2025-06-07.artifact
