import { CustomizationEngine } from '../../src/customization/CustomizationEngine';
import { EventBus } from '../../src/core/EventBus';

describe('CustomizationEngine (data-driven)', () => {
  let customization: CustomizationEngine;
  let eventBus: EventBus;
  beforeEach(() => {
    eventBus = new EventBus();
    customization = new CustomizationEngine(eventBus);
  });

  it('loads all cosmetics from data', () => {
    expect(customization.getUnlockedCosmetics().length).toBe(0);
  });

  it('unlocks and equips a cosmetic via events', () => {
    eventBus.emit({ type: 'UNLOCK_COSMETIC', data: { cosmeticId: 'outfit_angelic' } });
    expect(customization.getUnlockedCosmetics()).toContain('outfit_angelic');
    eventBus.emit({ type: 'EQUIP_COSMETIC', data: { cosmeticId: 'outfit_angelic' } });
    expect(customization.getEquippedCosmetics().outfit).toBe('outfit_angelic');
  });
});
