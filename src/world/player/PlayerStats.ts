// PlayerStats: Player stats with modifiers from equipment
import type { EquipmentService } from '../equipment/EquipmentService';

export interface BaseStats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
}

export class PlayerStats {
  private base: BaseStats;
  private equipmentService: EquipmentService;

  constructor(base: BaseStats, equipmentService: EquipmentService) {
    this.base = base;
    this.equipmentService = equipmentService;
  }

  getStats(): BaseStats {
    const equipped = this.equipmentService.getAllEquipped();
    const stats = { ...this.base };
    for (const eq of equipped) {
      const def = this.equipmentService['registry'].getEquipment(eq.id);
      if (def && def.stats) {
        for (const k in def.stats) {
          (stats as any)[k] += def.stats[k as keyof typeof def.stats] || 0;
        }
      }
    }
    return stats;
  }

  setBaseStats(base: BaseStats) {
    this.base = base;
  }

  // Add stat modifier utility for future effects
  addModifier(mod: Partial<BaseStats>) {
    for (const k in mod) {
      (this.base as any)[k] += mod[k as keyof BaseStats] || 0;
    }
  }

  toJSON() {
    return { base: this.base };
  }

  fromJSON(data: any) {
    if (data?.base) this.base = data.base;
  }
}
