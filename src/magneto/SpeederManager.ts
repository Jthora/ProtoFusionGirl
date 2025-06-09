// SpeederManager.ts
// Manages all Magneto Speeder logic, ley line integration, and world/environmental effects

import { MagnetoSpeeder } from './MagnetoSpeeder';
import { EventBus } from '../core/EventBus';
import { WorldStateManager } from '../world/WorldStateManager';
import { GameEvent } from '../core/EventTypes';

export class SpeederManager {
  private speeder: MagnetoSpeeder;
  private eventBus: EventBus;
  private worldStateManager: WorldStateManager;

  constructor(speeder: MagnetoSpeeder, eventBus: EventBus, worldStateManager: WorldStateManager) {
    this.speeder = speeder;
    this.eventBus = eventBus;
    this.worldStateManager = worldStateManager;
  }

  /**
   * Update speeder energy based on ley line proximity and environmental effects.
   * @param leyLineStrength 0-100, higher is closer/stronger
   * @param terrainModifier e.g. -10 for sandstorm, +5 for road
   */
  updateSpeederEnergy(leyLineStrength: number, terrainModifier: number = 0) {
    this.speeder.adjustEnergyByLeyLine(leyLineStrength);
    this.speeder.updateEnergy(terrainModifier);
    this.worldStateManager.updateState({
      // TODO: Patch speeder state in world state if represented
    });
    this.eventBus.emit({ type: 'SPEEDER_ENERGY_UPDATED', data: { energy: this.speeder.energy } });
  }

  /**
   * Apply environmental hazard (e.g., storm, rift) to the speeder.
   */
  applyEnvironmentalHazard(hazard: string) {
    if (hazard === 'storm') {
      this.speeder.updateEnergy(-10);
      this.worldStateManager.updateState({ /* TODO: Patch speeder state */ });
      this.eventBus.emit({ type: 'SPEEDER_HAZARD', data: { hazard, effect: 'energy_drain' } });
    } else if (hazard === 'rift') {
      this.worldStateManager.updateState({ /* TODO: Patch speeder state */ });
      this.eventBus.emit({ type: 'SPEEDER_HAZARD', data: { hazard, effect: 'disabled' } });
    }
  }
}
