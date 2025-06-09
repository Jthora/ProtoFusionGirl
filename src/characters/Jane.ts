// Jane.ts (characters domain)
// Core character class for Jane Tho'ra (FusionGirl) - refactored for domain-driven, event-oriented, data-driven architecture
import { EventBus } from '../core/EventBus';
import { EventName, GameEvent } from '../core/EventTypes';
import { MagnetoSpeeder } from '../magneto/MagnetoSpeeder';
import { LeyLineManager } from '../world/leyline/LeyLineManager';
import { getCharacterData } from '../data/characterLoader';
import { loadSkills, SkillDefinition } from '../data/skillLoader';
import { loadCosmetics, CosmeticDefinition } from '../data/cosmeticLoader';
import { loadFactions, FactionDefinition } from '../data/factionLoader';

export interface JaneStats {
  health: number;
  maxHealth: number;
  psi: number;
  maxPsi: number;
  level: number;
  experience: number;
  skills: Record<string, number>;
}

export interface JaneConfig {
  name?: string;
  eventBus: EventBus;
  initialStats?: Partial<JaneStats>;
  leyLineManager?: LeyLineManager;
}

export class Jane {
  public name: string;
  public stats: JaneStats;
  private eventBus: EventBus;
  private aiEnabled: boolean = true;
  private asiOverride: boolean = false;
  public speeder: MagnetoSpeeder | null = null;
  public isMounted: boolean = false;
  public position: { x: number; y: number } = { x: 0, y: 0 };
  private leyLineManager?: LeyLineManager;
  public skills: SkillDefinition[] = [];
  public cosmetics: CosmeticDefinition[] = [];
  public faction: FactionDefinition | null = null;

  constructor(config: JaneConfig) {
    this.name = config.name || "Jane Tho'ra";
    this.eventBus = config.eventBus;
    // Load base stats from data if available
    const data = getCharacterData('jane');
    const dataStats = data?.baseStats;
    this.stats = {
      health: 100,
      maxHealth: 100,
      psi: 50,
      maxPsi: 50,
      level: 1,
      experience: 0,
      skills: {},
      ...dataStats,
      ...config.initialStats
    };
    this.leyLineManager = config.leyLineManager;
    // Load Jane's skills from data
    const allSkills = loadSkills();
    this.skills = allSkills.filter(skill => {
      return skill.requirements.every(req => {
        if (req.startsWith('Jane:level>=')) {
          const minLevel = parseInt(req.split('>=')[1], 10);
          return this.stats.level >= minLevel;
        }
        return true;
      });
    });
    // Load Jane's cosmetics from data (by cosmeticIds)
    const allCosmetics = loadCosmetics();
    this.cosmetics = (data?.cosmeticIds || []).map(cid => allCosmetics.find(c => c.id === cid)).filter(Boolean) as CosmeticDefinition[];
    // Assign Jane's faction from data
    const factions = loadFactions();
    this.faction = factions.find(f => f.id === (data?.factionId || 'earth_alliance')) || null;
  }

  setASIOverride(enabled: boolean) {
    this.asiOverride = enabled;
    this.eventBus.emit({ type: 'JANE_ASI_OVERRIDE', data: { enabled } });
  }

  isASIControlled() { return this.asiOverride; }

  gainExperience(amount: number) {
    this.stats.experience += amount;
    while (this.stats.experience >= this.getNextLevelXP()) {
      this.stats.experience -= this.getNextLevelXP();
      this.stats.level++;
      this.stats.maxHealth += 10;
      this.stats.maxPsi += 5;
      this.stats.health = this.stats.maxHealth;
      this.stats.psi = this.stats.maxPsi;
      this.eventBus.emit({ type: 'JANE_LEVEL_UP', data: { level: this.stats.level } });
    }
  }

  getNextLevelXP() { return 100 + (this.stats.level - 1) * 50; }

  takeDamage(amount: number) {
    this.stats.health = Math.max(0, this.stats.health - amount);
    this.eventBus.emit({ type: 'JANE_DAMAGED', data: { amount, health: this.stats.health } });
    if (this.stats.health === 0) {
      this.eventBus.emit({ type: 'JANE_DEFEATED', data: {} });
    }
  }

  heal(amount: number) {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
    this.eventBus.emit({ type: 'JANE_HEALED', data: { amount, health: this.stats.health } });
  }

  usePsi(amount: number) {
    if (this.stats.psi >= amount) {
      this.stats.psi -= amount;
      this.eventBus.emit({ type: 'JANE_PSI_USED', data: { amount, psi: this.stats.psi } });
      return true;
    }
    return false;
  }

  restorePsi(amount: number) {
    this.stats.psi = Math.min(this.stats.maxPsi, this.stats.psi + amount);
    this.eventBus.emit({ type: 'JANE_PSI_RESTORED', data: { amount, psi: this.stats.psi } });
  }

  mountSpeeder() {
    if (!this.speeder) {
      this.speeder = new MagnetoSpeeder(this.leyLineManager);
    } else if (this.leyLineManager) {
      this.speeder.setLeyLineManager(this.leyLineManager);
    }
    this.isMounted = true;
    this.eventBus.emit({ type: 'JANE_MOUNTED_SPEEDER', data: {} });
  }

  dismountSpeeder() {
    this.isMounted = false;
    this.eventBus.emit({ type: 'JANE_DISMOUNTED_SPEEDER', data: {} });
  }

  setSpeederMode(mode: 'manual' | 'auto') {
    if (this.speeder && this.isMounted) {
      this.speeder.setMode(mode);
      this.eventBus.emit({ type: 'SPEEDER_MODE_CHANGED', data: { mode } });
    }
  }

  boostSpeederWithPsi(psiAmount: number) {
    if (this.speeder && this.isMounted && this.stats.psi >= psiAmount) {
      this.stats.psi -= psiAmount;
      this.speeder.updateEnergy(psiAmount);
      this.eventBus.emit({ type: 'JANE_PSI_USED_FOR_SPEEDER', data: { psiAmount } });
    }
  }

  moveTo(x: number, y: number) {
    this.position = { x, y };
    this.eventBus.emit({ type: 'CHARACTER_MOVED', data: { id: this.name, x, y } });
    if (this.isMounted && this.speeder) {
      this.speeder.setPosition(x, y);
      this.eventBus.emit({ type: 'SPEEDER_MOVED', data: { x, y } });
    } else {
      this.eventBus.emit({ type: 'JANE_MOVED', data: { x, y } });
    }
  }

  planLeyLineRouteTo(target: { x: number; y: number }) {
    if (this.leyLineManager) {
      this.leyLineManager.findLeyLinePath(this.position, target);
    }
  }

  getSpeederStatus() {
    if (this.speeder && this.isMounted) {
      return {
        energy: this.speeder.energy,
        mode: this.speeder.mode,
        upgrades: this.speeder.upgrades,
      };
    }
    return null;
  }

  setAccessibilityOption(option: string, value: any) {
    if (this.speeder) {
      if (typeof this.speeder.setAccessibilityFeature === 'function') {
        this.speeder.setAccessibilityFeature(option, value);
      }
    }
  }

  toJSON() {
    return {
      name: this.name,
      stats: this.stats,
      position: this.position,
      isMounted: this.isMounted,
      speeder: this.speeder ? {
        energy: this.speeder.energy,
        mode: this.speeder.mode,
        upgrades: this.speeder.upgrades,
        position: this.speeder.position,
      } : null,
    };
  }

  static fromJSON(data: any, eventBus: EventBus): Jane {
    const jane = new Jane({ name: data.name, eventBus, initialStats: data.stats });
    jane.position = data.position;
    jane.isMounted = data.isMounted;
    if (data.speeder) {
      jane.speeder = new MagnetoSpeeder();
      jane.speeder.energy = data.speeder.energy;
      jane.speeder.mode = data.speeder.mode;
      jane.speeder.upgrades = data.speeder.upgrades;
      jane.speeder.position = data.speeder.position;
    }
    return jane;
  }

  updateAI(_dt: number) {
    if (!this.aiEnabled || this.asiOverride) return;
    // TODO: Implement Jane's autonomous behavior/decision-making
  }

  setAIEnabled(enabled: boolean) { this.aiEnabled = enabled; }
  isAIEnabled() { return this.aiEnabled; }
}
