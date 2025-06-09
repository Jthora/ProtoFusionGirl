// CustomizationEngine.ts
// Data-driven, event-oriented customization system
import { EventBus } from '../core/EventBus';
import { loadCosmetics, CosmeticDefinition } from '../data/cosmeticLoader';
import { GameEvent } from '../core/EventTypes';

export class CustomizationEngine {
  private eventBus: EventBus;
  private allCosmetics: CosmeticDefinition[];
  private unlockedCosmetics: Set<string> = new Set();
  private equippedCosmetics: Record<string, string | null> = { outfit: null, hairstyle: null, wings: null };

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.allCosmetics = loadCosmetics();
    this.eventBus.on('UNLOCK_COSMETIC', this.handleUnlockCosmetic.bind(this));
    this.eventBus.on('EQUIP_COSMETIC', this.handleEquipCosmetic.bind(this));
  }

  private handleUnlockCosmetic(event: GameEvent<'UNLOCK_COSMETIC'>) {
    const { cosmeticId } = event.data;
    if (this.allCosmetics.find(c => c.id === cosmeticId)) {
      this.unlockedCosmetics.add(cosmeticId);
      this.eventBus.emit({ type: 'COSMETIC_UNLOCKED', data: { cosmeticId } });
    }
  }

  private handleEquipCosmetic(event: GameEvent<'EQUIP_COSMETIC'>) {
    const { cosmeticId } = event.data;
    const cosmetic = this.allCosmetics.find(c => c.id === cosmeticId);
    if (cosmetic && this.unlockedCosmetics.has(cosmeticId)) {
      this.equippedCosmetics[cosmetic.type] = cosmeticId;
      this.eventBus.emit({ type: 'COSMETIC_EQUIPPED', data: { cosmeticId, type: cosmetic.type } });
    }
  }

  getEquippedCosmetics() {
    return { ...this.equippedCosmetics };
  }

  getUnlockedCosmetics() {
    return Array.from(this.unlockedCosmetics);
  }
}
