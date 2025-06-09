import { Jane } from '../../src/characters/Jane';
import { EventBus } from '../../src/core/EventBus';

describe('Jane (data-driven)', () => {
  let jane: Jane;
  beforeEach(() => {
    jane = new Jane({ eventBus: new EventBus() });
  });

  it('loads skills from data and assigns by level', () => {
    expect(jane.skills.length).toBeGreaterThan(0);
    expect(jane.skills.every(skill => jane.stats.level >= 1)).toBe(true);
  });

  it('loads cosmetics from data', () => {
    expect(jane.cosmetics.length).toBeGreaterThan(0);
    expect(jane.cosmetics[0]).toHaveProperty('id');
  });

  it('assigns faction from data', () => {
    expect(jane.faction).not.toBeNull();
    expect(jane.faction?.id).toBe('earth_alliance');
  });
});
