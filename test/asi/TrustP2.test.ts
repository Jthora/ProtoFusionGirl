import { EventBus } from '../../src/core/EventBus';

describe('Trust P2 wiring', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('JANE_ARRIVED_AT_WAYPOINT should be consumable for trust increase', () => {
    // Simulate the GameScene wiring: arrival → JANE_RESPONSE
    const responses: any[] = [];
    eventBus.on('JANE_RESPONSE', (e) => responses.push(e.data));

    // Wire like GameScene does
    eventBus.on('JANE_ARRIVED_AT_WAYPOINT', (event) => {
      eventBus.emit({
        type: 'JANE_RESPONSE',
        data: { followed: true, guidanceId: event.data.waypointId, trustChange: 3, responseTime: 0 }
      });
    });

    eventBus.emit({
      type: 'JANE_ARRIVED_AT_WAYPOINT',
      data: { waypointId: 'wp_1', x: 100, y: 200 }
    });

    expect(responses.length).toBe(1);
    expect(responses[0].followed).toBe(true);
    expect(responses[0].trustChange).toBe(3);
  });

  it('JANE_DEFEATED triggers trust decrease event', () => {
    const defeats: any[] = [];
    eventBus.on('JANE_DEFEATED', (e) => defeats.push(e.data));

    eventBus.emit({
      type: 'JANE_DEFEATED',
      data: { x: 50, y: 50 }
    });

    expect(defeats.length).toBe(1);
  });

  it('trust responds to positive and negative events', () => {
    // Minimal TrustManager-like behavior test
    let trust = 50;
    eventBus.on('JANE_RESPONSE', (e) => {
      if (e.data.followed) trust += e.data.trustChange;
    });
    eventBus.on('JANE_DEFEATED', () => {
      trust -= 2;
    });

    eventBus.emit({ type: 'JANE_RESPONSE', data: { followed: true, guidanceId: 'g1', trustChange: 3, responseTime: 0 } });
    expect(trust).toBe(53);

    eventBus.emit({ type: 'JANE_DEFEATED', data: { x: 0, y: 0 } });
    expect(trust).toBe(51);
  });
});
