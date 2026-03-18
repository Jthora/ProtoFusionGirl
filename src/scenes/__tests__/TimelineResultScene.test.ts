// TimelineResultScene.test.ts
// Unit tests for the win/lose result screen.
//
// Mock strategy:
//   - Phaser.Scene is stubbed (no real renderer)
//   - scene.add.text / add.rectangle / add.graphics are captured
//   - scene.tweens.add is captured
//   - scene.cameras.main.setAlpha is captured
//   - scene.input is no-op
//   - The btn.on('pointerdown', ...) handler is manually invoked in tests

jest.mock('phaser', () => ({
  __esModule: true,
  default: {
    Scene: class {
      constructor(..._args: any[]) {}
    },
  },
}));

import { TimelineResultScene, TimelineResultData } from '../TimelineResultScene';

// ─── Minimal Phaser.Scene stub ────────────────────────────────────────────────

function makeScene() {
  const textObjects: Array<{ content: string; style: any; origin?: number[] }> = [];
  const tweens: any[] = [];
  const dividers: any[] = [];

  const makeTextObj = (x: number, y: number, content: string, style: any) => {
    const obj = {
      _x: x, _y: y, content, style,
      origin: [0.5, 0],
      depth: 0,
      setOrigin: jest.fn().mockImplementation(function(this: any, ...args: number[]) { this.origin = args; return this; }),
      setDepth: jest.fn().mockImplementation(function(this: any, d: number) { this.depth = d; return this; }),
      setAlpha: jest.fn().mockReturnThis(),
      setInteractive: jest.fn().mockReturnThis(),
      setStyle: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      _handlers: {} as Record<string, Function>,
    };
    // Capture .on() handlers so we can invoke them in tests
    obj.on = jest.fn().mockImplementation(function(this: any, event: string, handler: Function) {
      this._handlers[event] = handler;
      return this;
    });
    textObjects.push(obj);
    return obj;
  };

  const scene: any = {
    scale: { width: 800, height: 600 },
    cameras: {
      main: {
        alpha: 1,
        setAlpha: jest.fn().mockImplementation(function(this: any, a: number) { this.alpha = a; }),
      },
    },
    add: {
      text: jest.fn().mockImplementation((x: number, y: number, content: string, style: any) =>
        makeTextObj(x, y, content, style)
      ),
      rectangle: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
      }),
      graphics: jest.fn().mockReturnValue({
        setDepth: jest.fn().mockReturnThis(),
        lineStyle: jest.fn().mockReturnThis(),
        lineBetween: jest.fn().mockImplementation(function(this: any, ...args: number[]) {
          dividers.push(args);
          return this;
        }),
      }),
    },
    tweens: {
      add: jest.fn().mockImplementation((config: any) => tweens.push(config)),
    },
    scene: { start: jest.fn() },
    registry: { set: jest.fn(), get: jest.fn() },
    input: { on: jest.fn() },
    _textObjects: textObjects,
    _tweens: tweens,
    _dividers: dividers,
    /** Find a text object whose content contains the given substring */
    findText: (substr: string) =>
      textObjects.find(t => String(t.content).includes(substr)),
    /** Find all text objects matching a predicate */
    filterText: (pred: (t: typeof textObjects[0]) => boolean) =>
      textObjects.filter(pred),
  };

  return scene;
}

function makeResultScene(data: TimelineResultData) {
  const scene = makeScene();
  // Phaser.Scene constructor is called — we bypass it by directly calling create()
  const result = new TimelineResultScene();
  // Inject our mock scene properties
  Object.assign(result, scene);
  result.create(data);
  return { result, scene };
}

// ─── Win screen ───────────────────────────────────────────────────────────────

describe('TimelineResultScene — win screen', () => {
  const WIN_DATA: TimelineResultData = {
    outcome: 'secured',
    trustPercent: 80,
    nodesSaved: 3,
    totalNodes: 3,
    elapsedSeconds: 120,
  };

  it('renders TIMELINE SECURED title', () => {
    const { scene } = makeResultScene(WIN_DATA);
    expect(scene.findText('TIMELINE SECURED')).toBeDefined();
  });

  it('does NOT render TIMELINE COLLAPSED on win', () => {
    const { scene } = makeResultScene(WIN_DATA);
    expect(scene.findText('TIMELINE COLLAPSED')).toBeUndefined();
  });

  it('renders RECONNECT AS OPERATOR button on win', () => {
    const { scene } = makeResultScene(WIN_DATA);
    expect(scene.findText('RECONNECT AS OPERATOR')).toBeDefined();
  });

  it('does NOT render REWIND button on win', () => {
    const { scene } = makeResultScene(WIN_DATA);
    expect(scene.findText('[ REWIND ]')).toBeUndefined();
  });

  it('renders trust rating stat', () => {
    const { scene } = makeResultScene(WIN_DATA);
    expect(scene.findText('Trust Rating:')).toBeDefined();
  });

  it('renders nodes saved stat', () => {
    const { scene } = makeResultScene(WIN_DATA);
    expect(scene.findText('Nodes Saved:')).toBeDefined();
    expect(scene.findText('3/3')).toBeDefined();
  });

  it('renders elapsed time in mm:ss format', () => {
    const { scene } = makeResultScene(WIN_DATA);
    expect(scene.findText('2:00')).toBeDefined();
  });

  it('shows first Jono reflection for low trust (0–33%)', () => {
    const { scene } = makeResultScene({ ...WIN_DATA, trustPercent: 10 });
    expect(scene.findText("Another timeline preserved")).toBeDefined();
  });

  it('shows second Jono reflection for mid trust (34–66%)', () => {
    const { scene } = makeResultScene({ ...WIN_DATA, trustPercent: 50 });
    expect(scene.findText("Jane never knew you were there")).toBeDefined();
  });

  it('shows third Jono reflection for high trust (67–100%)', () => {
    const { scene } = makeResultScene({ ...WIN_DATA, trustPercent: 90 });
    expect(scene.findText("The Tho'ra lineage holds")).toBeDefined();
  });

  it('does NOT render collapse consequence text on win', () => {
    const { scene } = makeResultScene(WIN_DATA);
    expect(scene.findText('forced roboticization')).toBeUndefined();
  });

  it('fades camera in from alpha 0', () => {
    const { scene } = makeResultScene(WIN_DATA);
    expect(scene.cameras.main.setAlpha).toHaveBeenCalledWith(0);
    expect(scene._tweens.some((t: any) => t.alpha === 1)).toBe(true);
  });
});

// ─── Lose screen ─────────────────────────────────────────────────────────────

describe('TimelineResultScene — lose screen', () => {
  const LOSE_DATA: TimelineResultData = {
    outcome: 'collapsed',
    trustPercent: 20,
    nodesSaved: 0,
    totalNodes: 3,
    elapsedSeconds: 75,
  };

  it('renders TIMELINE COLLAPSED title', () => {
    const { scene } = makeResultScene(LOSE_DATA);
    expect(scene.findText('TIMELINE COLLAPSED')).toBeDefined();
  });

  it('does NOT render TIMELINE SECURED on lose', () => {
    const { scene } = makeResultScene(LOSE_DATA);
    expect(scene.findText('TIMELINE SECURED')).toBeUndefined();
  });

  it('renders REWIND button on lose', () => {
    const { scene } = makeResultScene(LOSE_DATA);
    expect(scene.findText('REWIND')).toBeDefined();
  });

  it('renders collapse consequence text', () => {
    const { scene } = makeResultScene(LOSE_DATA);
    expect(scene.findText('forced roboticization')).toBeDefined();
  });

  it('renders Rewind framing subtext', () => {
    const { scene } = makeResultScene(LOSE_DATA);
    expect(scene.findText("Tho'ra temporal recovery protocol")).toBeDefined();
  });

  it('does NOT render Jono win reflection on lose', () => {
    const { scene } = makeResultScene(LOSE_DATA);
    expect(scene.findText('Another timeline preserved')).toBeUndefined();
    expect(scene.findText("Tho'ra lineage holds")).toBeUndefined();
  });

  it('shows Timeline Intact: NO', () => {
    const { scene } = makeResultScene(LOSE_DATA);
    expect(scene.findText('NO')).toBeDefined();
  });

  it('renders elapsed time correctly', () => {
    const { scene } = makeResultScene(LOSE_DATA); // 75s = 1:15
    expect(scene.findText('1:15')).toBeDefined();
  });
});

// ─── Trust tier boundary ──────────────────────────────────────────────────────

describe('TimelineResultScene — win Jono reflection tier boundaries', () => {
  it('trust 0 → first reflection', () => {
    const { scene } = makeResultScene({ outcome: 'secured', trustPercent: 0, nodesSaved: 1, totalNodes: 1, elapsedSeconds: 0 });
    expect(scene.findText('Another timeline preserved')).toBeDefined();
  });

  it('trust 33 → first reflection', () => {
    const { scene } = makeResultScene({ outcome: 'secured', trustPercent: 33, nodesSaved: 1, totalNodes: 1, elapsedSeconds: 0 });
    expect(scene.findText('Another timeline preserved')).toBeDefined();
  });

  it('trust 67 → third reflection', () => {
    const { scene } = makeResultScene({ outcome: 'secured', trustPercent: 67, nodesSaved: 1, totalNodes: 1, elapsedSeconds: 0 });
    expect(scene.findText("The Tho'ra lineage holds")).toBeDefined();
  });

  it('trust 100 → third reflection', () => {
    const { scene } = makeResultScene({ outcome: 'secured', trustPercent: 100, nodesSaved: 1, totalNodes: 1, elapsedSeconds: 0 });
    expect(scene.findText("The Tho'ra lineage holds")).toBeDefined();
  });
});
