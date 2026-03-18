import { ThrottleController } from '../../src/navigation/controls/ThrottleController';
import { EventBus } from '../../src/core/EventBus';
import { SpeedCategory, SpeedClassifier } from '../../src/navigation/core/SpeedCategories';

describe('ThrottleController (P2)', () => {
  let eventBus: EventBus;
  let throttle: ThrottleController;

  beforeEach(() => {
    eventBus = new EventBus();
    throttle = new ThrottleController({ eventBus });
  });

  it('starts at 0 throttle in WALKING gear', () => {
    expect(throttle.throttle).toBe(0);
    expect(throttle.gear).toBe(SpeedCategory.WALKING);
    expect(throttle.currentSpeedKmh).toBe(0); // min of WALKING = 0
  });

  it('ramps up throttle when accelerating', () => {
    throttle.setAccelerating(true);
    throttle.update(500); // 0.5s at 1.5/s → 0.75
    expect(throttle.throttle).toBeCloseTo(0.75, 1);
    expect(throttle.currentSpeedKmh).toBeGreaterThan(0);
  });

  it('caps throttle at 1.0', () => {
    throttle.setAccelerating(true);
    throttle.update(2000); // 2s at 1.5/s → capped at 1.0
    expect(throttle.throttle).toBe(1);
  });

  it('ramps down throttle when decelerating', () => {
    // Get to 1.0 first
    throttle.setAccelerating(true);
    throttle.update(1000);
    throttle.setAccelerating(false);

    throttle.setDecelerating(true);
    throttle.update(250); // 0.25s at 2.0/s → -0.5
    expect(throttle.throttle).toBeLessThan(1.0);
    expect(throttle.throttle).toBeGreaterThan(0);
  });

  it('coasts down to 0 when no input', () => {
    throttle.setAccelerating(true);
    throttle.update(1000); // full throttle
    throttle.setAccelerating(false);

    throttle.update(1000); // 1s coast at 2.0/s → 0
    expect(throttle.throttle).toBe(0);
  });

  it('maintains throttle when both keys pressed', () => {
    throttle.setAccelerating(true);
    throttle.update(500); // 0.75
    const held = throttle.throttle;

    throttle.setDecelerating(true); // both pressed
    throttle.update(500);
    expect(throttle.throttle).toBeCloseTo(held, 5);
  });

  it('computes currentSpeedKmh within gear range', () => {
    const config = SpeedClassifier.getConfigByCategory(SpeedCategory.WALKING)!;
    throttle.setAccelerating(true);
    throttle.update(1000); // full throttle

    expect(throttle.currentSpeedKmh).toBeCloseTo(config.maxSpeedKmh, 0);
  });

  it('shifts gear up and resets throttle', () => {
    throttle.setAccelerating(true);
    throttle.update(1000);
    expect(throttle.throttle).toBe(1);

    const shifted = throttle.gearUp();
    expect(shifted).toBe(true);
    expect(throttle.gear).toBe(SpeedCategory.GROUND_VEHICLE);
    expect(throttle.throttle).toBe(0);
  });

  it('shifts gear down', () => {
    throttle.gearUp(); // → GROUND_VEHICLE
    const shifted = throttle.gearDown();
    expect(shifted).toBe(true);
    expect(throttle.gear).toBe(SpeedCategory.WALKING);
  });

  it('cannot shift below WALKING', () => {
    expect(throttle.gearDown()).toBe(false);
    expect(throttle.gear).toBe(SpeedCategory.WALKING);
  });

  it('cannot shift above HYPERSONIC', () => {
    // Shift to max gear
    while (throttle.gearUp()) { /* keep shifting */ }
    expect(throttle.gear).toBe(SpeedCategory.HYPERSONIC);
    expect(throttle.gearUp()).toBe(false);
  });

  it('reset clears throttle and input state', () => {
    throttle.setAccelerating(true);
    throttle.update(500);
    throttle.reset();
    expect(throttle.throttle).toBe(0);
    // After reset, update should not accelerate
    throttle.update(500);
    expect(throttle.throttle).toBe(0);
  });
});
