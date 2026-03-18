import { FastTravelManager } from '../../src/navigation/FastTravelManager';
import { EventBus } from '../../src/core/EventBus';

describe('FastTravelManager (P2)', () => {
  let eventBus: EventBus;
  let ftm: FastTravelManager;

  beforeEach(() => {
    eventBus = new EventBus();
    ftm = new FastTravelManager(eventBus);
    ftm.addNode({ id: 'thora', name: "Tho'ra Base", x: 400, y: 300, unlocked: true });
    ftm.addNode({ id: 'nexus', name: 'Ley Nexus', x: 1200, y: 600, unlocked: true });
    ftm.addNode({ id: 'rift', name: 'Rift Zone', x: 2000, y: 100, unlocked: false });
  });

  it('lists all 3 nodes', () => {
    expect(ftm.getAllNodes().length).toBe(3);
  });

  it('opens and closes map', () => {
    expect(ftm.isMapOpen).toBe(false);
    ftm.openMap();
    expect(ftm.isMapOpen).toBe(true);
    ftm.closeMap();
    expect(ftm.isMapOpen).toBe(false);
  });

  it('travels to unlocked node and emits JANE_RESPAWN', () => {
    const respawns: any[] = [];
    eventBus.on('JANE_RESPAWN', (e) => respawns.push(e.data));

    ftm.openMap();
    const result = ftm.travelTo('nexus');
    expect(result).toBe(true);
    expect(respawns.length).toBe(1);
    expect(respawns[0].x).toBe(1200);
    expect(respawns[0].y).toBe(600);
    expect(ftm.isMapOpen).toBe(false);
  });

  it('cannot travel to locked node', () => {
    const result = ftm.travelTo('rift');
    expect(result).toBe(false);
  });

  it('unlocks a node and then travels', () => {
    expect(ftm.travelTo('rift')).toBe(false);
    ftm.unlockNode('rift');
    expect(ftm.travelTo('rift')).toBe(true);
  });

  it('emits CHECKPOINT_SET on travel', () => {
    const checkpoints: any[] = [];
    eventBus.on('CHECKPOINT_SET', (e) => checkpoints.push(e.data));

    ftm.travelTo('thora');
    expect(checkpoints.length).toBe(1);
    expect(checkpoints[0].checkpointId).toBe('thora');
  });

  it('returns copy of node (not mutable reference)', () => {
    const node = ftm.getNode('thora');
    expect(node).toBeDefined();
    node!.name = 'hacked';
    expect(ftm.getNode('thora')!.name).toBe("Tho'ra Base");
  });
});

// ── P4 Animated Travel Tests (tasks 6341-6344) ──

describe('FastTravelManager — Animated Travel (P4)', () => {
  let eventBus: EventBus;
  let ftm: FastTravelManager;

  beforeEach(() => {
    eventBus = new EventBus();
    ftm = new FastTravelManager(eventBus);
    ftm.addNode({ id: 'nodeA', name: 'Node A', x: 0, y: 0, unlocked: true });
    ftm.addNode({ id: 'nodeB', name: 'Node B', x: 1000, y: 0, unlocked: true });
    ftm.addNode({ id: 'locked', name: 'Locked', x: 500, y: 500, unlocked: false });
  });

  it('starts animated travel and emits FAST_TRAVEL_STARTED', () => {
    const events: any[] = [];
    eventBus.on('FAST_TRAVEL_STARTED', (e) => events.push(e.data));

    expect(ftm.startAnimatedTravel('nodeA', 'nodeB')).toBe(true);
    expect(ftm.isTraveling).toBe(true);
    expect(ftm.travelProgress).toBe(0);
    expect(events.length).toBe(1);
    expect(events[0].fromNodeId).toBe('nodeA');
    expect(events[0].toNodeId).toBe('nodeB');
  });

  it('cannot start animated travel to locked node', () => {
    expect(ftm.startAnimatedTravel('nodeA', 'locked')).toBe(false);
    expect(ftm.isTraveling).toBe(false);
  });

  it('cannot start while already traveling', () => {
    ftm.startAnimatedTravel('nodeA', 'nodeB');
    expect(ftm.startAnimatedTravel('nodeA', 'nodeB')).toBe(false);
  });

  it('updateTravel advances progress', () => {
    ftm.startAnimatedTravel('nodeA', 'nodeB');
    // Distance = 1000px, duration = 1000*2 = 2000ms
    ftm.updateTravel(500);
    expect(ftm.travelProgress).toBeCloseTo(0.25, 1);
    expect(ftm.isTraveling).toBe(true);
  });

  it('completes travel and emits FAST_TRAVEL_ARRIVED + JANE_RESPAWN', () => {
    const arrived: any[] = [];
    const respawns: any[] = [];
    eventBus.on('FAST_TRAVEL_ARRIVED', (e) => arrived.push(e.data));
    eventBus.on('JANE_RESPAWN', (e) => respawns.push(e.data));

    ftm.startAnimatedTravel('nodeA', 'nodeB');
    ftm.updateTravel(3000); // exceeds duration
    expect(ftm.isTraveling).toBe(false);
    expect(ftm.travelProgress).toBe(1.0);
    expect(arrived.length).toBe(1);
    expect(arrived[0].nodeId).toBe('nodeB');
    expect(respawns.length).toBe(1);
    expect(respawns[0].x).toBe(1000);
  });

  it('triggers transit event at midpoint (chance=1)', () => {
    const events: any[] = [];
    eventBus.on('TRANSIT_EVENT', (e) => events.push(e.data));

    ftm.setTransitEventChance(1.0); // guarantee transit event
    ftm.startAnimatedTravel('nodeA', 'nodeB');
    // Duration = 2000ms. Progress at midpoint = 50%.
    ftm.updateTravel(1100); // crosses 0.5
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('random_encounter');
  });

  it('no transit event when chance=0', () => {
    const events: any[] = [];
    eventBus.on('TRANSIT_EVENT', (e) => events.push(e.data));

    ftm.setTransitEventChance(0);
    ftm.startAnimatedTravel('nodeA', 'nodeB');
    ftm.updateTravel(1100);
    expect(events.length).toBe(0);
  });

  it('updateTravel is a no-op when not traveling', () => {
    ftm.updateTravel(1000); // should not throw
    expect(ftm.isTraveling).toBe(false);
  });
});
