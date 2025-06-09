import Phaser from 'phaser';

export interface LoreTerminalConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string;
  scale?: number;
  loreEntries: string[];
  onShowEntry?: (entry: string) => void;
}

export class LoreTerminal {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private promptText?: Phaser.GameObjects.Text;
  private loreEntries: string[];
  private currentEntryIndex: number = 0;
  private active: boolean = false;
  private onShowEntry?: (entry: string) => void;

  constructor(config: LoreTerminalConfig) {
    this.scene = config.scene;
    this.loreEntries = config.loreEntries;
    this.onShowEntry = config.onShowEntry;
    this.sprite = this.scene.physics.add.staticSprite(config.x, config.y, config.texture);
    if (config.scale) this.sprite.setScale(config.scale);
    this.scene.add.existing(this.sprite);
  }

  public handlePlayerOverlap() {
    if (!this.active) {
      this.active = true;
      if (!this.promptText) {
        this.promptText = this.scene.add.text(
          this.sprite.x,
          this.sprite.y - 40,
          'Press E to access Lore Terminal',
          { color: '#ffffff', fontSize: '14px', backgroundColor: '#222244', padding: { x: 8, y: 4 } }
        ).setOrigin(0.5, 1);
      }
    }
  }

  public handlePlayerExit() {
    this.active = false;
    if (this.promptText) {
      this.promptText.destroy();
      this.promptText = undefined;
    }
  }

  public handleInteract() {
    if (this.active && this.loreEntries.length > 0) {
      const entry = this.loreEntries[this.currentEntryIndex];
      if (this.onShowEntry) {
        this.onShowEntry(entry);
      } else {
        // Default: show as a popup text
        this.scene.add.text(
          this.sprite.x,
          this.sprite.y - 80,
          entry,
          { color: '#ffffcc', fontSize: '16px', backgroundColor: '#333366', padding: { x: 10, y: 6 }, wordWrap: { width: 320 } }
        ).setOrigin(0.5, 1).setDepth(1000).setScrollFactor(0);
      }
      // Cycle to next entry
      this.currentEntryIndex = (this.currentEntryIndex + 1) % this.loreEntries.length;
    }
  }

  public destroy() {
    this.sprite.destroy();
    if (this.promptText) this.promptText.destroy();
  }

  // TODO: Add support for dynamic lore sources (e.g., from datapack, mods, or online updates).
  // TODO: Implement search/filter for lore entries and player bookmarking.
  // TODO: Add accessibility features (e.g., text-to-speech, font scaling).
}
