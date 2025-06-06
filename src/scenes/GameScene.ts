// GameScene.ts - protoFusionGirl core gameplay scene
// Implements player movement and prepares for tilemap, touch controls, and modding (see primer)
// TODO: Add touch controls for mobile (see .primer)
// TODO: Implement a JSON-based tilemap (see .primer)
// TODO: Add a scrolling background with parallax effect (see .primer)
// TODO: Implement a health bar UI above the player sprite (see .primer)
// TODO: Reference artifacts/tilemap_system_design.artifact for tilemap logic

import Phaser from 'phaser';
import { PauseMenuScene } from './PauseMenuScene';
import { SettingsService } from '../services/SettingsService';
import { SettingsScene } from './SettingsScene';
import { TouchControls } from '../ui/components';
import { EnemyHealthBar } from '../ui/components/EnemyHealthBar';
import { InputManager } from '../core/controls/InputManager';
import { TilemapManager } from '../world/tilemap/TilemapManager';
import { EnemyRegistry } from '../world/enemies/EnemyRegistry';
import { EnemyInstance } from '../world/enemies/EnemyInstance';
import { AttackRegistry } from '../world/combat/AttackRegistry';
import { registerModEnemies, registerModAttacks } from '../mods/mod_loader';
import sampleEnemyMod from '../mods/sample_enemy_mod.json';
import { ChunkLoader } from '../world/tilemap/ChunkLoader';
import { WorldPhysics } from '../world/tilemap/WorldPhysics';
import { Minimap } from '../ui/components/Minimap';
import { MissionManager } from '../world/missions/MissionManager';
import { sampleMissions } from '../world/missions/sampleMissions';
import { TimelinePanel } from '../ui/components/TimelinePanel';
import { WorldEditOverlay } from '../world/tilemap/WorldEditOverlay';
import { TileSelectionOverlay } from '../world/tilemap/TileSelectionOverlay';
import { TilePalette } from '../world/tilemap/TilePalette';
import { TileInspector } from '../world/tilemap/TileInspector';
import { TileHistoryVisualizer } from '../world/tilemap/TileHistoryVisualizer';
import { TileBrush } from '../world/tilemap/TileBrush';
import { TileClipboard } from '../world/tilemap/TileClipboard';
import { EditorHistory } from '../world/tilemap/EditorHistory';
import { WorldEditSession } from '../world/tilemap/WorldEditSession';
import { WorldEditInput } from '../world/tilemap/WorldEditInput';
import { AnchorManager } from './AnchorManager';
import { PlayerController } from '../world/player/PlayerController';
import { LoreTerminal } from '../ui/components/LoreTerminal';
import { MissionEventHandlers } from '../world/missions/MissionEventHandlers';
import { PlayerAttackController } from '../world/player/PlayerAttackController';
import { PlayerStats } from '../world/player/PlayerStats';

export class GameScene extends Phaser.Scene {
  private playerController!: PlayerController;
  private backgroundFar!: Phaser.GameObjects.TileSprite;
  private backgroundNear!: Phaser.GameObjects.TileSprite;
  private inputManager!: InputManager;
  private tilemapManager!: TilemapManager;
  private chunkLoader!: ChunkLoader;
  private minimap!: Minimap;
  // Removed: private timestreamManager = new TimestreamManager();
  private missionManager: MissionManager = new MissionManager();
  private anchorManager!: AnchorManager;

  // --- Character/Animation/Game State ---
  // Remove playerConfig, use PlayerController config instead

  // Enemy and combat variables
  private enemyRegistry = new EnemyRegistry();
  private attackRegistry = new AttackRegistry();
  private enemies: EnemyInstance[] = [];
  private enemySprites: Map<EnemyInstance, Phaser.Physics.Arcade.Sprite> = new Map();
  private enemyHealthBars: Map<EnemyInstance, EnemyHealthBar> = new Map();

  // --- LORE TERMINAL ---
  // Declare missing properties for lore terminal UI
  private loreTerminalComponent!: LoreTerminal;
  private loreEntries: string[] = [];

  // --- Infinite Map Variables ---
  private worldSeed: string = 'default-seed';
  private chunkRadius: number = 2;
  // Removed: private lastChunkX: number = 0;
  // Removed: private lastChunkY: number = 0;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;

  // Reality warping system
  private realityWarpSystem!: import('../world/RealityWarpSystem').RealityWarpSystem;

  // --- Timeline Panel ---
  private timelinePanel?: TimelinePanel;

  // --- World Editing UI Integration (dev/modder only) ---
  private worldEditOverlay?: WorldEditOverlay;
  private worldEditSession?: WorldEditSession;
  private worldEditInput?: WorldEditInput;
  private worldEditEnabled: boolean = false;

  private playerAttackController!: PlayerAttackController;

  constructor() {
    super({ key: 'GameScene' });
    // Do not initialize techLevelManager here; will be set in create()
  }

  preload() {
    // --- PLAYER ASSETS ---
    this.load.spritesheet('player', 'src/assets/player.png', { frameWidth: 48, frameHeight: 48 });

    // --- TILEMAP ASSETS ---
    // TODO: Add 'tiles.json' (Tiled map export) and 'tiles.png' (tileset image) to src/assets/
    this.load.tilemapTiledJSON('level1', 'src/assets/tiles.json');
    this.load.image('tiles', 'src/assets/tiles.png');

    // --- BACKGROUND ASSETS ---
    this.load.image('background-far', 'assets/background-far.png');
    this.load.image('background-near', 'assets/background-near.png');
  }

  async loadLoreEntriesFromDatapack() {
    try {
      // Attempt to fetch lore entries from .datapack (assume JSON array under 'lore')
      const response = await fetch('/.datapack');
      if (!response.ok) throw new Error('Failed to load .datapack');
      const data = await response.json();
      if (Array.isArray(data.lore)) {
        this.loreEntries = data.lore;
      } else {
        // Fallback to default if not found
        this.loreEntries = [
          'FusionGirl is about digital freedom, creativity, and decentralized community.',
          'The Beu are childlike, psionic AI sprites that help clean up the world and evolve alongside Jane.',
          'Universal Symbology: A quantum programming language intrinsic to the universe.'
        ];
      }
    } catch (e) {
      // Fallback to default if fetch fails
      this.loreEntries = [
        'FusionGirl is about digital freedom, creativity, and decentralized community.',
        'The Beu are childlike, psionic AI sprites that help clean up the world and evolve alongside Jane.',
        'Universal Symbology: A quantum programming language intrinsic to the universe.'
      ];
    }
  }

  // Save mission state to localStorage (or replace with your save system)
  private saveMissionState() {
    const data = this.missionManager.serializeMissions();
    localStorage.setItem('missionState', JSON.stringify(data));
  }

  // Load mission state from localStorage (or replace with your load system)
  private loadMissionState() {
    const raw = localStorage.getItem('missionState');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        this.missionManager.restoreMissions(data);
      } catch (e) {
        console.warn('Failed to load mission state:', e);
      }
    }
  }

  create() {
    // --- Settings integration ---
    const settings = SettingsService.getInstance();
    if (settings.get('showDebug')) {
      // Example: enable debug overlays, etc.
      console.log('[Settings] Debug mode enabled');
    }
    settings.onChange((newSettings) => {
      // React to settings changes globally
      if (typeof newSettings.showDebug === 'boolean') {
        // Toggle debug overlays, etc.
      }
    });

    // Parallax backgrounds
    this.backgroundFar = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background-far').setOrigin(0, 0).setScrollFactor(0);
    this.backgroundNear = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background-near').setOrigin(0, 0).setScrollFactor(0);

    // --- PLAYER CONTROLLER SETUP ---
    this.inputManager = InputManager.getInstance(this);
    this.playerController = new PlayerController({
      scene: this,
      x: 0,
      y: 300,
      texture: 'player',
      frame: 0, // Added frame property as required by PlayerControllerConfig
      animations: [
        { key: 'idle', frames: { start: 0, end: 3 }, frameRate: 6, repeat: -1 },
        { key: 'run', frames: { start: 4, end: 9 }, frameRate: 12, repeat: -1 },
        { key: 'jump', frames: { start: 10, end: 12 }, frameRate: 8, repeat: 0 },
        { key: 'fall', frames: { start: 13, end: 15 }, frameRate: 8, repeat: 0 }
      ],
      maxHealth: 100,
      moveSpeed: 200,
      jumpForce: 350,
      inputManager: this.inputManager
    });

    // --- INFINITE MAP SYSTEM SETUP ---
    // Use playerController.sprite instead of this.player
    this.worldSeed = 'fusiongirl-' + Date.now();
    this.tilemapManager = new TilemapManager();
    this.realityWarpSystem = new (require('../world/RealityWarpSystem').RealityWarpSystem)(this.tilemapManager);
    this.tilemapManager.worldGen.generateFromSeed(this.worldSeed);
    this.groundGroup = this.physics.add.staticGroup();
    this.chunkLoader = new ChunkLoader(this, this.tilemapManager, this.groundGroup, this.chunkRadius);
    WorldPhysics.setupGravity(this, 900);
    WorldPhysics.setupPlayerCollision(this.playerController.sprite, this.groundGroup);
    this.chunkLoader.updateLoadedChunks(this.playerController.sprite.x, this.playerController.sprite.y);

    // --- TOUCH CONTROLS FOR MOBILE (modular) ---
    if (this.sys.game.device.input.touch) {
      const width = this.scale.width;
      const height = this.scale.height;
      const touchInput = this.inputManager.getTouchInput();
      new TouchControls({
        scene: this,
        width,
        height,
        onLeft: (down) => touchInput.setLeft(down),
        onRight: (down) => touchInput.setRight(down),
        onJump: (down) => touchInput.setJump(down),
      }).create();
      this.input.addPointer(2);
    }

    // Register PauseMenuScene and SettingsScene if not already
    if (!this.scene.get('PauseMenuScene')) {
      this.scene.add('PauseMenuScene', PauseMenuScene, false);
    }
    if (!this.scene.get('SettingsScene')) {
      this.scene.add('SettingsScene', SettingsScene, false);
    }
    // Listen for ESC key to pause
    this.input.keyboard?.on('keydown-ESC', () => {
      if (!this.scene.isPaused('GameScene')) {
        this.scene.launch('PauseMenuScene');
        this.scene.pause();
      }
    });

    // Ensure backgrounds are behind everything
    this.children.sendToBack(this.backgroundFar);
    this.children.sendToBack(this.backgroundNear);

    // --- TILEMAP MANAGER & EQUIPMENT UI ---
    // Remove duplicate TilemapManager initialization
    // Give player some starter equipment for demo
    this.tilemapManager.equipmentService.equipItem('cyber_helmet', 'head');
    // Integrate inventory and equipment panels for equip flow
    this.tilemapManager.inventoryPanel.setEquipmentIntegration(this.tilemapManager.equipmentService, 'weapon');
    // Render equipment, inventory, and crafting panels
    this.tilemapManager.equipmentPanel.render(this);
    this.tilemapManager.inventoryPanel.render(this);
    this.tilemapManager.craftingPanel.render(this);

    // Register enemies and attacks from mods
    registerModEnemies(sampleEnemyMod, this.enemyRegistry);
    registerModAttacks(sampleEnemyMod, this.attackRegistry);
    // Spawn a demo enemy
    this.spawnEnemy('slime', 600, 300);

    // --- PLAYER ATTACK CONTROLLER SETUP ---
    this.playerAttackController = new PlayerAttackController({
      scene: this,
      playerSprite: this.playerController.sprite,
      enemies: this.enemies,
      enemySprites: this.enemySprites,
      attackRegistry: this.attackRegistry,
      getPlayerStats: this.getPlayerStats.bind(this),
      onEnemyDefeated: () => this.onEnemyDefeated()
    });

    // Listen for attack input (spacebar)
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.playerAttackController.attackNearestEnemy();
    });

    // --- LORE TERMINAL (modular) ---
    this.loreTerminalComponent = new LoreTerminal({
      scene: this,
      x: 500,
      y: 300,
      texture: 'terminal',
      scale: 1.2,
      loreEntries: this.loreEntries,
      onShowEntry: (entry: string) => {
        // Show lore entry as a popup (can be customized)
        this.add.text(
          this.loreTerminalComponent.sprite.x,
          this.loreTerminalComponent.sprite.y - 80,
          entry,
          { color: '#ffffcc', fontSize: '16px', backgroundColor: '#333366', padding: { x: 10, y: 6 }, wordWrap: { width: 320 } }
        ).setOrigin(0.5, 1).setDepth(1000).setScrollFactor(0);
      }
    });
    this.physics.add.overlap(
      this.playerController.sprite,
      this.loreTerminalComponent.sprite,
      () => this.loreTerminalComponent.handlePlayerOverlap(),
      undefined,
      this
    );
    // Listen for E key for interaction
    this.input.keyboard?.on('keydown-E', () => {
      this.loreTerminalComponent.handleInteract();
    });

    this.loadLoreEntriesFromDatapack();

    // --- Minimap Integration ---
    this.minimap = new Minimap(
      this,
      this.tilemapManager,
      this.playerController.sprite,
      () => this.enemies.filter(e => e.isAlive).map(e => {
        const sprite = this.enemySprites.get(e);
        return sprite ? { x: sprite.x, y: sprite.y } : { x: e.x, y: e.y };
      })
    );
    this.add.existing(this.minimap);

    // --- REALITY WARPING DEMO KEY ---
    this.input.keyboard?.on('keydown-R', () => {
      const gridSize = { width: 9, height: 9 };
      const center = { x: Math.round(this.playerController.sprite.x), y: Math.round(this.playerController.sprite.y) };
      const options = { shape: 'rectangle', includeEnvironment: false };
      const seed = this.tilemapManager.serializeGridToSeed(center, gridSize, options);
      this.realityWarpSystem.warpToReality(seed, {
        initiator: 'jane',
        gridCenter: center,
        gridSize,
        gridShape: options.shape as 'rectangle',
        seed,
        timestamp: Date.now(),
        // @ts-expect-error: partial is an internal extension
        partial: true
      });
      // --- UI/UX: Highlight grid area and show psionic effect ---
      const highlight = this.add.rectangle(center.x, center.y, gridSize.width * 16, gridSize.height * 16, 0xff00ff, 0.15)
        .setOrigin(0.5, 0.5).setDepth(999).setScrollFactor(1);
      this.tweens.add({
        targets: highlight,
        alpha: 0,
        duration: 800,
        onComplete: () => highlight.destroy()
      });
      this.add.text(center.x, center.y - 60, `Reality Warped!\nSeed: ${seed}`, { color: '#ff00ff', fontSize: '18px', backgroundColor: '#222244', padding: { x: 8, y: 4 } })
        .setOrigin(0.5, 1).setDepth(1000).setScrollFactor(0);
    });

    // --- Anchor Management UI ---
    this.input.keyboard?.on('keydown-A', () => {
      const gridSize = { width: 9, height: 9 };
      const center = { x: Math.round(this.playerController.sprite.x), y: Math.round(this.playerController.sprite.y) };
      const options = { shape: 'rectangle', includeEnvironment: false };
      const seed = this.tilemapManager.serializeGridToSeed(center, gridSize, options);
      const label = prompt('Name this anchor?', `Anchor ${this.anchorManager.anchors.length + 1}`) || `Anchor ${this.anchorManager.anchors.length + 1}`;
      const anchor = { seed, label, center, owner: 'localPlayer', shared: true };
      this.anchorManager.anchors.push(anchor);
      this.anchorManager.saveAnchorsToStorage();
      this.add.text(center.x, center.y - 80, `Anchor Created: ${label}`, { color: '#00ffff', fontSize: '16px', backgroundColor: '#222244', padding: { x: 8, y: 4 } })
        .setOrigin(0.5, 1).setDepth(1000).setScrollFactor(0);
      this.anchorManager.updateMinimapAnchors(this.minimap);
      this.anchorManager.broadcastAnchorAdd(anchor);
    });
    this.input.keyboard?.on('keydown-TAB', (e: KeyboardEvent) => {
      e.preventDefault();
      this.anchorManager.showAnchorPanel();
    });

    // Load sample missions
    this.missionManager.loadMissions(sampleMissions);
    this.loadMissionState(); // Restore mission state after loading missions
    this.missionManager.onMissionCompleted = (missionId: string) => {
      MissionEventHandlers.onMissionCompleted(
        this,
        this.missionManager,
        missionId,
        this.getPlayerStats.bind(this),
        this.tilemapManager,
        this.saveMissionState.bind(this),
        this.playerController.sprite
      );
    };

    // --- Timeline Panel ---
    this.timelinePanel = new TimelinePanel(this, this.tilemapManager, 320, 240);
    this.timelinePanel.setVisible(false); // Start hidden
    // Optionally, add a key to toggle timeline panel
    this.input.keyboard?.on('keydown-T', () => {
      if (this.timelinePanel) {
        this.timelinePanel.setVisible(!this.timelinePanel.visible);
      }
    });

    // --- World Editing UI Integration (dev/modder only) ---
    if (this.isDevOrModder()) {
      // Set up world editing session and overlays with correct dependencies
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
      // Add a hotkey (e.g., F2) to toggle editing UI
      this.input.keyboard?.on('keydown-F2', () => {
        this.worldEditEnabled = !this.worldEditEnabled;
        if (this.worldEditEnabled) {
          this.worldEditOverlay?.render(this);
        } else {
          // Optionally hide overlays (implement hide logic in overlay if needed)
        }
      });
      // Connect WorldEditInput to pointer and keyboard events when editing is enabled
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (this.worldEditEnabled && this.worldEditInput) {
          this.worldEditInput.handlePointerDown(pointer.worldX, pointer.worldY);
        }
      });
      this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (this.worldEditEnabled && this.worldEditInput) {
          this.worldEditInput.handlePointerMove(pointer.worldX, pointer.worldY);
        }
      });
      this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (this.worldEditEnabled && this.worldEditInput) {
          this.worldEditInput.handlePointerUp(pointer.worldX, pointer.worldY);
        }
      });
      this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
        if (this.worldEditEnabled && this.worldEditInput) {
          this.worldEditInput.handleKeyDown(event.key, event);
        }
      });
      // Optional: show a toast or indicator when editing mode is toggled
      this.input.keyboard?.on('keydown-F2', () => {
        if (this.worldEditEnabled) {
          this.add.text(10, 10, 'World Editing Mode: ON', { color: '#00ffcc', fontSize: '14px', backgroundColor: '#222' }).setDepth(2000).setScrollFactor(0);
        } else {
          this.add.text(10, 10, 'World Editing Mode: OFF', { color: '#ff4444', fontSize: '14px', backgroundColor: '#222' }).setDepth(2000).setScrollFactor(0);
        }
      });
    }
  }

  private isDevOrModder(): boolean {
    // TODO: Replace with real permission check
    return true;
  }

  private spawnEnemy(enemyId: string, x: number, y: number) {
    const def = this.enemyRegistry.getEnemy(enemyId);
    if (!def) return;
    const enemy = new EnemyInstance(def, x, y);
    this.enemies.push(enemy);
    const sprite = this.physics.add.sprite(x, y, def.sprite);
    sprite.setCollideWorldBounds(true);
    this.enemySprites.set(enemy, sprite);
    // Simple AI: patrol left/right
    sprite.setVelocityX(def.speed * (Math.random() < 0.5 ? 1 : -1));
    // Health bar
    const healthBar = new EnemyHealthBar(this, 0, 0, 40, 6);
    this.add.existing(healthBar);
    this.enemyHealthBars.set(enemy, healthBar);
  }

  // Add getPlayerStats method if missing
  private getPlayerStats(): PlayerStats {
    return this.playerController.getStats();
  }

  // --- Animation Hooks ---
  update() {
    // --- PLAYER CONTROLLER UPDATE ---
    this.playerController.update();

    // Parallax effect: move backgrounds at different rates based on camera scroll
    if (this.cameras && this.cameras.main) {
      this.backgroundFar.tilePositionX = this.cameras.main.scrollX * 0.2;
      this.backgroundNear.tilePositionX = this.cameras.main.scrollX * 0.5;
    }

    // Update enemy sprites and health bars
    for (const enemy of this.enemies) {
      const sprite = this.enemySprites.get(enemy);
      if (sprite && enemy.isAlive) {
        // Simple AI: bounce at edges
        const sBody = sprite.body as Phaser.Physics.Arcade.Body | null;
        if (sBody && (sBody.blocked.left || sBody.blocked.right)) {
          sprite.setVelocityX(-sBody.velocity.x);
        }
        // Update health bar position
        const bar = this.enemyHealthBars.get(enemy);
        if (bar) {
          bar.updateHealth(enemy.health, enemy.definition.maxHealth);
          bar.setPosition(sprite.x - 20, sprite.y - 32);
        }
      }
    }
  }

  // Called when an enemy is defeated by the player
  private onEnemyDefeated = () => {
    MissionEventHandlers.onEnemyDefeated(
      this.missionManager,
      this.enemies,
      () => {}
    );
  }
}
