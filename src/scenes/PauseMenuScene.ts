/**
 * PauseMenuScene — ASI Standby mode.
 *
 * When paused, the ASI shifts attention from active observation to its
 * console layer. The HoloDeck view desaturates (but keeps running) behind
 * a DOM overlay rendered by ASIStandbyOverlay.
 *
 * The scene is launched as an overlay on top of GameScene (which is paused).
 */
import Phaser from 'phaser';
import { ASIStandbyOverlay } from '../ui/ASIStandbyOverlay';

export class PauseMenuScene extends Phaser.Scene {
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    super({ key: 'PauseMenuScene' });
  }

  create() {
    // Desaturate the game canvas (HoloDeck keeps existing but dims)
    this.canvas = document.querySelector<HTMLCanvasElement>('canvas');
    if (this.canvas) {
      this.canvas.style.transition = 'filter 200ms ease';
      this.canvas.style.filter = 'saturate(0.15) brightness(0.45)';
    }

    // Pull live stats from GameScene if available
    const gameScene = this.scene.get('GameScene') as any;
    const stats = {
      sessionStartMs:    gameScene?.sessionStartMs ?? undefined,
      timelineDelta:     gameScene?.timelineDelta  ?? undefined,
      interventionCount: gameScene?.interventionCount ?? undefined,
      channelSaturation: gameScene?.channelSaturation ?? undefined,
      janeCoherence:     gameScene?.jane?.stats?.health != null
        ? Math.round((gameScene.jane.stats.health / (gameScene.jane.stats.maxHealth || 100)) * 100)
        : undefined,
      leylineStability: gameScene?.leylineStability ?? undefined,
    };

    const onAnchor = gameScene?.placeTimelineAnchor
      ? () => gameScene.placeTimelineAnchor()
      : undefined;

    ASIStandbyOverlay.show(stats, onAnchor).then(action => {
      this.restoreCanvas();

      if (action === 'resume') {
        this.scene.stop();
        this.scene.resume('GameScene');
      } else {
        // End session — stop game, return to Kernel/StartScene
        this.scene.stop('GameScene');
        this.scene.stop();
        this.scene.start('StartScene');
      }
    });
  }

  private restoreCanvas(): void {
    if (this.canvas) {
      this.canvas.style.transition = 'filter 250ms ease';
      this.canvas.style.filter = '';
    }
  }

  shutdown(): void {
    this.restoreCanvas();
  }
}
