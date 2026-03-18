import Phaser from 'phaser';
import { AudioManager, preloadAllAudio, AUDIO_KEYS } from '../audio/AudioManager';
import { SessionPersistence } from '../save/SaveSystem';

/**
 * StartScene — thin pass-through.
 *
 * The PsiSys Kernel (DOM layer) runs before Phaser starts and handles all
 * entry UX (cold boot, callsign, return session status diff).
 * StartScene exists only so Phaser has a first scene — it immediately proceeds
 * to GameScene after playing the boot SFX.
 *
 * The ley-line title screen copy is kept intact for now as a fallback, but
 * the primary ENTER route skips it via autoStart if Kernel already ran.
 */
export class StartScene extends Phaser.Scene {
  private cursorVisible = true;
  private cursorText!: Phaser.GameObjects.Text;
  private audioManager?: AudioManager;

  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    preloadAllAudio(this.load);
  }

  create() {
    // If the PsiSys Kernel already ran (callsign registered), skip the title
    // screen and go straight to the simulation entry overlay.
    const session = SessionPersistence.load();
    if (session?.callsign) {
      this.audioManager = new AudioManager(this);
      this.audioManager.playSfx(AUDIO_KEYS.SFX_BOOT_SEQUENCE);
      this.time.delayedCall(400, () => this.enterSimulation());
      return;
    }

    const { width, height } = this.cameras.main;

    // --- Background ---
    this.add.rectangle(width / 2, height / 2, width, height, 0x080810);

    // --- Dim ley line grid (3 diagonal cyan lines, very low opacity) ---
    this.drawLeylineGrid(width, height);

    // --- Title ---
    this.add.text(width / 2, height / 2 - 110, 'ProtoFusionGirl', {
      fontSize: '52px',
      color: '#FF8C00',
      fontStyle: 'bold',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // --- Hook lines ---
    this.add.text(width / 2, height / 2 - 42, "Jane Tho\u02bera is in the simulation.", {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 16, "She knows you\u02bere there. The simulation going live — she doesn\u02bet.", {
      fontSize: '14px',
      color: '#FF8C00',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // --- ENTER SIMULATION button ---
    const btn = this.add.text(width / 2, height / 2 + 60, '[ ENTER SIMULATION ]', {
      fontSize: '24px',
      color: '#FF8C00',
      backgroundColor: '#0d0e10',
      padding: { x: 24, y: 12 },
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#1a1200', color: '#FFD700' }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#0d0e10', color: '#FF8C00' }));
    btn.on('pointerdown', () => this.enterSimulation());

    this.input.keyboard?.on('keydown-ENTER', () => this.enterSimulation());

    // --- Footer ---
    const footerY = height - 28;
    const footerLeft = this.add.text(24, footerY,
      'PSINET // HOLO DECK v2032.1 // OPERATOR AUTHENTICATED', {
      fontSize: '11px',
      color: 'rgba(255,140,0,0.35)',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0, 0.5);

    this.cursorText = this.add.text(
      footerLeft.x + footerLeft.width + 4, footerY, '\u258c', {
      fontSize: '11px',
      color: 'rgba(255,140,0,0.35)',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0, 0.5);

    // Blinking cursor
    this.time.addEvent({
      delay: 530,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.cursorText.setAlpha(this.cursorVisible ? 1 : 0);
      }
    });

    // Audio — main menu music + boot SFX
    this.audioManager = new AudioManager(this);
    this.audioManager.playSfx(AUDIO_KEYS.SFX_BOOT_SEQUENCE);
    this.time.delayedCall(1200, () => {
      this.audioManager?.playMusic(AUDIO_KEYS.MUSIC_MAIN_MENU, 1500);
    });
  }

  shutdown(): void {
    this.audioManager?.stopMusic(400);
    this.audioManager?.destroy();
  }

  private drawLeylineGrid(width: number, height: number): void {
    const g = this.add.graphics();
    g.lineStyle(1, 0xFF8C00, 0.06);

    // Three diagonal lines spanning full screen
    const offsets = [width * 0.2, width * 0.5, width * 0.8];
    for (const ox of offsets) {
      g.beginPath();
      g.moveTo(ox - height * 0.6, 0);
      g.lineTo(ox + height * 0.6, height);
      g.strokePath();
    }

    // Slow pulse tween on the grid layer
    this.tweens.add({
      targets: g,
      alpha: { from: 0.5, to: 1.4 },
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private enterSimulation(): void {
    // Prevent double-trigger
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();
    // PsiSysKernel + ProjectionTransit already handled the full entry experience
    // in the DOM layer before Phaser started. Go straight to GameScene.
    this.scene.start('GameScene');
  }
}
