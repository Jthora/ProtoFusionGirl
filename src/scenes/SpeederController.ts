import Phaser from 'phaser';
import { NavigationManager } from '../navigation/core/NavigationManager';
import { ChunkLoader } from '../world/tilemap/ChunkLoader';
import { PlayerManager } from '../core/PlayerManager';

export interface SpeederControllerConfig {
  scene: Phaser.Scene;
  playerManager: PlayerManager;
  groundGroup: Phaser.Physics.Arcade.StaticGroup;
  navigationManager?: NavigationManager;
  chunkLoader?: ChunkLoader;
  speederStartX: number;
  speederStartY: number;
}

export class SpeederController {
  private scene: Phaser.Scene;
  private playerManager: PlayerManager;
  private navigationManager?: NavigationManager;
  private chunkLoader?: ChunkLoader;

  private magnetoSpeederSprite?: Phaser.Physics.Arcade.Sprite;
  private hypersonicEffectSprite?: Phaser.GameObjects.Sprite;
  private isOnSpeeder: boolean = false;
  private speederKeys?: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private lastBoardToggleAt: number = 0;
  private interactionHint?: Phaser.GameObjects.Text;

  constructor(config: SpeederControllerConfig) {
    this.scene = config.scene;
    this.playerManager = config.playerManager;
    this.navigationManager = config.navigationManager;
    this.chunkLoader = config.chunkLoader;

    // Create speeder sprite
    this.magnetoSpeederSprite = this.scene.physics.add.sprite(
      config.speederStartX, config.speederStartY, 'magnetospeeder'
    );
    this.magnetoSpeederSprite.setCollideWorldBounds(true);
    this.magnetoSpeederSprite.setScale(1.5);
    this.magnetoSpeederSprite.setBounce(0.2);
    this.magnetoSpeederSprite.setDrag(50);

    // Collision with ground
    this.scene.physics.add.collider(this.magnetoSpeederSprite, config.groundGroup);

    // Hypersonic effect (initially hidden)
    this.hypersonicEffectSprite = this.scene.add.sprite(0, 0, 'hypersonic-effect');
    this.hypersonicEffectSprite.setVisible(false);
    this.hypersonicEffectSprite.setDepth(-1);
    this.hypersonicEffectSprite.setAlpha(0.7);

    // F-key boarding (only for speeder — proximity check)
    this.wireBoardingInput();

    console.log(`✅ SpeederController initialized at (${config.speederStartX}, ${config.speederStartY})`);
  }

  private wireBoardingInput(): void {
    const janeSprite = this.playerManager.getJaneSprite();
    if (!janeSprite || !this.magnetoSpeederSprite) return;

    const kb: any = this.scene.input.keyboard as any;
    if (kb && typeof kb.on === 'function') {
      kb.on('keydown-F', () => {
        const now = Date.now();
        if (now - this.lastBoardToggleAt < 250) return;
        const jane = this.playerManager.getJaneSprite();
        if (jane && this.magnetoSpeederSprite) {
          const distance = Phaser.Math.Distance.Between(
            jane.x, jane.y,
            this.magnetoSpeederSprite.x, this.magnetoSpeederSprite.y
          );
          if (distance < 64) {
            this.toggleBoarding();
            this.lastBoardToggleAt = now;
          }
        }
      });
    }
  }

  getIsOnSpeeder(): boolean { return this.isOnSpeeder; }
  getSprite(): Phaser.Physics.Arcade.Sprite | undefined { return this.magnetoSpeederSprite; }

  toggleBoarding(): void {
    if (!this.magnetoSpeederSprite) return;
    this.isOnSpeeder = !this.isOnSpeeder;

    const janeSprite = this.playerManager.getJaneSprite();

    if (this.isOnSpeeder) {
      console.log('🚀 Jane mounted the MagnetoSpeeder!');

      const centerX = this.scene.cameras.main.width / 2;
      const centerY = this.scene.cameras.main.height - 100;
      const boardingMessage = this.scene.add.text(centerX, centerY,
        '🚀 MagnetoSpeeder Activated!\nPress WASD or Arrow Keys to move\nPress F to dismount', {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#00ff88',
        backgroundColor: '#001122',
        padding: { x: 12, y: 8 },
        align: 'center'
      }).setOrigin(0.5).setDepth(2000).setScrollFactor(0);

      this.scene.time.delayedCall(4000, () => {
        this.scene.tweens.add({
          targets: boardingMessage,
          alpha: 0,
          duration: 1000,
          onComplete: () => boardingMessage.destroy()
        });
      });

      if (janeSprite) {
        janeSprite.setVisible(false);
        this.magnetoSpeederSprite.setPosition(janeSprite.x, janeSprite.y);
      }
    } else {
      console.log('👩‍🚀 Jane dismounted the MagnetoSpeeder');
      if (janeSprite) {
        janeSprite.setVisible(true);
        janeSprite.setPosition(this.magnetoSpeederSprite.x + 32, this.magnetoSpeederSprite.y);
      }
      if (this.hypersonicEffectSprite) {
        this.hypersonicEffectSprite.setVisible(false);
      }
    }
  }

  updateMovement(): void {
    if (!this.isOnSpeeder || !this.magnetoSpeederSprite || !this.navigationManager) return;
    const cursors = this.scene.input.keyboard?.createCursorKeys();
    if (!cursors) return;

    if (!this.speederKeys) {
      const kb: any = this.scene.input.keyboard as any;
      if (!kb || typeof kb.addKey !== 'function') return;
      this.speederKeys = {
        W: kb.addKey('W'),
        A: kb.addKey('A'),
        S: kb.addKey('S'),
        D: kb.addKey('D'),
      } as any;
    }
    if (!this.speederKeys) return;

    const currentSpeed = this.navigationManager.getCurrentSpeed();
    const baseSpeedMultiplier = 0.1;
    const gameSpeed = Math.min(currentSpeed * baseSpeedMultiplier, 800);

    let velocityX = 0;
    let velocityY = 0;

    if (cursors.left.isDown || this.speederKeys?.A?.isDown) {
      velocityX = -gameSpeed;
    } else if (cursors.right.isDown || this.speederKeys?.D?.isDown) {
      velocityX = gameSpeed;
    }
    if (cursors.up.isDown || this.speederKeys?.W?.isDown) {
      velocityY = -gameSpeed;
    } else if (cursors.down.isDown || this.speederKeys?.S?.isDown) {
      velocityY = gameSpeed;
    }

    this.magnetoSpeederSprite.setVelocity(velocityX, velocityY);
    this.updateHypersonicEffect(currentSpeed);

    // Camera follows speeder
    this.scene.cameras.main.startFollow(this.magnetoSpeederSprite, true, 0.1, 0.1);

    // Terrain streaming
    if (this.chunkLoader) {
      try {
        this.chunkLoader.updateLoadedChunks(
          this.magnetoSpeederSprite.x,
          this.magnetoSpeederSprite.y,
          currentSpeed
        );
      } catch (error) {
        console.error('❌ Error updating chunks during speeder movement:', error);
      }
    }
  }

  private updateHypersonicEffect(speedKmh: number): void {
    if (!this.hypersonicEffectSprite || !this.magnetoSpeederSprite) return;

    if (speedKmh > 12000) {
      this.hypersonicEffectSprite.setVisible(true);
      this.hypersonicEffectSprite.setPosition(
        this.magnetoSpeederSprite.x - 20,
        this.magnetoSpeederSprite.y
      );
      const intensity = Math.min(speedKmh / 343000, 1);
      this.hypersonicEffectSprite.setAlpha(0.3 + intensity * 0.5);
      this.hypersonicEffectSprite.setScale(0.5 + intensity * 1.5);

      const body = this.magnetoSpeederSprite.body as Phaser.Physics.Arcade.Body;
      if (body) {
        const angle = Math.atan2(body.velocity.y, body.velocity.x);
        this.hypersonicEffectSprite.setRotation(angle);
      }
    } else {
      this.hypersonicEffectSprite.setVisible(false);
    }
  }

  updateInteractionHint(): void {
    const janeSprite = this.playerManager.getJaneSprite();
    if (!janeSprite || !this.magnetoSpeederSprite || this.isOnSpeeder) return;

    const distance = Phaser.Math.Distance.Between(
      janeSprite.x, janeSprite.y,
      this.magnetoSpeederSprite.x, this.magnetoSpeederSprite.y
    );

    if (distance < 80) {
      if (!this.interactionHint) {
        this.interactionHint = this.scene.add.text(
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
      }
    } else {
      if (this.interactionHint) {
        this.interactionHint.destroy();
        this.interactionHint = undefined;
      }
    }
  }

  setChunkLoader(chunkLoader: ChunkLoader): void {
    this.chunkLoader = chunkLoader;
  }

  setNavigationManager(nav: NavigationManager): void {
    this.navigationManager = nav;
  }
}
