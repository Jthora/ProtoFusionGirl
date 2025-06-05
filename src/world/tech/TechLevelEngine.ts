// TechLevelEngine.ts - Central engine for tech level progression, unlocks, and events
import * as TechLevels from './levels';
import type { TechLevel } from './TechLevel';

export class TechLevelEngine {
  // Example: Map of all tech levels by id
  private techLevels: Record<string, TechLevel> = {};

  constructor() {
    // Dynamically load all tech levels from modules
    // (In a real system, use dynamic import or codegen for all types/eras)
    this.registerTechLevel(TechLevels.TypeII.Fusion.FusionTech);
    // Add more as needed
  }

  registerTechLevel(techLevel: TechLevel) {
    this.techLevels[techLevel.id] = techLevel;
  }

  getTechLevel(id: string): TechLevel | undefined {
    return this.techLevels[id];
  }

  getAllTechLevels(): TechLevel[] {
    return Object.values(this.techLevels);
  }

  // Add methods for progression, unlocks, event hooks, modding, etc.
}
