// FactionSystem.test.ts
// Tests for faction reputation system (tasks 5331-5334)

import { EventBus } from '../../src/core/EventBus';
import { FactionSystem, FACTIONS } from '../../src/core/FactionSystem';

function createTestSetup() {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('FACTION_REPUTATION_ADJUSTED', (e) => events.push(e));
  eventBus.on('FACTION_THRESHOLD_REACHED', (e) => events.push(e));
  const sys = new FactionSystem(eventBus);
  return { eventBus, sys, events };
}

describe('FactionSystem', () => {
  it('initializes 3 factions with default reputations', () => {
    const { sys } = createTestSetup();
    expect(sys.getAllFactions()).toHaveLength(3);
    expect(sys.getReputation('thora')).toBe(0);
    expect(sys.getReputation('earth_alliance')).toBe(10);
    expect(sys.getReputation('psisys')).toBe(5);
  });

  it('adjusts reputation and emits event', () => {
    const { sys, events } = createTestSetup();
    sys.adjustReputation('thora', 15, 'helped_node');
    expect(sys.getReputation('thora')).toBe(15);
    expect(events.some(e => e.type === 'FACTION_REPUTATION_ADJUSTED')).toBe(true);
    const adj = events.find(e => e.type === 'FACTION_REPUTATION_ADJUSTED');
    expect(adj.data.previousRep).toBe(0);
    expect(adj.data.newRep).toBe(15);
    expect(adj.data.reason).toBe('helped_node');
  });

  it('emits threshold event when crossing boundary', () => {
    const { sys, events } = createTestSetup();
    // Tho'ra starts at 0 (neutral). Push to 30+ (friendly)
    sys.adjustReputation('thora', 35, 'sealed_rift');
    const threshold = events.find(e => e.type === 'FACTION_THRESHOLD_REACHED');
    expect(threshold).toBeDefined();
    expect(threshold.data.factionId).toBe('thora');
    expect(threshold.data.threshold).toBe('friendly');
  });

  it('emits threshold on downward crossing', () => {
    const { sys, events } = createTestSetup();
    sys.adjustReputation('thora', 35, 'good_deed');
    events.length = 0; // clear
    sys.adjustReputation('thora', -40, 'betrayal'); // 35 - 40 = -5
    const threshold = events.find(e => e.type === 'FACTION_THRESHOLD_REACHED');
    expect(threshold).toBeDefined();
  });

  it('returns correct threshold name', () => {
    const { sys } = createTestSetup();
    expect(sys.getThresholdName('thora')).toBe('neutral'); // 0
    sys.adjustReputation('thora', 60, 'quest');
    expect(sys.getThresholdName('thora')).toBe('allied'); // 60
    sys.adjustReputation('thora', 35, 'quest2');
    expect(sys.getThresholdName('thora')).toBe('champion'); // 95
  });

  it('returns unknown for invalid faction', () => {
    const { sys } = createTestSetup();
    expect(sys.getThresholdName('nonexistent')).toBe('unknown');
  });

  it('getFactionDef returns definition', () => {
    const { sys } = createTestSetup();
    const thora = sys.getFactionDef('thora');
    expect(thora).toBeDefined();
    expect(thora!.name).toBe("Tho'ra");
  });

  it('handles negative reputation', () => {
    const { sys } = createTestSetup();
    sys.adjustReputation('thora', -60, 'bad_deed');
    expect(sys.getReputation('thora')).toBe(-60);
    expect(sys.getThresholdName('thora')).toBe('hostile');
  });

  it('destroy clears state', () => {
    const { sys } = createTestSetup();
    sys.destroy();
    expect(sys.getAllFactions()).toHaveLength(0);
  });
});
