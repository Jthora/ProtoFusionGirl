/**
 * factories.ts — shared mock factories for ProtoFusionGirl tests.
 *
 * Import these instead of defining local makeSprite/makeScene helpers in each
 * test file. Keeps mocks consistent as the source interfaces evolve.
 *
 * Usage:
 *   import { makeEventBus, makeSprite, makePhScene } from '../__mocks__/factories';
 */

import { EventBus } from '../../src/core/EventBus';

// ─── EventBus ─────────────────────────────────────────────────────────────────

/**
 * Returns a real EventBus plus a helper to collect all emitted events.
 * Useful for asserting which events were emitted without individual listeners.
 *
 * @example
 * const { bus, emitted } = makeEventBus();
 * bus.emit({ type: 'FOO', data: { x: 1 } });
 * expect(emitted('FOO')).toHaveLength(1);
 */
export function makeEventBus() {
  const bus = new EventBus();
  const _all: { type: string; data: any }[] = [];
  const _origEmit = bus.emit.bind(bus);
  bus.emit = (event: any) => {
    _all.push({ type: event.type, data: event.data });
    return _origEmit(event);
  };
  return {
    bus,
    /** Returns all events of a given type that have been emitted. */
    emitted: (type: string) => _all.filter(e => e.type === type),
    /** Returns all emitted events. */
    all: () => [..._all],
    /** Clear the capture buffer (useful between steps in a test). */
    clear: () => { _all.length = 0; },
  };
}

// ─── Sprite ───────────────────────────────────────────────────────────────────

/**
 * Minimal Phaser.Physics.Arcade.Sprite stub.
 * Covers the interface used by JaneAI, NodeManager, EnemyManager, etc.
 */
export function makeSprite(x = 0, y = 0) {
  return {
    x,
    y,
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    active: true,
    body: {
      velocity: { x: 0, y: 0 },
      blocked: { down: true },
    },
    setAlpha: jest.fn().mockImplementation(function(this: any, a: number) { this.alpha = a; return this; }),
    setVelocity: jest.fn().mockImplementation(function(this: any, vx: number, vy: number) {
      this.body.velocity.x = vx;
      this.body.velocity.y = vy;
      return this;
    }),
    setVelocityX: jest.fn().mockImplementation(function(this: any, vx: number) { this.body.velocity.x = vx; return this; }),
    setVelocityY: jest.fn().mockImplementation(function(this: any, vy: number) { this.body.velocity.y = vy; return this; }),
    setPosition: jest.fn().mockImplementation(function(this: any, nx: number, ny: number) { this.x = nx; this.y = ny; return this; }),
    setVisible: jest.fn().mockReturnThis(),
    play: jest.fn().mockReturnThis(),
    destroy: jest.fn(),
  };
}

// ─── Phaser.Sound stub ────────────────────────────────────────────────────────

/**
 * Minimal Phaser.Sound.BaseSound stub.
 * Used when testing systems that call scene.sound.add().
 */
export function makePhaserSound(key = 'mock_sound') {
  return {
    key,
    isPlaying: false,
    volume: 1,
    play: jest.fn().mockImplementation(function(this: any) { this.isPlaying = true; }),
    stop: jest.fn().mockImplementation(function(this: any) { this.isPlaying = false; }),
    destroy: jest.fn(),
    setVolume: jest.fn().mockReturnThis(),
    setRate: jest.fn().mockReturnThis(),
    setLoop: jest.fn().mockReturnThis(),
    on: jest.fn(),
    off: jest.fn(),
    once: jest.fn(),
  };
}

// ─── Phaser.Scene stub ────────────────────────────────────────────────────────

/**
 * Minimal Phaser.Scene stub covering the methods used by HarmonicEngine,
 * AudioManager, NodeManager, and other scene-dependent systems.
 *
 * Override specific methods in your test with jest.spyOn().
 */
export function makePhScene() {
  const soundStubs = new Map<string, ReturnType<typeof makePhaserSound>>();

  const delayedCallbacks: Array<{ delay: number; cb: () => void; fired: boolean }> = [];

  const scene: any = {
    // Sound system
    sound: {
      add: jest.fn().mockImplementation((key: string) => {
        const s = makePhaserSound(key);
        soundStubs.set(key, s);
        return s;
      }),
      play: jest.fn(),
      stopAll: jest.fn(),
      get: jest.fn().mockImplementation((key: string) => soundStubs.get(key) ?? null),
    },

    // Timer system
    time: {
      delayedCall: jest.fn().mockImplementation((delay: number, cb: () => void) => {
        const entry = { delay, cb, fired: false };
        delayedCallbacks.push(entry);
        return entry;
      }),
      addEvent: jest.fn().mockReturnValue({ destroy: jest.fn() }),
      now: 0,
    },

    // Tweens
    tweens: {
      add: jest.fn().mockReturnValue({ stop: jest.fn(), destroy: jest.fn() }),
      killTweensOf: jest.fn(),
    },

    // Camera
    cameras: {
      main: {
        alpha: 1,
        zoom: 1,
        shake: jest.fn(),
        setZoom: jest.fn(),
        setAlpha: jest.fn(),
        startFollow: jest.fn(),
        fadeOut: jest.fn(),
      },
    },

    // Add objects
    add: {
      text: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        setStyle: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        destroy: jest.fn(),
        x: 0, y: 0, width: 100,
      }),
      rectangle: jest.fn().mockReturnValue({ setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis() }),
      graphics: jest.fn().mockReturnValue({
        setDepth: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        lineStyle: jest.fn().mockReturnThis(),
        lineBetween: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        destroy: jest.fn(),
        x: 0, y: 0, alpha: 1,
      }),
      image: jest.fn().mockReturnValue({
        setDepth: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        destroy: jest.fn(),
        x: 0, y: 0,
      }),
      particles: jest.fn().mockReturnValue({ explode: jest.fn(), destroy: jest.fn() }),
    },

    // Physics
    physics: {
      add: {
        sprite: jest.fn().mockReturnValue(makeSprite()),
        collider: jest.fn(),
        staticGroup: jest.fn().mockReturnValue({ add: jest.fn(), create: jest.fn() }),
      },
    },

    // Scale
    scale: { width: 800, height: 600 },

    // Events (Phaser scene events)
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      once: jest.fn(),
    },

    // Audio cache — _playStinger checks this before playing
    cache: {
      audio: {
        has: jest.fn().mockReturnValue(true), // default: all keys exist
      },
    },

    // Textures
    textures: {
      exists: jest.fn().mockReturnValue(false),
      addCanvas: jest.fn(),
      get: jest.fn().mockReturnValue({ frames: {} }),
    },

    // Input
    input: {
      on: jest.fn(),
      off: jest.fn(),
      keyboard: { on: jest.fn(), off: jest.fn(), addKeys: jest.fn(), createCursorKeys: jest.fn() },
      addPointer: jest.fn(),
    },

    // Scene manager
    scene: {
      start: jest.fn(),
      stop: jest.fn(),
      get: jest.fn().mockReturnValue(null),
      add: jest.fn(),
    },

    // Registry
    registry: {
      set: jest.fn(),
      get: jest.fn().mockReturnValue(null),
    },

    // Helper: manually fire a delayedCall by index or delay amount
    _fireDelayedCall: (indexOrDelay: number) => {
      const entry = typeof indexOrDelay === 'number' && indexOrDelay < 100
        ? delayedCallbacks[indexOrDelay]
        : delayedCallbacks.find(e => e.delay === indexOrDelay && !e.fired);
      if (entry && !entry.fired) {
        entry.fired = true;
        entry.cb();
      }
    },
    _allDelayedCalls: () => delayedCallbacks,
  };

  return scene;
}

// ─── Node config ──────────────────────────────────────────────────────────────

export function makeNodeConfig(overrides: Partial<{
  id: string; name: string; x: number; y: number;
  stability: number; maxStability: number; decayRate: number; surgeThreshold: number;
}> = {}) {
  return {
    id: 'node_test',
    name: 'Test Node',
    x: 0,
    y: 0,
    stability: 80,
    maxStability: 100,
    decayRate: 10,
    surgeThreshold: 40,
    ...overrides,
  };
}

// ─── Enemy target ─────────────────────────────────────────────────────────────

export function makeEnemy(id = 'enemy_1', x = 0, y = 0, health = 60) {
  return { id, x, y, health, maxHealth: 60 };
}
