// Jane_LeyLineManager.integration.test.ts
// Integration test for Jane, MagnetoSpeeder, and LeyLineManager
// See: artifacts/copilot_anchor_leyline_system_2025-06-06.artifact

import { Jane } from '../../src/core/Jane';
import { LeyLineManager } from '../../src/world/leyline/LeyLineManager';
import { EventBus } from '../../src/core/EventBus';
import { LeyLine } from '../../src/world/WorldStateManager';

describe('Jane + MagnetoSpeeder + LeyLineManager integration', () => {
  let leyLines: LeyLine[];
  let leyLineManager: LeyLineManager;
  let eventBus: EventBus;
  let jane: Jane;

  beforeEach(() => {
    leyLines = [
      {
        id: 'ley1',
        nodes: [
          { id: 'n1', position: { x: 0, y: 0 }, type: 'node', active: true },
          { id: 'n2', position: { x: 10, y: 0 }, type: 'node', active: true }
        ],
        energy: 100
      }
    ];
    leyLineManager = new LeyLineManager(leyLines);
    eventBus = new EventBus();
    jane = new Jane({ name: 'Jane', eventBus, leyLineManager });
    jane.mountSpeeder();
  });

  it('updates speeder energy based on ley line strength when moving', () => {
    if (!jane.speeder) throw new Error('Speeder not mounted');
    jane.speeder.energy = 50;
    jane.moveTo(0, 0); // At node, strength 100, +5 energy
    expect(jane.speeder.energy).toBe(55);
    jane.moveTo(10, 0); // At other node, strength 100, +5 energy
    expect(jane.speeder.energy).toBe(60);
    jane.moveTo(5, 0); // Midway, strength 50, 0 energy change
    expect(jane.speeder.energy).toBe(60);
    jane.moveTo(20, 0); // Far from nodes, strength 0, -5 energy
    expect(jane.speeder.energy).toBe(55);
  });
});
