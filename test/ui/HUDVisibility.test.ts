// HUD visibility test — Task 3314 (P1.7)
// Verifies HUD elements register and become visible via UILayoutManager mode system.

jest.mock('phaser', () => ({ __esModule: true, default: {} }));

import { UILayoutManager } from '../../src/ui/layout/UILayoutManager';

function makeMockScene(): any {
  return {
    scale: {
      width: 800,
      height: 600,
      on: jest.fn(),
      off: jest.fn(),
    },
    add: { graphics: jest.fn(() => ({})), text: jest.fn(() => ({})) },
  };
}

function makeMockComponent() {
  return { setPosition: jest.fn(), setSize: jest.fn(), setScrollFactor: jest.fn(), setDepth: jest.fn(), setVisible: jest.fn() };
}

describe('HUD visibility (3314 — P1.7)', () => {
  let scene: any;
  let lm: UILayoutManager;

  beforeEach(() => {
    scene = makeMockScene();
    lm = new UILayoutManager(scene);
  });

  it('essential HUD elements are visible on registration', () => {
    const health = makeMockComponent();
    const psi = makeMockComponent();
    lm.registerComponent('healthBar', health, 'topBar', 'essential');
    lm.registerComponent('psiBar', psi, 'topBar', 'essential');
    expect(lm.isComponentVisible('healthBar')).toBe(true);
    expect(lm.isComponentVisible('psiBar')).toBe(true);
  });

  it('essential elements stay visible in minimal mode', () => {
    const health = makeMockComponent();
    const panel = makeMockComponent();
    lm.registerComponent('healthBar', health, 'topBar', 'essential');
    lm.registerComponent('inventory', panel, 'leftPanel', 'contextual');
    lm.setMode('minimal');
    expect(lm.isComponentVisible('healthBar')).toBe(true);
    expect(lm.isComponentVisible('inventory')).toBe(false);
  });

  it('contextual elements hidden in minimal mode', () => {
    const panel = makeMockComponent();
    lm.registerComponent('inv', panel, 'leftPanel', 'contextual');
    lm.setMode('minimal');
    expect(lm.isComponentVisible('inv')).toBe(false);
    expect(panel.setVisible).toHaveBeenCalledWith(false);
  });

  it('debug elements visible only in debug mode', () => {
    const dbg = makeMockComponent();
    lm.registerComponent('fpsCounter', dbg, 'topBar', 'debug');
    // standard mode: debug hidden
    expect(lm.isComponentVisible('fpsCounter')).toBe(false);
    lm.setMode('debug');
    expect(lm.isComponentVisible('fpsCounter')).toBe(true);
  });

  it('hideComponent / showComponent toggle visibility', () => {
    const comp = makeMockComponent();
    lm.registerComponent('minimap', comp, 'rightPanel', 'essential');
    expect(lm.isComponentVisible('minimap')).toBe(true);
    lm.hideComponent('minimap');
    expect(lm.isComponentVisible('minimap')).toBe(false);
    lm.showComponent('minimap');
    expect(lm.isComponentVisible('minimap')).toBe(true);
  });

  it('layout zones are correctly computed', () => {
    const layout = lm.getLayout();
    expect(layout.topBar.height).toBe(60);
    expect(layout.bottomBar.y).toBe(600 - 80);
    expect(layout.centerSafe.width).toBeGreaterThan(0);
    expect(layout.centerSafe.height).toBeGreaterThan(0);
  });

  it('all three modes show correct visibility set', () => {
    const e = makeMockComponent();
    const c = makeMockComponent();
    const d = makeMockComponent();
    lm.registerComponent('e', e, 'topBar', 'essential');
    lm.registerComponent('c', c, 'leftPanel', 'contextual');
    lm.registerComponent('d', d, 'bottomBar', 'debug');

    lm.setMode('minimal');
    expect(lm.isComponentVisible('e')).toBe(true);
    expect(lm.isComponentVisible('c')).toBe(false);
    expect(lm.isComponentVisible('d')).toBe(false);

    lm.setMode('standard');
    expect(lm.isComponentVisible('e')).toBe(true);
    expect(lm.isComponentVisible('c')).toBe(true);
    expect(lm.isComponentVisible('d')).toBe(false);

    lm.setMode('debug');
    expect(lm.isComponentVisible('e')).toBe(true);
    expect(lm.isComponentVisible('c')).toBe(true);
    expect(lm.isComponentVisible('d')).toBe(true);
  });
});
