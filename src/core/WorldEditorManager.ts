import Phaser from 'phaser';
import { TileBrush } from '../world/tilemap/TileBrush';
import { TileClipboard } from '../world/tilemap/TileClipboard';
import { EditorHistory } from '../world/tilemap/EditorHistory';
import { TilePalette } from '../world/tilemap/TilePalette';
import { TileInspector } from '../world/tilemap/TileInspector';
import { TileSelectionOverlay } from '../world/tilemap/TileSelectionOverlay';
import { TileHistoryVisualizer } from '../world/tilemap/TileHistoryVisualizer';
import { WorldEditSession } from '../world/tilemap/WorldEditSession';
import { WorldEditOverlay } from '../world/tilemap/WorldEditOverlay';
import { WorldEditInput } from '../world/tilemap/WorldEditInput';

// WorldEditorManager.ts
// Manages world editing logic and overlays
// Artifact reference: copilot_chunk_replacement_api_proposal_2025-06-04.artifact

export class WorldEditorManager {
  private scene: Phaser.Scene;
  private tilemapManager: any;
  private worldEditSession?: WorldEditSession;
  private worldEditOverlay?: WorldEditOverlay;
  private worldEditInput?: WorldEditInput;
  private worldEditEnabled: boolean = false;

  constructor(scene: Phaser.Scene, tilemapManager: any) {
    this.scene = scene;
    this.tilemapManager = tilemapManager;
    this.setupWorldEditing();
  }

  private setupWorldEditing() {
    // Only enable for dev/modder
    if (typeof (this.scene as any).isDevOrModder === 'function' && (this.scene as any).isDevOrModder()) {
      const selection = new (require('../world/tilemap/WorldSelection').WorldSelection)();
      const brush = new TileBrush(this.tilemapManager);
      const clipboard = new TileClipboard();
      clipboard.setTilemapManager(this.tilemapManager);
      const history = new EditorHistory();
      const palette = new TilePalette(this.tilemapManager.tileRegistry);
      const inspector = new TileInspector(this.tilemapManager.tileRegistry);
      const selectionOverlay = new TileSelectionOverlay(selection);
      const historyVisualizer = new TileHistoryVisualizer(history);
      this.worldEditSession = new WorldEditSession(brush, clipboard, history, selection);
      this.worldEditOverlay = new WorldEditOverlay(selectionOverlay, palette, inspector, historyVisualizer);
      this.worldEditInput = new WorldEditInput(this.worldEditSession);

      // Hotkey to toggle editing UI
      this.scene.input.keyboard?.on('keydown-F2', () => {
        this.worldEditEnabled = !this.worldEditEnabled;
        if (this.worldEditEnabled) {
          this.worldEditOverlay?.render(this.scene);
        }
      });
      // Pointer and keyboard event handling
      this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (this.worldEditEnabled && this.worldEditInput) {
          this.worldEditInput.handlePointerDown(pointer.worldX, pointer.worldY);
        }
      });
      this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (this.worldEditEnabled && this.worldEditInput) {
          this.worldEditInput.handlePointerMove(pointer.worldX, pointer.worldY);
        }
      });
      this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (this.worldEditEnabled && this.worldEditInput) {
          this.worldEditInput.handlePointerUp(pointer.worldX, pointer.worldY);
        }
      });
      this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
        if (this.worldEditEnabled && this.worldEditInput) {
          this.worldEditInput.handleKeyDown(event.key, event);
        }
      });
      // Toast/indicator for editing mode
      this.scene.input.keyboard?.on('keydown-F2', () => {
        if (this.worldEditEnabled) {
          this.scene.add.text(10, 10, 'World Editing Mode: ON', { color: '#00ffcc', fontSize: '14px', backgroundColor: '#222' }).setDepth(2000).setScrollFactor(0);
        } else {
          this.scene.add.text(10, 10, 'World Editing Mode: OFF', { color: '#ff4444', fontSize: '14px', backgroundColor: '#222' }).setDepth(2000).setScrollFactor(0);
        }
      });
    }
  }
}
