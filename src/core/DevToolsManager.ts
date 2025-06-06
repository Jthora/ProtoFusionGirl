import Phaser from 'phaser';

// DevToolsManager.ts
// Handles debug, cheat, and developer tools
// Artifact reference: copilot_build_instructions_2025-06-03.artifact

export class DevToolsManager {
  private scene: Phaser.Scene;
  private playerController: any;
  private tilemapManager: any;
  private missionManager: any;
  private anchorManager: any;
  private realityWarpSystem: any;

  constructor(scene: Phaser.Scene, playerController: any, tilemapManager: any, missionManager: any, anchorManager: any, realityWarpSystem: any) {
    this.scene = scene;
    this.playerController = playerController;
    this.tilemapManager = tilemapManager;
    this.missionManager = missionManager;
    this.anchorManager = anchorManager;
    this.realityWarpSystem = realityWarpSystem;
    this.setupDebugHotkeys();
  }

  private setupDebugHotkeys() {
    // Example: add hotkeys for dev tools if needed
    // e.g., this.scene.input.keyboard?.on('keydown-G', () => this.toggleGodMode());
  }

  giveWeapon(weaponId: string) {
    this.tilemapManager.equipmentService.equipItem(weaponId, 'weapon');
  }

  setPlayerPosition(x: number, y: number) {
    this.playerController.sprite.setPosition(x, y);
  }

  toggleGodMode() {
    this.playerController.isInvincible = !this.playerController.isInvincible;
  }

  healPlayer(amount: number) {
    this.playerController.heal(amount);
  }

  spawnItem(itemId: string) {
    const item = this.scene.add.rectangle(Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500), 32, 32, 0xffff00);
    item.setOrigin(0.5, 0.5);
    item.setData('itemId', itemId);
    this.scene.physics.add.existing(item);
    (item.body as Phaser.Physics.Arcade.StaticBody).setStatic(true);
  }

  logAnchors() {
    console.log('Anchors:', this.anchorManager.anchors);
  }

  warpReality() {
    const gridSize = { width: 9, height: 9 };
    const center = { x: Math.round(this.playerController.sprite.x), y: Math.round(this.playerController.sprite.y) };
    const options = { shape: 'rectangle', includeEnvironment: false };
    const seed = this.tilemapManager.serializeGridToSeed(center, gridSize, options);
    this.realityWarpSystem.warpToReality(seed, {
      initiator: 'debug',
      gridCenter: center,
      gridSize,
      gridShape: options.shape as 'rectangle',
      seed,
      timestamp: Date.now(),
      partial: true
    });
  }

  // Add more dev/debug methods as needed...
}
