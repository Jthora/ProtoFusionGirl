// LeyLineSystem.test.ts
// Unit and integration tests for LeyLineSystem

import { LeyLineSystem, LeyLineNode } from '../../src/leyline/LeyLineSystem';

describe('LeyLineSystem', () => {
  let system: LeyLineSystem;

  beforeEach(() => {
    system = new LeyLineSystem();
  });

  it('generates a network with N nodes and M lines', () => {
    system.generateNetwork(42, 5, 8);
    expect(system.nodes.length).toBe(5);
    expect(system.lines.length).toBe(8);
  });

  it('can add and retrieve a node by ID', () => {
    const node: LeyLineNode = { id: 'A', position: { x: 1, y: 2 }, state: 'active' };
    system.addNode(node);
    expect(system.getNodeById('A')).toEqual(node);
  });

  it('can add and retrieve connected nodes', () => {
    const n1: LeyLineNode = { id: 'A', position: { x: 0, y: 0 }, state: 'active' };
    const n2: LeyLineNode = { id: 'B', position: { x: 1, y: 1 }, state: 'active' };
    const n3: LeyLineNode = { id: 'C', position: { x: 2, y: 2 }, state: 'inactive' };
    system.addNode(n1);
    system.addNode(n2);
    system.addNode(n3);
    system.addLine({ id: 'L1', nodes: ['A', 'B'], strength: 10 });
    system.addLine({ id: 'L2', nodes: ['A', 'C'], strength: 5 });
    const connected = system.getConnectedNodes('A').map(n => n.id);
    expect(connected.sort()).toEqual(['B', 'C']);
  });

  it('removes a node and its lines', () => {
    system.generateNetwork(1, 3, 2);
    const id = system.nodes[0].id;
    system.removeNode(id);
    expect(system.getNodeById(id)).toBeUndefined();
    expect(system.lines.every(l => !l.nodes.includes(id))).toBe(true);
  });

  it('removes a line by ID', () => {
    system.generateNetwork(2, 3, 2);
    const lineId = system.lines[0].id;
    system.removeLine(lineId);
    expect(system.lines.find(l => l.id === lineId)).toBeUndefined();
  });
});
