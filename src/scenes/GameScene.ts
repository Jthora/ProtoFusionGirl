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
import { MissionManager } from '../world/missions/MissionManager';
import { AnchorManager } from './AnchorManager';
import { PlayerManager } from '../core/PlayerManager';
import { ModularGameLoop } from '../core/ModularGameLoop';
import { createTileset, createPlayerSpritesheet, createPlaceholderCanvas, createMagnetoSpeederSprite, createHypersonicEffectSprite, createDropPodTexture } from '../utils/PlaceholderAssets';
import { EventBus } from '../core/EventBus';
import { getBootstrapContext } from '../core/GameBootstrap';
import { InteractionDiagnostics } from '../debug/InteractionDiagnostics';
import { UIManager } from '../core/UIManager';
import { EnemyManager } from '../core/EnemyManager';
import { WorldEditorManager } from '../core/WorldEditorManager';
import { DevToolsManager } from '../core/DevToolsManager';
import { NarrativeManager } from '../core/NarrativeManager';
import { PluginManager } from '../core/PluginManager';
import { registerModEnemies, registerModAttacks } from '../mods/mod_loader';
import { NPCManager } from '../core/NPCManager';
import { InventoryManager } from '../core/InventoryManager';
import { InventoryOverlay } from '../ui/components/InventoryOverlay';
import { DialogueManager } from '../core/DialogueManager';
import { DialogueModal } from '../ui/components/DialogueModal';
import { LeyLineManager } from '../world/leyline/LeyLineManager';
import { WorldStateManager } from '../world/WorldStateManager';
import { NavigationManager } from '../navigation/core/NavigationManager';
import { SpeedControlUI } from '../navigation/ui/SpeedControlUI';
import { TileRegistry } from '../world/tilemap/TileRegistry';
import { TileSpriteFactory } from '../world/tilemap/TileSpriteFactory';
import { RealityWarpSystem } from '../world/RealityWarpSystem';
import { TILE_SIZE } from '../world/tilemap/constants';
// New UI Layout System
import { UILayoutManager } from '../ui/layout/UILayoutManager';
import { UIBarSystem } from '../ui/layout/UIBarSystem';
// Extracted scene modules
import { SpeederController } from './SpeederController';
import { TerrainSceneSetup } from './TerrainSceneSetup';
import { ASISceneIntegration } from './ASISceneIntegration';
import { LeyLineSceneIntegration } from './LeyLineSceneIntegration';
import { JaneAI, JaneAIState } from '../ai/JaneAI';
import { REAL_SPRITES_ENABLED, JANE_ATLAS_KEY, JANE_ATLAS_PNG, JANE_ATLAS_JSON } from '../data/spriteConstants';
import { JANE_ANIM_SPEC } from '../data/animationCatalog';
import { EmotionSystem } from '../ai/EmotionSystem';
import { NodeManager } from '../world/NodeManager';
import { CheckpointManager } from '../core/CheckpointManager';
import { EnemyTypes } from '../combat/EnemyTypes';
import { ThrottleController } from '../navigation/controls/ThrottleController';
import { ProvisionManager } from '../provision/ProvisionManager';
import { ResearchProjects } from '../provision/ResearchProjects';
import { FastTravelManager } from '../navigation/FastTravelManager';
import { EventHistoryLog } from '../world/EventHistoryLog';
import { RewindSystem } from '../world/RewindSystem';
import { CosmicCalendar } from '../world/CosmicCalendar';
import { JonoHologram } from '../ai/JonoHologram';
import { ASIDashboard } from '../ui/ASIDashboard';
import { HologramFX } from '../world/fx/HologramFX';
import { Terra } from '../ai/Terra';
import { RiftManager } from '../world/RiftManager';
import { SessionPersistence, extractJaneSaveData, applyJaneSaveData } from '../save/SaveSystem';
import { AudioManager, preloadAllAudio, AUDIO_KEYS } from '../audio/AudioManager';
import { preloadCombinatorialAudio } from '../audio/CombinatorialPool';
import { HarmonicEngine } from '../audio/HarmonicEngine';
import { ULPuzzleManager } from '../ul/ULPuzzleManager';
import { MissionSystem, Mission as SysMission } from '../world/missions/MissionSystem';
import { sampleMissions } from '../world/missions/sampleMissions';
import { MissionHUD } from '../ui/MissionHUD';
import { HoloDeckGrid } from '../ui/HoloDeckGrid';
import { PsiNetLog, LogCategory } from '../ui/PsiNetLog';
import { JonoTransmission } from '../ui/JonoTransmission';
import { VisionDegradation, VisionState } from '../ui/VisionDegradation';
import { ChannelSaturation } from '../ui/ChannelSaturation';
import { WorldMaterialization } from '../ui/WorldMaterialization';
import { SectorScanRadar, RadarEntity } from '../ui/SectorScanRadar';
import { BeuSignatureRenderer, BeuLifecycleStage } from '../ui/BeuSignatureRenderer';
import { BeuDataPanel } from '../ui/BeuDataPanel';
import { BeuTransmission } from '../ui/BeuTransmission';

// Asset validation is dev-only — not needed at runtime
// process.env.NODE_ENV works in both Vite (replaces at build time) and Jest (Node.js)
const _DEV = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export class GameScene extends Phaser.Scene {
  private playerManager!: PlayerManager;
  private backgroundFar!: Phaser.GameObjects.TileSprite;
  private backgroundNear!: Phaser.GameObjects.TileSprite;
  private inputManager!: InputManager;
  private tilemapManager!: TilemapManager;
  private chunkLoader!: ChunkLoader;
  private missionManager: MissionManager = new MissionManager();
  private missionSystem!: MissionSystem;
  private missionHUD!: MissionHUD;
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
  private realityWarpSystem!: RealityWarpSystem;

  // --- Modular Game Loop ---
  private modularGameLoop!: ModularGameLoop;
  private eventBus!: EventBus;

  private uiManager!: UIManager;
  private worldEditorManager!: WorldEditorManager;
  private devToolsManager!: DevToolsManager;
  private narrativeManager!: NarrativeManager;
  private pluginManager!: PluginManager;

  // New UI Layout System
  private uiLayoutManager!: UILayoutManager;
  private uiBarSystem!: UIBarSystem;

  // Extracted scene modules
  private speederController!: SpeederController;
  private asiIntegration!: ASISceneIntegration;
  private leyLineIntegration!: LeyLineSceneIntegration;

  // Jane AI state machine (P1)
  private janeAI!: JaneAI;
  private waypointMarker?: Phaser.GameObjects.Graphics;

  // P2: World state and respawn
  private nodeManager!: NodeManager;
  private checkpointManager!: CheckpointManager;
  private throttleController!: ThrottleController;
  private provisionManager!: ProvisionManager;
  private emotionSystem!: EmotionSystem;
  private fastTravelManager!: FastTravelManager;

  // P4: Depth systems
  private eventHistoryLog!: EventHistoryLog;
  private rewindSystem!: RewindSystem;
  private cosmicCalendar!: CosmicCalendar;
  private jonoHologram!: JonoHologram;
  private jonoSprite?: Phaser.GameObjects.Sprite;
  private jonoHologramFX?: HologramFX;
  private asiDashboard!: ASIDashboard;
  private audioManager!: AudioManager;

  // World materialization overlay (Stage 2.2 — immersion system)
  private worldMaterialization?: WorldMaterialization;
  // Sector scan radar (Stage 6.3 — cinematic)
  private sectorScanRadar?: SectorScanRadar;
  // HoloDeck grid overlay (Stage 2.3 — immersion system)
  private holoDeckGrid!: HoloDeckGrid;
  // PsiNet ambient log (Stage 3.2 — living console)
  private psiNetLog!: PsiNetLog;
  // Vision degradation overlay (Stage 4.2)
  private visionDegradation!: VisionDegradation;
  // ASI channel saturation tracker (Stage 4.3)
  private channelSaturation!: ChannelSaturation;
  // Jane psionic aura (Stage 4.1.3)
  private janeAura?: Phaser.GameObjects.Graphics;

  // P3: Content wiring (5511-5514)
  private terra!: Terra;
  private riftManager!: RiftManager;
  private ulPuzzleManager!: ULPuzzleManager;
  private harmonicEngine!: HarmonicEngine;
  private beuGlow?: Phaser.GameObjects.Graphics;
  // Beu data signature (Stage 6.2)
  private beuSig?: BeuSignatureRenderer;

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

  // Navigation and speed systems
  private navigationManager!: NavigationManager;
  private speedControlUI!: SpeedControlUI;
  // Reference rarely-used members to satisfy TypeScript checks in tests
  private __keepRefsForTypeChecker() {
    void this.chunkRadius;
    void this.worldEditorManager;
    void this.devToolsManager;
    void this.narrativeManager;
    void this.pluginManager;
    void this.leyLineManager;
    void this.speedControlUI;
  }

  // --- WORLD STATE MANAGER SETUP ---
  private worldStateManager!: WorldStateManager;

  constructor() {
    super({ key: 'GameScene' });
  // no-op to satisfy TS unused checks in tests
  this.__keepRefsForTypeChecker();
  }

  preload() {
    // Audio — only load if not already cached (StartScene may have loaded them)
    if (!this.cache.audio.has(AUDIO_KEYS.MUSIC_GAMEPLAY_LOOP)) {
      preloadAllAudio(this.load);
    }
    // 2nd-pass combinatorial audio (372 files)
    if (!this.cache.audio.has('tone_0_p1_v1')) {
      preloadCombinatorialAudio(this.load);
    }

    // Drop Pod texture (FE-1)
    if (!this.textures.exists('drop_pod')) {
      const dropPodCanvas = createDropPodTexture();
      this.textures.addCanvas('drop_pod', dropPodCanvas);
    }

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
      _DEV && console.log('🎨 Tileset loading complete');
      const texture = this.textures.get('tilesheet');
      if (texture && texture.frames) {
        _DEV && console.log(`✅ Tilesheet loaded with ${Object.keys(texture.frames).length} frames`);
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

    // --- REAL SPRITE ATLAS (Stage 1.5+) ---
    if (REAL_SPRITES_ENABLED) {
      this.load.atlas(JANE_ATLAS_KEY, JANE_ATLAS_PNG, JANE_ATLAS_JSON);
    }
  }

  // Save mission state to localStorage (or replace with your save system)
  private saveMissionState() {
    const data = this.missionManager.serializeMissions();
    localStorage.setItem('missionState', JSON.stringify(data));
  }

  create() {
    try {
      _DEV && console.log('🎮 GameScene create() method called');
      
      // Check if textures are available
      _DEV && console.log('🔍 Checking loaded textures:');
      _DEV && console.log('- tilesheet exists:', this.textures.exists('tilesheet'));
      _DEV && console.log('- player exists:', this.textures.exists('player'));
      _DEV && console.log('- magnetospeeder exists:', this.textures.exists('magnetospeeder'));
      
      // --- Settings integration ---
      const settings = SettingsService.getInstance();
    if (settings.get('showDebug')) {
      _DEV && console.log('[Settings] Debug mode enabled');
    }
    settings.onChange((newSettings) => {
      if (typeof newSettings.showDebug === 'boolean') {
        // Toggle debug overlays, etc.
      }
    });

    _DEV && console.log('🖼️ Setting up backgrounds...');
    if (!this.textures.exists('background-far')) {
      _DEV && console.warn('⚠️ background-far texture missing, creating fallback');
      this.textures.addCanvas('background-far', createPlaceholderCanvas(800, 600, '#001122'));
    }
    
    if (!this.textures.exists('background-near')) {
      _DEV && console.warn('⚠️ background-near texture missing, creating fallback');
      this.textures.addCanvas('background-near', createPlaceholderCanvas(800, 600, '#003344'));
    }

    // Parallax backgrounds
    this.backgroundFar = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background-far').setOrigin(0, 0).setScrollFactor(0);
    this.backgroundNear = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background-near').setOrigin(0, 0).setScrollFactor(0);
    
    _DEV && console.log('✅ Backgrounds created successfully');

  _DEV && console.log('🎨 Setting up UI Layout System...');
  const bootstrap = getBootstrapContext(this);
  this.eventBus = bootstrap.eventBus;
  this.inputManager = bootstrap.inputManager;
  this.uiLayoutManager = new UILayoutManager(this);
  this.uiLayoutManager.setMode('standard');
  try { if (typeof window !== 'undefined' && window.location.search.includes('diag=1')) new InteractionDiagnostics(this, this.eventBus); } catch {}
    
    this.uiBarSystem = new UIBarSystem(this, this.uiLayoutManager);
    this.add.existing(this.uiBarSystem);
    
    _DEV && console.log('✅ UI Layout System initialized');

    // --- WORLD INITIALIZATION ---
    this.worldSeed = 'fusiongirl-' + Date.now();
    this.tilemapManager = new TilemapManager();
    this.realityWarpSystem = new RealityWarpSystem(this.tilemapManager);
    
    this.worldStateManager = new WorldStateManager({
      version: 1,
      leyLines: [],
      rifts: [],
      players: [],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: false, aiAgents: [], mods: [] }
    }, this.eventBus);

    this.leyLineManager = new LeyLineManager(this.worldStateManager, this.eventBus);

    // --- MISSION SYSTEM SETUP ---
    this.missionManager.loadMissions(sampleMissions);
    // Restore saved mission progress from prior session
    try {
      const savedMissionState = localStorage.getItem('missionState');
      if (savedMissionState) this.missionManager.restoreMissions(JSON.parse(savedMissionState));
    } catch { /* corrupted save — start fresh */ }
    // Ensure a player entry exists in world state for MissionSystem tracking
    const wsState = this.worldStateManager.getState();
    const wsPlayers: any[] = wsState.players ?? [];
    if (!wsPlayers.find((p: any) => p.id === 'player_1')) {
      this.worldStateManager.updateState({ players: [{ id: 'player_1' } as any] });
    }
    this.missionSystem = new MissionSystem(this.worldStateManager, this.eventBus, 'player_1');
    // Start all currently active missions so event tracking is live
    for (const m of this.missionManager.getAllMissions()) {
      if (m.status === 'active') {
        const sysMission: SysMission = {
          id: m.id, title: m.title, description: m.description,
          status: 'active',
          objectives: m.objectives.map(o => ({
            id: o.id,
            type: (o.type as SysMission['objectives'][0]['type']) ?? 'custom',
            target: String(o.target),
            count: 1,
            progress: o.status === 'complete' ? 1 : 0,
            completed: o.status === 'complete',
          })),
        };
        this.missionSystem.startMission(sysMission);
      }
    }
    // Auto-save mission state whenever a mission completes
    this.missionManager.onMissionCompleted = (id) => {
      this.saveMissionState();
      this.eventBus.emit({ type: 'MISSION_COMPLETED', data: { missionId: id } });
    };
    // Mission HUD — shows active objective to the player
    this.missionHUD = new MissionHUD(this, this.missionManager, this.eventBus);

    this.tilemapManager.worldGen.generateFromSeed(this.worldSeed);

    // --- TERRAIN SETUP (delegated to TerrainSceneSetup) ---
    _DEV && console.log('🏗️ Setting up dynamic terrain-aware spawn system...');
    const terrain = TerrainSceneSetup.init(this, this.tilemapManager);
    this.groundGroup = terrain.groundGroup;
    this.chunkLoader = terrain.chunkLoader!;
    const { platformX, platformY, playerStartX, playerStartY, dynamicGroundLevel } = terrain;
    
    _DEV && console.log(`🌍 Dynamic ground level at x=${platformX}: ${dynamicGroundLevel}`);
    _DEV && console.log(`🏗️ Platform positioned at: (${platformX}, ${platformY})`);

    // --- PLAYER MANAGER SETUP ---
    _DEV && console.log('👤 Setting up Player Manager...');
    const tileSize = TILE_SIZE;
    let janeSprite: Phaser.Physics.Arcade.Sprite | undefined;
    try {
      this.playerManager = new PlayerManager({
        scene: this,
        eventBus: this.eventBus,
        inputManager: this.inputManager,
        enemyManager: this.enemyManager,
        attackRegistry: this.attackRegistry,
        playerConfig: {
          x: playerStartX,
          y: playerStartY,
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
    janeSprite = this.playerManager.getJaneSprite();
    if (janeSprite) {
      if (this.anims.exists('idle')) {
        janeSprite.play('idle', true);
        _DEV && console.log('✅ Started idle animation successfully');
      } else {
        _DEV && console.warn('⚠️ Idle animation not ready yet, will start later');
        this.time.delayedCall(100, () => {
          if (janeSprite && this.anims.exists('idle')) {
            janeSprite.play('idle', true);
            _DEV && console.log('✅ Started idle animation after delay');
          } else {
            console.error('❌ Idle animation still not available after delay');
          }
        });
      }
    }

    // --- REAL SPRITE ANIMATIONS (Stage 2.4) ---
    if (REAL_SPRITES_ENABLED && janeSprite) {
      janeSprite.setTexture(JANE_ATLAS_KEY);
      for (const [key, spec] of Object.entries(JANE_ANIM_SPEC)) {
        if (!this.anims.exists(key)) {
          const frameKeys = this.textures.get(JANE_ATLAS_KEY).getFrameNames()
            .filter((f: string) => f.startsWith(key + '_'))
            .sort();
          this.anims.create({
            key,
            frames: frameKeys.map((f: string) => ({ key: JANE_ATLAS_KEY, frame: f })),
            frameRate: spec.fps,
            repeat: spec.loop ? -1 : 0,
          });
        }
      }
      this.eventBus.on('JANE_ANIMATION_CHANGED', (event) => {
        const sprite = this.playerManager.getJaneSprite();
        if (sprite) sprite.play(event.data.animKey, true);
      });
      janeSprite.play('jane_idle', true);
    }

    _DEV && console.log('✅ Player Manager setup completed successfully');
    } catch (error) {
      console.error('❌ Error setting up Player Manager:', error);
      throw error;
    }

    if (janeSprite) {
      // Physics collision and camera
      this.physics.add.collider(janeSprite, this.groundGroup);
      this.cameras.main.startFollow(janeSprite);
      // FE-1: Start drop-in sequence — slightly pulled back to show the landing zone
      this.cameras.main.setZoom(0.7);
      janeSprite.setAlpha(0);

      // --- MAGNETO SPEEDER SETUP (delegated to SpeederController) ---
      _DEV && console.log('🚀 Creating MagnetoSpeeder...');
      const speederStartX = platformX + tileSize;
      const speederStartY = playerStartY;
      this.speederController = new SpeederController({
        scene: this,
        playerManager: this.playerManager,
        groundGroup: this.groundGroup,
        chunkLoader: this.chunkLoader,
        speederStartX,
        speederStartY,
      });
      _DEV && console.log(`✅ MagnetoSpeeder positioned on platform: (${speederStartX}, ${speederStartY})`);

      // Initial chunk loading with dynamic spawn adjustment
      if (this.chunkLoader && this.textures.exists('tilesheet')) {
        _DEV && console.log('🌍 Loading initial chunks around platform...');
        try {
          this.chunkLoader.updateLoadedChunks(playerStartX, playerStartY);
          _DEV && console.log('✅ Initial chunks loaded successfully');
          TerrainSceneSetup.adjustSpawnForLoadedTerrain(
            this, this.groundGroup, this.tilemapManager,
            this.playerManager, this.speederController.getSprite(),
            platformX, playerStartY
          );
        } catch (error) {
          console.error('❌ Error loading initial chunks:', error);
          _DEV && console.log('⚠️ Continuing with platform-only mode');
        }
      }

      // Start continuous terrain monitoring
      TerrainSceneSetup.monitorTerrainChanges(
        this, this.groundGroup, this.tilemapManager,
        this.playerManager, this.chunkLoader
      );
      _DEV && console.log('✅ Platform and terrain setup completed');
    }

    _DEV && console.log('✅ World initialization complete!');

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
      janeSprite,
      { eventBus: this.eventBus }
    );
    // Spawn slime behind Jane (player-visible from ASI perspective, but Jane faces away)
    // Positioned right of spawn point so player sees threat Jane cannot
    this.enemyManager.spawnEnemy('slime', playerStartX + 380, playerStartY);

    // --- PLAYER ATTACK CONTROLLER SETUP ---
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.playerManager.getPlayerAttackController()?.attackNearestEnemy();
    });

    // --- MODULAR GAME LOOP SETUP ---
    this.modularGameLoop = new ModularGameLoop(this.eventBus);

    this.modularGameLoop.registerSystem({
      id: 'player-update',
      priority: 1,
      update: (dt) => {
        // Jane AI drives autonomous behavior; manual WASD is dev fallback
        if (this.janeAI) {
          this.janeAI.update(dt);
        }
        this.playerManager.getJane()?.updateAI?.(dt);
      }
    });

    this.modularGameLoop.registerSystem({
      id: 'navigation-update',
      priority: 1.5,
      update: (dt) => {
        this.navigationManager?.update(dt);
      }
    });

    this.modularGameLoop.registerSystem({
      id: 'speeder-movement',
      priority: 1.6,
      update: () => {
        this.speederController?.updateMovement();
      }
    });

    this.modularGameLoop.registerSystem({
      id: 'enemy-update',
      priority: 3,
      update: () => {
        this.enemyManager?.update?.();
      }
    });

    this.modularGameLoop.registerSystem({
      id: 'node-stability',
      priority: 3.5,
      update: (dt) => {
        this.nodeManager?.update(dt / 1000); // dt is ms, NodeManager expects seconds
      }
    });

    this.modularGameLoop.registerSystem({
      id: 'provision',
      priority: 3.6,
      update: (dt) => {
        this.provisionManager?.update(dt);
      }
    });

    this.modularGameLoop.registerSystem({
      id: 'emotion',
      priority: 3.7,
      update: (dt) => {
        this.emotionSystem?.update(dt);
      }
    });

    this.modularGameLoop.registerSystem({
      id: 'ui-update',
      priority: 4,
      update: (dt) => {
        this.uiManager?.update?.(dt, {});
      }
    });

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
      [],
      this.eventBus,
      {
        createASIOverlay: false,
        showASIOnStart: false,
        createLoreTerminal: false
      }
    );
    // Minimap suppressed — SectorScanRadar (circular DOM overlay, bottom-right) supersedes it.
    // To re-enable: pass createMinimap: true to UIManager and un-comment the line below.
    // if (this.uiManager.minimap) { this.uiLayoutManager.registerComponent('minimap', this.uiManager.minimap as any, 'topBar', 'essential'); }
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

    // --- NAVIGATION MANAGER SETUP ---
    _DEV && console.log('🧭 Setting up Navigation Manager...');
    this.navigationManager = new NavigationManager({
      eventBus: this.eventBus,
      playerManager: this.playerManager,
      uiManager: this.uiManager,
      scene: this
    });
    _DEV && console.log('✅ Navigation Manager initialized');

    // Wire navigation to speeder (created before navigation was available)
    if (this.speederController) {
      this.speederController.setNavigationManager(this.navigationManager);
    }

    // --- SPEED CONTROL UI SETUP ---
    _DEV && console.log('🚀 Setting up Speed Control UI...');
    this.speedControlUI = new SpeedControlUI(
      this,
      this.eventBus,
      this.navigationManager
    );
    _DEV && console.log('✅ Speed Control UI initialized');

    // --- ASI CONTROL INTERFACE (delegated to ASISceneIntegration) ---
    this.asiIntegration = new ASISceneIntegration({
      scene: this,
      eventBus: this.eventBus,
      playerManager: this.playerManager,
      uiLayoutManager: this.uiLayoutManager,
      uiShowFeedback: (msg: string) => this.uiManager.showFeedback(msg),
      getSpeederState: () => ({
        isOnSpeeder: this.speederController?.getIsOnSpeeder() ?? false,
        sprite: this.speederController?.getSprite()
      })
    });

    // --- LEY LINE VISUALIZATION (delegated to LeyLineSceneIntegration) ---
    this.leyLineIntegration = new LeyLineSceneIntegration({
      scene: this,
      eventBus: this.eventBus,
      worldStateManager: this.worldStateManager,
      uiManager: this.uiManager,
      uiLayoutManager: this.uiLayoutManager
    });

    // --- NPC MANAGER SETUP ---
    this.npcManager = new NPCManager(this.eventBus);
    NPCManager.registerGlobalInstance(this.npcManager);
    this.testNPCSprite = NPCManager.spawnTestNPC(this, (npcId) => this.handleNPCInteraction(npcId));
    this.input.keyboard?.on('keydown-E', () => {
      const janeSprite = this.playerManager.getJaneSprite();
      if (janeSprite && this.testNPCSprite && NPCManager.isPlayerNearNPC(janeSprite, this.testNPCSprite)) {
        this.handleNPCInteraction('npc_test_1');
      }
    });

    // --- INVENTORY MANAGER SETUP ---
    this.inventoryManager = new InventoryManager();
    InventoryManager.registerGlobalInstance(this.inventoryManager);
    let testItemSprite: Phaser.GameObjects.Sprite | undefined = InventoryManager.spawnTestItem(this, () => {
      this.inventoryManager.addItem({ id: 'nanochip', name: 'Nanochip', type: 'component', quantity: 1 });
    });
    // Item pickup: F key when near item (speeder boarding takes priority)
    this.input.keyboard?.on('keydown-F', () => {
      // Skip item pickup if near speeder (boarding has priority)
      if (this.speederController?.getIsOnSpeeder()) return;
      const janeSprite = this.playerManager.getJaneSprite();
      const speederSprite = this.speederController?.getSprite();
      if (janeSprite && speederSprite) {
        const speederDist = Phaser.Math.Distance.Between(janeSprite.x, janeSprite.y, speederSprite.x, speederSprite.y);
        if (speederDist < 64) return; // Speeder boarding takes priority
      }
      if (janeSprite && testItemSprite && InventoryManager.isPlayerNearItem(janeSprite, testItemSprite)) {
        this.inventoryManager.addItem({ id: 'nanochip', name: 'Nanochip', type: 'component', quantity: 1 });
        testItemSprite.destroy();
        testItemSprite = undefined;
      }
    });
    this.inventoryOverlay = new InventoryOverlay(this, this.inventoryManager);
    this.uiLayoutManager.registerComponent('inventoryOverlay', this.inventoryOverlay, 'overlays', 'contextual');
    this.uiLayoutManager.hideComponent('inventoryOverlay');
    this.input.keyboard?.on('keydown-I', () => {
      this.uiLayoutManager.toggleComponent('inventoryOverlay');
    });

    // --- DIALOGUE MANAGER SETUP ---
    this.dialogueManager = new DialogueManager();
    this.dialogueManager.registerDefaultNodes();
    this.dialogueModal = new DialogueModal(this, this.dialogueManager);
    this.dialogueManager.onDialogueStarted((node) => {
      this.dialogueModal?.show(node);
    });
    this.uiLayoutManager.registerComponent('dialogueModal', this.dialogueModal, 'overlays', 'contextual');
    this.uiLayoutManager.hideComponent('dialogueModal');

    // --- UI TOGGLES ---
    this.input.keyboard?.on('keydown-H', () => {
      const contextualVisible = this.uiLayoutManager.isComponentVisible('asiOverlay');
      if (contextualVisible) {
        this.uiLayoutManager.hideContextualUI();
      } else {
        this.uiLayoutManager.showEssentialUI();
      }
    });

    this.input.keyboard?.on('keydown-U', () => {
      this.uiLayoutManager.showLayoutDebug();
    });

    // Add basic player movement controls for testing
    this.addBasicPlayerControls();

    // --- JANE AI SETUP (P1 + P2 Combat) ---
    _DEV && console.log('🧠 Setting up Jane AI...');
    this.janeAI = new JaneAI({
      eventBus: this.eventBus,
      getSprite: () => {
        const s = this.playerManager.getJaneSprite();
        if (!s) return undefined;
        return { x: s.x, y: s.y, body: s.body as Phaser.Physics.Arcade.Body };
      },
      getHealth: () => {
        const jane = this.playerManager.getJane();
        if (!jane) return { current: 100, max: 100 };
        return { current: jane.stats.health, max: jane.stats.maxHealth };
      },
      getEnemiesInRange: (range: number) => {
        const sprite = this.playerManager.getJaneSprite();
        if (!sprite || !this.enemyManager) return [];
        return this.enemyManager.enemies
          .filter(e => e.isAlive)
          .filter(e => {
            const es = this.enemyManager.enemySprites.get(e);
            if (!es) return false;
            const dx = es.x - sprite.x;
            const dy = es.y - sprite.y;
            return Math.sqrt(dx * dx + dy * dy) <= range;
          })
          .map(e => {
            const es = this.enemyManager.enemySprites.get(e)!;
            return {
              id: e.definition.id,
              x: es.x,
              y: es.y,
              health: e.health,
              maxHealth: e.definition.maxHealth,
            };
          });
      },
      moveSpeed: 200,
      arrivalThreshold: 20,
      detectionRange: 200,
      attackRange: 80,
      attackCooldown: 800,
      attackDamage: 20,
      retreatHealthThreshold: 0.25,
    });

    // Wire JANE_ATTACK to actually damage enemies
    this.eventBus.on('JANE_ATTACK', (event) => {
      const target = this.enemyManager?.enemies.find(
        e => e.definition.id === event.data.targetId && e.isAlive
      );
      if (target) {
        target.takeDamage(event.data.damage);
      }
    });

    // --- P2: NODE MANAGER ---
    this.nodeManager = new NodeManager(this.eventBus);
    this.nodeManager.addNode({
      id: 'thora_base', name: "Tho'ra Base", x: 400, y: 300,
      stability: 80, maxStability: 100, decayRate: 0.5, surgeThreshold: 40,
    });
    this.nodeManager.addNode({
      id: 'node_2', name: 'Ley Nexus', x: 2000, y: 300,
      stability: 60, maxStability: 100, decayRate: 1.0, surgeThreshold: 40,
    });
    this.nodeManager.addNode({
      id: 'node_3', name: 'Rift Zone', x: 4000, y: 300,
      stability: 30, maxStability: 100, decayRate: 2.0, surgeThreshold: 40,
    });

    // --- P3: TERRA COMPANION (5511, 5513) ---
    this.terra = new Terra(this.eventBus);

    // --- P3: RIFT MANAGER (5512, 5514) ---
    this.riftManager = new RiftManager(this.eventBus);

    // --- P3: UL PUZZLE MANAGER — place damaged robot at Node 2 (5511) ---
    this.ulPuzzleManager = new ULPuzzleManager(this.eventBus);
    this.ulPuzzleManager.registerTarget({
      id: 'damaged_robot_node2',
      type: 'damaged_robot',
      x: 2000,
      y: 300,
      requiredSymbol: 'curve', // Earth+Water = Repair
    });

    // Wire NODE_STABILITY_CHANGED → rift spawn at node_3
    this.eventBus.on('NODE_STABILITY_CHANGED', (event) => {
      const node = this.nodeManager.getNode(event.data.nodeId);
      if (node) {
        const newRift = this.riftManager.checkNodeStability(node.id, event.data.newStability, node.x, node.y);
        // Register rift as a UL puzzle target when it spawns (5512)
        if (newRift) {
          this.ulPuzzleManager.registerTarget({
            id: `rift_${newRift.id}`,
            type: 'rift',
            x: newRift.x,
            y: newRift.y,
          });
        }
      }
    });

    // Wire RIFT_ENEMY_WAVE → spawn enemies near rift
    this.eventBus.on('RIFT_ENEMY_WAVE', (event) => {
      const rift = this.riftManager.getRift(event.data.riftId);
      if (rift && this.enemyManager) {
        for (let i = 0; i < event.data.count; i++) {
          const offsetX = (Math.random() - 0.5) * rift.radius * 2;
          this.enemyManager.spawnEnemy(event.data.enemyType || 'slime', rift.x + offsetX, rift.y - 40);
        }
      }
    });

    // Wire RIFT_SEALED → restore node stability (5514)
    this.eventBus.on('RIFT_SEALED', (event) => {
      this.nodeManager.restoreStability(event.data.nodeId, 30);
    });

    // Repair success (damaged robot at Node 2) → activate Terra (5513)
    // Also handle rift-seal UL puzzle success → seal the rift (5514)
    this.eventBus.on('UL_PUZZLE_SUCCESS', (event) => {
      const targetId: string = event.data.targetId ?? '';
      if (targetId.includes('damaged_robot') && !this.terra.isActivated()) {
        const node2 = this.nodeManager.getNode('node_2');
        this.terra.activate(node2?.x ?? 2000, node2?.y ?? 300);
      }
      if (targetId.includes('rift_')) {
        // Extract the rift id embedded in the puzzle target id (format: rift_rift_1)
        const riftId = targetId.replace(/^rift_/, '');
        const activeRift = this.riftManager.getRift(riftId) ?? this.riftManager.getActiveRifts()[0];
        if (activeRift) {
          this.riftManager.forceSeal(activeRift.id, 'player_ul');
        }
      }
    });

    // --- P2: CHECKPOINT MANAGER ---
    this.checkpointManager = new CheckpointManager(
      this.eventBus,
      { id: 'thora_base', x: 400, y: 300 },
      (x, y) => {
        // Respawn callback: reset Jane position and health
        const jane = this.playerManager.getJane();
        const sprite = this.playerManager.getJaneSprite();
        if (jane) {
          jane.stats.health = jane.stats.maxHealth;
          jane.stats.psi = jane.stats.maxPsi;
        }
        if (sprite) {
          sprite.setPosition(x, y);
          sprite.setVelocity(0, 0);
        }
      }
    );

    // Register enemy types
    for (const def of Object.values(EnemyTypes)) {
      this.enemyRegistry.registerEnemy(def);
    }

    // --- P2: THROTTLE CONTROLLER ---
    this.throttleController = new ThrottleController({ eventBus: this.eventBus });

    // --- P2: PROVISION MANAGER ---
    this.provisionManager = new ProvisionManager(this.eventBus);
    for (const proj of ResearchProjects) {
      this.provisionManager.registerProject(proj);
    }

    // --- P2: EMOTION SYSTEM ---
    this.emotionSystem = new EmotionSystem({
      eventBus: this.eventBus,
      getHealthRatio: () => {
        const jane = this.playerManager.getJane();
        if (!jane) return 1;
        return jane.stats.health / jane.stats.maxHealth;
      },
    });

    // --- P2: FAST TRAVEL MANAGER ---
    this.fastTravelManager = new FastTravelManager(this.eventBus);
    this.fastTravelManager.addNode({ id: 'thora_base', name: "Tho'ra Base", x: 400, y: 300, unlocked: true });
    this.fastTravelManager.addNode({ id: 'ley_nexus', name: 'Ley Nexus', x: 2200, y: 600, unlocked: true });
    this.fastTravelManager.addNode({ id: 'rift_zone', name: 'Rift Zone', x: 4000, y: 300, unlocked: false });

    // --- P4: EVENT HISTORY LOG + REWIND SYSTEM (6411) ---
    this.eventHistoryLog = new EventHistoryLog(this.eventBus);
    this.rewindSystem = new RewindSystem(this.eventBus, this.eventHistoryLog);
    // Wire rewind into death: on JANE_DEFEATED, record decision point + offer rewind
    this.eventBus.on('JANE_DEFEATED', () => {
      const jane = this.playerManager.getJane();
      const worldState = {
        health: jane?.stats.health ?? 0,
        psi: jane?.stats.psi ?? 0,
        nodeStabilities: this.nodeManager?.getAllNodes().map(n => ({ id: n.id, stability: n.stability })) ?? [],
      };
      this.rewindSystem.recordDecisionPoint('JANE_DEFEATED', 'death', worldState);
    });
    // Auto-record decision points on key events
    for (const evtType of ['GUIDANCE_ACCEPTED', 'COMBAT_STARTED', 'RIFT_SEALED', 'UL_PUZZLE_SUCCESS'] as const) {
      this.eventBus.on(evtType, () => {
        const jane = this.playerManager.getJane();
        this.rewindSystem.recordDecisionPoint(evtType, 'auto', {
          health: jane?.stats.health ?? 0,
          psi: jane?.stats.psi ?? 0,
        });
      });
    }

    // --- P4: COSMIC CALENDAR (6412) ---
    this.cosmicCalendar = new CosmicCalendar(this.eventBus);

    // --- P4: JONO HOLOGRAM at Tho'ra Base (6413) ---
    this.jonoHologram = new JonoHologram(this.eventBus, { baseX: 400, baseY: 300, triggerRadius: 150 });

    // Jono visual sprite (placeholder circle until real sprite available)
    {
      const jonoCanvas = document.createElement('canvas');
      jonoCanvas.width = 32; jonoCanvas.height = 64;
      const ctx = jonoCanvas.getContext('2d')!;
      ctx.fillStyle = '#00e5ff';
      ctx.globalAlpha = 0.7;
      ctx.fillRect(8, 0, 16, 64);
      this.textures.addCanvas('jono_placeholder', jonoCanvas);
      this.jonoSprite = this.add.sprite(400, 300, 'jono_placeholder').setAlpha(0);
      this.jonoHologramFX = new HologramFX(this, this.jonoSprite);
    }

    // --- ASI DASHBOARD (Phase 5: UI reframe) ---
    this.asiDashboard = new ASIDashboard(this.eventBus);
    // Seed node data from nodeManager
    for (const node of this.nodeManager.getAllNodes()) {
      this.asiDashboard.addNode({
        id: node.id,
        name: node.name,
        stability: node.stability,
        maxStability: node.maxStability,
      });
    }

    // --- AUDIO MANAGER ---
    this.audioManager = new AudioManager(this, this.eventBus);

    // Wire position references for spatial audio
    this.audioManager.setPositionRefs(
      () => this.playerManager?.getJaneSprite()?.x ?? 0,
      () => this.riftManager?.getActiveRifts().map(r => ({ x: r.x ?? 0, y: r.y ?? 0 })) ?? []
    );

    // Setup ambient zones anchored to Jane's spawn point
    this.audioManager.setupAmbientZones(playerStartX);

    // Seed node stabilities into tension system
    for (const node of this.nodeManager.getAllNodes()) {
      this.audioManager.updateNodeStability(node.id, node.stability);
    }
    this.eventBus.on('NODE_STABILITY_CHANGED', (e) => {
      this.audioManager?.updateNodeStability(e.data.nodeId, e.data.newStability);
    });

    // Connection SFX + gameplay music
    this.audioManager.playSfx(AUDIO_KEYS.SFX_CONNECTION_OK);
    this.time.delayedCall(800, () => {
      this.audioManager.playMusic(AUDIO_KEYS.MUSIC_GAMEPLAY_LOOP, 2000);
    });

    // --- HARMONIC ENGINE (Layer 3 emotional audio) ---
    this.harmonicEngine = new HarmonicEngine(this);
    const savedSession = SessionPersistence.load();
    this.harmonicEngine.setState({
      trustLevel: savedSession?.trustLevel ?? 50,
      beuStage: 'seed',
      emotionalAngle: 0,
      lowestNodeStability: 100,
      riftProximity: 0,
    });

    // Node events → HarmonicEngine
    this.eventBus.on('NODE_COLLAPSED', (e) => {
      this.harmonicEngine?.onNodeCollapse(e.data?.nodeId ?? '');
    });
    this.eventBus.on('NODE_STABILITY_CHANGED', (ev) => {
      const nodes = this.nodeManager?.getAllNodes() ?? [];
      const lowest = nodes.length > 0 ? Math.min(...nodes.map(n => n.stability)) : 100;
      this.harmonicEngine?.setState({ lowestNodeStability: lowest });
    });

    // Trust changes → HarmonicEngine
    this.eventBus.on('TRUST_CHANGED', (ev) => {
      this.harmonicEngine?.setState({ trustLevel: ev.data?.currentLevel ?? 50 });
    });

    // UL cast events → HarmonicEngine
    this.eventBus.on('UL_PUZZLE_DEPLOYED', () => {
      this.harmonicEngine?.onULCastInitiate();
    });
    this.eventBus.on('UL_PUZZLE_SUCCESS', () => {
      this.harmonicEngine?.onULCastRelease(true);
    });
    this.eventBus.on('UL_PUZZLE_FAILURE', () => {
      this.harmonicEngine?.onULCastRelease(false);
    });

    // --- FIRST-RUN DETECTION + SESSION PERSISTENCE ---
    const isFirstVisit = !localStorage.getItem('pfg_operator_id');
    if (isFirstVisit) {
      localStorage.setItem('pfg_operator_id', Date.now().toString());
    }
    const session = SessionPersistence.incrementVisit();
    // Seed trust from last session (returning players start where they left off)
    if (!isFirstVisit && this.asiIntegration) {
      this.asiIntegration.trustManager.updateTrust(session.trustLevel - 50, 'Session restore');
    }
    // Restore Jane's progression (level, XP, skills, speeder upgrades)
    if (!isFirstVisit && session.janeData) {
      const jane = this.playerManager.getJane();
      if (jane) applyJaneSaveData(jane, session.janeData);
    }
    const fromMainSite = document.referrer.includes('fusiongirl.app');
    // FE-1 + FE-4: Drop-in sequence replaces the static 2s delay
    const janeSprite2 = this.playerManager.getJaneSprite();
    if (janeSprite2) {
      this.runDropInSequence(janeSprite2, playerStartX, playerStartY, isFirstVisit, fromMainSite);
    } else {
      this.time.delayedCall(2000, () => {
        this.jonoHologram.triggerFirstContact(isFirstVisit, fromMainSite);
      });
    }

    // Listen for first-contact event → materialize Jono + show 4-beat dialogue
    this.eventBus.on('JONO_FIRST_CONTACT', (event) => {
      // Materialize hologram with FX
      if (this.jonoSprite && this.jonoHologramFX) {
        this.jonoSprite.setAlpha(0.6);
        this.jonoHologramFX.appear();
        // Particle burst effect (simple flash)
        const particles = this.add.particles(400, 300, 'jono_placeholder', {
          speed: { min: 60, max: 180 },
          lifespan: 600,
          scale: { start: 0.6, end: 0 },
          tint: 0xFF8C00,
          quantity: 12,
          emitting: false,
        });
        particles.explode(12);
        this.time.delayedCall(700, () => particles.destroy());
      }
      this.showJonoFirstContact(event.data.isFirstVisit, event.data.fromMainSite);
      // Swap to PsiSys awakening music during Jono's first-contact dialogue
      if (event.data.isFirstVisit) {
        this.audioManager?.playMusic(AUDIO_KEYS.MUSIC_PSISYS_AWAKENING, 1000);
        // Return to gameplay loop after the intro (approx 18s for 4 beats)
        this.time.delayedCall(18000, () => {
          this.audioManager?.playMusic(AUDIO_KEYS.MUSIC_GAMEPLAY_LOOP, 2000);
        });
      }
    });

    // Click-to-waypoint: player clicks world → ASI_WAYPOINT_PLACED
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Only left click, and not when on UI or speeder
      if (pointer.button !== 0) return;
      if (this.speederController?.getIsOnSpeeder()) return;

      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      const id = 'wp_' + Date.now();

      // Psionic pulse animation (Stage 3.3)
      this.spawnWaypointPulse(worldX, worldY);

      this.eventBus.emit({
        type: 'ASI_WAYPOINT_PLACED',
        data: { x: worldX, y: worldY, id }
      });
      this.psiNetLog?.add('PSINET', 'Guidance pulse — DELIVERED');
    });

    // Clear marker when waypoint cleared
    this.eventBus.on('ASI_WAYPOINT_CLEARED', () => {
      if (this.waypointMarker) {
        this.waypointMarker.destroy();
        this.waypointMarker = undefined;
      }
      this.psiNetLog?.add('PSINET', 'Guidance pulse — waypoint resolved');
    });

    // Pulse aura at Jane on waypoint arrival (Stage 3.3.3)
    this.eventBus.on('JANE_ARRIVED_AT_WAYPOINT', () => {
      const jS = this.playerManager?.getJaneSprite();
      if (!jS) return;
      const aura = this.add.graphics().setDepth(999);
      aura.lineStyle(1.5, 0xFF8C00, 0.7);
      aura.strokeCircle(jS.x, jS.y, 18);
      this.tweens.add({
        targets: aura, alpha: { from: 0.7, to: 0 }, scaleX: { from: 1, to: 1.8 },
        scaleY: { from: 1, to: 1.8 }, duration: 600, ease: 'Sine.easeOut',
        onComplete: () => aura.destroy(),
      });
    });

    // Trust feedback: Jane arrives at ASI waypoint → guidance was followed
    this.eventBus.on('JANE_ARRIVED_AT_WAYPOINT', (event) => {
      this.eventBus.emit({
        type: 'JANE_RESPONSE',
        data: { followed: true, guidanceId: event.data.waypointId, trustChange: 3, responseTime: 0 }
      });
    });
    // --- CONSEQUENCE CHAIN ---

    // FE-7: Name the Nefarium on the very first surge warning
    let _firstSurgeFired = false;
    this.eventBus.on('SURGE_WARNING', () => {
      if (_firstSurgeFired) return;
      _firstSurgeFired = true;
      this.time.delayedCall(1200, () => {
        this.showJonoLine(
          "That node — Nefarium signature.\nThey're siphoning Nether into the ley line feed.\nIf that node drops, it takes this sector with it."
        );
      });
    });

    // NODE_COLLAPSED → spawn enemy wave + show dashboard alert
    this.eventBus.on('NODE_COLLAPSED', (event) => {
      const { x, y } = event.data;
      this.asiDashboard?.showAlert('⚠ NODE COLLAPSED — RIFT EXPANDING', '#cc2200', 8000);
      this.audioManager?.playSfx(AUDIO_KEYS.SFX_NODE_COLLAPSED);
      // Spawn 3 enemies near the node
      for (let i = 0; i < 3; i++) {
        const spawnX = x + (i - 1) * 64;
        const spawnY = y;
        this.enemyManager?.spawnEnemy('slime', spawnX, spawnY);
      }
      // Emit PLAYER_FAILURE to hurt trust
      this.eventBus.emit({ type: 'PLAYER_DEFEATED', data: { playerId: 'timeline' } });
    });

    // RIFT_SEALED → restore collapsed node stability + show recovery message
    this.eventBus.on('RIFT_SEALED', (event) => {
      const nodeId = event.data?.nodeId;
      if (nodeId) {
        this.nodeManager?.restoreStability(nodeId, 30);
      } else {
        // Restore all collapsed nodes a little
        for (const node of (this.nodeManager?.getAllNodes() ?? [])) {
          if (node.stability === 0) this.nodeManager.restoreStability(node.id, 30);
        }
      }
      this.asiDashboard?.showAlert('RIFT SEALED — NODE STABILIZING', '#00cc66', 5000);
      // Emit MISSION_COMPLETED to boost trust
      this.eventBus.emit({ type: 'MISSION_COMPLETED', data: { missionId: 'rift_seal' } });
    });

    // Idle pressure: degrade the first node by 5 every 30s of gameplay
    this.time.addEvent({
      delay: 30000,
      loop: true,
      callback: () => {
        const nodes = this.nodeManager?.getAllNodes() ?? [];
        const target = nodes.find(n => n.stability > 0);
        if (target) this.nodeManager.damageStability(target.id, 5);
      }
    });

    // --- WIN / LOSE CONDITIONS ---
    let allAbove60Since: number | null = null;
    let outcomeTriggered = false;
    const gameStartTime = Date.now();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (outcomeTriggered) return;
        const nodes = this.nodeManager?.getAllNodes() ?? [];
        if (nodes.length === 0) return;
        const now = Date.now();

        // Win: all nodes above 60% for 10 continuous seconds
        const allAbove60 = nodes.every(n => (n.stability / n.maxStability) * 100 > 60);
        if (allAbove60) {
          if (allAbove60Since === null) allAbove60Since = now;
          else if (now - allAbove60Since >= 10000) {
            outcomeTriggered = true;
            const trustPct = this.asiIntegration?.getTrustLevel() ?? 50;
            const nodesSaved = nodes.filter(n => n.stability > 0).length;
            // Persist session state
            const stabilities: Record<string, number> = {};
            nodes.forEach(n => { stabilities[n.id] = n.stability; });
            const jane = this.playerManager?.getJane();
            SessionPersistence.update({
              trustLevel: Math.round(trustPct),
              bestTimelineScore: Math.round(trustPct),
              lastNodeStabilities: stabilities,
              janeData: jane ? extractJaneSaveData(jane) : undefined,
            });
            this.saveMissionState();
            this.cameras.main.fadeOut(800, 0, 0, 0, (_cam: any, _t: number) => {});
            this.time.delayedCall(900, () => {
              this.audioManager?.playSfx(AUDIO_KEYS.SFX_PSISYS_OK);
              this.audioManager?.stopMusic(600);
              this.asiDashboard?.destroy();
              this.audioManager?.destroy();
              this.harmonicEngine?.destroy();
              this.scene.start('TimelineResultScene', {
                outcome: 'secured',
                trustPercent: trustPct,
                nodesSaved,
                totalNodes: nodes.length,
                elapsedSeconds: (now - gameStartTime) / 1000,
              });
            });
          }
        } else {
          allAbove60Since = null;
        }

        // Lose: all nodes at 0%
        const allCollapsed = nodes.every(n => n.stability <= 0);
        if (allCollapsed) {
          outcomeTriggered = true;
          const trustPct = this.asiIntegration?.getTrustLevel() ?? 0;
          // Persist session state on loss too
          const stabilities: Record<string, number> = {};
          nodes.forEach(n => { stabilities[n.id] = n.stability; });
          const jane = this.playerManager?.getJane();
          SessionPersistence.update({
            trustLevel: Math.round(trustPct),
            lastNodeStabilities: stabilities,
            janeData: jane ? extractJaneSaveData(jane) : undefined,
          });
          this.saveMissionState();
          // Slow-mo dramatic pause
          this.time.timeScale = 0.3;
          this.time.delayedCall(2000, () => {
            this.time.timeScale = 1;
            this.audioManager?.playSfx(AUDIO_KEYS.SFX_TIMELINE_FAILURE);
            this.audioManager?.stopMusic(400);
            this.asiDashboard?.destroy();
            this.audioManager?.destroy();
            this.harmonicEngine?.destroy();
            this.scene.start('TimelineResultScene', {
              outcome: 'collapsed',
              trustPercent: trustPct,
              nodesSaved: 0,
              totalNodes: nodes.length,
              elapsedSeconds: (now - gameStartTime) / 1000,
            });
          });
        }
      }
    });

    // Jane starts active/bored — she has her own life before the ASI connected
    this.janeAI.setInitialState(JaneAIState.Bored);
    _DEV && console.log('✅ Jane AI initialized');

    // FE-6: Wire the first UL moment (fires ~60s in, debuts UL+Beu+HarmonicEngine)
    this.wireULFirstMoment();

    // ── World materialization reveal (Stage 2.2) ─────────────────────────────
    // Focal point: Jane's projected screen position, or viewport centre as fallback
    {
      const jS = this.playerManager.getJaneSprite();
      let focalX = window.innerWidth  * 0.5;
      let focalY = window.innerHeight * 0.5;
      if (jS) {
        const cam = this.cameras.main;
        focalX = (jS.x - cam.scrollX) * cam.zoom;
        focalY = (jS.y - cam.scrollY) * cam.zoom;
        // Clamp to viewport so the ring never starts off-screen
        focalX = Math.max(64, Math.min(window.innerWidth  - 64, focalX));
        focalY = Math.max(64, Math.min(window.innerHeight - 64, focalY));
      }
      this.worldMaterialization = new WorldMaterialization(focalX, focalY);
      this.worldMaterialization.mount();
    }

    // ── HoloDeck grid overlay (immersion system Stage 2.3) ──────────────────
    this.holoDeckGrid = new HoloDeckGrid(32);
    this.holoDeckGrid.mount();
    this.wireHoloDeckGridEvents();

    // ── PsiNet ambient log (Stage 3.2 — living console) ─────────────────────
    this.psiNetLog = new PsiNetLog();
    this.psiNetLog.mount();
    this.wirePsiNetLogEvents();
    JonoTransmission.resetSession();

    // ── Vision degradation overlay (Stage 4.2) ────────────────────────────────
    const phaserCanvas = this.game.canvas;
    this.visionDegradation = new VisionDegradation(phaserCanvas);
    this.visionDegradation.mount();

    // ── ASI channel saturation tracker (Stage 4.3) ───────────────────────────
    this.channelSaturation = new ChannelSaturation();

    // ── Jane psionic aura (Stage 4.1.3) ─────────────────────────────────────
    this.janeAura = this.add.graphics().setDepth(55).setAlpha(0.22);

    // ── Sector scan radar (Stage 6.3 — cinematic) ────────────────────────────
    this.sectorScanRadar = new SectorScanRadar(160, 800);
    this.sectorScanRadar.mount();

    this.wireStage4Events();

    _DEV && console.log('✅ GameScene create() completed successfully');
    } catch (error) {
      console.error('❌ CRITICAL ERROR in GameScene.create():', error);
      console.error('❌ Stack trace:', (error as Error)?.stack || 'No stack trace available');
      
      this.add.text(400, 300,
        '[PSISYS] CRITICAL FAULT\nHoloDeck initialization failed\nSee operator console for details',
        {
          fontSize: '13px',
          color: '#FF8C00',
          backgroundColor: '#0d0e10',
          fontFamily: 'Courier New, monospace',
          padding: { x: 18, y: 12 },
          align: 'left',
        }
      ).setOrigin(0.5).setDepth(10000);
      
      throw error;
    }
  }

  /**
   * FE-6: Wire the first UL moment.
   * ~60s into the session, spawn a damaged robot near the nearest node.
   * UL + Beu + HarmonicEngine debut together in one scripted moment.
   */
  private wireULFirstMoment(): void {
    let done = false;

    const spawnFirstULRobot = () => {
      if (done) return;
      done = true;

      const nodes = this.nodeManager?.getAllNodes() ?? [];
      if (nodes.length === 0) return;

      // Find nearest node
      const jS = this.playerManager?.getJaneSprite();
      const ox = jS?.x ?? 400;
      const oy = jS?.y ?? 300;
      let nearest = nodes[0];
      let nearestDist = Math.hypot(nodes[0].x - ox, nodes[0].y - oy);
      for (const n of nodes) {
        const d = Math.hypot(n.x - ox, n.y - oy);
        if (d < nearestDist) { nearest = n; nearestDist = d; }
      }

      // Spawn damaged robot placeholder (sparking wreck)
      const rx = nearest.x + 60;
      const ry = nearest.y;
      const robotGfx = this.add.graphics().setDepth(40);
      robotGfx.fillStyle(0x667755, 1);
      robotGfx.fillRect(-10, -16, 20, 32);    // body
      robotGfx.fillStyle(0x334422, 1);
      robotGfx.fillRect(-6, -24, 12, 12);     // head
      robotGfx.fillStyle(0xff4400, 0.7);
      robotGfx.fillRect(-3, -10, 6, 4);       // damage mark
      robotGfx.setPosition(rx, ry);

      // UL signature glyph on chassis
      const ulGlyph = this.add.text(rx, ry - 28, '●', {
        fontSize: '14px', fontFamily: 'monospace', color: '#00ffcc',
      }).setOrigin(0.5).setDepth(41).setAlpha(0);
      this.tweens.add({
        targets: ulGlyph, alpha: { from: 0.2, to: 0.9 },
        duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      // Sparking effect (rapid blinking small dot)
      const spark = this.add.graphics().setDepth(42).setPosition(rx + 5, ry - 5);
      spark.fillStyle(0xffee44, 1);
      spark.fillCircle(0, 0, 2);
      this.tweens.add({
        targets: spark, alpha: { from: 0, to: 1 },
        duration: 120, yoyo: true, repeat: -1,
      });

      // Beu brightens toward robot
      if (this.beuGlow) {
        this.tweens.killTweensOf(this.beuGlow);
        this.tweens.add({
          targets: this.beuGlow, alpha: { from: 0.3, to: 1.0 },
          duration: 300, yoyo: true, repeat: 4, ease: 'Sine.easeInOut',
          onComplete: () => {
            this.tweens.add({
              targets: this.beuGlow, alpha: { from: 0.3, to: 0.7 },
              duration: 800, yoyo: true, repeat: -1,
            });
          },
        });
      }

      // HUD: UL signature detected
      this.showHudTooltip('BEU: UL SIGNATURE DETECTED — ENTITY REACHABLE');

      // Register as UL puzzle target + enable guided mode
      this.ulPuzzleManager?.registerTarget({
        id: 'fe6_robot', type: 'damaged_robot', x: rx, y: ry, requiredSymbol: 'point',
      });
      this.ulPuzzleManager?.setGuidedMode('point');
      this.ulPuzzleManager?.registerRule({
        id: 'repair_point', name: 'Repair',
        baseElement: 'Point', modifierElement: 'Point', resultSymbol: 'point',
        effect: 'repair', description: 'Restore function to a damaged entity.',
      });

      // Make robot clickable
      robotGfx.setInteractive(new Phaser.Geom.Rectangle(-12, -28, 24, 44), Phaser.Geom.Rectangle.Contains);
      robotGfx.input!.cursor = 'pointer';
      robotGfx.on('pointerdown', () => {
        const opened = this.ulPuzzleManager?.openPuzzle('fe6_robot');
        if (opened) {
          this._showULGuidedOverlay(robotGfx, spark, ulGlyph, ry);
        }
      });

      // Wire bounce: Beu chirp + robot shake
      this.eventBus.on('UL_GUIDED_BOUNCE', () => {
        this.audioManager?.playSfx(AUDIO_KEYS.SFX_BOOT_SEQUENCE); // soft chirp placeholder
        this.tweens.add({
          targets: robotGfx, x: rx + 4, duration: 60, yoyo: true, repeat: 3,
        });
      });

      // Wire success: robot stands up, Beu stage advances, Jono speaks
      const onULSuccess = (ev: { data: { targetId: string } }) => {
        if (ev.data?.targetId !== 'fe6_robot') return;

        // Robot "stands up" — restore alpha and scale cleanly
        spark.destroy();
        ulGlyph.destroy();
        this.tweens.add({
          targets: robotGfx,
          alpha: 1, scaleX: 1, scaleY: 1,
          duration: 500, ease: 'Back.Out',
        });
        // Tint robot to show it's repaired
        robotGfx.clear();
        robotGfx.fillStyle(0x44aa66, 1);
        robotGfx.fillRect(-10, -16, 20, 32);
        robotGfx.fillStyle(0x226644, 1);
        robotGfx.fillRect(-6, -24, 12, 12);
        robotGfx.setPosition(rx, ry);

        // Beu advances: seed → sprout — shift glow to warm green
        if (this.beuGlow) {
          this.tweens.killTweensOf(this.beuGlow);
          this.beuGlow.clear();
          this.beuGlow.fillStyle(0x88ff88, 0.7);
          this.beuGlow.fillCircle(0, 0, 7);
          this.tweens.add({
            targets: this.beuGlow, alpha: { from: 0.4, to: 0.9 },
            duration: 1000, yoyo: true, repeat: -1,
          });
        }
        this.harmonicEngine?.setState({ beuStage: 'sprout' });
        this.eventBus.emit({ type: 'BEU_STAGE_CHANGED', data: { stage: 'sprout' } });
        // Emotional angle → Hope/Warmth (120°)
        this.harmonicEngine?.setEmotionalAngle(120);

        // Robot follows Jane for 30s (simple position tracking)
        const followTimer = this.time.addEvent({
          delay: 100, loop: true,
          callback: () => {
            const js = this.playerManager?.getJaneSprite();
            if (!js) return;
            const dx = js.x + 40 - robotGfx.x;
            const dy = js.y - robotGfx.y;
            robotGfx.x += dx * 0.06;
            robotGfx.y += dy * 0.06;
          },
        });
        this.time.delayedCall(30000, () => followTimer.destroy());

        // Jono line
        this.time.delayedCall(1500, () => {
          this.showJonoLine('The Universal Language.\nReality responds to it.\nSo do they.');
        });
      };
      this.eventBus.on('UL_PUZZLE_SUCCESS', onULSuccess);
    };

    // Trigger at 60s, or when Jane first arrives at a node from FE-4 scripted nav
    this.time.delayedCall(60000, spawnFirstULRobot);

    // Early trigger: if Jane arrives at a node during the scripted autonomous sequence
    const unsubArrive = this.eventBus.on('JANE_ARRIVED_AT_WAYPOINT', (ev) => {
      if (ev.data?.waypointId === 'scripted' && !done) {
        this.time.delayedCall(3000, spawnFirstULRobot);
        unsubArrive();
      }
    });
  }

  /**
   * Stage 3.3 — Psionic pulse animation for waypoint placement.
   *
   * Phase A (0–300ms):   Amber ripple expands at click point.
   * Phase B (100–550ms): Travelling dot moves from Jane → destination.
   * Phase C (ongoing):   Pulsing destination ring until waypoint cleared.
   */
  private spawnWaypointPulse(worldX: number, worldY: number): void {
    // Destroy any previous destination ring
    if (this.waypointMarker) {
      this.tweens.killTweensOf(this.waypointMarker);
      this.waypointMarker.destroy();
      this.waypointMarker = undefined;
    }

    // ── Phase A: Ripple at click point ────────────────────────────────────────
    const ripple = this.add.graphics().setDepth(1002);
    ripple.lineStyle(1.5, 0xFF8C00, 0.9);
    ripple.strokeCircle(worldX, worldY, 10);
    this.tweens.add({
      targets: ripple,
      scaleX: { from: 0.1, to: 2.5 }, scaleY: { from: 0.1, to: 2.5 },
      alpha:  { from: 0.9, to: 0 },
      duration: 320, ease: 'Sine.easeOut',
      onComplete: () => ripple.destroy(),
    });

    // ── Phase B: Travelling dot (Jane → destination) ─────────────────────────
    const jS = this.playerManager?.getJaneSprite();
    const startX = jS?.x ?? worldX;
    const startY = jS?.y ?? worldY;

    const dot = this.add.graphics().setDepth(1001);
    dot.fillStyle(0xFF8C00, 1);
    dot.fillCircle(0, 0, 3);
    dot.setPosition(startX, startY);

    this.tweens.add({
      targets: dot,
      x: worldX, y: worldY,
      duration: 420,
      delay: 100,
      ease: 'Sine.easeIn',
      onComplete: () => {
        dot.destroy();
        // Small impact ripple at destination
        const impact = this.add.graphics().setDepth(1002);
        impact.lineStyle(1, 0xFF8C00, 0.8);
        impact.strokeCircle(worldX, worldY, 6);
        this.tweens.add({
          targets: impact,
          scaleX: { from: 1, to: 2 }, scaleY: { from: 1, to: 2 },
          alpha: { from: 0.8, to: 0 },
          duration: 200, ease: 'Sine.easeOut',
          onComplete: () => impact.destroy(),
        });
      },
    });

    // ── Phase C: Persistent pulsing ring at destination ───────────────────────
    const ring = this.add.graphics().setDepth(1000);
    ring.lineStyle(1.5, 0xFF8C00, 0.7);
    ring.strokeCircle(worldX, worldY, 10);
    ring.fillStyle(0xFF8C00, 0.08);
    ring.fillCircle(worldX, worldY, 10);
    this.waypointMarker = ring;

    this.tweens.add({
      targets: ring,
      alpha: { from: 0.7, to: 0.2 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Stage 2.3 — Wire game events to HoloDeckGrid state transitions.
   * Maps threat/stability events → grid opacity/drift/flicker changes.
   */
  private wireHoloDeckGridEvents(): void {
    // Ley line disruption → disrupted grid + resonance flicker
    this.eventBus.on('LEYLINE_DISRUPTION', () => {
      this.holoDeckGrid.setState('disrupted');
      this.uiBarSystem?.setLeylineDisrupted(true);
    });
    this.eventBus.on('LEYLINE_INSTABILITY', () => {
      this.holoDeckGrid.setState('disrupted');
      this.uiBarSystem?.setLeylineDisrupted(true);
    });

    // Rift / Nefarium presence → nefarium grid (horizontal drift)
    this.eventBus.on('RIFT_FORMED', () => {
      this.holoDeckGrid.setState('nefarium');
    });
    this.eventBus.on('RIFT_SPAWNED', () => {
      this.holoDeckGrid.setState('nefarium');
    });

    // Nefarium threat resolved → back to active
    this.eventBus.on('RIFT_SEALED', () => {
      this.holoDeckGrid.setState('active');
    });
    this.eventBus.on('UL_RIFT_SEALED', () => {
      this.holoDeckGrid.setState('active');
    });

    // Node collapse / Jane critical → critical grid (scan-line flicker)
    this.eventBus.on('NODE_COLLAPSED', () => {
      this.holoDeckGrid.setState('critical');
    });
    this.eventBus.on('JANE_DEFEATED', () => {
      this.holoDeckGrid.setState('failure');
    });

    // General threat detection → active
    this.eventBus.on('THREAT_DETECTED', () => {
      this.holoDeckGrid.setState('active');
    });
    this.eventBus.on('THREAT_RESOLVED', () => {
      this.holoDeckGrid.setState('stable');
    });

    // Ley line restored/activated → step down toward stable, clear disruption
    this.eventBus.on('LEYLINE_ACTIVATED', () => {
      this.holoDeckGrid.setState('active');
      this.uiBarSystem?.setLeylineDisrupted(false);
    });
    this.eventBus.on('LEYLINE_MANIPULATION', (ev) => {
      const stable = ev.data?.status === 'stable';
      this.holoDeckGrid.setState(stable ? 'stable' : 'disrupted');
      this.uiBarSystem?.setLeylineDisrupted(!stable);
    });

    // Jane respawn → return to active after failure
    this.eventBus.on('JANE_RESPAWN', () => {
      this.holoDeckGrid.setState('active');
    });

    // Destroy grid canvas when this scene shuts down
    this.events.on('shutdown', () => {
      this.holoDeckGrid?.destroy();
      this.psiNetLog?.destroy();
      this.worldMaterialization?.destroy();
      this.sectorScanRadar?.destroy();
      this.beuSig?.destroy();
    });
    this.events.on('destroy', () => {
      this.holoDeckGrid?.destroy();
      this.psiNetLog?.destroy();
      this.worldMaterialization?.destroy();
      this.sectorScanRadar?.destroy();
      this.beuSig?.destroy();
    });
  }

  /**
   * Stage 3.2 — Wire game events to PsiNet ambient log.
   * Each event produces a brief, in-world log line (no UI language).
   */
  private wirePsiNetLogEvents(): void {
    const log = this.psiNetLog;
    const callsign = SessionPersistence.load()?.callsign ?? 'OBSERVER';

    // Bridge established on session start
    log.add('BRIDGE', `Observer bridge — ESTABLISHED — ${callsign}`, true);

    // Leyline events
    this.eventBus.on('LEYLINE_DISRUPTION', (ev) => {
      log.add('PSINET', `Ley line disruption detected${ev.data?.leyLineId ? ` — ${ev.data.leyLineId}` : ''}`);
    });
    this.eventBus.on('LEYLINE_INSTABILITY', () => {
      log.add('PSINET', 'Ley line instability — monitoring');
    });
    this.eventBus.on('LEYLINE_ACTIVATED', () => {
      log.add('PSINET', 'Ley line signal restored');
    });
    this.eventBus.on('LEYLINE_SURGE', (ev) => {
      const ctx = ev.data?.narrativeContext;
      log.add('PSINET', ctx ?? 'Ley line surge detected');
    });

    // Rift / Nefarium events
    this.eventBus.on('RIFT_FORMED', (ev) => {
      log.add('NEFARIUM', `Rift formation — severity: ${ev.data?.severity ?? 'unknown'}`);
    });
    this.eventBus.on('RIFT_SPAWNED', () => {
      log.add('NEFARIUM', 'Nefarium rift active in sector');
    });
    this.eventBus.on('RIFT_SEALED', () => {
      log.add('PSINET', 'Rift sealed — resonance normalising');
    });
    this.eventBus.on('UL_RIFT_SEALED', (ev) => {
      log.add('ANCHOR', `Rift sealed via UL — symbol: ${ev.data?.symbolUsed ?? '?'}`);
    });

    // Node events
    this.eventBus.on('NODE_COLLAPSED', (ev) => {
      log.add('PSINET', `Node ${ev.data?.nodeId ?? '?'} — collapsed`);
    });
    this.eventBus.on('NODE_STABILITY_CHANGED', (ev) => {
      const s = ev.data?.newStability;
      if (s !== undefined && s < 40) {
        log.add('PSINET', `Node ${ev.data.nodeId} stability critical — ${Math.round(s)}%`);
      }
    });

    // Jane coherence events
    this.eventBus.on('JANE_DAMAGED', (ev) => {
      const hp = Math.round(ev.data?.health ?? 0);
      if (hp < 30) log.add('JANE', `Coherence dropping — ${hp}% remaining`);
    });
    this.eventBus.on('JANE_DEFEATED', () => {
      log.add('JANE', 'Coherence collapse — initiating kernel rollback');
    });
    this.eventBus.on('JANE_RESPAWN', () => {
      log.add('BRIDGE', 'Anchor recovery complete — observer link restored');
    });
    this.eventBus.on('JANE_HEALED', (ev) => {
      const hp = Math.round(ev.data?.health ?? 100);
      if (hp > 80) log.add('JANE', `Coherence stabilised — ${hp}%`);
    });

    // Beu events
    this.eventBus.on('BEU_SEED_APPEAR', () => {
      log.add('BEU', 'Beu signal detected — entity nearby', true);
      // Advance Beu signature to sprout stage
      if (this.beuSig) this.beuSig.setStage('sprout');
    });
    this.eventBus.on('BEU_STAGE_CHANGED', (ev) => {
      const stage = (ev.data?.stage ?? 'sprout') as BeuLifecycleStage;
      log.add('BEU', `Beu stage transition — ${stage}`, true);
      if (this.beuSig) this.beuSig.setStage(stage);
      // Show Beu data panel on significant stage transitions
      if (stage === 'bloom' || stage === 'bond') {
        const beuGlowPos = this.beuGlow?.getTopLeft();
        BeuDataPanel.show({
          name: 'ORION',
          stage,
          bondStatus: stage === 'bond' ? 'bonded' : 'proximity',
          associatedEntity: "Jane.Tho'ra",
          activity: stage === 'bond' ? 'resonant bonding' : 'resonance exploration',
          signal: stage === 'bond' ? 0.95 : 0.74,
          resonance: stage === 'bond' ? 0.92 : 0.72,
        });
        // Direct Beu transmission to ASI
        BeuTransmission.show({
          name: 'ORION',
          coordX: beuGlowPos?.x ?? this.playerManager.getJaneSprite()?.x ?? 0,
          coordY: beuGlowPos?.y ?? this.playerManager.getJaneSprite()?.y ?? 0,
          confidence: stage === 'bond' ? 0.97 : 0.81,
          janeAware: true,
          priority: stage === 'bond' ? 1 : 2,
        });
      }
    });

    // UL / anchor events
    this.eventBus.on('UL_PUZZLE_SUCCESS', (ev) => {
      log.add('ANCHOR', `UL symbol deployed — ${ev.data?.resultSymbol ?? '?'} — effect: ${ev.data?.effect ?? 'unknown'}`);
    });
    this.eventBus.on('CHECKPOINT_SET', (ev) => {
      log.add('ANCHOR', `Anchor updated — ${ev.data?.checkpointId ?? 'unknown'}`);
    });

    // Timeline events
    this.eventBus.on('TIMELINE_SCORE_UPDATED', () => {
      log.add('TIMELINE', 'Timeline delta recorded');
    });
    this.eventBus.on('JONO_FIRST_CONTACT', () => {
      log.add('BRIDGE', 'Encrypted transmission incoming — source: JONO', true);
    });
    this.eventBus.on('JONO_DIALOGUE_TRIGGERED', () => {
      log.add('BRIDGE', 'Packet received — decoding', true);
    });

    // ── Observer stats increments (Stage 5.2) ─────────────────────────────
    this.eventBus.on('ASI_WAYPOINT_PLACED', () => {
      SessionPersistence.incrementStat('guidancePulsesDelivered');
    });
    this.eventBus.on('LEYLINE_ACTIVATED', () => {
      SessionPersistence.incrementStat('leyLinesRestored');
    });
    this.eventBus.on('RIFT_SEALED', () => {
      SessionPersistence.incrementStat('nefariumNodesDisrupted');
    });
    this.eventBus.on('UL_RIFT_SEALED', () => {
      SessionPersistence.incrementStat('nefariumNodesDisrupted');
    });
    this.eventBus.on('BEU_STAGE_CHANGED', (ev) => {
      if (ev.data?.stage === 'bond') {
        SessionPersistence.incrementStat('beuBondsFacilitated');
      }
    });
    this.eventBus.on('JANE_DEFEATED', () => {
      SessionPersistence.incrementStat('coherenceCollapses');
    });
    this.eventBus.on('JANE_HEALED', (ev) => {
      const hp = ev.data?.health ?? 0;
      const existing = SessionPersistence.load();
      const peak = existing?.stats?.peakCoherenceObserved ?? 0;
      if (hp > peak) SessionPersistence.incrementStat('peakCoherenceObserved', hp - peak);
    });
    this.eventBus.on('MISSION_COMPLETED', () => {
      SessionPersistence.incrementStat('timelinesCorreected');
    });
    this.eventBus.on('PLAYER_DEFEATED', () => {
      SessionPersistence.incrementStat('timelinesFailed');
    });
  }

  /**
   * Stage 4 — Wire vision degradation, channel saturation, Jane aura, and
   * mission-complete resonance events.
   */
  private wireStage4Events(): void {
    const vd  = this.visionDegradation;
    const sat = this.channelSaturation;
    const log = this.psiNetLog;

    // ── Vision degradation: Nefarium / disruption ─────────────────────────
    this.eventBus.on('RIFT_FORMED', () => vd?.setState('nefarium'));
    this.eventBus.on('RIFT_SPAWNED', () => vd?.setState('nefarium'));
    this.eventBus.on('RIFT_SEALED', () => vd?.setState('clear'));
    this.eventBus.on('UL_RIFT_SEALED', () => vd?.setState('clear'));
    this.eventBus.on('LEYLINE_DISRUPTION', () => vd?.setState('disrupted'));
    this.eventBus.on('LEYLINE_INSTABILITY', () => vd?.setState('disrupted'));
    this.eventBus.on('LEYLINE_ACTIVATED', () => vd?.setState('clear'));
    this.eventBus.on('JANE_DEFEATED', () => {
      vd?.setState('critical');
      vd?.triggerInversion(120);
    });
    this.eventBus.on('JANE_RESPAWN', () => vd?.setState('clear'));

    // ── Channel saturation milestones → log + vision ──────────────────────
    sat.on(({ tier, value }) => {
      if (tier === 'elevated') {
        log?.add('BRIDGE', `Channel saturation: ${Math.round(value)}% — interventions limited`);
      } else if (tier === 'impaired') {
        log?.add('BRIDGE', `Channel saturation: ${Math.round(value)}% — some actions blocked`);
        vd?.setState('saturated');
      } else if (tier === 'locked') {
        log?.add('BRIDGE', 'Channel saturation: CRITICAL — passive observation only');
        vd?.setState('critical');
      } else {
        // Returned to clear
        vd?.setState('clear');
      }
    });

    // ── Near-node decay for saturation ────────────────────────────────────
    this.eventBus.on('LEYLINE_ENTERED', () => sat?.setNearNode(true));
    this.eventBus.on('LEYLINE_EXITED', () => sat?.setNearNode(false));

    // ── Jane psionic flare: UL success clears saturation ─────────────────
    this.eventBus.on('UL_PUZZLE_SUCCESS', () => {
      sat?.applyPsionicFlare();
      // Brief aura bloom
      if (this.janeAura) {
        const jS = this.playerManager?.getJaneSprite();
        if (jS) {
          this.tweens.add({
            targets: this.janeAura, alpha: { from: 0.22, to: 0.75 },
            duration: 250, yoyo: true, repeat: 1,
          });
        }
      }
    });

    // ── Mission complete: resonance restored ──────────────────────────────
    this.eventBus.on('MISSION_COMPLETED', (ev) => {
      log?.add('TIMELINE', 'Sector resonance — RESTORED', true);
      log?.add('TIMELINE', `Mission complete — ${ev.data?.missionId ?? 'objective'}`, false);
      this.holoDeckGrid?.setState('stable');
      vd?.setState('clear');
    });
    this.eventBus.on('MISSION_OBJECTIVE_COMPLETED', () => {
      log?.add('TIMELINE', 'Objective resolved — timeline delta improving');
    });

    // ── Cleanup on scene shutdown ─────────────────────────────────────────
    this.events.on('shutdown', () => vd?.destroy());
    this.events.on('destroy',  () => vd?.destroy());
  }

  /**
   * FE-6: Show the guided first-puzzle overlay (5 UL symbols, 'point' glowing).
   * Single-symbol selection, no modifier. Wrong pick = gentle bounce.
   */
  private _showULGuidedOverlay(
    robotGfx: Phaser.GameObjects.Graphics,
    spark: Phaser.GameObjects.Graphics,
    ulGlyph: Phaser.GameObjects.Text,
    _robotY: number
  ): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0;
      display: flex; align-items: center; justify-content: center;
      z-index: 77777;
      background: rgba(0,8,16,0.82);
    `;

    const panel = document.createElement('div');
    panel.style.cssText = `
      font-family: monospace;
      background: #060d18;
      border: 1px solid #00ffcc;
      padding: 28px 36px;
      min-width: 340px;
      text-align: center;
    `;

    const title = document.createElement('div');
    title.style.cssText = 'font-size: 11px; letter-spacing: 3px; color: #006666; margin-bottom: 6px;';
    title.textContent = 'BEU // UL INTERFACE';

    const subtitle = document.createElement('div');
    subtitle.style.cssText = 'font-size: 14px; color: #00ffcc; margin-bottom: 22px;';
    subtitle.textContent = 'Select the symbol to speak to this entity.';

    const SYMBOLS = [
      { key: 'point',     glyph: '●', label: 'Point' },
      { key: 'line',      glyph: '─', label: 'Line' },
      { key: 'angle',     glyph: '∠', label: 'Angle' },
      { key: 'curve',     glyph: '∼', label: 'Curve' },
      { key: 'enclosure', glyph: '○', label: 'Enclosure' },
    ];

    const palette = document.createElement('div');
    palette.style.cssText = 'display: flex; gap: 14px; justify-content: center; margin-bottom: 18px;';

    const guided = this.ulPuzzleManager?.getGuidedSymbol() ?? 'point';

    SYMBOLS.forEach(({ key, glyph, label }) => {
      const btn = document.createElement('button');
      const isGuided = key === guided;
      btn.style.cssText = `
        background: ${isGuided ? '#001a22' : '#000e18'};
        border: ${isGuided ? '2px solid #00ffcc' : '1px solid #004444'};
        color: ${isGuided ? '#00ffcc' : '#006666'};
        font-family: monospace;
        font-size: 24px;
        padding: 12px 14px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 80ms;
        ${isGuided ? 'box-shadow: 0 0 8px #00ffcc66;' : ''}
      `;
      btn.title = label;
      btn.textContent = glyph;

      btn.addEventListener('mouseover', () => {
        btn.style.background = '#003322';
        btn.style.color = '#ffffff';
      });
      btn.addEventListener('mouseout', () => {
        btn.style.background = isGuided ? '#001a22' : '#000e18';
        btn.style.color = isGuided ? '#00ffcc' : '#006666';
      });

      btn.addEventListener('click', () => {
        const result = this.ulPuzzleManager?.deployGuided(key);
        if (result === true) {
          // Success — close overlay
          overlay.style.transition = 'opacity 300ms';
          overlay.style.opacity = '0';
          setTimeout(() => overlay.remove(), 320);
        } else if (result === false) {
          // Bounce — flash red border on the clicked button, then restore
          btn.style.border = '2px solid #ff4444';
          btn.style.color = '#ff4444';
          setTimeout(() => {
            btn.style.border = isGuided ? '2px solid #00ffcc' : '1px solid #004444';
            btn.style.color = isGuided ? '#00ffcc' : '#006666';
          }, 600);
        }
      });

      palette.appendChild(btn);
    });

    const hint = document.createElement('div');
    hint.style.cssText = 'font-size: 11px; color: #004444; letter-spacing: 1px;';
    hint.textContent = 'The glowing symbol is the one Beu is pointing to.';

    panel.appendChild(title);
    panel.appendChild(subtitle);
    panel.appendChild(palette);
    panel.appendChild(hint);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
  }

  /**
   * FE-1 + FE-4: Drop-in sequence. Replaces the static 2s Jono delay.
   * Camera starts at omniscient zoom (0.4), Drop Pod falls in, Jane appears,
   * Beu seed glow spawns, Jane autonomously navigates toward nearest node (FE-4),
   * then Jono fires at ~T+10s from pod impact.
   */
  private runDropInSequence(
    janeSprite: Phaser.Physics.Arcade.Sprite,
    spawnX: number,
    spawnY: number,
    isFirstVisit: boolean,
    fromMainSite: boolean
  ): void {
    // Drop Pod falls from above in world space
    const podStartY = spawnY - 600;
    let pod: Phaser.GameObjects.Image | null = null;
    try {
      pod = this.add.image(spawnX, podStartY, 'drop_pod').setDepth(50).setAlpha(1);
    } catch {
      // texture may not exist in test env — skip visual
    }

    // [T=0.5s] Pod falls to ground
    if (pod) {
      this.tweens.add({
        targets: pod,
        y: spawnY - 16,
        duration: 400,
        ease: 'Quad.In',
        delay: 500,
        onComplete: () => {
          // Screen shake on impact
          this.cameras.main.shake(200, 0.008);
          // Dust particles
          try {
            const dust = this.add.particles(spawnX, spawnY - 8, 'drop_pod', {
              speed: { min: 30, max: 90 },
              lifespan: 400,
              scale: { start: 0.5, end: 0 },
              tint: 0xaabbcc,
              quantity: 8,
              emitting: false,
            });
            dust.explode(8);
            this.time.delayedCall(500, () => dust.destroy());
          } catch { /* no particles in test */ }

          // [T=1.0s] Jane appears, pod fades
          this.time.delayedCall(500, () => {
            janeSprite.setAlpha(1);
            pod?.destroy();

            // [T=1.5s] Beu seed glow appears
            this.time.delayedCall(500, () => {
              this.beuGlow = this.add.graphics().setDepth(60);
              this.beuGlow.fillStyle(0xffdd88, 0.5);
              this.beuGlow.fillCircle(0, 0, 5);
              this.beuGlow.setPosition(janeSprite.x + 14, janeSprite.y - 12);
              // Stage 6.2 — Beu signature renderer (orbit rings + waveform)
              if (!this.beuSig) {
                this.beuSig = new BeuSignatureRenderer(this);
                this.beuSig.setStage('seed');
              }
              // Pulse loop
              this.tweens.add({
                targets: this.beuGlow,
                alpha: { from: 0.3, to: 0.7 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
              });

              this.eventBus.emit({ type: 'BEU_SEED_APPEAR', data: {} });
            });

            // [T=2.5s] Camera zooms to normal play distance
            this.time.delayedCall(1000, () => {
              this.tweens.add({
                targets: this.cameras.main,
                zoom: 1.0,
                duration: 1500,
                ease: 'Sine.easeInOut',
              });
            });

            // [T=3.0s] FE-4: Jane scans left/right (brief velocity nudges)
            this.time.delayedCall(1500, () => {
              // Simulate a head-scan with a subtle brief movement hint
              janeSprite.setVelocityX(-40);
              this.time.delayedCall(300, () => {
                janeSprite.setVelocityX(40);
                this.time.delayedCall(300, () => {
                  janeSprite.setVelocityX(0);

                  // [T~4s] FE-4: Beu brightens — node detected
                  if (this.beuGlow) {
                    this.tweens.killTweensOf(this.beuGlow);
                    this.tweens.add({
                      targets: this.beuGlow,
                      alpha: { from: 0.3, to: 0.9 },
                      duration: 400,
                      yoyo: true,
                      repeat: 2,
                      ease: 'Sine.easeInOut',
                      onComplete: () => {
                        // Resume slow pulse
                        this.tweens.add({
                          targets: this.beuGlow,
                          alpha: { from: 0.3, to: 0.7 },
                          duration: 800,
                          yoyo: true,
                          repeat: -1,
                        });
                      }
                    });
                  }

                  // [T~4.5s] FE-4: Jane navigates toward nearest node
                  const nodes = this.nodeManager?.getAllNodes() ?? [];
                  if (nodes.length > 0) {
                    let nearest = nodes[0];
                    let nearestDist = Math.hypot(nodes[0].x - spawnX, nodes[0].y - spawnY);
                    for (const n of nodes) {
                      const d = Math.hypot(n.x - spawnX, n.y - spawnY);
                      if (d < nearestDist) { nearest = n; nearestDist = d; }
                    }
                    this.janeAI?.setScriptedWaypoint(nearest.x, nearest.y);

                    // [T~7s] FE-4: Node tremor — Nefarium activity hint
                    this.time.delayedCall(2500, () => {
                      // Visual tremor on the node indicator (best-effort; NodeManager may
                      // expose a graphics object if available)
                      const nodeGraphics = (this.nodeManager as any)?._nodeGraphics?.get?.(nearest.id);
                      if (nodeGraphics) {
                        this.tweens.add({
                          targets: nodeGraphics,
                          scaleX: 1.08, scaleY: 1.08,
                          duration: 200,
                          yoyo: true,
                          repeat: 2,
                        });
                      }
                    });
                  }
                });
              });
            });

            // [T~6s] Clear scripted waypoint — player has manual control from here
            this.time.delayedCall(4500, () => {
              this.janeAI?.clearScriptedWaypoint();
            });

            // [T~7s] Jono fires first contact
            this.time.delayedCall(5500, () => {
              this.jonoHologram.triggerFirstContact(isFirstVisit, fromMainSite);
            });
          });
        }
      });
    } else {
      // Fallback: no texture — just run sequence without pod visual
      this.time.delayedCall(1000, () => {
        janeSprite.setAlpha(1);
        this.tweens.add({ targets: this.cameras.main, zoom: 1.0, duration: 1500, ease: 'Sine.easeInOut' });
      });
      this.time.delayedCall(10000, () => {
        this.jonoHologram.triggerFirstContact(isFirstVisit, fromMainSite);
      });
    }
  }

  private showJonoFirstContact(isFirstVisit: boolean, fromMainSite: boolean): void {
    const beats = isFirstVisit
      ? [
          // Beat 1 — WHO JONO IS
          // fromMainSite path: user arrived via fusiongirl.app "Enter Simulation" CTA —
          // they were already inside the PsiSys Kernel, so the HoloDeck loaded from within
          // an active PsiNet session. Acknowledge that continuity instead of re-establishing it.
          fromMainSite
            ? 'Operator. Your PsiNet link was already live when the HoloDeck came online.\nI\'ve been waiting.\nI\'m Jono Tho\'ra — what the PsiNet kept after the last incursion.\nI have Timesight. I\'ve watched this go wrong enough times to know exactly where it starts.'
            : 'Operator. I\'m Jono Tho\'ra — architect of this network, voice in the static.\nMy body didn\'t make it through the last timeline incursion.\nTimesight did.\nI\'ve watched this go wrong enough times to know exactly where it starts.',
          // Beat 2 — WHO JANE IS
          "That's Jane Tho'ra. My line.\nShe volunteered for this. Went through onboarding. Knows the ASI is part of the framework.\nWhat she doesn't know: the simulation went live.\nThe Nefarium made sure of that.",
          // Beat 3 — THE STAKES
          "They routed Nether through the HoloDeck's ley line feeds.\nThose nodes aren't training props — they're carrying real planetary load.\nIf they drop inside the sim, they drop outside it.\nThis stopped being a training run the moment you connected.",
          // Beat 4 — THE RELATIONSHIP
          "She'll find a way through. She always does.\nThe question is what she becomes on the other side — and whether the timeline holds.\nDon't take the wheel. Leave the right door open.\nShe chooses. You arrange the doors.\nEvery choice you make shapes who she becomes.",
        ]
      : ["Operator. The Nefarium doesn't stand down between sessions.\nJane's still in it."];

    // Block waypoint clicks during intro
    let introActive = true;

    const overlay = document.createElement('div');
    overlay.id = 'pfg-jono-overlay';
    overlay.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,4,0,0.97) 60%, transparent);
      padding: 32px 48px 40px;
      z-index: 88888;
      font-family: 'Aldrich', monospace;
      color: #ffffff;
      cursor: pointer;
      user-select: none;
    `;

    const speaker = document.createElement('div');
    speaker.style.cssText = 'font-size: 11px; letter-spacing: 3px; color: rgba(255,140,0,0.6); margin-bottom: 10px;';
    speaker.textContent = 'JONO \u2502 THO\u02beRA CLAN \u2502 PSINET FRAGMENT \u2502 TIMESIGHT ACTIVE';

    const textEl = document.createElement('div');
    textEl.style.cssText = 'font-size: 17px; line-height: 1.65; white-space: pre-line; max-width: 700px; color: rgba(255,255,255,0.92);';

    const hint = document.createElement('div');
    hint.style.cssText = 'font-size: 11px; color: rgba(255,140,0,0.45); margin-top: 16px; letter-spacing: 2px;';
    hint.textContent = 'CLICK TO CONTINUE';

    overlay.appendChild(speaker);
    overlay.appendChild(textEl);
    overlay.appendChild(hint);
    document.body.appendChild(overlay);

    let beatIndex = 0;
    let canAdvance = false;

    const closeIntro = () => {
      introActive = false;
      overlay.style.transition = 'opacity 600ms';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 650);

      // Waypoint HUD tooltip — separate from narrative beats
      this.time.delayedCall(800, () => this.showHudTooltip('Click anywhere in the world to mark a destination. Jane will find her own path there.'));

      // FE-5: ethical spectrum wiring
      if (isFirstVisit) this.wireEthicsIntroResponse();
    };

    const showBeat = (i: number) => {
      textEl.textContent = beats[i];
      canAdvance = false;
      hint.style.opacity = '0';

      const isLast = i === beats.length - 1;
      const holdMs = i === 0 ? 3000 : 0;
      setTimeout(() => {
        canAdvance = true;
        hint.textContent = 'CLICK TO CONTINUE';
        hint.style.opacity = '1';
        if (isLast) {
          hint.textContent = 'CLICK TO ENTER THE SIMULATION';
          setTimeout(closeIntro, 3000);
        }
      }, holdMs);
    };

    const advance = () => {
      if (!canAdvance) return;
      beatIndex++;
      if (beatIndex < beats.length) showBeat(beatIndex);
    };

    overlay.addEventListener('click', advance);
    document.addEventListener('keydown', (e) => {
      if (overlay.isConnected && (e.key === 'Enter' || e.key === ' ')) advance();
    }, { once: false });

    showBeat(0);
  }

  // FE-5: ethical spectrum — fires once after the first waypoint resolves
  private _ethicsIntroFired = false;
  private wireEthicsIntroResponse(): void {
    if (this._ethicsIntroFired) return;

    // Path A: no waypoint placed in 90s → observation line
    const noWaypointTimer = this.time.delayedCall(90_000, () => {
      if (this._ethicsIntroFired) return;
      this._ethicsIntroFired = true;
      this.showJonoLine(
        "You can watch. Sometimes observation is the right move.\nSometimes the timeline runs out while you're thinking."
      );
    });

    // Path B or C: player places a waypoint
    const unsubPlaced = this.eventBus.on('ASI_WAYPOINT_PLACED', () => {
      if (this._ethicsIntroFired) return;
      noWaypointTimer.remove(false);
      unsubPlaced();

      // Wait to see if Jane arrives (25s window)
      let arrived = false;
      const unsubArrived = this.eventBus.on('JANE_ARRIVED_AT_WAYPOINT', () => {
        if (this._ethicsIntroFired) return;
        arrived = true;
        this._ethicsIntroFired = true;
        unsubArrived();
        this.showJonoLine("She followed you. Don't take that for granted.\nIt's a choice she makes.");
      });

      this.time.delayedCall(25_000, () => {
        if (this._ethicsIntroFired) return;
        if (!arrived) {
          unsubArrived();
          this._ethicsIntroFired = true;
          this.showJonoLine("She has her own mind.\nGuidance only works when it's earned.");
        }
      });
    });
  }

  private showHudTooltip(text: string): void {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,10,20,0.85);
      border: 1px solid #004444;
      padding: 10px 20px;
      z-index: 88800;
      font-family: monospace;
      font-size: 13px;
      color: #00ccaa;
      letter-spacing: 1px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 300ms ease-in;
    `;
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => {
      el.style.transition = 'opacity 600ms ease-out';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 650);
    }, 5000);
  }

  private showJonoLine(text: string): void {
    JonoTransmission.show(text, () => {
      this.psiNetLog?.add('BRIDGE', 'Encrypted packet — decryption complete', false);
    });
  }

  private addBasicPlayerControls() {
    const cursors = this.input.keyboard?.createCursorKeys();
    const wasd = this.input.keyboard?.addKeys('W,S,A,D') as any;
    
    _DEV && console.log('🎮 Basic player controls added (WASD/Arrow keys, F to board speeder)');
    
    (this as any).playerControls = { cursors, wasd };
  }

  private handleNPCInteraction(npcId: string) {
    const npc = this.npcManager.getNPC(npcId);
    if (npc) {
      this.dialogueManager.startDialogue('npc_test_1_intro');
      this.npcManager.setRelationship(npcId, npc.relationship + 1);
      this.npcManager.updateNPC({ ...npc, relationship: npc.relationship + 1 });
    }
  }

  update(_time: number, delta: number) {
    this.modularGameLoop.update(delta);

    // Spatial audio update (ambient crossfade + rift contamination)
    this.audioManager?.update();

    // Propagate rift proximity from AudioManager → HarmonicEngine
    this.harmonicEngine?.setState({ riftProximity: this.audioManager?.getRiftProximity() ?? 0 });

    // Harmonic engine tick (tone crossfade timing)
    this.harmonicEngine?.update(delta);

    // Jane AI state → emotional angle
    const janeState = this.janeAI?.state as JaneAIState | undefined;
    if (janeState != null) {
      const JANE_STATE_TO_ANGLE: Record<JaneAIState, number> = {
        [JaneAIState.Idle]:           0,   // Stillness
        [JaneAIState.Bored]:          0,   // Stillness
        [JaneAIState.Navigate]:       60,  // Curiosity / Movement
        [JaneAIState.FollowGuidance]: 120, // Hope / Warmth
        [JaneAIState.Combat]:         210, // Power / Clarity
        [JaneAIState.Retreat]:        330, // Anticipation / Threshold
        [JaneAIState.Refusing]:       30,  // Tension / Dissonance
      };
      this.harmonicEngine?.setEmotionalAngle(JANE_STATE_TO_ANGLE[janeState] ?? 0);
    }

    // ASI guidance arrival detection
    this.asiIntegration?.checkGuidanceArrival();

    // P4: Tick depth systems
    this.eventHistoryLog?.update(delta);
    this.cosmicCalendar?.update(delta);
    this.emotionSystem?.update(delta);
    this.fastTravelManager?.updateTravel(delta);

    // P3: Tick rift manager and Terra companion
    this.riftManager?.update(delta);
    if (this.terra?.isActivated()) {
      const sprite = this.playerManager?.getJaneSprite();
      const enemies = (this.enemyManager?.enemies ?? [])
        .filter(e => e.isAlive)
        .map(e => {
          const s = this.enemyManager?.enemySprites.get(e);
          return { id: e.definition.id || 'unknown', x: s?.x ?? 0, y: s?.y ?? 0 };
        });
      this.terra.update(delta, sprite?.x ?? 0, sprite?.y ?? 0, enemies);
    }

    // P4: Jono hologram proximity check
    if (this.jonoHologram) {
      const sprite = this.playerManager?.getJaneSprite();
      if (sprite) {
        this.jonoHologram.checkProximity(
          sprite.x, sprite.y,
          this.eventHistoryLog?.getGameTime() ?? 0,
          {
            hasUsedUL: false, // TODO: wire to UL usage tracking
            hasCompanion: this.terra?.isActivated() ?? false,
            activeRiftCount: this.riftManager?.getActiveRifts().length ?? 0,
            lowestStability: this.nodeManager?.getAllNodes().reduce((min, n) => Math.min(min, n.stability), 100) ?? 100,
            trustLevel: this.asiIntegration?.getTrustLevel() ?? 50,
            cosmicPhase: this.cosmicCalendar?.getPhase() ?? null,
          }
        );
      }
    }
    
    // FE-1: Track Beu glow position with Jane
    if (this.beuGlow) {
      const jS = this.playerManager?.getJaneSprite();
      if (jS) {
        this.beuGlow.setPosition(jS.x + 14, jS.y - 12);
        // Stage 6.2: Render Beu orbit rings + waveform
        if (this.beuSig) {
          this.beuSig.render(jS.x + 14, jS.y - 12, this.time.now);
        }
      }
    }

    // Stage 4.1.3: Update Jane psionic aura position
    if (this.janeAura) {
      const jS = this.playerManager?.getJaneSprite();
      if (jS) {
        this.janeAura.clear();
        const sat = this.channelSaturation?.value ?? 0;
        // Aura contracts under high saturation / stress
        const radius = 14 - sat * 0.06;
        this.janeAura.lineStyle(1, 0xffffff, 0.55);
        this.janeAura.strokeCircle(jS.x, jS.y - 4, radius);
        this.janeAura.lineStyle(0.5, 0xffffff, 0.20);
        this.janeAura.strokeCircle(jS.x, jS.y - 4, radius + 5);
      }
    }

    // Update UI with current game state
    this.updateUIElements();
    
    // Basic manual player movement for testing
    this.updateBasicPlayerMovement();
    
    // Speeder interaction hint
    this.speederController?.updateInteractionHint();
  }

  private updateUIElements() {
    if (!this.uiBarSystem) return;

    // Animate COHERENCE waveform + RESONANCE dot (time-based)
    this.uiBarSystem.update();

    // Channel saturation passive decay
    this.channelSaturation?.tick();

    const jane = this.playerManager?.getJane();
    const health = jane?.stats.health ?? 100;
    const maxHealth = jane?.stats.maxHealth ?? 100;
    const psi = jane?.stats.psi ?? 75;
    const maxPsi = jane?.stats.maxPsi ?? 100;

    this.uiBarSystem.updateCoherence(health, maxHealth);
    this.uiBarSystem.updateResonance(psi, maxPsi);
    
    const asiControlled = this.playerManager?.isJaneASIControlled() ? 'ASI' : 'Manual';
    const trustLevel = this.asiIntegration?.getTrustLevel() || 50;
    const janeState = this.janeAI?.state || 'Unknown';
    this.uiBarSystem.updateStatus(`${janeState} • ${asiControlled} • Trust: ${Math.round(trustLevel)}%`);
    
    const navigationSpeed = 1.0;
    this.uiBarSystem.updateSpeed(navigationSpeed);

    // Stage 6.3: Update sector scan radar with current entity positions
    if (this.sectorScanRadar) {
      const jS = this.playerManager?.getJaneSprite();
      if (jS) {
        const radarEntities: RadarEntity[] = [];

        // Ley line nodes
        const nodes = this.nodeManager?.getAllNodes() ?? [];
        for (const node of nodes) {
          radarEntities.push({
            id:     `node-${node.id}`,
            type:   node.stability < 40 ? 'ley-disrupted' : 'ley-node',
            worldX: node.position?.x ?? 0,
            worldY: node.position?.y ?? 0,
          });
        }

        // Active rifts (Nefarium)
        const rifts = this.riftManager?.getActiveRifts() ?? [];
        for (const rift of rifts) {
          radarEntities.push({
            id:     `rift-${rift.id}`,
            type:   'nefarium',
            worldX: rift.x,
            worldY: rift.y,
          });
        }

        // Enemies
        const enemies = this.enemyManager?.enemies ?? [];
        for (const enemy of enemies) {
          const eSprite = this.enemyManager?.enemySprites?.get(enemy);
          if (eSprite) {
            radarEntities.push({
              id:     `enemy-${enemy.definition?.id ?? Math.random()}`,
              type:   'enemy',
              worldX: eSprite.x,
              worldY: eSprite.y,
            });
          }
        }

        // Timeline anchors (latest only, as a waypoint echo)
        const anchorManager = (this as any).anchorManager as import('./AnchorManager').AnchorManager | undefined;
        const anchors = anchorManager?.anchors ?? [];
        for (const anchor of anchors) {
          radarEntities.push({
            id:     `anchor-${anchor.seed}`,
            type:   'anchor',
            worldX: anchor.center.x,
            worldY: anchor.center.y,
          });
        }

        // Scan quality follows leyline/rift disruption state
        const disrupted = rifts.length > 0;
        const nefariumActive = rifts.length >= 2;
        this.sectorScanRadar.setScanQuality(
          nefariumActive ? 'nefarium' : disrupted ? 'disrupted' : 'normal',
        );

        this.sectorScanRadar.updateEntities(jS.x, jS.y, radarEntities);
      }
    }
  }

  private updateBasicPlayerMovement() {
    // Skip manual movement when JaneAI is actively navigating, fighting, or retreating
    const aiState = this.janeAI?.state;
    if (aiState === 'FollowGuidance' || aiState === 'Combat' || aiState === 'Retreat') return;

    const controls = (this as any).playerControls;
    if (!controls) return;

    const janeSprite = this.playerManager.getJaneSprite();
    if (!janeSprite || this.speederController?.getIsOnSpeeder()) return;

    const { cursors, wasd } = controls;
    const speed = 200;

    let velocityX = 0;
    let velocityY = 0;

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
    
    if (this.chunkLoader && (velocityX !== 0 || velocityY !== 0)) {
      try {
        const walkingSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * 0.018;
        this.chunkLoader.updateLoadedChunks(janeSprite.x, janeSprite.y, walkingSpeed);
      } catch (error) {
        console.error('❌ Error updating chunks during player movement:', error);
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
