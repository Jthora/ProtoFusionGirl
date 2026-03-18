// Mock Phaser module to avoid loading real canvas/WebGL in tests
jest.mock('phaser', () => ({
  __esModule: true,
  default: {
    AUTO: 'AUTO',
    Scene: class { constructor(..._args:any[]){} },
    Math: { Distance: { Between: jest.fn(() => 0) } },
    Input: { Keyboard: { KeyCodes: {}, Key: class {} } },
    Scale: { RESIZE: 'RESIZE', CENTER_BOTH: 'CENTER_BOTH' },
    Physics: { Arcade: { Sprite: class {}, StaticGroup: class {} } },
  },
}));

// Mock UI/layout modules that pull in DOM/canvas specifics
jest.mock('../ui/components', () => ({ TouchControls: class {} }));
jest.mock('../ui/components/ASIOverlay', () => ({ ASIOverlay: class {} }));
jest.mock('../asiControl/ui/components/CommandCenterUI', () => ({ CommandCenterUI: class {} }));
jest.mock('../ui/layout/UILayoutManager', () => ({
  UILayoutManager: class {
    registerComponent = jest.fn();
    hideComponent = jest.fn();
    toggleComponent = jest.fn();
    isComponentVisible = jest.fn(() => false);
    showEssentialUI = jest.fn();
    hideContextualUI = jest.fn();
    showLayoutDebug = jest.fn();
    onResize = jest.fn();
    setMode = jest.fn();
    getMode = jest.fn(() => 'standard');
  }
}));
jest.mock('../ui/layout/UIBarSystem', () => ({
  UIBarSystem: class {
    updateHealth = jest.fn();
    updatePSI = jest.fn();
    updateStatus = jest.fn();
    updateSpeed = jest.fn();
    onResize = jest.fn();
  }
}));
jest.mock('./PauseMenuScene', () => ({ PauseMenuScene: class {} }));
jest.mock('./SettingsScene', () => ({ SettingsScene: class {} }));
jest.mock('../core/controls/InputManager', () => ({
  InputManager: {
    getInstance: jest.fn(() => ({
      getTouchInput: () => ({ setLeft: jest.fn(), setRight: jest.fn(), setJump: jest.fn() }),
    }))
  }
}));
jest.mock('../core/controls/KeyboardInput', () => ({ KeyboardInput: class {} }));
jest.mock('../world/missions/MissionManager', () => ({
  MissionManager: class {
    loadMissions = jest.fn();
    getAllMissions = jest.fn(() => []);
    getMission = jest.fn(() => undefined);
    restoreMissions = jest.fn();
    serializeMissions = jest.fn(() => []);
    update = jest.fn();
    onMissionCompleted?: (id: string) => void;
  }
}));
jest.mock('../world/missions/MissionSystem', () => ({
  MissionSystem: class {
    startMission = jest.fn();
  }
}));
jest.mock('../world/missions/sampleMissions', () => ({ sampleMissions: [] }));
jest.mock('../ui/MissionHUD', () => ({ MissionHUD: class { destroy = jest.fn(); refresh = jest.fn(); } }));
jest.mock('../core/PlayerManager', () => ({
  PlayerManager: jest.fn().mockImplementation((opts: any) => {
    const janeSprite: any = {
      x: opts?.playerConfig?.x ?? 400,
      y: opts?.playerConfig?.y ?? 300,
      setVisible: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis(),
      setPosition: jest.fn(function(this:any, x:number, y:number){ this.x = x; this.y = y; return this; }),
      setVelocity: jest.fn().mockReturnThis(),
      setVelocityX: jest.fn().mockReturnThis(),
      setVelocityY: jest.fn().mockReturnThis(),
      play: jest.fn().mockReturnThis(),
      body: { velocity: { x: 0, y: 0 } }
    };
    return {
      initialize: jest.fn(),
      getJaneSprite: jest.fn(() => janeSprite),
      getJane: jest.fn(() => ({ updateAI: jest.fn() })),
      isJaneASIControlled: jest.fn(() => false),
      setJaneASIOverride: jest.fn(),
      getPlayerAttackController: jest.fn(() => ({ attackNearestEnemy: jest.fn() }))
    } as any;
  })
}));
jest.mock('../core/UIManager', () => ({
  UIManager: class {
    minimap = { updateMinimap: jest.fn(), toggleLeyLineOverlayVisible: jest.fn() };
    update = jest.fn();
    setLeyLineMinimapData = jest.fn();
  }
}));
jest.mock('../core/EnemyManager', () => ({
  EnemyManager: class {
    enemies:any[] = []; enemySprites:any[] = [];
    spawnEnemy = jest.fn();
    update = jest.fn();
  }
}));
jest.mock('../core/WorldEditorManager', () => ({ WorldEditorManager: class {} }));
jest.mock('../core/DevToolsManager', () => ({ DevToolsManager: class {} }));
jest.mock('../core/NarrativeManager', () => ({ NarrativeManager: class {} }));
jest.mock('../core/PluginManager', () => ({ PluginManager: class {} }));
jest.mock('../ui/components/InventoryOverlay', () => ({ InventoryOverlay: class {} }));
jest.mock('../ui/components/DialogueModal', () => ({ DialogueModal: class {} }));
jest.mock('../world/leyline/LeyLineManager', () => ({ LeyLineManager: class {} }));
jest.mock('../world/leyline/visualization/LeyLineVisualization', () => ({
  LeyLineVisualization: {
    generateEventOverlays: jest.fn(() => []),
    getRenderData: jest.fn(() => ({ lines: [], nodes: [], overlays: [] }))
  }
}));
jest.mock('../asiControl/systems/TrustManager', () => ({ TrustManager: class {} }));
jest.mock('../asiControl/systems/ThreatDetector', () => ({ ThreatDetector: class {} }));
jest.mock('../asiControl/systems/GuidanceEngine', () => ({ GuidanceEngine: class {} }));
jest.mock('../navigation/ui/SpeedControlUI', () => ({ SpeedControlUI: class {} }));
jest.mock('../world/WorldStateManager', () => ({
  WorldStateManager: class {
    getState(){ return { leyLines: [], players: [] }; }
    updateState = jest.fn();
  }
}));
jest.mock('../navigation/core/NavigationManager', () => ({
  NavigationManager: class {
    update = jest.fn();
    getCurrentSpeed = jest.fn(() => 100);
  }
}));
jest.mock('../world/tilemap/ChunkLoader', () => ({
  ChunkLoader: class {
    updateLoadedChunks = jest.fn();
  }
}));
jest.mock('../world/tilemap/TilemapManager', () => ({
  TilemapManager: class {
    public chunkManager:any = { chunkSize: 16 };
    public worldGen = { generateFromSeed: jest.fn() };
    public equipmentService = { equipItem: jest.fn() };
    public inventoryPanel = { setEquipmentIntegration: jest.fn(), render: jest.fn() };
    public equipmentPanel = { render: jest.fn() };
    public craftingPanel = { render: jest.fn() };
    static wrapX(x:number){return x;}
    static wrapChunkX(x:number){return x;}
  }
}));
jest.mock('../ui/components/ASIOverlay', () => ({
  ASIOverlay: class {
    setASIState = jest.fn();
    onConsent = jest.fn();
    setDepth = jest.fn();
  }
}));
jest.mock('../navigation/ui/SpeedControlUI', () => ({
  SpeedControlUI: class {}
}));
jest.mock('../world/tilemap/TileRegistry', () => ({ TileRegistry: class {} }));
jest.mock('../world/tilemap/TileSpriteFactory', () => ({ TileSpriteFactory: { createTileSprite: jest.fn() } }));
jest.mock('../world/RealityWarpSystem', () => ({ RealityWarpSystem: class {} }));
jest.mock('../mods/mod_loader', () => ({ registerModEnemies: jest.fn(), registerModAttacks: jest.fn() }));
jest.mock('../mods/sample_enemy_mod', () => ({}));
jest.mock('../world/enemies/EnemyRegistry', () => ({ EnemyRegistry: class { registerEnemy() {} create() { return null; } getDefinition() { return null; } } }));
jest.mock('../world/combat/AttackRegistry', () => ({ AttackRegistry: class {} }));
jest.mock('../core/NPCManager', () => ({
  NPCManager: class {
    static registerGlobalInstance: any = jest.fn();
    static spawnTestNPC: any = jest.fn((_scene:any, _cb:any) => ({ x: 0, y: 0 }));
    static isPlayerNearNPC: any = jest.fn(() => true);
    constructor(..._args:any[]){}
    getNPC = jest.fn(() => ({ relationship: 0 }));
    setRelationship = jest.fn();
    updateNPC = jest.fn();
  }
}));
jest.mock('../core/InventoryManager', () => ({
  InventoryManager: class {
    static registerGlobalInstance: any = jest.fn();
    static spawnTestItem: any = jest.fn((_scene:any, _cb:any) => ({ destroy: jest.fn() }));
    constructor(..._args:any[]){}
    addItem = jest.fn();
  }
}));
jest.mock('../core/DialogueManager', () => ({
  DialogueManager: class {
    registerDefaultNodes = jest.fn();
    onDialogueStarted = jest.fn();
    startDialogue = jest.fn();
  }
}));
jest.mock('../utils/PlaceholderAssets', () => {
  const makeCanvas = () => ({
    width: 64,
    height: 64,
    getContext: jest.fn(() => ({ fillStyle: '', fillRect: jest.fn(), clearRect: jest.fn(), beginPath: jest.fn(), moveTo: jest.fn(), quadraticCurveTo: jest.fn(), stroke: jest.fn(), globalAlpha: 1 })),
    toDataURL: jest.fn(() => 'data:image/png;base64,TEST')
  });
  return {
    createTileset: jest.fn(() => makeCanvas()),
    createPlayerSpritesheet: jest.fn(() => makeCanvas()),
    createPlaceholderCanvas: jest.fn(() => makeCanvas()),
    createMagnetoSpeederSprite: jest.fn(() => makeCanvas()),
    createHypersonicEffectSprite: jest.fn(() => makeCanvas()),
  };
});
jest.mock('../services/SettingsService', () => ({
  SettingsService: { getInstance: () => ({ get: jest.fn(() => false), onChange: jest.fn() }) }
}));
jest.mock('../core/AppIconManager', () => ({
  AppIconManager: { getInstance: () => ({ updateIconForGameState: jest.fn() }) }
}), { virtual: true });

import { GameScene } from './GameScene';

describe('GameScene', () => {
  let scene: GameScene;

  beforeEach(() => {
    scene = new GameScene();
    // Mock minimal scene systems
    // @ts-ignore - test-time mock wiring
    (scene as any).physics = {
      add: {
        sprite: jest.fn(() => ({
          setCollideWorldBounds: jest.fn().mockReturnThis(),
          setBounce: jest.fn().mockReturnThis(),
          setGravityY: jest.fn().mockReturnThis(),
          setVelocityX: jest.fn().mockReturnThis(),
          setVelocityY: jest.fn().mockReturnThis(),
          setVelocity: jest.fn().mockReturnThis(),
          setDrag: jest.fn().mockReturnThis(),
          setScale: jest.fn().mockReturnThis(),
          setPosition: jest.fn().mockReturnThis(),
          body: { velocity: { x: 0, y: 0 } }
        })),
        existing: jest.fn(),
        staticGroup: jest.fn(() => ({ children: { entries: [] }, add: jest.fn() })),
        collider: jest.fn()
      }
    };
  // @ts-ignore - test-time mock wiring
    (scene as any).add = {
      text: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis(), setScrollFactor: jest.fn().mockReturnThis() })),
      sprite: jest.fn(() => ({
        setOrigin: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setPipeline: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        setRotation: jest.fn().mockReturnThis(),
        setTint: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        body: { velocity: { x: 0, y: 0 } },
      })),
      tileSprite: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis(), setScrollFactor: jest.fn().mockReturnThis(), setTileScale: jest.fn().mockReturnThis() })),
      image: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis(), setScrollFactor: jest.fn().mockReturnThis() })),
      container: jest.fn(() => ({ add: jest.fn(), setDepth: jest.fn().mockReturnThis() })),
      group: jest.fn(() => ({ add: jest.fn(), clear: jest.fn() })),
      existing: jest.fn(() => ({})),
      rectangle: jest.fn((x:number,y:number,_w:number,_h:number,_c?:number) => ({ x, y, setStrokeStyle: jest.fn().mockReturnThis(), setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis() })),
      circle: jest.fn((x:number,y:number,_r:number,_c?:number) => ({ x, y, setStrokeStyle: jest.fn().mockReturnThis(), setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis() })),
      graphics: jest.fn(() => ({ clear: jest.fn(), lineStyle: jest.fn().mockReturnThis(), strokeLineShape: jest.fn(), fillStyle: jest.fn().mockReturnThis(), fillCircle: jest.fn(), fillRect: jest.fn(), setDepth: jest.fn() })),
    };
  // @ts-ignore - test-time mock wiring
  (scene as any).input = { keyboard: { createCursorKeys: jest.fn(() => ({ left: {}, right: {}, up: {}, down: {} })), on: jest.fn(), addKey: jest.fn(() => ({ isDown: false })), addKeys: jest.fn(() => ({ W: { isDown: false }, A: { isDown: false }, S: { isDown: false }, D: { isDown: false } })) }, addPointer: jest.fn(), on: jest.fn() };
  // @ts-ignore - test-time mock wiring
  (scene as any).anims = { create: jest.fn(), exists: jest.fn(() => true) };
  // @ts-ignore - test-time mock wiring
  (scene as any).cameras = { main: { startFollow: jest.fn(), setZoom: jest.fn(), setAlpha: jest.fn(), width: 800, height: 600 } };
  // @ts-ignore - test-time mock wiring
  (scene as any).cache = { tilemap: { exists: jest.fn(() => true) }, audio: { has: jest.fn(() => false) } };
    // @ts-ignore - textures mock for spritesheets
  (scene as any).textures = { exists: jest.fn(() => true), get: jest.fn(), addSpriteSheet: jest.fn(), addCanvas: jest.fn() };
  // @ts-ignore - test-time mock wiring
    (scene as any).make = { tilemap: jest.fn(() => ({ addTilesetImage: jest.fn(() => ({})), createLayer: jest.fn(() => ({ setCollisionByProperty: jest.fn() })), setCollisionByProperty: jest.fn() })) };
  // @ts-ignore - test-time mock wiring
    (scene as any).children = { sendToBack: jest.fn() };
  // @ts-ignore - test-time mock wiring
  (scene as any).scale = { width: 800, height: 600 };
  // @ts-ignore - test-time mock wiring
  (scene as any).sys = { game: { device: { input: { touch: false } } } };
    // @ts-ignore - events mock
    (scene as any).events = { on: jest.fn(), once: jest.fn(), emit: jest.fn() };
  // @ts-ignore - extra scene systems used in create
  (scene as any).time = { delayedCall: jest.fn(), addEvent: jest.fn() };
  (scene as any).tweens = { add: jest.fn() };
  (scene as any).scene = { get: jest.fn(() => undefined), add: jest.fn(), launch: jest.fn(), pause: jest.fn(), isPaused: jest.fn(() => false) };
  });

  it('should create a player sprite with physics', () => {
    scene.create();
    expect(scene.physics.add.sprite).toHaveBeenCalled();
  });

  it('should set up player controls', () => {
    scene.create();
    expect(scene.input.keyboard!.createCursorKeys).toHaveBeenCalled();
  });

  // TODO: Write Jest test for player movement (see .primer)
  // TODO: Add tests for tilemap loading and health bar UI (see .primer)
  // Add more tests for movement, jumping, etc. as the logic is implemented
});
