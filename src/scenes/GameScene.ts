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
import sampleEnemyMod from '../mods/sample_enemy_mod';
import { ChunkLoader } from '../world/tilemap/ChunkLoader';
import { WorldPhysics } from '../world/tilemap/WorldPhysics';
import { MissionManager } from '../world/missions/MissionManager';
import { AnchorManager } from './AnchorManager';
import { PlayerManager } from '../core/PlayerManager';
import { ModularGameLoop } from '../core/ModularGameLoop';
import { createTileset, createPlayerSpritesheet, createPlaceholderCanvas, createMagnetoSpeederSprite, createHypersonicEffectSprite } from '../utils/PlaceholderAssets';
import { EventBus } from '../core/EventBus';
import { UIManager } from '../core/UIManager';
import { EnemyManager } from '../core/EnemyManager';
import { WorldEditorManager } from '../core/WorldEditorManager';
import { DevToolsManager } from '../core/DevToolsManager';
import { NarrativeManager } from '../core/NarrativeManager';
import { PluginManager } from '../core/PluginManager';
import { registerModEnemies, registerModAttacks } from '../mods/mod_loader';
import { ASIOverlay } from '../ui/components/ASIOverlay';
import { CommandCenterUI } from '../asiControl/ui/components/CommandCenterUI';
import { TrustManager } from '../asiControl/systems/TrustManager';
import { ThreatDetector } from '../asiControl/systems/ThreatDetector';
import { GuidanceEngine } from '../asiControl/systems/GuidanceEngine';
import { NPCManager, NPC } from '../core/NPCManager';
import { InventoryManager, Item } from '../core/InventoryManager';
import { InventoryOverlay } from '../ui/components/InventoryOverlay';
import { DialogueManager, DialogueNode } from '../core/DialogueManager';
import { DialogueModal } from '../ui/components/DialogueModal';
import { LeyLineManager } from '../world/leyline/LeyLineManager';
import { LeyLineVisualization } from '../world/leyline/visualization/LeyLineVisualization';
import { WorldStateManager } from '../world/WorldStateManager';
import { NavigationManager } from '../navigation/core/NavigationManager';
import { SpeedControlUI } from '../navigation/ui/SpeedControlUI';
import { TileRegistry } from '../world/tilemap/TileRegistry';
import { TileSpriteFactory } from '../world/tilemap/TileSpriteFactory';
import { RealityWarpSystem } from '../world/RealityWarpSystem';
// New UI Layout System
import { UILayoutManager } from '../ui/layout/UILayoutManager';
import { UIBarSystem } from '../ui/layout/UIBarSystem';

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

  // New UI Layout System
  private uiLayoutManager!: UILayoutManager;
  private uiBarSystem!: UIBarSystem;

  private asiOverlay!: ASIOverlay;
  
  // ASI Control Interface Components
  private trustManager!: TrustManager;
  private threatDetector!: ThreatDetector;
  private guidanceEngine!: GuidanceEngine;
  private commandCenterUI!: CommandCenterUI;

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

  // Navigation and speed systems
  private navigationManager!: NavigationManager;
  private speedControlUI!: SpeedControlUI;
  
  // Magneto Speeder
  private magnetoSpeederSprite?: Phaser.Physics.Arcade.Sprite;
  private hypersonicEffectSprite?: Phaser.GameObjects.Sprite;
  private isOnSpeeder: boolean = false;

  // --- WORLD STATE MANAGER SETUP ---
  // TODO: Replace with actual initial state loading as needed
  private worldStateManager!: WorldStateManager;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Generate procedural assets using PlaceholderAssets
    // Create tileset texture from PlaceholderAssets
    const tilesetTexture = createTileset();
    
    // Configure the tileset as a spritesheet for individual tile frames
    // The tileset is 4 tiles wide × 3 tiles high, each tile is 32×32 pixels
    // Use a unique key 'tilesheet' instead of 'tiles' to avoid conflicts
    this.load.spritesheet('tilesheet', tilesetTexture.toDataURL(), { 
      frameWidth: 32, 
      frameHeight: 32 
    });

    // Add loading completion check
    this.load.once('complete', () => {
      console.log('🎨 Tileset loading complete');
      const texture = this.textures.get('tilesheet');
      if (texture && texture.frames) {
        console.log(`✅ Tilesheet loaded with ${Object.keys(texture.frames).length} frames`);
      } else {
        console.error('❌ Tilesheet failed to load properly');
      }
    });

    // Initialize TileRegistry and configure TileSpriteFactory
    const tileRegistry = new TileRegistry();
    TileSpriteFactory.setTileRegistry(tileRegistry);
    
    // Create player spritesheet from PlaceholderAssets  
    const playerTexture = createPlayerSpritesheet();
    
    // Configure the player spritesheet for animations
    // The spritesheet is 4 frames wide × 4 frames high, each frame is 32×32 pixels
    this.load.spritesheet('player', playerTexture.toDataURL(), { 
      frameWidth: 32, 
      frameHeight: 32 
    });

    // Create MagnetoSpeeder sprite
    const speederTexture = createMagnetoSpeederSprite();
    this.textures.addCanvas('magnetospeeder', speederTexture);
    
    // Create hypersonic effect sprite
    const hypersonicTexture = createHypersonicEffectSprite();
    this.textures.addCanvas('hypersonic-effect', hypersonicTexture);

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
    try {
      console.log('🎮 GameScene create() method called');
      
      // Check if textures are available
      console.log('🔍 Checking loaded textures:');
      console.log('- tilesheet exists:', this.textures.exists('tilesheet'));
      console.log('- player exists:', this.textures.exists('player'));
      console.log('- magnetospeeder exists:', this.textures.exists('magnetospeeder'));
      
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

    console.log('🖼️ Setting up backgrounds...');
    // Check if background textures exist, create fallbacks if not
    let backgroundFarTexture = 'background-far';
    let backgroundNearTexture = 'background-near';
    
    if (!this.textures.exists('background-far')) {
      console.warn('⚠️ background-far texture missing, creating fallback');
      this.textures.addCanvas('background-far', createPlaceholderCanvas(800, 600, '#001122'));
    }
    
    if (!this.textures.exists('background-near')) {
      console.warn('⚠️ background-near texture missing, creating fallback');
      this.textures.addCanvas('background-near', createPlaceholderCanvas(800, 600, '#003344'));
    }

    // Parallax backgrounds
    this.backgroundFar = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, backgroundFarTexture).setOrigin(0, 0).setScrollFactor(0);
    this.backgroundNear = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, backgroundNearTexture).setOrigin(0, 0).setScrollFactor(0);
    
    console.log('✅ Backgrounds created successfully');

    console.log('🎨 Setting up UI Layout System...');
    // Initialize the new UI layout manager
    this.uiLayoutManager = new UILayoutManager(this);
    
    // Initialize the UI bar system for essential UI elements
    this.uiBarSystem = new UIBarSystem(this, this.uiLayoutManager);
    this.add.existing(this.uiBarSystem);
    
    console.log('✅ UI Layout System initialized');

    console.log('👤 Setting up Player Manager...');
    let janeSprite: Phaser.Physics.Arcade.Sprite | undefined;
    try {
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
    janeSprite = this.playerManager.getJaneSprite();
    if (janeSprite) {
      // Start idle animation immediately if it exists
      if (this.anims.exists('idle')) {
        janeSprite.play('idle', true);
        console.log('✅ Started idle animation successfully');
      } else {
        console.warn('⚠️ Idle animation not ready yet, will start later');
        // Try again after a short delay
        this.time.delayedCall(100, () => {
          if (this.anims.exists('idle')) {
            janeSprite.play('idle', true);
            console.log('✅ Started idle animation after delay');
          } else {
            console.error('❌ Idle animation still not available after delay');
          }
        });
      }
    }
    
    // Note: chunkLoader will be initialized later with terrain setup

    // --- MAGNETO SPEEDER SETUP ---
    console.log('🚀 Creating MagnetoSpeeder sprite...');
    this.magnetoSpeederSprite = this.physics.add.sprite(450, 300, 'magnetospeeder');
    this.magnetoSpeederSprite.setCollideWorldBounds(true);
    this.magnetoSpeederSprite.setScale(1.5); // Make it a bit larger than player
    this.magnetoSpeederSprite.setBounce(0.2);
    this.magnetoSpeederSprite.setDrag(50); // Add some drag for better control
    
    // Create hypersonic effect (initially hidden)
    this.hypersonicEffectSprite = this.add.sprite(0, 0, 'hypersonic-effect');
    this.hypersonicEffectSprite.setVisible(false);
    this.hypersonicEffectSprite.setDepth(-1); // Behind the speeder
    this.hypersonicEffectSprite.setAlpha(0.7);
    
    console.log('✅ MagnetoSpeeder sprite created');

    // Add collision between player and speeder for boarding
    if (janeSprite && this.magnetoSpeederSprite) {
      this.physics.add.overlap(janeSprite, this.magnetoSpeederSprite, () => {
        console.log('🚀 Player touched MagnetoSpeeder - boarding available!');
        this.toggleSpeederBoarding();
      });
      
      // Also add manual boarding with F key when near speeder
      this.input.keyboard?.on('keydown-F', () => {
        if (janeSprite && this.magnetoSpeederSprite) {
          const distance = Phaser.Math.Distance.Between(
            janeSprite.x, janeSprite.y,
            this.magnetoSpeederSprite.x, this.magnetoSpeederSprite.y
          );
          if (distance < 64) { // Within 64 pixels
            console.log('🚀 F key pressed near MagnetoSpeeder - boarding!');
            this.toggleSpeederBoarding();
          }
        }
      });
    }
    
    console.log('✅ Player Manager setup completed successfully');
    } catch (error) {
      console.error('❌ Error setting up Player Manager:', error);
      // Player setup failed - this should not happen with the current fixes
      throw error; // Re-throw to prevent game from running in broken state
    }

    // --- INFINITE MAP SYSTEM SETUP ---
    this.worldSeed = 'fusiongirl-' + Date.now();
    this.tilemapManager = new TilemapManager();
    this.realityWarpSystem = new RealityWarpSystem(this.tilemapManager);
    
    // --- WORLD STATE MANAGER SETUP ---
    this.worldStateManager = new WorldStateManager({
      version: 1,
      leyLines: [],
      rifts: [],
      players: [],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: false, aiAgents: [], mods: [] }
    }, this.eventBus);

    // --- LEY LINE MANAGER SETUP ---
    this.leyLineManager = new LeyLineManager(this.worldStateManager, this.eventBus);

    // Generate basic world first
    this.tilemapManager.worldGen.generateFromSeed(this.worldSeed);

    // Set up physics and collision groups
    this.groundGroup = this.physics.add.staticGroup();
    WorldPhysics.setupGravity(this, 900);
    
    // Create chunk loader with MORE restrictive settings
    this.chunkLoader = new ChunkLoader(this, this.tilemapManager, this.groundGroup, 1); // Reduce chunk radius to 1
    
    // Position player at a simple starting location for now
    const simpleStartX = 400;
    const simpleStartY = 200;

    if (janeSprite) {
      janeSprite.setPosition(simpleStartX, simpleStartY);
      console.log(`👤 Jane positioned at simple starting location: (${simpleStartX}, ${simpleStartY})`);
      
      // Set up physics collision
      this.physics.add.collider(janeSprite, this.groundGroup);
      
      // Center camera on player
      this.cameras.main.startFollow(janeSprite);
      
      // Load initial chunks ONLY if texture is ready
      if (this.textures.exists('tilesheet')) {
        console.log('🌍 Loading initial chunks...');
        this.chunkLoader.updateLoadedChunks(simpleStartX, simpleStartY);
        console.log('✅ Initial chunks loaded');
      } else {
        console.warn('⚠️ Tilesheet not ready, skipping chunk loading');
      }
    }

    console.log('✅ World initialization complete!');

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
      update: (dt) => {
        this.playerManager.getJane()?.updateAI?.(dt);
      }
    });

    // Register navigation system
    this.modularGameLoop.registerSystem({
      id: 'navigation-update',
      priority: 1.5, // After player update, before tilemap
      update: (dt) => {
        this.navigationManager.update(dt);
      }
    });

    // Register speeder movement system
    this.modularGameLoop.registerSystem({
      id: 'speeder-movement',
      priority: 1.6, // After navigation update
      update: () => {
        this.updateSpeederMovement();
      }
    });

    // Register tilemap system
    this.modularGameLoop.registerSystem({
      id: 'tilemap-update',
      priority: 2,
      update: (dt) => {
        this.tilemapManager?.update?.(dt);
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
      update: (dt) => {
        this.uiManager?.update?.(dt, {});
      }
    });

    // Register mission system
    this.modularGameLoop.registerSystem({
      id: 'mission-update',
      priority: 5,
      update: (dt) => {
        this.missionManager?.update?.(dt, {});
      }
    });

    // --- MANAGER MODULES SETUP ---
    this.uiManager = new UIManager(
      this,
      this.tilemapManager,
      janeSprite || this.playerManager.getJaneSprite(),
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
    // --- ASI CONTROL INTERFACE SETUP ---
    // Initialize ASI systems before the overlay
    this.trustManager = new TrustManager({
      eventBus: this.eventBus,
      initialTrust: 50,
      maxTrust: 100,
      minTrust: 0,
      decayRate: 1,
      updateInterval: 1000
    });

    this.threatDetector = new ThreatDetector({
      scene: this,
      eventBus: this.eventBus,
      detectionRadius: 300,
      updateInterval: 500,
      threatTypes: ['enemy', 'environmental', 'mission']
    });

    this.guidanceEngine = new GuidanceEngine({
      scene: this,
      eventBus: this.eventBus,
      trustManager: this.trustManager,
      threatDetector: this.threatDetector,
      contextUpdateInterval: 1000,
      maxSuggestions: 3
    });

    this.commandCenterUI = new CommandCenterUI({
      scene: this,
      width: this.scale.width,
      height: this.scale.height,
      eventBus: this.eventBus,
      playerManager: this.playerManager,
      trustManager: this.trustManager,
      threatDetector: this.threatDetector,
      guidanceEngine: this.guidanceEngine
    });

    // --- NAVIGATION MANAGER SETUP ---
    console.log('🧭 Setting up Navigation Manager...');
    this.navigationManager = new NavigationManager({
      eventBus: this.eventBus,
      playerManager: this.playerManager,
      uiManager: this.uiManager,
      scene: this
    });
    console.log('✅ Navigation Manager initialized');

    // --- SPEED CONTROL UI SETUP ---
    console.log('🚀 Setting up Speed Control UI...');
    this.speedControlUI = new SpeedControlUI(
      this,
      this.eventBus,
      this.navigationManager
    );
    console.log('✅ Speed Control UI initialized');

    // Update app icon to reflect ASI active state
    import('../core/AppIconManager').then(({ AppIconManager }) => {
      const iconManager = AppIconManager.getInstance();
      iconManager.updateIconForGameState('asi_active');
    });

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
    
    // Register ASI overlay with layout manager but keep it hidden initially
    this.uiLayoutManager.registerComponent('asiOverlay', this.asiOverlay, 'overlays', 'contextual');
    this.uiLayoutManager.hideComponent('asiOverlay');
    
    // Register Command Center UI with layout manager but keep it hidden initially  
    this.uiLayoutManager.registerComponent('commandCenterUI', this.commandCenterUI, 'overlays', 'contextual');
    this.uiLayoutManager.hideComponent('commandCenterUI');
    
    // Listen for Jane/ASI state changes
    this.eventBus.on('JANE_ASI_OVERRIDE', (event: any) => {
      this.asiOverlay.setASIState(event.data.enabled);
    });
    
    // Keyboard input for ASI override (Q) - now toggles overlay visibility
    this.input.keyboard?.on('keydown-Q', () => {
      const current = this.playerManager.isJaneASIControlled();
      this.playerManager.setJaneASIOverride(!current);
      this.uiLayoutManager.toggleComponent('asiOverlay');
    });

    // Toggle Command Center Interface (C key)
    this.input.keyboard?.on('keydown-C', () => {
      this.uiLayoutManager.toggleComponent('commandCenterUI');
    });

    // Quick guidance suggestions (Tab key)
    this.input.keyboard?.on('keydown-TAB', () => {
      // Generate guidance based on current context
      const janeSprite = this.playerManager.getJaneSprite();
      const currentContext = {
        janeState: {
          position: { x: janeSprite?.x || 400, y: janeSprite?.y || 300 },
          health: 100,
          maxHealth: 100,
          psi: 75,
          maxPsi: 100,
          emotionalState: {
            confidence: 70,
            stress: 30,
            curiosity: 80,
            trust: this.trustManager.getTrustLevel(),
            fear: 20
          },
          isMoving: false,
          isInCombat: false,
          currentAction: 'exploring',
          trustLevel: this.trustManager.getTrustLevel(),
          asiControlled: this.playerManager.isJaneASIControlled()
        },
        nearbyThreats: [],
        availableActions: ['move', 'interact', 'magic', 'rest'],
        environmentalFactors: [],
        socialContext: {
          nearbyNPCs: [],
          relationships: [],
          reputation: []
        },
        missionContext: undefined
      };
      
      this.guidanceEngine.generateSuggestions(currentContext);
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
    
    // Register inventory overlay with layout manager but keep it hidden initially
    this.uiLayoutManager.registerComponent('inventoryOverlay', this.inventoryOverlay, 'overlays', 'contextual');
    this.uiLayoutManager.hideComponent('inventoryOverlay');
    
    // Add keyboard shortcut to toggle inventory (I key)
    this.input.keyboard?.on('keydown-I', () => {
      this.uiLayoutManager.toggleComponent('inventoryOverlay');
    });

    // --- DIALOGUE MANAGER SETUP ---
    this.dialogueManager = new DialogueManager();
    this.dialogueManager.registerDefaultNodes(); // Modular registration
    this.dialogueModal = new DialogueModal(this, this.dialogueManager);
    this.dialogueManager.onDialogueStarted((node) => {
      this.dialogueModal?.show(node);
    });
    
    // Register dialogue modal with layout manager
    this.uiLayoutManager.registerComponent('dialogueModal', this.dialogueModal, 'overlays', 'contextual');
    this.uiLayoutManager.hideComponent('dialogueModal');

    // --- LEY LINE VISUALIZATION OVERLAY SETUP ---
    // (LeyLineManager already initialized above)
    this.leyLineOverlay = this.add.graphics();
    this.leyLineOverlay.setDepth(1000); // Draw above tilemap
    
    // Register ley line overlay with layout manager
    this.uiLayoutManager.registerComponent('leyLineOverlay', this.leyLineOverlay, 'overlays', 'debug');
    this.uiLayoutManager.hideComponent('leyLineOverlay');
    
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

    // --- DEV DEBUG TOOLS: Toggle ley line overlay and debug UI ---
    this.input.keyboard?.on('keydown-D', () => {
      this.uiLayoutManager.toggleComponent('leyLineOverlay');
      this.uiManager.minimap?.toggleLeyLineOverlayVisible();
    });
    
    // Add comprehensive UI control keys
    this.input.keyboard?.on('keydown-H', () => {
      // H key: Hide/Show all contextual UI
      const contextualVisible = this.uiLayoutManager.isComponentVisible('asiOverlay');
      if (contextualVisible) {
        this.uiLayoutManager.hideContextualUI();
      } else {
        this.uiLayoutManager.showEssentialUI();
      }
    });
    
    this.input.keyboard?.on('keydown-U', () => {
      // U key: Show UI layout debug
      this.uiLayoutManager.showLayoutDebug();
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

    // --- WELCOME MESSAGE WITH SPEED CONTROLS ---
    this.time.delayedCall(1000, () => {
      this.showWelcomeMessage();
    });

    // Add basic player movement controls for testing
    this.addBasicPlayerControls();
    
    console.log('✅ GameScene create() completed successfully');
    } catch (error) {
      console.error('❌ CRITICAL ERROR in GameScene.create():', error);
      console.error('❌ Stack trace:', (error as Error)?.stack || 'No stack trace available');
      
      // Add a visible error message on screen
      this.add.text(400, 300, 'GAME INITIALIZATION ERROR\nCheck console for details', {
        fontSize: '24px',
        color: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
        align: 'center'
      }).setOrigin(0.5).setDepth(10000);
      
      // Re-throw the error so it's visible in the console
      throw error;
    }
  }

  private addBasicPlayerControls() {
    const cursors = this.input.keyboard?.createCursorKeys();
    const wasd = this.input.keyboard?.addKeys('W,S,A,D') as any;
    
    console.log('🎮 Basic player controls added');
    console.log('🎮 WASD and Arrow keys should move Jane');
    console.log('🎮 F key to board MagnetoSpeeder when near');
    
    // Store controls for update method
    (this as any).playerControls = { cursors, wasd };
  }

  private toggleSpeederBoarding() {
    if (!this.magnetoSpeederSprite) return;

    this.isOnSpeeder = !this.isOnSpeeder;
    
    if (this.isOnSpeeder) {
      console.log('🚀 Jane mounted the MagnetoSpeeder!');
      
      // Show welcome message with controls
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height - 100;
      
      const boardingMessage = this.add.text(centerX, centerY, 
        '🚀 MagnetoSpeeder Activated!\nPress WASD or Arrow Keys to move\nPress number keys 1-9 for speed\nPress H for hypersonic mode!', {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#00ff88',
        backgroundColor: '#001122',
        padding: { x: 12, y: 8 },
        align: 'center'
      }).setOrigin(0.5).setDepth(2000).setScrollFactor(0);

      // Auto-hide the message
      this.time.delayedCall(4000, () => {
        this.tweens.add({
          targets: boardingMessage,
          alpha: 0,
          duration: 1000,
          onComplete: () => boardingMessage.destroy()
        });
      });

      // Mount Jane on the speeder (make Jane invisible, control speeder)
      const janeSprite = this.playerManager.getJaneSprite();
      if (janeSprite) {
        janeSprite.setVisible(false);
        // Position speeder where Jane was
        this.magnetoSpeederSprite.setPosition(janeSprite.x, janeSprite.y);
      }
      
    } else {
      console.log('👩‍🚀 Jane dismounted the MagnetoSpeeder');
      
      // Dismount Jane (make Jane visible again)
      const janeSprite = this.playerManager.getJaneSprite();
      if (janeSprite) {
        janeSprite.setVisible(true);
        janeSprite.setPosition(this.magnetoSpeederSprite.x + 32, this.magnetoSpeederSprite.y);
      }
      
      // Hide hypersonic effect
      if (this.hypersonicEffectSprite) {
        this.hypersonicEffectSprite.setVisible(false);
      }
    }
  }

  private updateSpeederMovement() {
    if (!this.isOnSpeeder || !this.magnetoSpeederSprite) return;

    const cursors = this.input.keyboard?.createCursorKeys();
    
    if (!cursors) return;

    // Get WASD keys individually
    const keyW = this.input.keyboard?.addKey('W');
    const keyA = this.input.keyboard?.addKey('A');
    const keyS = this.input.keyboard?.addKey('S');
    const keyD = this.input.keyboard?.addKey('D');

    // Get current speed from NavigationManager
    const currentSpeed = this.navigationManager.getCurrentSpeed();
    
    // Convert km/h to pixels per second for game movement
    // Scale it down for playable speeds (1 km/h = 0.1 pixels/second base)
    const baseSpeedMultiplier = 0.1;
    const gameSpeed = Math.min(currentSpeed * baseSpeedMultiplier, 800); // Cap at 800 for performance
    
    // Apply movement
    let velocityX = 0;
    let velocityY = 0;
    
    if (cursors.left.isDown || keyA?.isDown) {
      velocityX = -gameSpeed;
    } else if (cursors.right.isDown || keyD?.isDown) {
      velocityX = gameSpeed;
    }
    
    if (cursors.up.isDown || keyW?.isDown) {
      velocityY = -gameSpeed;
    } else if (cursors.down.isDown || keyS?.isDown) {
      velocityY = gameSpeed;
    }
    
    this.magnetoSpeederSprite.setVelocity(velocityX, velocityY);
    
    // Update hypersonic effect
    this.updateHypersonicEffect(currentSpeed);
    
    // Update camera to follow speeder
    this.cameras.main.startFollow(this.magnetoSpeederSprite, true, 0.1, 0.1);
    
    // Update terrain streaming based on speeder position
    this.chunkLoader.updateLoadedChunks(
      this.magnetoSpeederSprite.x, 
      this.magnetoSpeederSprite.y, 
      currentSpeed
    );
  }

  private updateHypersonicEffect(speedKmh: number) {
    if (!this.hypersonicEffectSprite || !this.magnetoSpeederSprite) return;

    if (speedKmh > 12000) { // Hypersonic speeds
      this.hypersonicEffectSprite.setVisible(true);
      this.hypersonicEffectSprite.setPosition(
        this.magnetoSpeederSprite.x - 20, // Offset behind speeder
        this.magnetoSpeederSprite.y
      );
      
      // Intensity based on speed
      const intensity = Math.min(speedKmh / 343000, 1); // Max at Mach 1000
      this.hypersonicEffectSprite.setAlpha(0.3 + intensity * 0.5);
      this.hypersonicEffectSprite.setScale(0.5 + intensity * 1.5);
      
      // Rotate effect based on movement direction
      const body = this.magnetoSpeederSprite.body as Phaser.Physics.Arcade.Body;
      if (body) {
        const angle = Math.atan2(body.velocity.y, body.velocity.x);
        this.hypersonicEffectSprite.setRotation(angle);
      }
      
    } else {
      this.hypersonicEffectSprite.setVisible(false);
    }
  }

  private showWelcomeMessage() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const welcomeText = `🚀 HYPERSONIC NAVIGATION ACTIVATED 🚀

Use WASD or Arrow Keys to move Jane (blue character)
Walk to the MagnetoSpeeder (spacecraft) and press F to board
Once aboard: Press number keys 1-9 for speed selection
Press H to enable hypersonic mode (Mach 1000!)

Current terrain: Real Earth geography
Camera will auto-adjust for high speeds

CONTROLS TEST:
- WASD / Arrow Keys: Move Jane
- F: Board/Exit MagnetoSpeeder
- 1-9: Speed selection (when aboard)
- H: Hypersonic toggle`;

    const welcomeMessage = this.add.text(centerX, centerY, welcomeText, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00ff88',
      backgroundColor: '#001122',
      padding: { x: 20, y: 16 },
      align: 'center'
    }).setOrigin(0.5).setDepth(2000).setScrollFactor(0);

    // Fade in
    welcomeMessage.setAlpha(0);
    this.tweens.add({
      targets: welcomeMessage,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    // Auto-hide after 7 seconds (longer to read controls)
    this.time.delayedCall(7000, () => {
      this.tweens.add({
        targets: welcomeMessage,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => welcomeMessage.destroy()
      });
    });
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
    
    // Update UI with current game state
    this.updateUIElements();
    
    // Basic manual player movement for testing
    this.updateBasicPlayerMovement();
    
    // Check distance to MagnetoSpeeder and show interaction hint
    this.updateSpeederInteractionHint();
    
    // Optionally, update ley line overlay if ley lines are dynamic
    // this.refreshLeyLineOverlay();
  }

  private updateUIElements() {
    if (!this.uiBarSystem) return;
    
    // Update health and PSI (placeholder values for now)
    this.uiBarSystem.updateHealth(100, 100);
    this.uiBarSystem.updatePSI(75, 100);
    
    // Update status text
    const asiControlled = this.playerManager?.isJaneASIControlled() ? 'ASI' : 'Manual';
    const trustLevel = this.trustManager?.getTrustLevel() || 50;
    this.uiBarSystem.updateStatus(`${asiControlled} • Trust: ${Math.round(trustLevel)}%`);
    
    // Update speed indicator  
    const navigationSpeed = 1.0; // Default speed for now - will be updated when navigation system is properly integrated
    this.uiBarSystem.updateSpeed(navigationSpeed);
  }

  private updateBasicPlayerMovement() {
    const controls = (this as any).playerControls;
    if (!controls) return;

    const janeSprite = this.playerManager.getJaneSprite();
    if (!janeSprite || this.isOnSpeeder) return;

    const { cursors, wasd } = controls;
    const speed = 200;

    let velocityX = 0;
    let velocityY = 0;

    // Check WASD and arrow keys
    if (cursors?.left?.isDown || wasd?.A?.isDown) {
      velocityX = -speed;
    } else if (cursors?.right?.isDown || wasd?.D?.isDown) {
      velocityX = speed;
    }

    if (cursors?.up?.isDown || wasd?.W?.isDown) {
      velocityY = -speed;
    } else if (cursors?.down?.isDown || wasd?.S?.isDown) {
      velocityY = speed;
    }

    janeSprite.setVelocity(velocityX, velocityY);
  }

  private updateSpeederInteractionHint() {
    const janeSprite = this.playerManager.getJaneSprite();
    if (!janeSprite || !this.magnetoSpeederSprite || this.isOnSpeeder) return;

    const distance = Phaser.Math.Distance.Between(
      janeSprite.x, janeSprite.y,
      this.magnetoSpeederSprite.x, this.magnetoSpeederSprite.y
    );

    // Show/hide interaction hint
    if (distance < 80) {
      if (!(this as any).interactionHint) {
        const hint = this.add.text(
          this.magnetoSpeederSprite.x, 
          this.magnetoSpeederSprite.y - 60,
          'Press F to board MagnetoSpeeder',
          {
            fontSize: '14px',
            color: '#00ff88',
            backgroundColor: '#001122',
            padding: { x: 8, y: 4 }
          }
        ).setOrigin(0.5).setDepth(1000);
        
        (this as any).interactionHint = hint;
      }
    } else {
      if ((this as any).interactionHint) {
        (this as any).interactionHint.destroy();
        (this as any).interactionHint = null;
      }
    }
  }

  // Handle screen resize
  resize() {
    if (this.uiLayoutManager) {
      this.uiLayoutManager.onResize();
    }
    if (this.uiBarSystem) {
      this.uiBarSystem.onResize();
    }
  }
}
