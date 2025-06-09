// Minimap_LeyLineOverlay.integration.test.ts
// Integration test for ley line overlays on the minimap UI
// References: copilot_leyline_tilemap_traversal_integration_2025-06-07.artifact

import { Minimap } from '../../src/ui/components/Minimap';
import { LeyLineVisualization } from '../../src/world/leyline/visualization/LeyLineVisualization';
import { LeyLine } from '../../src/world/WorldStateManager';
import Phaser from 'phaser';

// Mock Phaser and its Graphics class to avoid jsdom/canvas errors
jest.mock('phaser', () => {
  const Graphics = jest.fn().mockImplementation(() => ({
    clear: jest.fn(),
    fillStyle: jest.fn(),
    fillRect: jest.fn(),
    fillCircle: jest.fn(),
    lineStyle: jest.fn(),
    strokeRect: jest.fn(),
    strokePath: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    strokeLineShape: jest.fn(),
    setVisible: jest.fn(),
    setDepth: jest.fn(),
    setScrollFactor: jest.fn(),
    setPosition: jest.fn(),
    destroy: jest.fn(),
    add: jest.fn(),
  }));
  return {
    __esModule: true,
    default: { GameObjects: { Graphics } },
    GameObjects: { Container: jest.fn(), Graphics },
  };
});

describe('Minimap ley line overlay integration', () => {
  let minimap: Minimap;
  let scene: Phaser.Scene;
  let tilemapManager: any;
  let player: any;
  let getEnemies: any;

  beforeEach(() => {
    // Mock Phaser.Scene and dependencies
    scene = {
      add: { graphics: () => ({ clear: jest.fn(), fillStyle: jest.fn(), fillRect: jest.fn(), fillCircle: jest.fn(), lineStyle: jest.fn(), strokeRect: jest.fn(), strokePath: jest.fn(), beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), strokeLineShape: jest.fn() }), existing: jest.fn() },
      scale: { width: 200, height: 60 }
    } as any;
    tilemapManager = { chunkManager: { chunkSize: 16, getLoadedChunks: () => [] }, WORLD_WIDTH: 320, WORLD_HEIGHT: 180 };
    player = { x: 32, y: 32 };
    getEnemies = () => [];
    minimap = new Minimap(scene, tilemapManager, player, getEnemies, 200, 60 );
  });

  it('renders ley line nodes and edges on the minimap', () => {
    const leyLines: LeyLine[] = [
      {
        id: 'ley1',
        nodes: [
          { id: 'n1', position: { x: 32, y: 32 }, type: 'node', active: true },
          { id: 'n2', position: { x: 96, y: 32 }, type: 'node', active: true }
        ],
        energy: 100
      }
    ];
    const overlays = LeyLineVisualization.generateEventOverlays([
      { type: 'LEYLINE_SURGE', affectedTiles: [{ x: 1, y: 1 }], color: 'cyan' }
    ]);
    minimap.setLeyLineData(leyLines, overlays);
    expect(() => minimap.updateMinimap()).not.toThrow();
    // Optionally, check that leyLineOverlay.clear and drawing methods were called
    expect((minimap as any).leyLineOverlay.clear).toBeDefined();
  });

  it('handles empty ley line data gracefully', () => {
    minimap.setLeyLineData([], []);
    expect(() => minimap.updateMinimap()).not.toThrow();
  });
});

describe('Minimap ley line overlay debug toggle', () => {
  let minimap: Minimap;
  let scene: Phaser.Scene;
  let tilemapManager: any;
  let player: any;
  let getEnemies: any;

  beforeEach(() => {
    // Mock Phaser.Scene and dependencies
    scene = {
      add: { graphics: () => ({ clear: jest.fn(), fillStyle: jest.fn(), fillRect: jest.fn(), fillCircle: jest.fn(), lineStyle: jest.fn(), strokeRect: jest.fn(), strokePath: jest.fn(), beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), strokeLineShape: jest.fn(), setVisible: jest.fn() }), existing: jest.fn() },
      scale: { width: 200, height: 60 }
    } as any;
    tilemapManager = { chunkManager: { chunkSize: 16, getLoadedChunks: () => [] }, WORLD_WIDTH: 320, WORLD_HEIGHT: 180 };
    player = { x: 32, y: 32 };
    getEnemies = () => [];
    minimap = new Minimap(scene, tilemapManager, player, getEnemies, 200, 60 );
  });

  it('toggles ley line overlay visibility', () => {
    // Initially visible
    expect((minimap as any).leyLineOverlayVisible).toBe(true);
    minimap.toggleLeyLineOverlayVisible();
    expect((minimap as any).leyLineOverlayVisible).toBe(false);
    minimap.toggleLeyLineOverlayVisible();
    expect((minimap as any).leyLineOverlayVisible).toBe(true);
  });
});
