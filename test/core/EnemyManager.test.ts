// EnemyManager.test.ts
// Unit tests for EnemyManager — spawning, AI state, event contracts.
// Mocks Phaser scene and registries; tests pure logic without a real renderer.

import { EnemyManager } from '../../src/core/EnemyManager';
import { EnemyRegistry } from '../../src/world/enemies/EnemyRegistry';
import { EventBus } from '../../src/core/EventBus';

// ─── Mock heavy Phaser dependencies ──────────────────────────────────────────

jest.mock('phaser', () => ({
  __esModule: true,
  default: {
    Math: { Distance: { Between: (_x1: number, _y1: number, x2: number, y2: number) => Math.hypot(x2 - _x1, y2 - _y1) } },
    Physics: { Arcade: { Sprite: class {} } },
  },
}));

jest.mock('../../src/world/enemies/EnemyInstance', () => {
  return {
    EnemyInstance: jest.fn().mockImplementation(function(this: any, def: any, x: number, y: number) {
      this.definition = def;
      this.health = def.maxHealth;
      this.x = x;
      this.y = y;
      this.isAlive = true;
      this.takeDamage = (amount: number) => {
        this.health -= amount;
        if (this.health <= 0) { this.health = 0; this.isAlive = false; }
      };
    }),
  };
});

jest.mock('../../src/world/tilemap/TilemapManager', () => ({
  TilemapManager: { wrapX: (x: number) => x, toroidalDistanceX: (a: number, b: number) => Math.abs(a - b) },
}));

jest.mock('../../src/ui/components/EnemyHealthBar', () => ({
  EnemyHealthBar: jest.fn().mockImplementation(function(this: any) {
    this.updateHealth = jest.fn();
    this.setPosition = jest.fn();
    this.destroy = jest.fn();
  }),
}));

jest.mock('../../src/world/combat/AttackRegistry', () => ({
  AttackRegistry: jest.fn().mockImplementation(function(this: any) {}),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeEnemyDef(id = 'test_enemy', maxHealth = 60, damage = 10, speed = 80) {
  return { id, name: id, maxHealth, damage, attack: damage, defense: 0, speed, aiType: 'patrol', sprite: 'enemy' };
}

function makeSprite(x = 0, y = 0) {
  const body: any = {
    setVelocityX: jest.fn(),
    blocked: { left: false, right: false },
    enable: true,
  };
  return {
    x, y,
    body,
    setOrigin: jest.fn().mockReturnThis(),
    setCollideWorldBounds: jest.fn().mockReturnThis(),
    setBounce: jest.fn().mockReturnThis(),
    setTint: jest.fn().mockReturnThis(),
    destroy: jest.fn(),
    scaleX: 1, scaleY: 1,
  };
}

function makeScene(spriteX = 0, spriteY = 0) {
  const sprite = makeSprite(spriteX, spriteY);
  const tweenCallbacks: Array<() => void> = [];

  const scene: any = {
    textures: { exists: jest.fn(() => false) }, // force fallback texture
    physics: {
      add: {
        sprite: jest.fn(() => sprite),
        collider: jest.fn(),
      },
    },
    add: {
      existing: jest.fn(),
    },
    tweens: {
      add: jest.fn((cfg: any) => {
        if (cfg.onComplete) tweenCallbacks.push(cfg.onComplete);
      }),
    },
    _sprite: sprite,
    _tweenCallbacks: tweenCallbacks,
    _fireTweens() { for (const cb of this._tweenCallbacks) cb(); },
  };
  return scene;
}

function makeManager(scene: any, opts: { eventBus?: EventBus; playerX?: number; playerY?: number } = {}) {
  const registry = new EnemyRegistry();
  registry.registerEnemy(makeEnemyDef());
  registry.registerEnemy(makeEnemyDef('type_b', 40, 15, 60));

  const { AttackRegistry } = require('../../src/world/combat/AttackRegistry');
  const attackRegistry = new AttackRegistry();

  const groundGroup: any = {};
  const playerSprite = makeSprite(opts.playerX ?? 1000, opts.playerY ?? 1000);
  const playerController: any = {
    sprite: playerSprite,
    health: 100,
    takeDamage: jest.fn(),
  };

  const mgr = new EnemyManager(scene, registry, attackRegistry, groundGroup, playerController, {
    eventBus: opts.eventBus,
  });

  return { mgr, registry, playerController, playerSprite };
}

// ─── Constructor ──────────────────────────────────────────────────────────────

describe('EnemyManager — construction', () => {
  it('constructs without throwing', () => {
    const scene = makeScene();
    expect(() => makeManager(scene)).not.toThrow();
  });

  it('starts with an empty enemies array', () => {
    const scene = makeScene();
    const { mgr } = makeManager(scene);
    expect(mgr.enemies).toHaveLength(0);
  });
});

// ─── spawnEnemy ───────────────────────────────────────────────────────────────

describe('EnemyManager — spawnEnemy', () => {
  it('adds enemy to enemies array on spawn', () => {
    const scene = makeScene();
    const { mgr } = makeManager(scene);
    mgr.spawnEnemy('test_enemy', 100, 200);
    expect(mgr.enemies).toHaveLength(1);
  });

  it('creates a physics sprite at the given position', () => {
    const scene = makeScene();
    const { mgr } = makeManager(scene);
    mgr.spawnEnemy('test_enemy', 150, 300);
    expect(scene.physics.add.sprite).toHaveBeenCalledWith(150, 300, expect.any(String));
  });

  it('uses fallback texture "player" when enemy sprite texture is missing', () => {
    const scene = makeScene();
    scene.textures.exists.mockReturnValue(false);
    const { mgr } = makeManager(scene);
    mgr.spawnEnemy('test_enemy', 0, 0);
    expect(scene.physics.add.sprite).toHaveBeenCalledWith(0, 0, 'player');
  });

  it('uses actual texture when it exists in scene', () => {
    const scene = makeScene();
    scene.textures.exists.mockReturnValue(true);
    const { mgr } = makeManager(scene);
    mgr.spawnEnemy('test_enemy', 0, 0);
    expect(scene.physics.add.sprite).toHaveBeenCalledWith(0, 0, 'enemy');
  });

  it('does not add enemy for unknown type', () => {
    const scene = makeScene();
    const { mgr } = makeManager(scene);
    mgr.spawnEnemy('unknown_type', 0, 0);
    expect(mgr.enemies).toHaveLength(0);
  });

  it('can spawn multiple enemies', () => {
    const scene = makeScene();
    const { mgr } = makeManager(scene);
    mgr.spawnEnemy('test_enemy', 0, 0);
    mgr.spawnEnemy('test_enemy', 100, 0);
    mgr.spawnEnemy('type_b', 200, 0);
    expect(mgr.enemies).toHaveLength(3);
  });
});

// ─── damageEnemy ─────────────────────────────────────────────────────────────

describe('EnemyManager — damageEnemy', () => {
  it('reduces enemy health', () => {
    const scene = makeScene();
    const { mgr } = makeManager(scene);
    mgr.spawnEnemy('test_enemy', 0, 0);
    const enemy = mgr.enemies[0];
    mgr.damageEnemy(enemy, 20);
    expect(enemy.health).toBe(40);
  });

  it('marks enemy not alive when health reaches 0', () => {
    const scene = makeScene();
    const { mgr } = makeManager(scene);
    mgr.spawnEnemy('test_enemy', 0, 0);
    const enemy = mgr.enemies[0];
    mgr.damageEnemy(enemy, 999);
    expect(enemy.isAlive).toBe(false);
    expect(enemy.health).toBe(0);
  });

  it('ignores damage on dead enemy', () => {
    const scene = makeScene();
    const { mgr } = makeManager(scene);
    mgr.spawnEnemy('test_enemy', 0, 0);
    const enemy = mgr.enemies[0];
    mgr.damageEnemy(enemy, 999); // kill
    mgr.damageEnemy(enemy, 100); // should no-op
    expect(enemy.health).toBe(0);
  });
});

// ─── update — AI state transitions ──────────────────────────────────────────

describe('EnemyManager — update AI states', () => {
  it('enemy stays in patrol when player is far away', () => {
    const scene = makeScene();
    // Player is at x=1000, enemy spawns at x=0 — distance > 200
    const { mgr } = makeManager(scene, { playerX: 1000 });
    mgr.spawnEnemy('test_enemy', 0, 0);
    mgr.update();
    const spriteBody = scene._sprite.body;
    // Patrol means velocity is set to PATROL_SPEED (60) * patrol direction
    expect(spriteBody.setVelocityX).toHaveBeenCalledWith(expect.any(Number));
  });

  it('enemy chases when player within detection range (200px)', () => {
    const scene = makeScene();
    const { mgr, playerSprite } = makeManager(scene, { playerX: 150, playerY: 0 });
    mgr.spawnEnemy('test_enemy', 0, 0);
    // Put enemy sprite at x=0, player at x=150 (within 200, outside 48)
    scene._sprite.x = 0;
    scene._sprite.y = 0;
    playerSprite.x = 150;
    playerSprite.y = 0;
    mgr.update();
    // Chase should set velocity toward player (positive direction)
    const calls = scene._sprite.body.setVelocityX.mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).toBeGreaterThan(0);
  });

  it('enemy stops when within attack range (48px)', () => {
    const scene = makeScene();
    const { mgr, playerSprite } = makeManager(scene, { playerX: 30, playerY: 0 });
    mgr.spawnEnemy('test_enemy', 0, 0);
    scene._sprite.x = 0;
    scene._sprite.y = 0;
    playerSprite.x = 30;
    playerSprite.y = 0;
    mgr.update();
    // Attack state: velocity set to 0
    const calls = scene._sprite.body.setVelocityX.mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).toBe(0);
  });
});

// ─── update — event emission ──────────────────────────────────────────────────

describe('EnemyManager — event emission', () => {
  it('emits JANE_DAMAGED when enemy attacks player', () => {
    const eventBus = new EventBus();
    const damagedEvents: any[] = [];
    eventBus.on('JANE_DAMAGED', (e) => damagedEvents.push(e.data));

    const scene = makeScene();
    const { mgr, playerSprite } = makeManager(scene, { eventBus, playerX: 30, playerY: 0 });
    mgr.spawnEnemy('test_enemy', 0, 0);
    scene._sprite.x = 0;
    scene._sprite.y = 0;
    playerSprite.x = 30;
    playerSprite.y = 0;

    // Force lastAttackAt to 0 so cooldown has expired
    mgr.update();

    expect(damagedEvents.length).toBeGreaterThan(0);
    expect(damagedEvents[0]).toHaveProperty('amount');
  });

  it('emits ENEMY_DEFEATED after death tween completes', () => {
    const eventBus = new EventBus();
    const defeatedEvents: any[] = [];
    eventBus.on('ENEMY_DEFEATED', (e) => defeatedEvents.push(e.data));

    const scene = makeScene();
    const { mgr } = makeManager(scene, { eventBus, playerX: 1000 });
    mgr.spawnEnemy('test_enemy', 0, 0);
    const enemy = mgr.enemies[0];

    // Kill the enemy
    mgr.damageEnemy(enemy, 999);
    // Trigger update to start death tween
    mgr.update();
    // Fire the tween onComplete callback
    scene._fireTweens();

    expect(defeatedEvents).toHaveLength(1);
    expect(defeatedEvents[0].enemyId).toBe('test_enemy');
  });

  it('does not emit events when no eventBus is provided', () => {
    const scene = makeScene();
    const { mgr, playerSprite } = makeManager(scene, { playerX: 30 });
    mgr.spawnEnemy('test_enemy', 0, 0);
    scene._sprite.x = 0;
    playerSprite.x = 30;

    // Should not throw even without eventBus
    expect(() => mgr.update()).not.toThrow();
  });
});

// ─── update — dead enemy cleanup ─────────────────────────────────────────────

describe('EnemyManager — dead enemy cleanup', () => {
  it('removes sprite and health bar after death tween', () => {
    const scene = makeScene();
    const { mgr } = makeManager(scene, { playerX: 1000 });
    mgr.spawnEnemy('test_enemy', 0, 0);
    const enemy = mgr.enemies[0];

    mgr.damageEnemy(enemy, 999);
    mgr.update(); // kick off death anim
    scene._fireTweens(); // complete it

    expect(mgr.enemySprites.get(enemy)).toBeUndefined();
    expect(mgr.enemyHealthBars.get(enemy)).toBeUndefined();
  });

  it('does not start death tween twice for same enemy', () => {
    const scene = makeScene();
    const { mgr } = makeManager(scene, { playerX: 1000 });
    mgr.spawnEnemy('test_enemy', 0, 0);
    const enemy = mgr.enemies[0];

    mgr.damageEnemy(enemy, 999);
    mgr.update();
    mgr.update(); // second update on same dead enemy

    // tweens.add should only have been called once for the death animation
    expect(scene.tweens.add).toHaveBeenCalledTimes(1);
  });
});
