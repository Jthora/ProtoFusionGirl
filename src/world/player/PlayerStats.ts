// PlayerStats: Player stats with modifiers from equipment
import type { EquipmentService } from '../equipment/EquipmentService';

export interface BaseStats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  effect: (target: any) => void;
}

export interface StatusEffect {
  id: string;
  name: string;
  duration: number;
  modifier: Partial<BaseStats>;
  onApply?: (player: PlayerStats) => void;
  onExpire?: (player: PlayerStats) => void;
}

export class PlayerStats {
  private base: BaseStats;
  private equipmentService: EquipmentService;
  private techLevelId: string = 'neolithic'; // Default starting tech level
  private abilities: Ability[] = [];
  private statusEffects: StatusEffect[] = [];
  private eventBus?: import('../../core/EventBus').EventBus;
  private playerId?: string;

  constructor(base: BaseStats, equipmentService: EquipmentService, eventBus?: import('../../core/EventBus').EventBus, playerId?: string) {
    this.base = base;
    this.equipmentService = equipmentService;
    this.eventBus = eventBus;
    this.playerId = playerId;
  }

  getStats(): BaseStats {
    const equipped = this.equipmentService.getAllEquipped();
    let stats = { ...this.base };
    for (const eq of equipped) {
      const def = this.equipmentService['registry'].getEquipment(eq.id);
      if (def && def.stats) {
        for (const k in def.stats) {
          (stats as any)[k] += def.stats[k as keyof typeof def.stats] || 0;
        }
      }
    }
    // Apply status effects
    for (const effect of this.statusEffects) {
      for (const k in effect.modifier) {
        (stats as any)[k] += effect.modifier[k as keyof BaseStats] || 0;
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

  getTechLevelId(): string {
    return this.techLevelId;
  }

  setTechLevelId(id: string) {
    this.techLevelId = id;
  }

  getAbilities(): Ability[] {
    return this.abilities;
  }

  addAbility(ability: Ability) {
    this.abilities.push(ability);
  }

  removeAbility(abilityId: string) {
    this.abilities = this.abilities.filter(a => a.id !== abilityId);
  }

  getStatusEffects(): StatusEffect[] {
    return this.statusEffects;
  }

  addStatusEffect(effect: StatusEffect) {
    this.statusEffects.push(effect);
    if (effect.onApply) effect.onApply(this);
  }

  removeStatusEffect(effectId: string) {
    const effect = this.statusEffects.find(e => e.id === effectId);
    if (effect && effect.onExpire) effect.onExpire(this);
    this.statusEffects = this.statusEffects.filter(e => e.id !== effectId);
  }

  tickStatusEffects() {
    for (const effect of this.statusEffects) {
      effect.duration -= 1;
      if (effect.duration <= 0) {
        this.removeStatusEffect(effect.id);
      }
    }
  }

  // Add: Ability use event and handler
  useAbility(abilityId: string, target: any) {
    const ability = this.abilities.find(a => a.id === abilityId);
    if (ability && ability.cooldown === 0) {
      ability.effect(target);
      ability.cooldown = 3; // Example cooldown
      if (this.eventBus && this.playerId) {
        this.eventBus.emit({ type: 'PLAYER_USED_ABILITY', data: { playerId: this.playerId, abilityId } });
      }
    }
  }
  tickCooldowns() {
    for (const ability of this.abilities) {
      if (ability.cooldown > 0) ability.cooldown -= 1;
    }
  }

  // Enhancement: Ability and status effect serialization
  toJSON() {
    return {
      base: this.base,
      abilities: this.abilities.map(a => ({ ...a, effect: undefined })), // effect functions can't be serialized
      statusEffects: this.statusEffects.map(e => ({ ...e, onApply: undefined, onExpire: undefined }))
    };
  }

  fromJSON(data: any) {
    if (data?.base) this.base = data.base;
    if (Array.isArray(data?.abilities)) {
      this.abilities = data.abilities.map((a: any) => ({ ...a, effect: () => {} })); // placeholder effect
    }
    if (Array.isArray(data?.statusEffects)) {
      this.statusEffects = data.statusEffects.map((e: any) => ({ ...e, onApply: undefined, onExpire: undefined }));
    }
  }
}
