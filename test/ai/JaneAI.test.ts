import { JaneAI, JaneAIState, EnemyTarget } from '../../src/ai/JaneAI';
import { EventBus } from '../../src/core/EventBus';

function makeSprite(x = 0, y = 0) {
  return {
    x,
    y,
    body: { velocity: { x: 0, y: 0 } },
  };
}

function makeEnemy(id: string, x: number, y: number, health = 60): EnemyTarget {
  return { id, x, y, health, maxHealth: 60 };
}

describe('JaneAI', () => {
  let eventBus: EventBus;
  let sprite: ReturnType<typeof makeSprite>;
  let janeAI: JaneAI;
  let healthState: { current: number; max: number };
  let enemies: EnemyTarget[];

  beforeEach(() => {
    eventBus = new EventBus();
    sprite = makeSprite(100, 100);
    healthState = { current: 100, max: 100 };
    enemies = [];
    janeAI = new JaneAI({
      eventBus,
      getSprite: () => sprite,
      getHealth: () => healthState,
      getEnemiesInRange: () => enemies,
      moveSpeed: 200,
      arrivalThreshold: 20,
      detectionRange: 200,
      attackRange: 80,
      attackCooldown: 800,
      attackDamage: 20,
      retreatHealthThreshold: 0.25,
    });
  });

  afterEach(() => {
    janeAI.destroy();
  });

  it('starts in Idle state', () => {
    expect(janeAI.state).toBe(JaneAIState.Idle);
  });

  it('has no active waypoint initially', () => {
    expect(janeAI.getActiveWaypoint()).toBeNull();
  });

  describe('waypoint acceptance', () => {
    it('transitions to FollowGuidance when waypoint placed', () => {
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 500, id: 'wp1' } });
      expect(janeAI.state).toBe(JaneAIState.FollowGuidance);
      expect(janeAI.getActiveWaypoint()).toEqual({ id: 'wp1', x: 500, y: 500 });
    });

    it('emits JANE_STATE_CHANGED on transition', () => {
      const changes: { previousState: string; newState: string }[] = [];
      eventBus.on('JANE_STATE_CHANGED', (e) => changes.push(e.data));

      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 500, id: 'wp1' } });
      expect(changes).toEqual([{ previousState: 'Idle', newState: 'FollowGuidance' }]);
    });

    it('replaces existing waypoint and emits ASI_WAYPOINT_CLEARED', () => {
      const cleared: { id: string; reason: string }[] = [];
      eventBus.on('ASI_WAYPOINT_CLEARED', (e) => cleared.push(e.data));

      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 500, id: 'wp1' } });
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 800, y: 200, id: 'wp2' } });

      expect(cleared).toEqual([{ id: 'wp1', reason: 'replaced' }]);
      expect(janeAI.getActiveWaypoint()?.id).toBe('wp2');
    });
  });

  describe('movement toward waypoint', () => {
    it('sets velocity toward waypoint during FollowGuidance', () => {
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 100, id: 'wp1' } });
      janeAI.update(16);

      // Sprite is at (100,100), waypoint at (500,100) — should move right
      expect(sprite.body.velocity.x).toBeGreaterThan(0);
      expect(sprite.body.velocity.y).toBeCloseTo(0, 0);
    });

    it('moves diagonally toward waypoint', () => {
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 500, id: 'wp1' } });
      janeAI.update(16);

      expect(sprite.body.velocity.x).toBeGreaterThan(0);
      expect(sprite.body.velocity.y).toBeGreaterThan(0);
      // Should be normalized to moveSpeed
      const speed = Math.sqrt(sprite.body.velocity.x ** 2 + sprite.body.velocity.y ** 2);
      expect(speed).toBeCloseTo(200, 0);
    });
  });

  describe('arrival', () => {
    it('transitions to Idle when within arrival threshold', () => {
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 110, y: 110, id: 'wp1' } });
      // Sprite at (100,100), waypoint at (110,110) — distance ~14.14, within threshold of 20
      janeAI.update(16);

      expect(janeAI.state).toBe(JaneAIState.Idle);
      expect(janeAI.getActiveWaypoint()).toBeNull();
    });

    it('emits JANE_ARRIVED_AT_WAYPOINT on arrival', () => {
      const arrivals: { waypointId: string; x: number; y: number }[] = [];
      eventBus.on('JANE_ARRIVED_AT_WAYPOINT', (e) => arrivals.push(e.data));

      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 110, y: 110, id: 'wp1' } });
      janeAI.update(16);

      expect(arrivals).toEqual([{ waypointId: 'wp1', x: 110, y: 110 }]);
    });

    it('emits ASI_WAYPOINT_CLEARED with arrived reason', () => {
      const cleared: { id: string; reason: string }[] = [];
      eventBus.on('ASI_WAYPOINT_CLEARED', (e) => cleared.push(e.data));

      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 110, y: 110, id: 'wp1' } });
      janeAI.update(16);

      expect(cleared).toEqual([{ id: 'wp1', reason: 'arrived' }]);
    });

    it('stops velocity on arrival', () => {
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 110, y: 110, id: 'wp1' } });
      janeAI.update(16);

      expect(sprite.body.velocity.x).toBe(0);
      expect(sprite.body.velocity.y).toBe(0);
    });
  });

  describe('Idle state', () => {
    it('does not override velocity in Idle (allows WASD)', () => {
      sprite.body.velocity.x = 150;
      sprite.body.velocity.y = -50;
      janeAI.update(16);
      // Idle should NOT zero out velocity
      expect(sprite.body.velocity.x).toBe(150);
      expect(sprite.body.velocity.y).toBe(-50);
    });
  });

  describe('Combat state (P2)', () => {
    it('transitions to Combat when enemy in detection range during Idle', () => {
      enemies = [makeEnemy('t1', 200, 100)];
      janeAI.update(16);
      expect(janeAI.state).toBe(JaneAIState.Combat);
    });

    it('moves toward enemy when outside attack range', () => {
      enemies = [makeEnemy('t1', 400, 100)]; // 300 px away
      janeAI.update(16); // Idle → Combat
      janeAI.update(16); // Combat tick — move toward
      expect(sprite.body.velocity.x).toBeGreaterThan(0);
    });

    it('stops and attacks when within attack range', () => {
      const attacks: any[] = [];
      eventBus.on('JANE_ATTACK', (e) => attacks.push(e.data));

      enemies = [makeEnemy('t1', 150, 100)]; // 50 px away < attackRange 80
      janeAI.update(16); // Idle → Combat
      janeAI.update(16); // Combat tick — in range, attack
      expect(sprite.body.velocity.x).toBe(0);
      expect(attacks.length).toBe(1);
      expect(attacks[0]).toEqual({ targetId: 't1', damage: 20, weaponType: 'blast_pistol' });
    });

    it('returns to Idle when no enemies remain', () => {
      enemies = [makeEnemy('t1', 150, 100)];
      janeAI.update(16); // → Combat
      enemies = []; // All enemies gone
      janeAI.update(16); // → Idle
      expect(janeAI.state).toBe(JaneAIState.Idle);
    });

    it('returns to FollowGuidance after combat if waypoint exists', () => {
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 500, id: 'wp1' } });
      enemies = [makeEnemy('t1', 150, 100)];
      janeAI.update(16); // FollowGuidance → Combat (enemy detected during guidance)
      expect(janeAI.state).toBe(JaneAIState.Combat);
      enemies = []; // enemy dies
      janeAI.update(16);
      expect(janeAI.state).toBe(JaneAIState.FollowGuidance);
    });

    it('interrupts FollowGuidance for nearby enemies', () => {
      enemies = [];
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 500, id: 'wp1' } });
      expect(janeAI.state).toBe(JaneAIState.FollowGuidance);
      // Enemy appears very close (within 0.6 * detectionRange = 120)
      enemies = [makeEnemy('t1', 200, 100)];
      janeAI.update(16);
      expect(janeAI.state).toBe(JaneAIState.Combat);
    });

    it('waypoint placement interrupts combat', () => {
      enemies = [makeEnemy('t1', 150, 100)];
      janeAI.update(16); // → Combat
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 999, y: 999, id: 'wp2' } });
      expect(janeAI.state).toBe(JaneAIState.FollowGuidance);
      expect(janeAI.getCombatTarget()).toBeNull();
    });
  });

  describe('Retreat state (P2)', () => {
    it('transitions to Retreat when health drops below 25%', () => {
      healthState.current = 20; // 20% of 100
      enemies = [makeEnemy('t1', 150, 100)];
      janeAI.update(16); // Idle → should check retreat first
      expect(janeAI.state).toBe(JaneAIState.Retreat);
    });

    it('emits JANE_RETREAT_STARTED on retreat', () => {
      const retreats: any[] = [];
      eventBus.on('JANE_RETREAT_STARTED', (e) => retreats.push(e.data));

      healthState.current = 20;
      janeAI.update(16);
      expect(retreats.length).toBe(1);
      expect(retreats[0].reason).toBe('low_health');
    });

    it('flees away from nearest enemy if no retreat target', () => {
      healthState.current = 20;
      enemies = [makeEnemy('t1', 200, 100)]; // enemy to the right
      janeAI.update(16); // → Retreat
      janeAI.update(16); // update retreat — flee left
      expect(sprite.body.velocity.x).toBeLessThan(0); // fleeing away from enemy
    });

    it('returns to Idle when health recovers above threshold + 10%', () => {
      const ended: any[] = [];
      eventBus.on('JANE_RETREAT_ENDED', (e) => ended.push(e.data));

      healthState.current = 20;
      janeAI.update(16); // → Retreat
      healthState.current = 40; // 40% > 25% + 10% = 35%
      janeAI.update(16);
      expect(janeAI.state).toBe(JaneAIState.Idle);
      expect(ended.length).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('transitions to Idle if sprite becomes undefined during FollowGuidance', () => {
      const ai = new JaneAI({
        eventBus,
        getSprite: () => undefined,
        moveSpeed: 200,
        arrivalThreshold: 20,
      });
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 500, id: 'wp1' } });
      ai.update(16);
      expect(ai.state).toBe(JaneAIState.Idle);
      ai.destroy();
    });
  });

  describe('destroy', () => {
    it('unsubscribes from events after destroy', () => {
      janeAI.destroy();
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 500, id: 'wp1' } });
      expect(janeAI.state).toBe(JaneAIState.Idle);
      expect(janeAI.getActiveWaypoint()).toBeNull();
    });
  });

  // ─── Scripted waypoints (FE-4) ────────────────────────────────────────────
  // setScriptedWaypoint / clearScriptedWaypoint were added for the drop-in
  // sequence. They bypass the refusal system and don't emit ASI_WAYPOINT_PLACED.

  describe('scripted waypoints (FE-4)', () => {
    it('setScriptedWaypoint transitions to Navigate state', () => {
      janeAI.setScriptedWaypoint(300, 300);
      expect(janeAI.state).toBe(JaneAIState.Navigate);
    });

    it('setScriptedWaypoint sets active waypoint with id "scripted"', () => {
      janeAI.setScriptedWaypoint(300, 300);
      expect(janeAI.getActiveWaypoint()).toEqual({ id: 'scripted', x: 300, y: 300 });
    });

    it('setScriptedWaypoint does NOT emit ASI_WAYPOINT_PLACED', () => {
      const placed: any[] = [];
      eventBus.on('ASI_WAYPOINT_PLACED', (e) => placed.push(e));
      janeAI.setScriptedWaypoint(300, 300);
      expect(placed).toHaveLength(0);
    });

    it('setScriptedWaypoint bypasses refusal even at low health', () => {
      healthState.current = 5; // critically low — would normally refuse
      janeAI.setScriptedWaypoint(300, 300);
      expect(janeAI.state).toBe(JaneAIState.Navigate);
    });

    it('clearScriptedWaypoint returns state to Bored and nulls waypoint', () => {
      janeAI.setScriptedWaypoint(300, 300);
      janeAI.clearScriptedWaypoint();
      expect(janeAI.state).toBe(JaneAIState.Bored);
      expect(janeAI.getActiveWaypoint()).toBeNull();
    });

    it('clearScriptedWaypoint is a no-op when no scripted waypoint is active', () => {
      janeAI.setInitialState(JaneAIState.Idle);
      expect(() => janeAI.clearScriptedWaypoint()).not.toThrow();
      expect(janeAI.state).toBe(JaneAIState.Idle);
    });

    it('clearScriptedWaypoint does NOT remove a player-placed waypoint', () => {
      // Player places a waypoint → state = FollowGuidance, id ≠ 'scripted'
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 100, id: 'player_wp' } });
      expect(janeAI.state).toBe(JaneAIState.FollowGuidance);
      janeAI.clearScriptedWaypoint(); // should be no-op
      expect(janeAI.state).toBe(JaneAIState.FollowGuidance);
      expect(janeAI.getActiveWaypoint()?.id).toBe('player_wp');
    });

    it('player ASI_WAYPOINT_PLACED replaces a scripted waypoint', () => {
      janeAI.setScriptedWaypoint(200, 200);
      eventBus.emit({ type: 'ASI_WAYPOINT_PLACED', data: { x: 500, y: 100, id: 'player_wp' } });
      expect(janeAI.getActiveWaypoint()?.id).toBe('player_wp');
    });

    it('setScriptedWaypoint moves sprite toward target on update', () => {
      sprite.x = 100;
      sprite.y = 100;
      janeAI.setScriptedWaypoint(500, 100); // far right
      janeAI.update(16);
      expect(sprite.body.velocity.x).toBeGreaterThan(0);
    });
  });
});
