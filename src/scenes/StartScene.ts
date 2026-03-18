import Phaser from 'phaser';
import { AudioManager, preloadAllAudio, AUDIO_KEYS } from '../audio/AudioManager';

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
    const { width, height } = this.cameras.main;

    // --- Background ---
    this.add.rectangle(width / 2, height / 2, width, height, 0x080810);

    // --- Dim ley line grid (3 diagonal cyan lines, very low opacity) ---
    this.drawLeylineGrid(width, height);

    // --- Title ---
    this.add.text(width / 2, height / 2 - 110, 'ProtoFusionGirl', {
      fontSize: '52px',
      color: '#00ffff',
      fontStyle: 'bold',
      fontFamily: 'monospace'
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
      fontSize: '28px',
      color: '#00ff88',
      backgroundColor: '#001a0d',
      padding: { x: 24, y: 12 },
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#003320', color: '#00ffaa' }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#001a0d', color: '#00ff88' }));
    btn.on('pointerdown', () => this.enterSimulation());

    this.input.keyboard?.on('keydown-ENTER', () => this.enterSimulation());

    // --- Footer ---
    const footerY = height - 28;
    const footerLeft = this.add.text(24, footerY,
      'PSINET // HOLO DECK v2032.1 // OPERATOR AUTHENTICATED', {
      fontSize: '11px',
      color: '#006666',
      fontFamily: 'monospace'
    }).setOrigin(0, 0.5);

    this.cursorText = this.add.text(
      footerLeft.x + footerLeft.width + 4, footerY, '\u258c', {
      fontSize: '11px',
      color: '#006666',
      fontFamily: 'monospace'
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
    g.lineStyle(1, 0x00ffff, 0.06);

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

    this.showConnectingOverlay(() => {
      this.scene.start('GameScene');
    });
  }

  private showConnectingOverlay(onComplete: () => void): void {
    const overlay = document.createElement('div');
    overlay.id = 'pfg-connect-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: #080810;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      font-family: monospace;
      color: #00ffcc;
      opacity: 0;
      transition: opacity 120ms ease-in;
    `;

    // Auth lines — appear sequentially before the progress bar
    const authLines: { text: string; color: string; dim?: boolean }[] = [
      { text: 'PSINET HANDSHAKE INITIATED...', color: '#00ffcc' },
      { text: '\u00a0', color: '#00ffcc' }, // spacer
      { text: 'OPERATOR CLEARANCE: ASI-7 \u2502 ARCHANGEL AGENCY', color: '#00ccaa' },
      { text: 'TIMELINE DESIGNATION: ALPHA-PRIMARY', color: '#00ccaa' },
      { text: 'SIMULATION: HOLO DECK ALPHA-7', color: '#00ccaa' },
      { text: 'SUBJECT: JANE THO\u02beRA  [ PSIOPS RECRUIT \u2014 CONNECTION UNDETECTED ]', color: '#00ccaa' },
      { text: '\u00a0', color: '#00ffcc' }, // spacer
      { text: 'LEYLINE NETWORK STATUS: DEGRADED', color: '#ff8800' },
      { text: 'NEFARIUM ACTIVITY: DETECTED', color: '#ff4444' },
      { text: 'WARNING: DEFAULT TIMELINE PROJECTION \u2014 CRITICAL', color: '#ff4444' },
      { text: '\u00a0', color: '#00ffcc' }, // spacer
      { text: 'ESTABLISHING COVERT OBSERVATION LINK...', color: '#00ffcc' },
    ];

    const linesContainer = document.createElement('div');
    linesContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 22px;
      min-width: 520px;
    `;

    const lineEls: HTMLDivElement[] = authLines.map(({ text, color }) => {
      const el = document.createElement('div');
      el.style.cssText = `font-size: 13px; letter-spacing: 1.5px; color: ${color}; opacity: 0; transition: opacity 80ms ease-in;`;
      el.textContent = text;
      linesContainer.appendChild(el);
      return el;
    });

    const barWrap = document.createElement('div');
    barWrap.style.cssText = 'font-size: 15px; letter-spacing: 1px; margin-bottom: 14px; opacity: 0; transition: opacity 80ms ease-in;';
    barWrap.textContent = '\u2591'.repeat(20) + '  0%';

    const statusLine = document.createElement('div');
    statusLine.style.cssText = 'font-size: 15px; color: #004444; letter-spacing: 2px;';
    statusLine.textContent = 'CONNECTION ESTABLISHED';

    overlay.appendChild(linesContainer);
    overlay.appendChild(barWrap);
    overlay.appendChild(statusLine);
    document.body.appendChild(overlay);

    // Fade overlay in
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });

    // Stagger each auth line appearing
    const LINE_STAGGER = 120; // ms between each line
    lineEls.forEach((el, i) => {
      setTimeout(() => { el.style.opacity = '1'; }, 80 + i * LINE_STAGGER);
    });

    // After all lines shown, animate progress bar
    const allLinesMs = 80 + authLines.length * LINE_STAGGER;
    setTimeout(() => {
      barWrap.style.opacity = '1';

      let pct = 0;
      const filled = '\u2593';
      const empty = '\u2591';
      const total = 20;

      const interval = setInterval(() => {
        pct = Math.min(pct + 5, 100);
        const done = Math.round((pct / 100) * total);
        barWrap.textContent = filled.repeat(done) + empty.repeat(total - done) + `  ${pct}%`;

        if (pct >= 100) {
          clearInterval(interval);
          statusLine.style.color = '#00ffcc';
          setTimeout(() => {
            overlay.style.transition = 'opacity 300ms ease-out';
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.remove(); onComplete(); }, 320);
          }, 320);
        }
      }, 38);
    }, allLinesMs);
  }
}
