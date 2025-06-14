// GameScene.ts - protoFusionGirl core gameplay scene
// Implements player movement and prepares for tilemap, touch controls, and modding (see primer)

import Phaser from 'phaser';
import { PauseMenuScene } from './PauseMenuScene';
import { SettingsService } from '../services/SettingsService';
import { SettingsScene } from './SettingsScene';
import { TouchControls } from '../ui/components';
import { InputManager } from '../core/controls/InputManager';
import { TilemapManager } from '../world/tilemap/TilemapManager';
import { EnemyRegistry } from '../world/enemies/EnemyRegistry';
import { AttackRegistry } from '../world/combat/AttackRegistry';
import sampleEnemyMod from '../mods/sample_enemy_mod.json';
import { ChunkLoader } from '../world/tilemap/ChunkLoader';
import { WorldPhysics } from '../world/tilemap/WorldPhysics';
import { MissionManager } from '../world/missions/MissionManager';
import { AnchorManager } from './AnchorManager';
import { PlayerManager } from '../core/PlayerManager';
import { ModularGameLoop } from '../core/ModularGameLoop';
import { EventBus } from '../core/EventBus';
import { UIManager } from '../core/UIManager';
import { EnemyManager } from '../core/EnemyManager';
import { WorldEditorManager } from '../core/WorldEditorManager';
import { DevToolsManager } from '../core/DevToolsManager';
import { NarrativeManager } from '../core/NarrativeManager';
import { PluginManager } from '../core/PluginManager';
import { registerModEnemies, registerModAttacks } from '../mods/mod_loader';
import { ASIOverlay } from '../ui/components/ASIOverlay';
import { NPCManager, NPC } from '../core/NPCManager';
import { InventoryManager, Item } from '../core/InventoryManager';
import { InventoryOverlay } from '../ui/components/InventoryOverlay';
import { DialogueManager, DialogueNode } from '../core/DialogueManager';
import { DialogueModal } from '../ui/components/DialogueModal';
import { LeyLineManager } from '../world/leyline/LeyLineManager';
import { LeyLineVisualization } from '../world/leyline/visualization/LeyLineVisualization';
import { WorldStateManager } from '../world/WorldStateManager';

// Optionally, run asset validation at startup (for dev environments)
try {
  require('../../scripts/assetValidation');
} catch (e) {
  // Ignore if not present or in production
}

export class GameScene extends Phaser.Scene {
  private playerManager!: PlayerManager;
  private backgroundFar!: Phaser.GameObjects.TileSprite;
  private backgroundNear!: Phaser.GameObjects.TileSprite;
  private inputManager!: InputManager;
  private tilemapManager!: TilemapManager;
  private chunkLoader!: ChunkLoader;
  private missionManager: MissionManager = new MissionManager();
  private anchorManager!: AnchorManager;

  // Enemy and combat variables
  private enemyRegistry = new EnemyRegistry();
  private attackRegistry = new AttackRegistry();
  private enemyManager!: EnemyManager;

  // --- Infinite Map Variables ---
  private worldSeed: string = 'default-seed';
  private chunkRadius: number = 2;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;

  // Reality warping system
  private realityWarpSystem!: import('../world/RealityWarpSystem').RealityWarpSystem;

  // --- Modular Game Loop ---
  private modularGameLoop!: ModularGameLoop;
  private eventBus: EventBus = new EventBus();

  private uiManager!: UIManager;
  private worldEditorManager!: WorldEditorManager;
  private devToolsManager!: DevToolsManager;
  private narrativeManager!: NarrativeManager;
  private pluginManager!: PluginManager;

  private asiOverlay!: ASIOverlay;

  // NPC variables
  private npcManager!: NPCManager;
  private testNPCSprite?: Phaser.GameObjects.Sprite;

  // Inventory variables
  private inventoryManager!: InventoryManager;
  private inventoryOverlay?: InventoryOverlay;

  // Dialogue variables
  private dialogueManager!: DialogueManager;
  private dialogueModal?: DialogueModal;

  // Ley line variables
  private leyLineManager!: LeyLineManager;
  private leyLineOverlay!: Phaser.GameObjects.Graphics;
  private leyLineEventHistory: any[] = [];

  // --- WORLD STATE MANAGER SETUP ---
  // TODO: Replace with actual initial state loading as needed
  private worldStateManager!: WorldStateManager;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // --- PLAYER ASSETS ---
    this.load.spritesheet('player', 'src/assets/player.png', { frameWidth: 48, frameHeight: 48 });

    // --- TILEMAP ASSETS ---
    this.load.tilemapTiledJSON('level1', 'src/assets/tiles.json');
    this.load.image('tiles', 'src/assets/tiles.png');

    // --- BACKGROUND ASSETS ---
    this.load.image('background-far', 'assets/background-far.png');
    this.load.image('background-near', 'assets/background-near.png');
  }

  // Save mission state to localStorage (or replace with your save system)
  private saveMissionState() {
    const data = this.missionManager.serializeMissions();
    localStorage.setItem('missionState', JSON.stringify(data));
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

    // --- PLAYER MANAGER SETUP ---
    this.inputManager = InputManager.getInstance(this);
    this.playerManager = new PlayerManager({
      scene: this,
      eventBus: this.eventBus,
      inputManager: this.inputManager,
      enemyManager: this.enemyManager, // will be set after enemyManager is created
      attackRegistry: this.attackRegistry,
      playerConfig: {
        x: 0,
        y: 300,
        texture: 'player',
        frame: 0,
        movement: { moveSpeed: 200, jumpForce: 350 },
        animation: {
          animations: [
            { key: 'idle', frames: { start: 0, end: 3 }, frameRate: 6, repeat: -1 },
            { key: 'run', frames: { start: 4, end: 9 }, frameRate: 12, repeat: -1 },
            { key: 'jump', frames: { start: 10, end: 12 }, frameRate: 8, repeat: 0 },
            { key: 'fall', frames: { start: 13, end: 15 }, frameRate: 8, repeat: 0 }
          ]
        },
        stats: { maxHealth: 100 }
      }
    });
    this.playerManager.initialize();
    // Use Jane's sprite for collision and chunk loading if available
    const janeSprite = this.playerManager.getJaneSprite();
    WorldPhysics.setupPlayerCollision(janeSprite, this.groundGroup);
    this.chunkLoader.updateLoadedChunks(janeSprite?.x || 0, janeSprite?.y || 0);

    // --- INFINITE MAP SYSTEM SETUP ---
    this.worldSeed = 'fusiongirl-' + Date.now();
    this.tilemapManager = new TilemapManager();
    this.realityWarpSystem = new (require('../world/RealityWarpSystem').RealityWarpSystem)(this.tilemapManager);
    this.tilemapManager.worldGen.generateFromSeed(this.worldSeed);
    this.groundGroup = this.physics.add.staticGroup();
    this.chunkLoader = new ChunkLoader(this, this.tilemapManager, this.groundGroup, this.chunkRadius);
    WorldPhysics.setupGravity(this, 900);
    WorldPhysics.setupPlayerCollision(this.playerManager.getJaneSprite(), this.groundGroup);
    this.chunkLoader.updateLoadedChunks(this.playerManager.getJaneSprite().x, this.playerManager.getJaneSprite().y);

    // --- TOUCH CONTROLS FOR MOBILE ---
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
    this.input.keyboard?.on('keydown-ESC', () => {
      if (!this.scene.isPaused('GameScene')) {
        this.scene.launch('PauseMenuScene');
        this.scene.pause();
      }
    });
    this.children.sendToBack(this.backgroundFar);
    this.children.sendToBack(this.backgroundNear);

    // --- TILEMAP MANAGER & EQUIPMENT UI ---
    this.tilemapManager.equipmentService.equipItem('cyber_helmet', 'head');
    this.tilemapManager.inventoryPanel.setEquipmentIntegration(this.tilemapManager.equipmentService, 'weapon');
    this.tilemapManager.equipmentPanel.render(this);
    this.tilemapManager.inventoryPanel.render(this);
    this.tilemapManager.craftingPanel.render(this);

    // Register enemies and attacks from mods
    registerModEnemies(sampleEnemyMod, this.enemyRegistry);
    registerModAttacks(sampleEnemyMod, this.attackRegistry);
    this.enemyManager = new EnemyManager(
      this,
      this.enemyRegistry,
      this.attackRegistry,
      this.groundGroup,
      janeSprite
    );
    this.enemyManager.spawnEnemy('slime', 600, 300);

    // --- PLAYER ATTACK CONTROLLER SETUP ---
    // Now handled by PlayerManager; access via this.playerManager.getPlayerAttackController()
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.playerManager.getPlayerAttackController()?.attackNearestEnemy();
    });

    // --- MODULAR GAME LOOP SETUP ---
    this.modularGameLoop = new ModularGameLoop(this.eventBus);

    // Register player update system
    this.modularGameLoop.registerSystem({
      id: 'player-update',
      priority: 1,
      update: (dt, context) => {
        this.playerManager.getJane()?.updateAI?.(dt);
      }
    });

    // Register tilemap system
    this.modularGameLoop.registerSystem({
      id: 'tilemap-update',
      priority: 2,
      update: (dt, context) => {
        this.tilemapManager?.update?.(dt, context);
      }
    });

    // Register enemy system
    this.modularGameLoop.registerSystem({
      id: 'enemy-update',
      priority: 3,
      update: () => {
        this.enemyManager?.update?.();
      }
    });

    // Register UI system
    this.modularGameLoop.registerSystem({
      id: 'ui-update',
      priority: 4,
      update: (dt, context) => {
        this.uiManager?.update?.(dt, context);
      }
    });

    // Register mission system
    this.modularGameLoop.registerSystem({
      id: 'mission-update',
      priority: 5,
      update: (dt, context) => {
        this.missionManager?.update?.(dt, context);
      }
    });

    // --- MANAGER MODULES SETUP ---
    this.uiManager = new UIManager(
      this,
      this.tilemapManager,
      janeSprite,
      this.enemyManager.enemies,
      this.enemyManager.enemySprites,
      [], // loreEntries, now handled in UIManager or NarrativeManager
      this.eventBus
    );
    // Attach UIManager to scene for PlayerManager feedback integration
    (this as any).uiManager = this.uiManager;
    this.narrativeManager = new NarrativeManager(
      this,
      this.missionManager,
      this.eventBus,
      this.tilemapManager,
      this.playerManager.getJane(),
      this.saveMissionState.bind(this)
    );
    this.worldEditorManager = new WorldEditorManager(this, this.tilemapManager);
    this.devToolsManager = new DevToolsManager(
      this,
      this.playerManager.getJane(),
      this.tilemapManager,
      this.missionManager,
      this.anchorManager,
      this.realityWarpSystem
    );
    this.pluginManager = new PluginManager(
      this,
      this.eventBus,
      this.modularGameLoop
    );
    // --- ASI Overlay UI ---
    this.asiOverlay = new ASIOverlay({
      scene: this,
      width: this.scale.width,
      height: this.scale.height,
      eventBus: this.eventBus
    });
    this.asiOverlay.setASIState(this.playerManager.isJaneASIControlled());
    this.asiOverlay.onConsent(() => {
      const current = this.playerManager.isJaneASIControlled();
      this.playerManager.setJaneASIOverride(!current);
    });
    this.asiOverlay.show();
    // Listen for Jane/ASI state changes
    this.eventBus.on('JANE_ASI_OVERRIDE', (event: any) => {
      this.asiOverlay.setASIState(event.data.enabled);
    });
    // Keyboard input for ASI override (Q)
    this.input.keyboard?.on('keydown-Q', () => {
      const current = this.playerManager.isJaneASIControlled();
      this.playerManager.setJaneASIOverride(!current);
    });

    // --- NPC MANAGER SETUP ---
    this.npcManager = new NPCManager(this.eventBus);
    NPCManager.registerGlobalInstance(this.npcManager);
    // Spawn a test NPC in the world using static helper
    this.testNPCSprite = NPCManager.spawnTestNPC(this, (npcId) => this.handleNPCInteraction(npcId));
    // Keyboard interaction (E key)
    this.input.keyboard?.on('keydown-E', () => {
      const janeSprite = this.playerManager.getJaneSprite();
      if (janeSprite && this.testNPCSprite && NPCManager.isPlayerNearNPC(janeSprite, this.testNPCSprite)) {
        this.handleNPCInteraction('npc_test_1');
      }
    });

    // --- INVENTORY MANAGER SETUP ---
    this.inventoryManager = new InventoryManager();
    InventoryManager.registerGlobalInstance(this.inventoryManager);
    // Spawn a test item in the world using static helper
    let testItemSprite: Phaser.GameObjects.Sprite | undefined = InventoryManager.spawnTestItem(this, () => {
      this.inventoryManager.addItem({ id: 'nanochip', name: 'Nanochip', type: 'component', quantity: 1 });
    });
    // Item pickup: F key when near item
    this.input.keyboard?.on('keydown-F', () => {
      const janeSprite = this.playerManager.getJaneSprite();
      if (janeSprite && testItemSprite && InventoryManager.isPlayerNearItem(janeSprite, testItemSprite)) {
        this.inventoryManager.addItem({ id: 'nanochip', name: 'Nanochip', type: 'component', quantity: 1 });
        testItemSprite.destroy();
        testItemSprite = undefined;
      }
    });
    // Inventory UI overlay
    this.inventoryOverlay = new InventoryOverlay(this, this.inventoryManager);

    // --- DIALOGUE MANAGER SETUP ---
    this.dialogueManager = new DialogueManager();
    this.dialogueManager.registerDefaultNodes(); // Modular registration
    this.dialogueModal = new DialogueModal(this, this.dialogueManager);
    this.dialogueManager.onDialogueStarted((node) => {
      this.dialogueModal?.show(node);
    });

    // --- LEY LINE MANAGER & VISUALIZATION OVERLAY ---
    this.leyLineManager = new LeyLineManager(this.worldStateManager, this.eventBus as any); // Use unified state
    this.leyLineOverlay = this.add.graphics();
    this.leyLineOverlay.setDepth(1000); // Draw above tilemap
    // Listen for ley line events to update overlay and feedback
    this.eventBus.on('LEYLINE_SURGE', (event: any) => {
      this.leyLineEventHistory.push(event.data);
      this.refreshLeyLineOverlay();
      this.showLeyLineFeedback(event.data);
    });
    this.eventBus.on('LEYLINE_DISRUPTION', (event: any) => {
      this.leyLineEventHistory.push(event.data);
      this.refreshLeyLineOverlay();
      this.showLeyLineFeedback(event.data);
    });
    // Initial overlay draw
    this.refreshLeyLineOverlay();

    // --- DEV DEBUG TOOLS: Toggle ley line overlay on minimap ---
    this.input.keyboard?.on('keydown-D', () => {
      this.uiManager.minimap?.toggleLeyLineOverlayVisible();
    });

    // Artifact: leyline_instability_event_narrative_examples_2025-06-08.artifact
    // Listen for ley line instability and related events for in-world feedback
    if (this.eventBus) {
      this.eventBus.on('LEYLINE_INSTABILITY', (event) => {
        // In-world visual: ley line glows, flickers, or emits sparks
        if (event.data.leyLineId) {
          this.triggerLeyLineVisualEffect(event.data.leyLineId, event.data.nodeId, event.data.severity);
        }
      });
      this.eventBus.on('LEYLINE_SURGE', (event) => {
        // No nodeId in LEYLINE_SURGE event, only leyLineId
        this.triggerLeyLineVisualEffect(event.data.leyLineId, undefined, 'moderate');
      });
      this.eventBus.on('LEYLINE_DISRUPTION', (event) => {
        this.triggerLeyLineVisualEffect(event.data.leyLineId, undefined, 'major');
      });
      this.eventBus.on('RIFT_FORMED', (event) => {
        if (event.data.leyLineId) {
          this.triggerLeyLineVisualEffect(event.data.leyLineId, event.data.nodeId, 'major', true);
        }
      });
    }
  }

  private handleNPCInteraction(npcId: string) {
    const npc = this.npcManager.getNPC(npcId);
    if (npc) {
      // Start dialogue with the NPC
      this.dialogueManager.startDialogue('npc_test_1_intro');
      this.npcManager.setRelationship(npcId, npc.relationship + 1);
      this.npcManager.updateNPC({ ...npc, relationship: npc.relationship + 1 });
    }
  }

  private refreshLeyLineOverlay() {
    this.leyLineOverlay.clear();
    // Use canonical ley line state from WorldStateManager
    const leyLines = this.worldStateManager.getState().leyLines;
    const overlays = LeyLineVisualization.generateEventOverlays(this.leyLineEventHistory.slice(-5)); // last 5 events
    const renderData = LeyLineVisualization.getRenderData(leyLines, overlays);
    // Draw lines
    this.leyLineOverlay.lineStyle(3, 0x00ffff, 0.5);
    for (const line of renderData.lines) {
      this.leyLineOverlay.strokeLineShape(new Phaser.Geom.Line(
        line.from.x, line.from.y, line.to.x, line.to.y
      ));
    }
    // Draw nodes
    for (const node of renderData.nodes) {
      this.leyLineOverlay.fillStyle(node.state === 'active' ? 0x00ffcc : 0x888888, 1);
      this.leyLineOverlay.fillCircle(node.position.x, node.position.y, 8);
    }
    // Draw overlays (event highlights)
    for (const overlay of renderData.overlays) {
      if (overlay.affectedTiles) {
        this.leyLineOverlay.fillStyle(overlay.color === 'cyan' ? 0x00ffff : overlay.color === 'red' ? 0xff4444 : 0xffff00, 0.4);
        for (const tile of overlay.affectedTiles) {
          this.leyLineOverlay.fillRect(tile.x * 32, tile.y * 32, 32, 32);
        }
      }
    }
    // Update minimap ley line overlay via UIManager
    this.uiManager.setLeyLineMinimapData(leyLines, overlays);
    this.uiManager.minimap?.updateMinimap();
  }

  private showLeyLineFeedback(eventData: any) {
    // Simple player feedback: show a floating text or popup
    const msg = eventData.narrativeContext || eventData.lore || eventData.eventType;
    const text = this.add.text(this.scale.width / 2, 40, msg, {
      font: '20px Arial', color: '#00ffff', backgroundColor: '#222', padding: { x: 8, y: 4 }
    }).setOrigin(0.5, 0).setDepth(2000);
    this.tweens.add({
      targets: text,
      alpha: 0,
      y: 0,
      duration: 2000,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Trigger a visual effect (glow, flicker, sparks) on the affected ley line/node.
   * Artifact: leyline_instability_event_narrative_examples_2025-06-08.artifact
   */
  private triggerLeyLineVisualEffect(leyLineId: string, nodeId?: string, severity?: string, isRift?: boolean) {
    // Find ley line and node in overlay, add a temporary effect (stub/placeholder)
    // Example: flicker/glow effect on overlay canvas or add a sprite effect
    // This is a stub; real implementation would use a particle system or shader
    const color = isRift ? 0xaa00ff : severity === 'major' ? 0xff4444 : severity === 'moderate' ? 0xffff00 : 0x00ff88;
    const overlay = this.leyLineOverlay || this.add.graphics();
    overlay.lineStyle(6, color, 0.7);
    // Example: draw a glowing circle at node or along ley line
    if (nodeId) {
      const leyLine = this.worldStateManager.getState().leyLines.find(l => l.id === leyLineId);
      const node = leyLine?.nodes.find(n => n.id === nodeId);
      if (node) {
        overlay.strokeCircle(node.position.x, node.position.y, 32);
        this.tweens.add({
          targets: overlay,
          alpha: 0,
          duration: 900,
          onComplete: () => overlay.clear()
        });
      }
    } else {
      // Highlight the whole ley line
      const leyLine = this.worldStateManager.getState().leyLines.find(l => l.id === leyLineId);
      if (leyLine) {
        for (let i = 1; i < leyLine.nodes.length; i++) {
          const a = leyLine.nodes[i - 1].position;
          const b = leyLine.nodes[i].position;
          overlay.strokeLineShape(new Phaser.Geom.Line(a.x, a.y, b.x, b.y));
        }
        this.tweens.add({
          targets: overlay,
          alpha: 0,
          duration: 900,
          onComplete: () => overlay.clear()
        });
      }
    }
  }

  update(_time: number, delta: number) {
    this.modularGameLoop.update(delta);
    // Optionally, update ley line overlay if ley lines are dynamic
    // this.refreshLeyLineOverlay();
  }
}
