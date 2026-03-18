import { ProvisionManager } from '../../src/provision/ProvisionManager';
import { ResearchProjects } from '../../src/provision/ResearchProjects';
import { EventBus } from '../../src/core/EventBus';

describe('ProvisionManager (P2)', () => {
  let eventBus: EventBus;
  let pm: ProvisionManager;

  beforeEach(() => {
    eventBus = new EventBus();
    pm = new ProvisionManager(eventBus);
    for (const proj of ResearchProjects) {
      pm.registerProject(proj);
    }
  });

  it('registers and retrieves projects', () => {
    expect(pm.getAllProjects().length).toBe(3);
    expect(pm.getProject('ley_amplifier')).toBeDefined();
    expect(pm.getProject('psi_capacitor')).toBeDefined();
    expect(pm.getProject('shield_matrix')).toBeDefined();
  });

  it('starts research and reports progress', () => {
    expect(pm.startResearch('ley_amplifier')).toBe(true);
    expect(pm.getActiveResearch()).not.toBeNull();
    expect(pm.getProgress()).toBe(0);

    pm.update(15_000); // half of 30s
    expect(pm.getProgress()).toBeCloseTo(0.5, 1);
  });

  it('completes research and fires event', () => {
    const events: any[] = [];
    eventBus.on('NODE_STABILITY_CHANGED', (e) => events.push(e.data));

    pm.startResearch('ley_amplifier');
    pm.update(30_000); // exactly 30s → complete

    expect(events.length).toBe(1);
    expect(events[0].nodeId).toBe('research_ley_amplifier');
    expect(pm.getCompletedIds()).toContain('ley_amplifier');
    expect(pm.getActiveResearch()).toBeNull();
  });

  it('cannot start a second research while one is active', () => {
    pm.startResearch('ley_amplifier');
    expect(pm.startResearch('psi_capacitor')).toBe(false);
  });

  it('cannot re-research a completed project', () => {
    pm.startResearch('ley_amplifier');
    pm.update(30_000);
    expect(pm.startResearch('ley_amplifier')).toBe(false);
  });

  it('cancels active research', () => {
    pm.startResearch('ley_amplifier');
    expect(pm.cancelResearch()).toBe(true);
    expect(pm.getActiveResearch()).toBeNull();
    expect(pm.getCompletedIds()).not.toContain('ley_amplifier');
  });

  it('can start next project after completing one', () => {
    pm.startResearch('ley_amplifier');
    pm.update(30_000);
    expect(pm.startResearch('psi_capacitor')).toBe(true);
  });

  it('progress is null when idle', () => {
    expect(pm.getProgress()).toBeNull();
  });
});

// ── P4 Material Cost Tests (tasks 6351-6353) ──

describe('ProvisionManager — Material Costs (P4)', () => {
  let eventBus: EventBus;
  let pm: ProvisionManager;

  beforeEach(() => {
    eventBus = new EventBus();
    pm = new ProvisionManager(eventBus);
  });

  it('starts research with no material cost freely', () => {
    pm.registerProject({ id: 'free', name: 'Free', durationMs: 1000, effect: 'none' });
    expect(pm.startResearch('free')).toBe(true);
  });

  it('blocks research when materials are missing (6353)', () => {
    pm.registerProject({ id: 'expensive', name: 'Expensive', durationMs: 1000, effect: 'x', materials: { crystal: 5 } });
    expect(pm.hasMaterials('expensive')).toBe(false);
    expect(pm.startResearch('expensive')).toBe(false);
  });

  it('allows research when materials are sufficient', () => {
    pm.registerProject({ id: 'craft', name: 'Craft', durationMs: 1000, effect: 'y', materials: { crystal: 3, metal: 2 } });
    pm.addMaterial('crystal', 5);
    pm.addMaterial('metal', 2);
    expect(pm.hasMaterials('craft')).toBe(true);
    expect(pm.startResearch('craft')).toBe(true);
  });

  it('consumes materials when research starts', () => {
    pm.registerProject({ id: 'craft', name: 'Craft', durationMs: 1000, effect: 'y', materials: { crystal: 3 } });
    pm.addMaterial('crystal', 5);
    pm.startResearch('craft');
    expect(pm.getMaterial('crystal')).toBe(2); // 5 - 3
  });

  it('addMaterial accumulates amounts (6352)', () => {
    pm.addMaterial('ore', 10);
    pm.addMaterial('ore', 5);
    expect(pm.getMaterial('ore')).toBe(15);
  });

  it('getMaterial returns 0 for unknown material', () => {
    expect(pm.getMaterial('nonexistent')).toBe(0);
  });

  it('hasMaterials returns true for project with no cost defined', () => {
    pm.registerProject({ id: 'basic', name: 'Basic', durationMs: 1000, effect: 'z' });
    expect(pm.hasMaterials('basic')).toBe(true);
  });
});
