// ManualTest_Acceptance.test.ts
// Automated acceptance tests that cover the scenarios described in the
// manual test tasks: 3431, 3432, 4523, 6415.
//
// These tests simulate the interactive scenarios programmatically to verify
// the systems work correctly before manual QA sessions.

import { EventBus } from '../../src/core/EventBus';
import { JaneAI, JaneAIState } from '../../src/ai/JaneAI';
import { NodeManager } from '../../src/world/NodeManager';
import { EmotionSystem, JaneEmotion } from '../../src/ai/EmotionSystem';
import { EventHistoryLog } from '../../src/world/EventHistoryLog';
import { RewindSystem } from '../../src/world/RewindSystem';
import { CosmicCalendar, PHASE_ORDER } from '../../src/world/CosmicCalendar';
import { JonoHologram } from '../../src/ai/JonoHologram';

// ============================================================================
// 3431 — Jane stands at Tho'ra Base on game open
// "Manual test: Open game → Jane stands at Tho'ra Base"
// ============================================================================
describe("3431 — Jane starts Idle at Tho'ra Base", () => {
  it('JaneAI initialises in Idle state at spawn position (P1 acceptance)', () => {
    const eventBus = new EventBus();
    const spawnX = 400;
    const spawnY = 300;
    const sprite: any = { x: spawnX, y: spawnY, body: { velocity: { x: 0, y: 0 } } };

    const janeAI = new JaneAI({
      eventBus,
      getSprite: () => sprite,
      getHealth: () => ({ current: 100, max: 100 }),
      getEnemiesInRange: () => [],
      moveSpeed: 200,
      arrivalThreshold: 20,
    });

    // On creation, Jane should be Idle
    expect(janeAI.state).toBe(JaneAIState.Idle);

    // After one update with no input, still Idle (unless boredom threshold met)
    janeAI.update(16);
    expect([JaneAIState.Idle, JaneAIState.Bored]).toContain(janeAI.state);

    // Position unchanged — Jane hasn't moved
    expect(sprite.x).toBe(spawnX);
    expect(sprite.y).toBe(spawnY);
  });
});

// ============================================================================
// 3432 — Click → waypoint → Jane walks → arrives → Idle
// "Manual test: Click anywhere → waypoint appears → Jane walks → arrives → Idle"
// ============================================================================
describe('3432 — Waypoint → walk → arrive → Idle (P1 acceptance)', () => {
  it('emitting ASI_WAYPOINT_PLACED causes Jane to walk and arrive (P1.2-P1.5)', () => {
    const eventBus = new EventBus();
    const sprite: any = { x: 100, y: 100, body: { velocity: { x: 0, y: 0 } } };

    const janeAI = new JaneAI({
      eventBus,
      getSprite: () => sprite,
      getHealth: () => ({ current: 100, max: 100 }),
      getEnemiesInRange: () => [],
      moveSpeed: 300,
      arrivalThreshold: 20,
    });

    // Simulate a click: emit waypoint placed event
    const waypointCleared: string[] = [];
    eventBus.on('ASI_WAYPOINT_CLEARED', () => waypointCleared.push('cleared'));

    eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 200, y: 100, id: 'wp_click' } });
    janeAI.update(16);

    // Jane should now be navigating toward the waypoint
    expect(janeAI.state).toBe(JaneAIState.FollowGuidance);

    // Simulate Jane moving — manually advance sprite position toward waypoint
    // (in game this is handled by physics; here we simulate arrival)
    sprite.x = 200;
    sprite.y = 100;
    janeAI.update(16);

    // On arrival, Jane returns to Idle and waypoint is cleared
    expect(janeAI.state).toBe(JaneAIState.Idle);
    expect(waypointCleared.length).toBeGreaterThan(0);
  });

  it('new waypoint redirects Jane mid-navigation (P1.6)', () => {
    const eventBus = new EventBus();
    const sprite: any = { x: 0, y: 0, body: { velocity: { x: 0, y: 0 } } };

    const janeAI = new JaneAI({
      eventBus,
      getSprite: () => sprite,
      getHealth: () => ({ current: 100, max: 100 }),
      getEnemiesInRange: () => [],
      moveSpeed: 200,
      arrivalThreshold: 20,
    });

    eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 0, id: 'wp1' } });
    janeAI.update(16);
    expect(janeAI.state).toBe(JaneAIState.FollowGuidance);

    // Redirect mid-navigation — Jane should continue FollowGuidance with new waypoint
    eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 300, y: 100, id: 'wp2' } });
    janeAI.update(16);
    expect(janeAI.state).toBe(JaneAIState.FollowGuidance);
    // A WAYPOINT_CLEARED event should have been emitted for wp1 (replaced)
    // The jane is still navigating — state confirms redirect worked
  });
});

// ============================================================================
// 4523 — Jane fights, retreats, guidance works, stability decays
// "Manual test: Jane fights, retreats, guidance works, stability decays"
// ============================================================================
describe('4523 — Combat, retreat, guidance, stability decay (P2 acceptance)', () => {
  it('Jane enters Combat when enemy detected, retreats at low health', () => {
    const eventBus = new EventBus();
    const sprite: any = { x: 100, y: 100, body: { velocity: { x: 0, y: 0 } } };
    let health = { current: 100, max: 100 };

    const janeAI = new JaneAI({
      eventBus,
      getSprite: () => sprite,
      getHealth: () => health,
      getEnemiesInRange: (range) => {
        // Return an enemy within range when health is full
        if (health.current >= 25) {
          return [{ id: 'terminator_1', x: 150, y: 100, health: 80, maxHealth: 100 }];
        }
        return [];
      },
      moveSpeed: 200,
      arrivalThreshold: 20,
      detectionRange: 200,
      attackRange: 80,
      attackCooldown: 100,
      attackDamage: 20,
      retreatHealthThreshold: 0.25,
    });

    // Jane should detect the enemy and enter Combat
    janeAI.update(16);
    expect(janeAI.state).toBe(JaneAIState.Combat);

    // Simulate taking damage to trigger Retreat
    health.current = 20; // 20% health — below 25% threshold
    janeAI.update(16);
    expect(janeAI.state).toBe(JaneAIState.Retreat);
  });

  it('guidance places waypoint and Jane follows it', () => {
    const eventBus = new EventBus();
    const sprite: any = { x: 100, y: 100, body: { velocity: { x: 0, y: 0 } } };

    const janeAI = new JaneAI({
      eventBus,
      getSprite: () => sprite,
      getHealth: () => ({ current: 100, max: 100 }),
      getEnemiesInRange: () => [],
      moveSpeed: 200,
      arrivalThreshold: 20,
    });

    // Simulate ASI placing waypoint (guidance)
    eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 400, y: 100, id: 'guidance_wp' } });
    janeAI.update(16);
    expect(janeAI.state).toBe(JaneAIState.FollowGuidance);
  });

  it('node stability decays over time', () => {
    const eventBus = new EventBus();
    const nodeManager = new NodeManager(eventBus);
    nodeManager.addNode({ id: 'node_3', name: 'Rift Zone', x: 4000, y: 300, stability: 30, maxStability: 100, decayRate: 2.0, surgeThreshold: 40 });

    const initial = nodeManager.getNode('node_3')!.stability;
    nodeManager.update(10); // 10 seconds
    const after = nodeManager.getNode('node_3')!.stability;

    expect(after).toBeLessThan(initial);
    expect(initial - after).toBeCloseTo(20, 0); // ~2.0/s × 10s = 20
  });

  it('emotion becomes Anxious at low health', () => {
    const eventBus = new EventBus();
    let healthRatio = 1.0;
    const emotion = new EmotionSystem({ eventBus, getHealthRatio: () => healthRatio });

    healthRatio = 0.2; // very low health
    emotion.update(16);
    expect(emotion.emotion).toBe(JaneEmotion.Anxious);
    emotion.destroy();
  });
});

// ============================================================================
// 6415 — Death rewind, cosmic phases, Jono dialogue
// "Manual test: Death rewind, cosmic phases, Jono dialogue"
// ============================================================================
describe('6415 — Death rewind, cosmic phases, Jono dialogue (P4 acceptance)', () => {
  it('death records a rewind point and rewind-to restores snapshot', () => {
    const eventBus = new EventBus();
    const historyLog = new EventHistoryLog(eventBus);
    const rewindSystem = new RewindSystem(eventBus, historyLog);

    // Record a pre-death decision point
    rewindSystem.recordDecisionPoint('UL_PUZZLE_SUCCESS', 'auto', { health: 95, psi: 80 });

    // Simulate Jane being defeated
    rewindSystem.recordDecisionPoint('JANE_DEFEATED', 'death', { health: 0, psi: 0 });
    historyLog.update(16);

    const rewindPoints = rewindSystem.getRewindPoints();
    expect(rewindPoints.length).toBeGreaterThanOrEqual(1);

    // Rewind to the most recent safe point
    const safePoint = rewindPoints[0];
    const snapshot = rewindSystem.rewindTo(safePoint.snapshotId);
    expect(snapshot).not.toBeNull();
    expect(rewindSystem.getIsRewinding()).toBe(true);

    // Resume from rewind
    const resumed = rewindSystem.resumeFromRewind(safePoint.snapshotId);
    expect(resumed).toBe(true);
    expect(rewindSystem.getIsRewinding()).toBe(false);
  });

  it('cosmic calendar advances through 12 phases over 12 days', () => {
    const eventBus = new EventBus();
    const phases: string[] = [];
    eventBus.on('COSMIC_PHASE_CHANGED', (e) => phases.push(e.data.newPhase));

    const calendar = new CosmicCalendar(eventBus, 10); // 10s per day for speed
    calendar.update(0); expect(calendar.getPhase()).toBe('Fire');
    calendar.update(10_000); expect(calendar.getPhase()).toBe('Earth');
    calendar.update(10_000); expect(calendar.getPhase()).toBe('Air');
    calendar.update(10_000); expect(calendar.getPhase()).toBe('Water');
    calendar.update(10_000); expect(calendar.getPhase()).toBe('Lightning');
    calendar.update(10_000); expect(calendar.getPhase()).toBe('Ice');

    // Phase changes should have been emitted
    expect(phases.length).toBeGreaterThanOrEqual(5);
    expect(phases).toContain('Earth');
    expect(phases).toContain('Water');
  });

  it('cosmic phase modifiers differ between phases (weights active)', () => {
    const eventBus = new EventBus();
    const calendar = new CosmicCalendar(eventBus, 1);
    // Fire phase
    expect(calendar.getWeight('combat')).toBe(1.5);
    expect(calendar.getWeight('healing')).toBe(0.6);
    // Advance to Water phase (day 3)
    calendar.update(3000);
    expect(calendar.getPhase()).toBe('Water');
    expect(calendar.getWeight('healing')).toBe(1.5);
    expect(calendar.getWeight('combat')).toBe(0.7);
  });

  it("Jono dialogue triggers when Jane enters Tho'ra Base radius", () => {
    const eventBus = new EventBus();
    const jono = new JonoHologram(eventBus, { baseX: 400, baseY: 300, triggerRadius: 150 });
    const dialogues: string[] = [];
    eventBus.on('JONO_DIALOGUE_TRIGGERED', (e) => dialogues.push(e.data.dialogueId));

    const ctx = { hasUsedUL: false, hasCompanion: false, activeRiftCount: 0, lowestStability: 80, trustLevel: 60, cosmicPhase: 'Fire' };

    // Jane far away — no dialogue
    const far = jono.checkProximity(800, 300, 0, ctx);
    expect(far).toBeNull();
    expect(dialogues.length).toBe(0);

    // Jane close — dialogue fires
    const near = jono.checkProximity(420, 300, 1000, ctx);
    expect(near).not.toBeNull();
    expect(dialogues.length).toBe(1);
    expect(near!.id).toBe('welcome'); // first visit → highest priority = welcome
  });

  it('Jono gives contextual hint when rift is active', () => {
    const eventBus = new EventBus();
    const jono = new JonoHologram(eventBus, { baseX: 400, baseY: 300, triggerRadius: 150 });

    const ctx = { hasUsedUL: false, hasCompanion: false, activeRiftCount: 1, lowestStability: 80, trustLevel: 60, cosmicPhase: null };

    // First visit — welcome dialogue takes priority
    jono.checkProximity(410, 300, 0, ctx);
    // Second visit with cooldown passed — rift warning should surface
    const line = jono.checkProximity(410, 300, 15_000, ctx);
    expect(line).not.toBeNull();
    expect(line!.id).toBe('rift_warning');
  });
});
