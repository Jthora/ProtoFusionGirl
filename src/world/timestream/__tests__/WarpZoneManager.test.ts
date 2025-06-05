// __tests__/WarpZoneManager.test.ts
import { WarpZoneManager } from '../WarpZoneManager';
import { WarpZone } from '../types';

describe('WarpZoneManager', () => {
  it('registers and triggers a custom zone type', () => {
    const mgr = new WarpZoneManager();
    let triggered = false;
    mgr.registerZoneType('custom', (zone, ctx) => { triggered = true; });
    const zone: WarpZone = {
      id: 'z1',
      label: 'TestZone',
      region: { x: 0, y: 0, width: 10, height: 10 },
      triggerType: 'custom',
      metadata: {}
    };
    mgr.addZone(zone);
    mgr.triggerZone('z1', {});
    expect(triggered).toBe(true);
  });
});
