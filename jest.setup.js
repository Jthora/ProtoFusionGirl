// jest.setup.js
// Global test environment setup for ProtoFusionGirl.
// Mocks Phaser, browser APIs, and provides a clean slate between tests.

// ─── Phaser mock ─────────────────────────────────────────────────────────────
// Full mock is needed because Phaser attempts to boot WebGL/Canvas on import.
// Individual tests may override specific methods via jest.spyOn or local mocks.

try {
  jest.mock('phaser');
} catch (e) {}

// ─── Browser APIs ────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  global.HTMLCanvasElement = window.HTMLCanvasElement || function() {};
  global.requestAnimationFrame = cb => setTimeout(cb, 0);
  global.cancelAnimationFrame = id => clearTimeout(id);

  window.focus = window.focus || (() => {});
  window.scrollTo = window.scrollTo || (() => {});

  // Web Audio API — required by Phaser's sound system.
  // jsdom does not provide AudioContext; stub so imports don't throw.
  if (!window.AudioContext) {
    window.AudioContext = class {
      createGain() { return { connect: () => {}, gain: { value: 1 } }; }
      createOscillator() {
        return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 440 } };
      }
      createBufferSource() {
        return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null };
      }
      decodeAudioData(_buf, onSuccess) { if (onSuccess) onSuccess({}); }
      get destination() { return {}; }
      get currentTime() { return 0; }
    };
    window.webkitAudioContext = window.AudioContext;
  }

  // Canvas 2D context — jsdom provides a partial implementation; fill gaps.
  const _origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, ...args) {
    if (type === '2d') {
      const ctx = _origGetContext ? _origGetContext.call(this, type, ...args) : null;
      if (ctx) return ctx;
      return {
        fillRect: () => {}, clearRect: () => {}, getImageData: () => ({ data: [] }),
        putImageData: () => {}, createImageData: () => ([]),
        setTransform: () => {}, drawImage: () => {}, save: () => {}, fillText: () => {},
        restore: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {},
        closePath: () => {}, stroke: () => {}, translate: () => {}, scale: () => {},
        rotate: () => {}, arc: () => {}, fill: () => {}, measureText: () => ({ width: 0 }),
        transform: () => {}, rect: () => {}, clip: () => {},
        canvas: this, strokeStyle: '', fillStyle: '', globalAlpha: 1,
        lineWidth: 1, lineCap: 'butt', lineJoin: 'miter', font: '10px sans-serif',
        textAlign: 'start', textBaseline: 'alphabetic', shadowColor: '', shadowBlur: 0,
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        ellipse: () => {}, quadraticCurveTo: () => {}, bezierCurveTo: () => {},
        strokeRect: () => {}, strokeText: () => {}, isPointInPath: () => false,
      };
    }
    return _origGetContext ? _origGetContext.call(this, type, ...args) : null;
  };
}

// ─── localStorage isolation ───────────────────────────────────────────────────
// jsdom provides a real localStorage; clear it between tests so
// SaveSystem / SessionPersistence tests don't bleed state.

beforeEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});

// ─── Phaser.Sound stub helper ─────────────────────────────────────────────────
// Global factory for use in test files. HarmonicEngine / AudioManager call
// this.scene.sound.add(key, opts) — the return value needs play/stop/destroy.

global.makePhaserSound = () => ({
  play: jest.fn(),
  stop: jest.fn(),
  destroy: jest.fn(),
  setVolume: jest.fn().mockReturnThis(),
  setRate: jest.fn().mockReturnThis(),
  setLoop: jest.fn().mockReturnThis(),
  isPlaying: false,
  key: '',
  volume: 1,
  on: jest.fn(),
  off: jest.fn(),
  once: jest.fn(),
});

// ─── Timer cleanup ────────────────────────────────────────────────────────────
// Stragglers from tests that don't use fake timers.

afterEach(() => {
  jest.clearAllTimers();
});
