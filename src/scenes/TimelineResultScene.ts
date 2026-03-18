// TimelineResultScene.ts
// Win / lose result screen shown when the timeline is secured or collapses.

import Phaser from 'phaser';

export interface TimelineResultData {
  outcome: 'secured' | 'collapsed';
  trustPercent: number;
  nodesSaved: number;
  totalNodes: number;
  elapsedSeconds: number;
}

export class TimelineResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TimelineResultScene' });
  }

  create(data: TimelineResultData): void {
    const { outcome, trustPercent, nodesSaved, totalNodes, elapsedSeconds } = data;

    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;

    const isWin = outcome === 'secured';
    const accent = isWin ? 0x00ffcc : 0xff00cc;
    const accentHex = isWin ? '#00ffcc' : '#ff00cc';

    // Background — pure black with subtle vignette via two rects
    this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0, 0);
    this.add.rectangle(cx, cy, W, H, isWin ? 0x001a11 : 0x1a0011, 0.4).setOrigin(0.5);

    // Top accent line
    const topLine = this.add.graphics();
    topLine.lineStyle(2, accent, 0.7);
    topLine.lineBetween(cx - 200, cy - 148, cx + 200, cy - 148);

    // Title
    this.add.text(cx, cy - 118, isWin ? 'TIMELINE SECURED' : 'TIMELINE COLLAPSED', {
      fontSize: '36px', fontFamily: 'monospace',
      color: accentHex, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    // Subtitle
    this.add.text(cx, cy - 82, isWin ? '— Operator performance logged —' : '— Timeline integrity: ZERO —', {
      fontSize: '12px', fontFamily: 'monospace',
      color: isWin ? '#447766' : '#774455',
    }).setOrigin(0.5).setDepth(100);

    // Divider
    const divGfx = this.add.graphics().setDepth(100);
    divGfx.lineStyle(1, accent, 0.35);
    divGfx.lineBetween(cx - 180, cy - 62, cx + 180, cy - 62);

    // Stats rows
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = Math.floor(elapsedSeconds % 60).toString().padStart(2, '0');
    const trustTrend = trustPercent >= 70 ? ' ▲' : trustPercent >= 40 ? '' : ' ▼';
    const statsRows: Array<[string, string]> = [
      ['Trust Rating:',   `${Math.round(trustPercent)}%${trustTrend}`],
      ['Nodes Saved:',    `${nodesSaved}/${totalNodes}`],
      ['Timeline Intact:', isWin ? 'YES' : 'NO'],
      ['Session Time:',   `${mins}:${secs}`],
    ];

    statsRows.forEach(([label, value], i) => {
      const y = cy - 38 + i * 28;
      // Label (dimmer, right-aligned to centre)
      this.add.text(cx - 16, y, label, {
        fontSize: '14px', fontFamily: 'monospace', color: '#5588aa',
      }).setOrigin(1, 0.5).setDepth(100);
      // Value (bright, left-aligned from centre)
      this.add.text(cx, y, value, {
        fontSize: '14px', fontFamily: 'monospace',
        color: accentHex, fontStyle: 'bold',
      }).setOrigin(0, 0.5).setDepth(100);
    });

    // Second divider
    divGfx.lineBetween(cx - 180, cy + 74, cx + 180, cy + 74);

    // Jono reflection / collapse consequence
    let lowerY = cy + 86;

    const jonoWinLines = [
      '"Another timeline preserved.\nThere are 47 others that weren\'t."',
      '"Jane never knew you were there.\nThat\'s exactly how it should work."',
      '"The Tho\'ra lineage holds.\nFor now."',
    ];
    const reflection = isWin
      ? jonoWinLines[Math.floor((trustPercent / 100) * (jonoWinLines.length - 0.01))]
      : 'In the timeline that followed:\nforced roboticization began within six months.\nThe ley line network went dark.';

    this.add.text(cx, lowerY, reflection, {
      fontSize: '12px', fontFamily: 'monospace',
      color: isWin ? '#7bbcaa' : '#cc4466',
      wordWrap: { width: 380 }, align: 'center',
    }).setOrigin(0.5, 0).setDepth(100);

    lowerY += isWin ? 52 : 64;

    // Action button
    const btnLabel = isWin ? '[ RECONNECT AS OPERATOR ]' : '[ INITIATE REWIND ]';
    const btn = this.add.text(cx, lowerY, btnLabel, {
      fontSize: '16px', fontFamily: 'monospace',
      color: '#000022',
      backgroundColor: accentHex,
      padding: { x: 22, y: 10 },
    }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setAlpha(0.85));
    btn.on('pointerout',  () => btn.setAlpha(1));
    btn.on('pointerdown', () => {
      if (!isWin) this.registry.set('pfg_rewind_requested', true);
      this.scene.start('GameScene');
    });

    // Footer note (lose only)
    if (!isWin) {
      this.add.text(cx, lowerY + 46, "Tho'ra temporal recovery protocol — Jono built this for you.", {
        fontSize: '10px', fontFamily: 'monospace', color: '#5555aa',
      }).setOrigin(0.5, 0).setDepth(100);
    }

    // Bottom accent line
    topLine.lineBetween(cx - 200, cy + H * 0.38, cx + 200, cy + H * 0.38);

    // Fade in
    this.cameras.main.setAlpha(0);
    this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 900, ease: 'Power2' });
  }
}
