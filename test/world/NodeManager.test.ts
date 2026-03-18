import { NodeManager } from '../../src/world/NodeManager';
import { EventBus } from '../../src/core/EventBus';

describe('NodeManager', () => {
  let eventBus: EventBus;
  let nodeManager: NodeManager;

  beforeEach(() => {
    eventBus = new EventBus();
    nodeManager = new NodeManager(eventBus);
    nodeManager.addNode({
      id: 'node_1', name: 'Test Node', x: 0, y: 0,
      stability: 80, maxStability: 100, decayRate: 10, surgeThreshold: 40,
    });
  });

  afterEach(() => {
    nodeManager.destroy();
  });

  it('initializes with correct stability', () => {
    expect(nodeManager.getNode('node_1')?.stability).toBe(80);
  });

  it('decays stability over time', () => {
    nodeManager.update(2); // 2 seconds at rate 10/s = -20
    expect(nodeManager.getNode('node_1')!.stability).toBeCloseTo(60, 0);
  });

  it('emits NODE_STABILITY_CHANGED on integer boundary crossing', () => {
    const changes: any[] = [];
    eventBus.on('NODE_STABILITY_CHANGED', (e) => changes.push(e.data));

    nodeManager.update(0.5); // 80 → 75
    expect(changes.length).toBeGreaterThan(0);
    expect(changes[0].nodeId).toBe('node_1');
  });

  it('emits SURGE_WARNING when stability crosses threshold', () => {
    const warnings: any[] = [];
    eventBus.on('SURGE_WARNING', (e) => warnings.push(e.data));

    nodeManager.update(4.1); // 80 - 41 = 39, just below threshold of 40
    expect(warnings.length).toBe(1);
    expect(warnings[0].nodeId).toBe('node_1');
  });

  it('emits SURGE_TRIGGERED at critical level', () => {
    const surges: any[] = [];
    eventBus.on('SURGE_TRIGGERED', (e) => surges.push(e.data));

    nodeManager.update(6.1); // 80 - 61 = 19, below surgeThreshold/2 = 20
    expect(surges.length).toBe(1);
    expect(surges[0].severity).toBe('moderate');
  });

  it('does not decay below 0', () => {
    nodeManager.update(100); // way more than enough to hit 0
    expect(nodeManager.getNode('node_1')!.stability).toBe(0);
  });

  it('restoreStability increases stability', () => {
    nodeManager.update(5); // 80 → 30
    nodeManager.restoreStability('node_1', 25);
    expect(nodeManager.getNode('node_1')!.stability).toBeCloseTo(55, 0);
  });

  it('restoreStability caps at maxStability', () => {
    nodeManager.restoreStability('node_1', 50);
    expect(nodeManager.getNode('node_1')!.stability).toBe(100);
  });

  it('damageStability reduces stability', () => {
    nodeManager.damageStability('node_1', 30);
    expect(nodeManager.getNode('node_1')!.stability).toBeCloseTo(50, 0);
  });

  it('getAllNodes returns all registered nodes', () => {
    nodeManager.addNode({
      id: 'node_2', name: 'Second', x: 100, y: 100,
      stability: 60, maxStability: 100, decayRate: 5, surgeThreshold: 30,
    });
    expect(nodeManager.getAllNodes().length).toBe(2);
  });
});
