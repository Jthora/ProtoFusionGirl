import { EventBus } from '../../src/core/EventBus';
import { JaneAI, JaneAIState } from '../../src/ai/JaneAI';
import { NodeManager } from '../../src/world/NodeManager';
import { CheckpointManager } from '../../src/core/CheckpointManager';
import { ThrottleController } from '../../src/navigation/controls/ThrottleController';
import { ProvisionManager } from '../../src/provision/ProvisionManager';
import { FastTravelManager } from '../../src/navigation/FastTravelManager';
import { EmotionSystem, JaneEmotion } from '../../src/ai/EmotionSystem';

describe('Best Use Case System Suite', () => {
  it('runs core gameplay systems together without conflicts', () => {
    const eventBus = new EventBus();

    // 1) JaneAI guidance -> arrival flow
    const sprite: any = { x: 100, y: 100, body: { velocity: { x: 0, y: 0 } } };
    const janeAI = new JaneAI({
      eventBus,
      getSprite: () => sprite,
      moveSpeed: 200,
      arrivalThreshold: 20,
      getHealth: () => ({ current: 100, max: 100 }),
      getEnemiesInRange: () => [],
    });
    eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 120, y: 120, id: 'wp1' } });
    janeAI.update(16);
    expect([JaneAIState.Idle, JaneAIState.FollowGuidance]).toContain(janeAI.state);

    // 2) World node stability updates and warning events
    const nodeManager = new NodeManager(eventBus);
    nodeManager.addNode({
      id: 'node_1', name: "Tho'ra Base", x: 0, y: 0,
      stability: 80, maxStability: 100, decayRate: 10, surgeThreshold: 40,
    });
    const warnings: any[] = [];
    eventBus.on('SURGE_WARNING', e => warnings.push(e.data));
    nodeManager.update(5); // 80 -> 30 crosses threshold 40
    expect(warnings.length).toBeGreaterThan(0);

    // 3) Checkpoint manager handles defeated -> respawn
    let respawned = false;
    const checkpoint = new CheckpointManager(
      eventBus,
      { id: 'base', x: 10, y: 20 },
      () => { respawned = true; }
    );
    eventBus.emit({ type: 'JANE_DEFEATED', data: { x: 1, y: 1 } });
    expect(respawned).toBe(true);

    // 4) Throttle ramps smoothly
    const throttle = new ThrottleController({ eventBus });
    throttle.setAccelerating(true);
    throttle.update(500);
    expect(throttle.throttle).toBeGreaterThan(0);
    throttle.setAccelerating(false);
    throttle.update(1000);
    expect(throttle.throttle).toBeGreaterThanOrEqual(0);

    // 5) Provision queue finishes and emits completion event
    const provision = new ProvisionManager(eventBus);
    provision.registerProject({ id: 'p1', name: 'Test', durationMs: 100, effect: 'ok' });
    expect(provision.startResearch('p1')).toBe(true);
    provision.update(100);
    expect(provision.getCompletedIds()).toContain('p1');

    // 6) Emotion transitions under low health
    let health = 1;
    const emotion = new EmotionSystem({ eventBus, getHealthRatio: () => health });
    health = 0.3;
    emotion.update(16);
    expect(emotion.emotion).toBe(JaneEmotion.Anxious);

    // 7) Fast travel teleports to unlocked node
    const travel = new FastTravelManager(eventBus);
    travel.addNode({ id: 'n1', name: 'Node 1', x: 50, y: 60, unlocked: true });
    expect(travel.travelTo('n1')).toBe(true);

    checkpoint.destroy();
    emotion.destroy();
  });
});
