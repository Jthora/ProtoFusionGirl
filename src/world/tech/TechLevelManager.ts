// TechLevelManager.ts - Handles current tech level, progression, and unlocks
import type { TechLevel } from './TechLevel';

export class TechLevelManager {
  private techLevels: TechLevel[];
  private currentTechLevelId: string;

  constructor(techLevels: TechLevel[], startingTechLevelId: string) {
    this.techLevels = techLevels;
    this.currentTechLevelId = startingTechLevelId;
  }

  getCurrentTechLevel(): TechLevel | undefined {
    return this.techLevels.find(tl => tl.id === this.currentTechLevelId);
  }

  canAdvance(trigger: string): boolean {
    const current = this.getCurrentTechLevel();
    return current ? current.advancementTriggers.includes(trigger) : false;
  }

  advanceTo(nextTechLevelId: string): boolean {
    if (this.techLevels.some(tl => tl.id === nextTechLevelId)) {
      this.currentTechLevelId = nextTechLevelId;
      return true;
    }
    return false;
  }

  getUnlocks(): string[] {
    const current = this.getCurrentTechLevel();
    return current ? current.gameplayUnlocks : [];
  }

  // Add regression, save/load, and event hooks as needed
}
