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
import { HealthBar, TouchControls } from '../ui/components';
import { EnemyHealthBar } from '../ui/components/EnemyHealthBar';
import { DamageNumber } from '../ui/components/DamageNumber';
import { InputManager } from '../core/controls/InputManager';
import { TilemapManager } from '../world/tilemap/TilemapManager';
import { EnemyRegistry } from '../world/enemies/EnemyRegistry';
import { EnemyInstance } from '../world/enemies/EnemyInstance';
import { AttackRegistry } from '../world/combat/AttackRegistry';
import { CombatService } from '../world/combat/CombatService';
import { registerModEnemies, registerModAttacks } from '../mods/mod_loader';
import sampleEnemyMod from '../mods/sample_enemy_mod.json';
import { PlayerStats } from '../world/player/PlayerStats';
import { QuestState, sampleQuest, QuestDefinition } from '../world/quest/QuestPrototype';
import { ChunkLoader } from '../world/tilemap/ChunkLoader';
import { WorldPhysics } from '../world/tilemap/WorldPhysics';
import { Minimap } from '../ui/components/Minimap';
import { AnchorSyncService, SharedAnchor, AnchorSyncEvent } from '../services/AnchorSyncService';
import { TechLevelManager } from '../world/tech/TechLevelManager';
import type { TechLevel } from '../world/tech/TechLevel';
import techLevelsData from '../world/tech/tech_levels.json';
import { TimestreamManager, WarpZoneManager, TimeMapVisualizer } from '../world/timestream';
import { MissionManager } from '../world/missions/MissionManager';
import { sampleMissions } from '../world/missions/sampleMissions';
import { MissionTracker } from '../ui/components/MissionTracker';
import { AnchorTradeOfferModal } from '../ui/components';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private backgroundFar!: Phaser.GameObjects.TileSprite;
  private backgroundNear!: Phaser.GameObjects.TileSprite;
  private playerHealth: number = 100;
  private maxHealth: number = 100;
  private healthBarComponent!: HealthBar;
  private moveSpeed = 200;
  private jumpForce = 350;
  private inputManager!: InputManager;
  private tilemapManager!: TilemapManager;
  private chunkLoader!: ChunkLoader;
  private minimap!: Minimap;
  private techLevelManager!: TechLevelManager;
  private timestreamManager = new TimestreamManager();
  private warpZoneManager = new WarpZoneManager();
  private timeMapVisualizer = new TimeMapVisualizer();
  private missionManager: MissionManager = new MissionManager();

  // --- Player State Machine ---
  private playerState: 'idle' | 'running' | 'jumping' | 'falling' = 'idle';
  private lastPlayerState: typeof this.playerState = 'idle';

  // --- Character/Animation/Game State ---
  private playerConfig = {
    // Spawn at the world seam (tile 0, ground level)
    startX: 0, // Seam position
    startY: 300, // TODO: Set to ground/water level based on tilemap
    texture: 'player',
    frame: 0,
    animations: [
      { key: 'idle', frames: { start: 0, end: 3 }, frameRate: 6, repeat: -1 },
      { key: 'run', frames: { start: 4, end: 9 }, frameRate: 12, repeat: -1 },
      { key: 'jump', frames: { start: 10, end: 12 }, frameRate: 8, repeat: 0 },
      { key: 'fall', frames: { start: 13, end: 15 }, frameRate: 8, repeat: 0 }
    ]
  };

  // Enemy and combat variables
  private enemyRegistry = new EnemyRegistry();
  private attackRegistry = new AttackRegistry();
  private enemies: EnemyInstance[] = [];
  private enemySprites: Map<EnemyInstance, Phaser.Physics.Arcade.Sprite> = new Map();
  private enemyHealthBars: Map<EnemyInstance, EnemyHealthBar> = new Map();

  private _playerStats?: PlayerStats;

  // Quest state
  private questState = new QuestState();
  private currentQuest: QuestDefinition | null = null;

  // --- LORE TERMINAL ---
  // Declare missing properties for lore terminal UI
  private loreTerminal!: Phaser.Physics.Arcade.Sprite;
  private loreTextBox?: Phaser.GameObjects.Text;
  private loreEntries: string[] = [];
  private loreTerminalActive: boolean = false;

  // Fix type for overlap callback to match Phaser's ArcadePhysicsCallback signature
  private onLoreTerminalOverlap = (_obj1: Phaser.GameObjects.GameObject, _obj2: Phaser.GameObjects.GameObject) => {
    // Only show prompt if not already active
    if (!this.loreTerminalActive) {
      this.loreTerminalActive = true;
      if (!this.loreTextBox) {
        this.loreTextBox = this.add.text(
          this.loreTerminal.x,
          this.loreTerminal.y - 40,
          'Press E to access Lore Terminal',
          { color: '#ffffff', fontSize: '14px', backgroundColor: '#222244', padding: { x: 8, y: 4 } }
        ).setOrigin(0.5, 1);
      }
    }
  };

  // --- Infinite Map Variables ---
  private worldSeed: string = 'default-seed';
  private chunkRadius: number = 2;
  private lastChunkX: number = 0;
  private lastChunkY: number = 0;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;

  // Reality warping system
  private realityWarpSystem!: import('../world/RealityWarpSystem').RealityWarpSystem;

  // --- Anchor Management UI ---
  private anchors: { seed: string, label: string, center: { x: number, y: number }, owner?: string, shared?: boolean }[] = [];
  private anchorPanel?: Phaser.GameObjects.DOMElement;
  private anchorSync?: AnchorSyncService;
  private playerId: string = AnchorSyncService.generatePlayerId();

  // --- Anchor Trading State ---
  private anchorTradeState: 'idle' | 'offering' | 'awaiting_response' | 'received_offer' | 'reviewing_offers' = 'idle';
  private lastAnchorTradeEvent?: AnchorSyncEvent;
  private anchorTradeOfferQueue: AnchorSyncEvent[] = [];

  // --- Anchor Trade Modal Instance ---
  private anchorTradeOfferModal?: any;

  private setAnchorTradeState(state: 'idle' | 'offering' | 'awaiting_response' | 'received_offer' | 'reviewing_offers', event?: AnchorSyncEvent) {
    this.anchorTradeState = state;
    this.lastAnchorTradeEvent = event;
    // Optionally update UI or trigger state-dependent logic here
    if (state === 'reviewing_offers') {
      this.showAnchorTradeOfferQueue();
    }
  }

  private showAnchorTradeOfferQueue() {
    if (this.anchorTradeOfferQueue.length === 0) {
      // No pending offers
      this.setAnchorTradeState('idle');
      return;
    }
    const offer = this.anchorTradeOfferQueue[0];
    // Use AnchorTradeOfferModal for UI
    if (this.anchorTradeOfferModal) this.anchorTradeOfferModal.destroy();
    this.anchorTradeOfferModal = new AnchorTradeOfferModal({
      scene: this,
      offer: { from: (offer as any).from, anchor: (offer as any).anchor },
      onAccept: () => this.acceptAnchorTradeOffer(offer),
      onReject: () => this.rejectAnchorTradeOffer(offer)
    });
    this.anchorTradeOfferModal.show();
  }

  private acceptAnchorTradeOffer(offer: any) {
    this.anchorSync?.sendEvent({
      type: 'trade_accept',
      anchor: offer.anchor,
      from: this.playerId,
      to: offer.from
    });
    this.anchors.push({ ...offer.anchor });
    this.saveAnchorsToStorage();
    this.updateMinimapAnchors();
    this.anchorTradeOfferQueue.shift();
    this.setAnchorTradeState(this.anchorTradeOfferQueue.length > 0 ? 'reviewing_offers' : 'idle');
    this.missionManager.triggerEventForAllMissions('anchor_trade_completed', { with: offer.from });
    this.grantAnchorTradeReward();
    // Optionally: add to trade history, play sound, etc.
  }

  private rejectAnchorTradeOffer(offer: any) {
    this.anchorSync?.sendEvent({
      type: 'trade_reject',
      anchor: offer.anchor,
      from: this.playerId,
      to: offer.from
    });
    this.anchorTradeOfferQueue.shift();
    this.setAnchorTradeState(this.anchorTradeOfferQueue.length > 0 ? 'reviewing_offers' : 'idle');
    // Optionally: add to trade history, play sound, etc.
  }

  private setupAnchorSync() {
    this.anchorSync = new AnchorSyncService(this.playerId);
    this.anchorSync.onEvent((event: AnchorSyncEvent) => {
      if (event.type === 'add') {
        // Avoid duplicate anchors by seed
        if (!this.anchors.some(a => a.seed === event.anchor.seed)) {
          this.anchors.push({ ...event.anchor });
          this.saveAnchorsToStorage();
          this.updateMinimapAnchors();
        }
      } else if (event.type === 'edit') {
        const anchor = this.anchors.find(a => a.seed === event.seed);
        if (anchor) {
          anchor.label = event.label;
          this.saveAnchorsToStorage();
          this.updateMinimapAnchors();
        }
      } else if (event.type === 'delete') {
        const idx = this.anchors.findIndex(a => a.seed === event.seed);
        if (idx !== -1) {
          this.anchors.splice(idx, 1);
          this.saveAnchorsToStorage();
          this.updateMinimapAnchors();
        }
      } else if (event.type === 'trade_offer' && event.to === this.playerId) {
        this.anchorTradeOfferQueue.push(event);
        if (this.anchorTradeState === 'idle') {
          this.setAnchorTradeState('reviewing_offers');
        }
        this.missionManager.triggerEventForAllMissions('anchor_trade_offer_received', { from: event.from });
      } else if (event.type === 'trade_accept' && event.to === this.playerId) {
        this.setAnchorTradeState('idle', event);
        this.missionManager.triggerEventForAllMissions('anchor_trade_completed', { with: event.from });
        alert(`Player ${event.from} accepted your anchor trade for '${event.anchor.label}'.`);
      } else if (event.type === 'trade_reject' && event.to === this.playerId) {
        this.setAnchorTradeState('idle', event);
        alert(`Player ${event.from} rejected your anchor trade for '${event.anchor.label}'.`);
      }
    });
  }

  private broadcastAnchorAdd(anchor: { seed: string, label: string, center: { x: number, y: number } }) {
    if (this.anchorSync) {
      this.anchorSync.sendEvent({
        type: 'add',
        anchor: { ...anchor, owner: this.playerId, shared: true }
      });
    }
  }
  private broadcastAnchorEdit(seed: string, label: string) {
    if (this.anchorSync) {
      this.anchorSync.sendEvent({ type: 'edit', seed, label });
    }
  }
  private broadcastAnchorDelete(seed: string) {
    if (this.anchorSync) {
      this.anchorSync.sendEvent({ type: 'delete', seed });
    }
  }

  private pendingAnchorTrade?: { anchor: any, toPlayerId: string };

  private offerAnchorTrade(anchorIdx: number, toPlayerId: string) {
    if (!this.anchorSync) return;
    const anchor = this.anchors[anchorIdx];
    if (!anchor) return;
    const sharedAnchor = {
      seed: anchor.seed,
      label: anchor.label,
      center: anchor.center,
      owner: anchor.owner || this.playerId,
      shared: true as const
    };
    this.anchorSync.sendEvent({
      type: 'trade_offer',
      anchor: sharedAnchor,
      from: this.playerId,
      to: toPlayerId
    });
    this.setAnchorTradeState('awaiting_response');
    // Mission system: progress a mission if player offers a trade
    this.missionManager.triggerEventForAllMissions('anchor_trade_offered', { to: toPlayerId });
    alert('Trade offer sent!');
  }

  private acceptAnchorTrade(trade: { anchor: any, fromPlayerId: string }) {
    if (!this.anchorSync) return;
    this.anchorSync.sendEvent({
      type: 'trade_accept',
      anchor: trade.anchor,
      from: this.playerId,
      to: trade.fromPlayerId
    });
    this.anchors.push({ ...trade.anchor });
    this.saveAnchorsToStorage();
    this.updateMinimapAnchors();
    alert('Anchor trade accepted!');
  }

  private showAnchorPanel() {
    if (this.anchorPanel) {
      this.anchorPanel.setVisible(true);
      return;
    }
    // Create a simple HTML UI for anchor management with edit/delete
    const html = `
      <div style="background:#222244;color:#fff;padding:12px;border-radius:8px;width:260px;max-height:320px;overflow:auto;">
        <h4>Reality Anchors</h4>
        <button id='import-anchor-btn' style='margin-bottom:8px;width:100%;'>Import Shared Anchor</button>
        <ul style='list-style:none;padding:0;margin:0;'>
          ${this.anchors.map((a, i) => `
            <li style='margin-bottom:8px;'>
              <button data-anchor='${i}' style='width:40%;margin-bottom:2px;'>${a.label} <span style='font-size:10px;color:#aaa;'>[${a.owner || 'local'}]</span></button>
              <button data-edit='${i}' style='width:10%;margin-left:2px;'>✎</button>
              <button data-delete='${i}' style='width:10%;margin-left:2px;color:#ff4444;'>🗑</button>
              <button data-export='${i}' style='width:15%;margin-left:2px;'>Share</button>
              <button data-trade='${i}' style='width:20%;margin-left:2px;'>Offer Trade</button>
            </li>`).join('')}
        </ul>
        <button id='close-anchor-panel' style='margin-top:8px;width:100%;'>Close</button>
      </div>
    `;
    this.anchorPanel = this.add.dom(this.scale.width - 280, 60).createFromHTML(html).setDepth(2000).setScrollFactor(0);
    this.anchorPanel.addListener('click');
    this.anchorPanel.on('click', (event: any) => {
      if (event.target.id === 'close-anchor-panel') {
        this.anchorPanel?.setVisible(false);
      } else if (event.target.id === 'import-anchor-btn') {
        this.importAnchor();
      } else if (event.target.dataset && event.target.dataset.anchor) {
        const idx = parseInt(event.target.dataset.anchor, 10);
        const anchor = this.anchors[idx];
        if (anchor) {
          this.realityWarpSystem.warpToReality(anchor.seed, {
            initiator: 'anchor',
            gridCenter: anchor.center,
            gridSize: { width: 9, height: 9 },
            gridShape: 'rectangle',
            seed: anchor.seed,
            timestamp: Date.now(),
            // @ts-expect-error: partial is an internal extension
            partial: true
          });
          this.add.text(anchor.center.x, anchor.center.y - 60, `Warped to Anchor: ${anchor.label}`, { color: '#00ffff', fontSize: '16px', backgroundColor: '#222244', padding: { x: 8, y: 4 } })
            .setOrigin(0.5, 1).setDepth(1000).setScrollFactor(0);
        }
      } else if (event.target.dataset && event.target.dataset.edit) {
        const idx = parseInt(event.target.dataset.edit, 10);
        const anchor = this.anchors[idx];
        if (anchor) {
          const newLabel = prompt('Rename anchor:', anchor.label) || anchor.label;
          anchor.label = newLabel;
          this.saveAnchorsToStorage();
          this.updateMinimapAnchors();
          this.broadcastAnchorEdit(anchor.seed, newLabel);
        }
      } else if (event.target.dataset && event.target.dataset.delete) {
        const idx = parseInt(event.target.dataset.delete, 10);
        const anchor = this.anchors[idx];
        if (anchor && confirm('Delete this anchor?')) {
          this.anchors.splice(idx, 1);
          this.saveAnchorsToStorage();
          this.updateMinimapAnchors();
          this.broadcastAnchorDelete(anchor.seed);
        }
      } else if (event.target.dataset && event.target.dataset.export) {
        const idx = parseInt(event.target.dataset.export, 10);
        this.exportAnchor(idx);
      } else if (event.target.dataset && event.target.dataset.trade) {
        const idx = parseInt(event.target.dataset.trade, 10);
        // TODO: Prompt for player ID to trade with (for demo, use prompt)
        const toPlayerId = prompt('Enter Player ID to trade with:');
        if (toPlayerId) {
          this.offerAnchorTrade(idx, toPlayerId);
        }
      }
    });
  }

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

    // --- PLAYER ANIMATIONS ---
    this.createPlayerAnimations();
    // --- Create player sprite ---
    this.player = this.physics.add.sprite(
      this.playerConfig.startX,
      this.playerConfig.startY,
      this.playerConfig.texture,
      this.playerConfig.frame
    );
    this.player.setCollideWorldBounds(true);

    // --- INPUT MANAGER SETUP ---
    this.inputManager = InputManager.getInstance(this);

    // --- INFINITE MAP SYSTEM SETUP ---
    // Only initialize TilemapManager once
    this.worldSeed = 'fusiongirl-' + Date.now(); // Or use a user-provided seed
    this.tilemapManager = new TilemapManager();
    this.realityWarpSystem = new (require('../world/RealityWarpSystem').RealityWarpSystem)(this.tilemapManager);
    this.tilemapManager.worldGen.generateFromSeed(this.worldSeed);
    this.groundGroup = this.physics.add.staticGroup();
    this.chunkLoader = new ChunkLoader(this, this.tilemapManager, this.groundGroup, this.chunkRadius);
    WorldPhysics.setupGravity(this, 900);
    WorldPhysics.setupPlayerCollision(this.player, this.groundGroup);
    this.chunkLoader.updateLoadedChunks(this.player.x, this.player.y);

    // Health bar UI above player (modular)
    this.healthBarComponent = new HealthBar({
      scene: this,
      x: 0,
      y: 0,
      max: this.maxHealth,
      value: this.playerHealth
    });
    this.healthBarComponent.create();

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

    // Listen for attack input (spacebar)
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.playerAttackNearestEnemy();
    });

    // Start the sample quest for prototype
    this.currentQuest = sampleQuest;
    this.questState.startQuest(this.currentQuest);

    // --- LORE TERMINAL ---
    this.loreTerminal = this.physics.add.staticSprite(500, 300, 'terminal'); // Add terminal sprite asset to assets folder
    this.loreTerminal.setScale(1.2);
    this.add.existing(this.loreTerminal);
    // Fix overlap callback signature for Phaser ArcadePhysics
    this.physics.add.overlap(
      this.player,
      this.loreTerminal,
      // Use a function with correct ArcadePhysicsCallback signature
      (_obj1: Phaser.GameObjects.GameObject | Phaser.Tilemaps.Tile, _obj2: Phaser.GameObjects.GameObject | Phaser.Tilemaps.Tile) => {
        // Only show prompt if not already active
        if (!this.loreTerminalActive) {
          this.loreTerminalActive = true;
          if (!this.loreTextBox) {
            this.loreTextBox = this.add.text(
              this.loreTerminal.x,
              this.loreTerminal.y - 40,
              'Press E to access Lore Terminal',
              { color: '#ffffff', fontSize: '14px', backgroundColor: '#222244', padding: { x: 8, y: 4 } }
            ).setOrigin(0.5, 1);
          }
        }
      },
      undefined,
      this
    );
    // Listen for E key for interaction
    this.input.keyboard?.on('keydown-E', () => {
      if (this.loreTerminalActive) {
        this.showLoreEntry();
      }
    });

    this.loadLoreEntriesFromDatapack();

    // --- Minimap Integration ---
    this.minimap = new Minimap(
      this,
      this.tilemapManager,
      this.player,
      () => this.enemies.filter(e => e.isAlive).map(e => {
        const sprite = this.enemySprites.get(e);
        return sprite ? { x: sprite.x, y: sprite.y } : { x: e.x, y: e.y };
      })
    );
    this.add.existing(this.minimap);

    // --- REALITY WARPING DEMO KEY ---
    this.input.keyboard?.on('keydown-R', () => {
      const gridSize = { width: 9, height: 9 };
      const center = { x: Math.round(this.player.x), y: Math.round(this.player.y) };
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
      const center = { x: Math.round(this.player.x), y: Math.round(this.player.y) };
      const options = { shape: 'rectangle', includeEnvironment: false };
      const seed = this.tilemapManager.serializeGridToSeed(center, gridSize, options);
      const label = prompt('Name this anchor?', `Anchor ${this.anchors.length + 1}`) || `Anchor ${this.anchors.length + 1}`;
      const anchor = { seed, label, center, owner: this.playerId, shared: true };
      this.anchors.push(anchor);
      this.saveAnchorsToStorage();
      this.add.text(center.x, center.y - 80, `Anchor Created: ${label}`, { color: '#00ffff', fontSize: '16px', backgroundColor: '#222244', padding: { x: 8, y: 4 } })
        .setOrigin(0.5, 1).setDepth(1000).setScrollFactor(0);
      this.updateMinimapAnchors();
      this.broadcastAnchorAdd(anchor);
    });
    this.input.keyboard?.on('keydown-TAB', (e: KeyboardEvent) => {
      e.preventDefault();
      this.showAnchorPanel();
    });

    // Initialize TechLevelManager with player's current tech level if available
    this.techLevelManager = new TechLevelManager(
      techLevelsData as TechLevel[],
      this._playerStats ? this._playerStats.getTechLevelId() : 'neolithic'
    );

    // --- TimeMapVisualizer Overlay Integration ---
    this.input.keyboard?.on('keydown-Y', () => {
      this.timeMapOverlayVisible = !this.timeMapOverlayVisible;
      if (this.timeMapOverlayVisible) {
        // Generate a sample time map from the current timestream state
        const map = this.generateCurrentTimeMap();
        // Assume player is on the root timeline for now
        const playerNodeId = map.nodes.find(n => n.type === 'timeline')?.id;
        this.timeMapVisualizer.renderOverlay(this, map, playerNodeId);
      } else if (this.timeMapVisualizer['overlayGroup']) {
        this.timeMapVisualizer['overlayGroup'].setVisible(false);
      }
    });

    // Load sample missions
    this.missionManager.loadMissions(sampleMissions);
    this.loadMissionState(); // Restore mission state after loading missions
    this.missionManager.onMissionCompleted = (missionId: string) => {
      this.grantMissionRewards(missionId);
      this.saveMissionState(); // Save after mission completion
      // UI feedback: show mission complete notification
      const mission = this.missionManager.getMission(missionId);
      if (mission) {
        this.add.text(
          this.player.x,
          this.player.y - 100,
          `Mission Complete: ${mission.title}`,
          { color: '#00ff88', fontSize: '20px', backgroundColor: '#222244', padding: { x: 12, y: 6 } }
        )
        .setOrigin(0.5, 1)
        .setDepth(2000)
        .setScrollFactor(0)
        .setAlpha(1);
        // Fade out and destroy after 2 seconds
        this.tweens.add({
          targets: this.children.getChildren().slice(-1)[0],
          alpha: 0,
          duration: 2000,
          onComplete: (tween, targets) => targets[0].destroy()
        });
      }
    };
  }

  /**
   * Generate a sample time map from the current timestream/timeline state.
   * This should be replaced with real logic as the game state evolves.
   */
  private generateCurrentTimeMap() {
    // For now, just show the root timeline and any branches
    const ts = Array.from(this.timestreamManager['timestreams'].values())[0];
    if (!ts) return { nodes: [], edges: [] };
    const nodes = [
      { id: ts.id, type: 'timestream' as const, ref: ts },
      { id: ts.rootTimeline.id, type: 'timeline' as const, ref: ts.rootTimeline },
      ...ts.branches.map(b => ({ id: b.id, type: 'timeline' as const, ref: b }))
    ];
    const edges = [
      { from: ts.id, to: ts.rootTimeline.id, type: 'root' },
      ...ts.branches.map(b => ({ from: ts.rootTimeline.id, to: b.id, type: 'branch' }))
    ];
    return { nodes, edges };
  }

  getCurrentTechLevel() {
    return this.techLevelManager.getCurrentTechLevel();
  }

  getCurrentTechUnlocks() {
    return this.techLevelManager.getUnlocks();
  }

  private createPlayerAnimations() {
    for (const anim of this.playerConfig.animations) {
      if (!this.anims.exists(anim.key)) {
        this.anims.create({
          key: anim.key,
          frames: this.anims.generateFrameNumbers('player', anim.frames),
          frameRate: anim.frameRate,
          repeat: anim.repeat
        });
      }
    }
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

  private playerAttackNearestEnemy() {
    if (this.enemies.length === 0) return;
    // Find nearest alive enemy
    const px = this.player.x, py = this.player.y;
    let nearest: EnemyInstance | null = null;
    let minDist = Infinity;
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      const sprite = this.enemySprites.get(enemy);
      if (!sprite) continue;
      const dx = sprite.x - px, dy = sprite.y - py;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minDist && dist < 60) { // 60px attack range
        minDist = dist;
        nearest = enemy;
      }
    }
    if (!nearest) return;
    // Use first attack from registry (or fallback)
    const attack = this.attackRegistry.getAttack('slime_bounce') || { id: 'basic', name: 'Punch', type: 'melee', damage: 5, range: 60, cooldown: 0.5 };
    const playerStats = this.getPlayerStats();
    const damage = CombatService.playerAttackEnemy(playerStats, nearest, attack);
    // Show damage number
    const sprite = this.enemySprites.get(nearest);
    if (sprite) {
      const damageText = new DamageNumber(this, sprite.x, sprite.y - 20, damage);
      damageText.setOrigin(0.5, 0);
      this.add.existing(damageText);
      // Fix: DamageNumber.play may not exist, use scene's animation system or remove if not needed
      // Replace or comment out damageText.play('damage_floating');
    }
    // --- Connect quest progress to enemy defeat ---
    if (!nearest.isAlive) {
      this.onEnemyDefeated();
    }
  }

  private getPlayerStats(): PlayerStats {
    // Use the tilemapManager's equipmentService for stat calculation
    if (!this._playerStats) {
      this._playerStats = new PlayerStats(
        { health: this.playerHealth, attack: 5, defense: 2, speed: 100 },
        this.tilemapManager.equipmentService
      );
    }
    // Sync health
    this._playerStats.setBaseStats({
      health: this.playerHealth,
      attack: 5,
      defense: 2,
      speed: 100
    });
    return this._playerStats;
  }

  private canJump(): boolean {
    const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
    return !!body && body.blocked && (body.blocked.down as boolean);
  }

  update() {
    // --- Robust input: allow for future expansion (multiplayer, rebinding, etc.) ---
    const direction = this.inputManager.getDirection();
    this.player.setVelocityX(direction * this.moveSpeed);

    // State machine: determine state
    const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
    const onGround = !!body && body.blocked && (body.blocked.down as boolean);
    const isMoving = direction !== 0;
    const isJumpPressed = this.inputManager.isJumpPressed();

    if (onGround) {
      if (isJumpPressed && this.canJump()) {
        this.player.setVelocityY(-this.jumpForce);
        this.playerState = 'jumping';
      } else if (isMoving) {
        this.playerState = 'running';
      } else {
        this.playerState = 'idle';
      }
    } else {
      if (body && body.velocity.y < 0) {
        this.playerState = 'jumping';
      } else {
        this.playerState = 'falling';
      }
    }

    // --- Animation Hooks ---
    if (this.playerState !== this.lastPlayerState) {
      switch (this.playerState) {
        case 'idle':
          this.player.play('idle', true);
          break;
        case 'running':
          this.player.play('run', true);
          break;
        case 'jumping':
          this.player.play('jump', true);
          break;
        case 'falling':
          this.player.play('fall', true);
          break;
      }
      this.lastPlayerState = this.playerState;
    }

    // Parallax effect: move backgrounds at different rates based on camera scroll
    if (this.cameras && this.cameras.main) {
      this.backgroundFar.tilePositionX = this.cameras.main.scrollX * 0.2;
      this.backgroundNear.tilePositionX = this.cameras.main.scrollX * 0.5;
    }

    // Update health bar position above player (modular)
    if (this.player && this.healthBarComponent) {
      this.healthBarComponent.update(this.player.x, this.player.y - 34, this.playerHealth);
    }

    // Update enemy sprites and health bars
    for (const enemy of this.enemies) {
      const sprite = this.enemySprites.get(enemy);
      const bar = this.enemyHealthBars.get(enemy);
      if (sprite && enemy.isAlive) {
        // Simple AI: bounce at edges
        const sBody = sprite.body as Phaser.Physics.Arcade.Body | null;
        if (sBody && (sBody.blocked.left || sBody.blocked.right)) {
          sprite.setVelocityX(-sBody.velocity.x);
        }
        // Update health bar position
        if (bar) bar.updateHealth(enemy.health, enemy.definition.maxHealth);
        if (bar) bar.setPosition(sprite.x - 20, sprite.y - 32);
      }
    }

    // Reset lore terminal prompt if player moves away
    if (this.loreTerminal && this.player) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.loreTerminal.x, this.loreTerminal.y);
      if (dist > 64 && this.loreTerminalActive) {
        if (this.loreTextBox) {
          this.loreTextBox.destroy();
          this.loreTextBox = undefined;
        }
        this.loreTerminalActive = false;
      }
    }

    // --- Infinite Map Chunk Streaming ---
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const playerChunkX = Math.floor(this.player.x / (chunkSize * 16));
    const playerChunkY = Math.floor(this.player.y / (chunkSize * 16));
    if (playerChunkX !== this.lastChunkX || playerChunkY !== this.lastChunkY) {
      this.lastChunkX = playerChunkX;
      this.lastChunkY = playerChunkY;
      this.chunkLoader.updateLoadedChunks(this.player.x, this.player.y);
    }

    // --- Seamless World Looping (Horizontal Torus) ---
    // Wrap player X position at world seam using TilemapManager.wrapX
    this.player.x = TilemapManager.wrapX(this.player.x);
    // Camera: center on player, handle wrap
    if (this.cameras && this.cameras.main) {
      // If player is near the seam, allow camera to wrap
      let camX = this.player.x;
      if (camX < 0) camX += 800; // TODO: Use actual world width
      else if (camX > 800) camX -= 800;
      this.cameras.main.setScroll(camX - 400, this.player.y - 300); // Center camera on player
    }

    // Update minimap
    if (this.minimap) {
      this.minimap.updateMinimap();
    }

    // Anchor trading state machine integration
    switch (this.anchorTradeState) {
      case 'reviewing_offers':
        // Optionally, show a UI or highlight for pending offers
        break;
      case 'awaiting_response':
        // Optionally, show a waiting indicator
        break;
      case 'offering':
        // Reserved for future expansion
        break;
      case 'received_offer':
        // Deprecated: now handled by queue
        break;
      case 'idle':
      default:
        // Normal gameplay
        break;
    }
  }

  private showLoreEntry() {
    if (!this.loreTextBox) return;
    const currentText = this.loreTextBox.text || '';
    const currentIndex = this.loreEntries.indexOf(currentText);
    const nextIndex = (currentIndex + 1) % this.loreEntries.length;
    this.loreTextBox.setText(this.loreEntries[nextIndex]);
  }

  // Called when an enemy is defeated by the player
  private onEnemyDefeated() {
    // Check if any active mission has a 'defeat' objective
    const missions = this.missionManager.getAllMissions();
    for (const mission of missions) {
      if (mission.status !== 'active') continue;
      for (const obj of mission.objectives) {
        if (obj.type === 'defeat' && obj.status === 'incomplete') {
          // For demo: mark as complete on any enemy defeat
          this.missionManager.updateObjective(mission.id, obj.id, 'complete');
          // Optionally, trigger mission event
          this.missionManager.triggerEvent(mission.id, 'onObjectiveComplete', { objectiveId: obj.id });
        }
      }
    }
    // Existing quest/respawn logic
    const allDefeated = this.enemies.every(enemy => !enemy.isAlive);
    if (allDefeated) {
      this.respawnEnemies();
    }
  }

  private respawnEnemies() {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) {
        enemy.isAlive = true;
        enemy.health = enemy.definition.maxHealth; // Restore health
        const sprite = this.enemySprites.get(enemy);
        if (sprite) {
          sprite.setPosition(enemy.x, enemy.y);
          sprite.setVisible(true);
        }
        const healthBar = this.enemyHealthBars.get(enemy);
        if (healthBar) {
          healthBar.setVisible(true);
          healthBar.updateHealth(enemy.health, enemy.definition.maxHealth);
        }
      }
    }
  }

  private saveAnchorsToStorage() {
    localStorage.setItem('realityAnchors', JSON.stringify(this.anchors));
  }

  private updateMinimapAnchors() {
    if (this.minimap) {
      this.minimap.drawWarpAnchors(
        this.anchors.map(a => ({ x: a.center.x, y: a.center.y, datakey: a.label }))
      );
    }
  }

  private exportAnchor(idx: number) {
    const anchor = this.anchors[idx];
    if (!anchor) return;
    const shareData = {
      seed: anchor.seed,
      label: anchor.label,
      center: anchor.center,
      owner: anchor.owner || 'local',
      shared: true
    };
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
    navigator.clipboard.writeText(code);
    alert('Anchor share code copied to clipboard!');
  }

  private importAnchor() {
    const code = prompt('Paste anchor share code:');
    if (!code) return;
    try {
      const json = decodeURIComponent(escape(atob(code)));
      const data = JSON.parse(json);
      if (!data.seed || !data.center) throw new Error('Invalid anchor');
      this.anchors.push({
        seed: data.seed,
        label: data.label + ' (shared)',
        center: data.center,
        owner: data.owner || 'shared',
        shared: true
      });
      this.saveAnchorsToStorage();
      this.updateMinimapAnchors();
      alert('Anchor imported!');
    } catch {
      alert('Invalid anchor code!');
    }
  }

  // Example: Use timestream/warp zone managers in anchor warping
  private handleAnchorWarp(anchor: { seed: string, label: string, center: { x: number, y: number } }) {
    // Branch timeline on warp
    const currentTimestream = this.timestreamManager.createTimestream(anchor.label, {
      id: `tl_${Date.now()}`,
      label: anchor.label,
      events: [],
      parentTimestream: 'root',
      branchFromEventId: undefined
    });
    // Optionally, trigger a warp zone event
    // this.warpZoneManager.triggerZone(anchor.seed, { anchor });
    // Update UI (stub)
    this.timeMapVisualizer.render({ nodes: [], edges: [] });
  }

  // Called when the player reaches a location (e.g., for 'location' objectives)
  private onPlayerReachLocation(locationId: string) {
    const missions = this.missionManager.getAllMissions();
    for (const mission of missions) {
      if (mission.status !== 'active') continue;
      for (const obj of mission.objectives) {
        if (obj.type === 'location' && obj.status === 'incomplete' && obj.target === locationId) {
          this.missionManager.updateObjective(mission.id, obj.id, 'complete');
          this.missionManager.triggerEvent(mission.id, 'onObjectiveComplete', { objectiveId: obj.id });
        }
      }
    }
  }

  // Called when the player collects an item (for 'collect' objectives)
  private onPlayerCollectItem(itemId: string, amount: number = 1) {
    const missions = this.missionManager.getAllMissions();
    for (const mission of missions) {
      if (mission.status !== 'active') continue;
      for (const obj of mission.objectives) {
        if (obj.type === 'collect' && obj.status === 'incomplete' && obj.target === itemId) {
          // Increment progress or mark complete
          const newProgress = (obj.progress || 0) + amount;
          if (newProgress >= 1) { // For demo, 1 is enough; adjust as needed
            this.missionManager.updateObjective(mission.id, obj.id, 'complete', newProgress);
            this.missionManager.triggerEvent(mission.id, 'onObjectiveComplete', { objectiveId: obj.id });
          } else {
            this.missionManager.updateObjective(mission.id, obj.id, 'incomplete', newProgress);
          }
        }
      }
    }
  }

  // Called when the player interacts with an object (for 'interact' objectives)
  private onPlayerInteract(targetId: string) {
    const missions = this.missionManager.getAllMissions();
    for (const mission of missions) {
      if (mission.status !== 'active') continue;
      for (const obj of mission.objectives) {
        if (obj.type === 'interact' && obj.status === 'incomplete' && obj.target === targetId) {
          this.missionManager.updateObjective(mission.id, obj.id, 'complete');
          this.missionManager.triggerEvent(mission.id, 'onObjectiveComplete', { objectiveId: obj.id });
        }
      }
    }
  }

  // Grant rewards for a completed mission
  private grantMissionRewards(missionId: string) {
    const mission = this.missionManager.getMission(missionId);
    if (!mission || !mission.rewards) return;
    for (const reward of mission.rewards) {
      switch (reward.type) {
        case 'xp':
          // Example: add XP to player stats
          if (typeof reward.value === 'number') {
            this.getPlayerStats().addXP?.(reward.value);
          }
          break;
        case 'item':
          // Example: add item to inventory
          if (typeof reward.value === 'string') {
            this.tilemapManager.inventoryPanel?.addItem?.(reward.value, 1);
          }
          break;
        case 'currency':
          // Example: add currency to player
          if (typeof reward.value === 'number') {
            this.getPlayerStats().addCurrency?.(reward.value);
          }
          break;
        case 'unlock':
          // Example: unlock feature or tech
          // Implement unlock logic as needed
          break;
        case 'faction':
          // Example: increase faction reputation
          // Implement faction logic as needed
          break;
        case 'custom':
          // Custom reward handler (modding/extensibility)
          // Implement as needed
          break;
      }
    }
  }

  private grantAnchorTradeReward() {
    // Give the player a 'traded_anchor_token' item for completing an anchor trade
    this.tilemapManager.inventoryService.addItem('traded_anchor_token', 1);
    // Show notification text
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const notif = this.add.text(centerX, centerY - 80, 'Received: Traded Anchor Token! 🔗', {
      fontSize: '24px', color: '#0fa', backgroundColor: '#222', padding: { left: 16, right: 16, top: 8, bottom: 8 }
    }).setOrigin(0.5).setDepth(3000);
    this.tweens.add({
      targets: notif,
      alpha: 0,
      y: centerY - 120,
      duration: 1800,
      ease: 'Cubic.easeIn',
      onComplete: () => notif.destroy()
    });
    // Play a sound effect if available
    if (this.sound && this.sound.play) {
      try { this.sound.play('item_pickup'); } catch (e) { /* ignore if sound missing */ }
    }
  }
}
