// ULPuzzleOverlay.ts
// WASM-powered Universal Language puzzle overlay with 5-primitive palette,
// real-time validation, scoring, and hints.
// Implements tasks 5121-5125 from the progress tracker.

import Phaser from 'phaser';
import { getULEngine, type IULEngine } from './ulWasmAdapter';
import type { Gir, NodeType, Sort, ValidationResult, ScoreResult, Hint } from './ulForgeTypes';
import { ULGlyphRenderer } from './ULGlyphRenderer';
import { ulEventBus } from './ulEventBus';

export interface PuzzleOverlayConfig {
  scene: Phaser.Scene;
  targetGir: Gir;
  targetLabel?: string;
  onComplete: (result: { success: boolean; score: number; grade: string }) => void;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface PaletteEntry {
  symbol: string;
  nodeType: NodeType;
  sort: Sort;
  label: string;
}

const PALETTE: PaletteEntry[] = [
  { symbol: '●', nodeType: 'point',     sort: 'entity',    label: 'Point' },
  { symbol: '─', nodeType: 'line',      sort: 'relation',  label: 'Line' },
  { symbol: '∠', nodeType: 'angle',     sort: 'modifier',  label: 'Angle' },
  { symbol: '∼', nodeType: 'curve',     sort: 'relation',  label: 'Curve' },
  { symbol: '○', nodeType: 'enclosure', sort: 'assertion', label: 'Enclosure' },
];

const COLORS = {
  bg: 0x111122,
  border: 0x00ddaa,
  paletteNormal: '#00ffcc',
  paletteHover: '#ffffff',
  validOk: '#00ff88',
  validError: '#ff4444',
  validWarn: '#ffcc00',
  hint: '#88ccff',
  score: '#ffcc00',
  title: '#ffffff',
  closeBtn: '#ff4444',
};

export class ULPuzzleOverlay extends Phaser.GameObjects.Container {
  private engine: IULEngine;
  private glyphRenderer: ULGlyphRenderer;
  private composedNodes: { id: string; type: NodeType; sort: Sort; label: string }[] = [];
  private targetGir: Gir;
  private ctxId: number;
  private onComplete: PuzzleOverlayConfig['onComplete'];
  private panelWidth: number;
  private panelHeight: number;

  // UI elements
  private bg!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private paletteButtons: Phaser.GameObjects.Text[] = [];
  private compositionText!: Phaser.GameObjects.Text;
  private validationText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private deployBtn!: Phaser.GameObjects.Text;
  private clearBtn!: Phaser.GameObjects.Text;
  private closeBtn!: Phaser.GameObjects.Text;
  private undoBtn!: Phaser.GameObjects.Text;
  private hintBtn!: Phaser.GameObjects.Text;

  constructor(config: PuzzleOverlayConfig) {
    super(config.scene, config.x ?? 40, config.y ?? 40);
    this.engine = getULEngine();
    this.targetGir = config.targetGir;
    this.onComplete = config.onComplete;
    this.panelWidth = config.width ?? 420;
    this.panelHeight = config.height ?? 380;
    this.ctxId = this.engine.createContext();

    this.glyphRenderer = new ULGlyphRenderer(config.scene, 3002);

    this.createUI();
    this.updateValidation();
    this.setScrollFactor(0);
    this.setDepth(3001);
    config.scene.add.existing(this);

    ulEventBus.emit('ul:puzzle:started', { metadata: { targetGir: this.targetGir } });
  }

  private createUI(): void {
    const w = this.panelWidth;
    const h = this.panelHeight;

    // Background panel
    this.bg = this.scene.add.graphics();
    this.bg.fillStyle(COLORS.bg, 0.95);
    this.bg.fillRect(0, 0, w, h);
    this.bg.lineStyle(2, COLORS.border, 1);
    this.bg.strokeRect(0, 0, w, h);
    this.add(this.bg);

    // Title
    const label = 'UL Puzzle';
    this.titleText = this.scene.add.text(10, 8, label, {
      fontSize: '18px', color: COLORS.title, fontStyle: 'bold',
    });
    this.add(this.titleText);

    // Close button
    this.closeBtn = this.scene.add.text(w - 30, 8, '[X]', {
      fontSize: '16px', color: COLORS.closeBtn,
    }).setInteractive().on('pointerdown', () => this.close(false));
    this.add(this.closeBtn);

    // ── Palette row (5 primitives) ──
    const paletteY = 40;
    const btnSpacing = w / 5;
    for (let i = 0; i < PALETTE.length; i++) {
      const entry = PALETTE[i];
      const btn = this.scene.add.text(
        10 + i * btnSpacing, paletteY,
        `${entry.symbol}\n${entry.label}`,
        { fontSize: '20px', color: COLORS.paletteNormal, align: 'center' }
      ).setInteractive()
        .on('pointerdown', () => this.addPrimitive(entry))
        .on('pointerover', () => btn.setColor(COLORS.paletteHover))
        .on('pointerout', () => btn.setColor(COLORS.paletteNormal));
      this.add(btn);
      this.paletteButtons.push(btn);
    }

    // ── Composition display ──
    this.compositionText = this.scene.add.text(10, 95, 'Composition: (empty)', {
      fontSize: '14px', color: '#cccccc', wordWrap: { width: w - 20 },
    });
    this.add(this.compositionText);

    // ── Validation display (4-layer) ──
    this.validationText = this.scene.add.text(10, 135, '', {
      fontSize: '13px', color: COLORS.validOk, wordWrap: { width: w - 20 },
    });
    this.add(this.validationText);

    // ── Hint display ──
    this.hintText = this.scene.add.text(10, 200, '', {
      fontSize: '12px', color: COLORS.hint, wordWrap: { width: w - 20 },
    });
    this.add(this.hintText);

    // ── Score display ──
    this.scoreText = this.scene.add.text(10, 260, '', {
      fontSize: '14px', color: COLORS.score,
    });
    this.add(this.scoreText);

    // ── Action buttons ──
    const btnY = h - 40;
    this.deployBtn = this.scene.add.text(10, btnY, '[Deploy]', {
      fontSize: '16px', color: '#00ff88', backgroundColor: '#003322', padding: { x: 8, y: 4 },
    }).setInteractive().on('pointerdown', () => this.deploy());
    this.add(this.deployBtn);

    this.undoBtn = this.scene.add.text(110, btnY, '[Undo]', {
      fontSize: '14px', color: '#ffcc00',
    }).setInteractive().on('pointerdown', () => this.undo());
    this.add(this.undoBtn);

    this.clearBtn = this.scene.add.text(180, btnY, '[Clear]', {
      fontSize: '14px', color: '#ff8888',
    }).setInteractive().on('pointerdown', () => this.clearComposition());
    this.add(this.clearBtn);

    this.hintBtn = this.scene.add.text(260, btnY, '[Hint]', {
      fontSize: '14px', color: COLORS.hint,
    }).setInteractive().on('pointerdown', () => this.showHints());
    this.add(this.hintBtn);
  }

  // ── Palette interaction (5121) ──

  addPrimitive(entry: PaletteEntry): void {
    const id = `n${this.composedNodes.length + 1}`;
    this.composedNodes.push({ id, type: entry.nodeType, sort: entry.sort, label: entry.label });
    this.updateCompositionDisplay();
    this.updateValidation();
    this.renderGlyph();
    ulEventBus.emit('ul:puzzle:attempted', { stats: { nodes: this.composedNodes.length } });
  }

  // ── Composition management (5122) ──

  private buildComposedGir(): Gir {
    if (this.composedNodes.length === 0) {
      return {
        ul_gir: '1.0', root: 'n1',
        nodes: [{ id: 'n1', type: 'point' as NodeType, sort: 'entity' as Sort, label: 'empty' }],
        edges: [],
      };
    }
    const nodes = this.composedNodes.map(n => ({
      id: n.id, type: n.type, sort: n.sort, label: n.label,
    }));
    // Connect sequential nodes with 'connects' edges
    const edges = [];
    for (let i = 1; i < nodes.length; i++) {
      edges.push({ source: nodes[i - 1].id, target: nodes[i].id, type: 'connects' as const });
    }
    return { ul_gir: '1.0', root: nodes[0].id, nodes, edges };
  }

  composeWithOperation(operation: string): void {
    if (this.composedNodes.length < 2) return;
    const gir = this.buildComposedGir();
    const result = this.engine.applyOperation(operation as any, [gir]);
    // Replace composed nodes with result nodes
    this.composedNodes = result.nodes.map(n => ({
      id: n.id, type: n.type, sort: n.sort, label: n.label ?? n.type,
    }));
    this.updateCompositionDisplay();
    this.updateValidation();
    this.renderGlyph();
  }

  private undo(): void {
    this.composedNodes.pop();
    this.updateCompositionDisplay();
    this.updateValidation();
    this.renderGlyph();
  }

  private clearComposition(): void {
    this.composedNodes = [];
    this.updateCompositionDisplay();
    this.updateValidation();
    this.glyphRenderer.clear();
    this.scoreText.setText('');
    this.hintText.setText('');
  }

  private updateCompositionDisplay(): void {
    if (this.composedNodes.length === 0) {
      this.compositionText.setText('Composition: (empty)');
      return;
    }
    const symbols = this.composedNodes.map(n => {
      const pal = PALETTE.find(p => p.nodeType === n.type);
      return pal?.symbol ?? '?';
    });
    this.compositionText.setText(`Composition: ${symbols.join(' ')}`);
  }

  // ── Validation display (5123) ──

  updateValidation(): void {
    if (this.composedNodes.length === 0) {
      this.validationText.setText('Add primitives to begin.');
      this.validationText.setColor('#888888');
      return;
    }
    const gir = this.buildComposedGir();
    const result: ValidationResult = this.engine.validate(gir, true);

    const lines: string[] = [];
    const layers = result.layers;
    lines.push(`Schema: ${layers.schema.length === 0 ? '✓' : '✗ ' + layers.schema.join(', ')}`);
    lines.push(`Sort:   ${layers.sort.length === 0 ? '✓' : '✗ ' + layers.sort.join(', ')}`);
    lines.push(`Inv:    ${layers.invariant.length === 0 ? '✓' : '✗ ' + layers.invariant.join(', ')}`);
    lines.push(`Geom:   ${layers.geometry.length === 0 ? '✓' : '✗ ' + layers.geometry.join(', ')}`);

    if (result.warnings.length > 0) {
      lines.push(`⚠ ${result.warnings[0]}`);
    }

    this.validationText.setText(lines.join('\n'));
    this.validationText.setColor(result.valid ? COLORS.validOk : COLORS.validError);

    ulEventBus.emit('ul:puzzle:validated', {
      result: result.valid,
      errors: result.errors,
      metadata: { warnings: result.warnings },
    });
  }

  // ── Deploy + scoring (5124) ──

  deploy(): void {
    if (this.composedNodes.length === 0) return;
    const gir = this.buildComposedGir();
    const targetJson = JSON.stringify(this.targetGir);
    const scoreResult: ScoreResult = this.engine.scoreComposition(this.ctxId, gir, targetJson);

    const pc = scoreResult.partial_credit;
    this.scoreText.setText(
      `Score: ${(scoreResult.score * 100).toFixed(0)}% (${scoreResult.grade})\n` +
      `Structure: ${(pc.structural_match * 100).toFixed(0)}% | Sort: ${(pc.sort_correctness * 100).toFixed(0)}% | ` +
      `Op: ${(pc.operation_correctness * 100).toFixed(0)}% | Seq: ${(pc.sequence_order * 100).toFixed(0)}%`
    );
    this.scoreText.setColor(scoreResult.score >= 0.8 ? COLORS.validOk : scoreResult.score >= 0.4 ? COLORS.validWarn : COLORS.validError);

    const success = scoreResult.score >= 0.8;
    ulEventBus.emit(success ? 'ul:puzzle:completed' : 'ul:puzzle:attempted', {
      result: scoreResult.score,
      stats: {
        score: scoreResult.score,
        grade: scoreResult.grade,
        feedback: scoreResult.feedback,
      },
    });

    if (success) {
      this.scene.time.delayedCall(1200, () => {
        this.close(true, scoreResult);
      });
    }
  }

  // ── Hints system (5125) ──

  showHints(): void {
    if (this.composedNodes.length === 0) {
      this.hintText.setText('Add at least one primitive first.');
      return;
    }
    const gir = this.buildComposedGir();
    const hints: Hint[] = this.engine.getHints(gir, this.targetGir);

    if (hints.length === 0) {
      this.hintText.setText('No hints available.');
      return;
    }
    const text = hints.map(h => {
      const icon = h.severity === 'warning' ? '⚠' : h.severity === 'error' ? '✗' : 'ℹ';
      return `${icon} [${h.category}] ${h.message}`;
    }).join('\n');
    this.hintText.setText(text);
  }

  // ── Glyph visualization ──

  private renderGlyph(): void {
    if (this.composedNodes.length === 0) {
      this.glyphRenderer.clear();
      return;
    }
    const gir = this.buildComposedGir();
    const positioned = this.engine.layout(gir, this.panelWidth - 40, 80);
    this.glyphRenderer.render(positioned, {
      offsetX: (this.x as number) + 10,
      offsetY: (this.y as number) + 160,
    });
  }

  // ── Lifecycle ──

  private close(success: boolean, scoreResult?: ScoreResult): void {
    this.glyphRenderer.destroy();
    this.destroy();
    this.onComplete({
      success,
      score: scoreResult?.score ?? 0,
      grade: scoreResult?.grade ?? 'unrelated',
    });
  }

  // ── Public accessors for testing ──

  getComposedNodes() { return [...this.composedNodes]; }
  getComposedGir() { return this.buildComposedGir(); }
  getPaletteButtons() { return this.paletteButtons; }
  getValidationText() { return this.validationText; }
  getScoreText() { return this.scoreText; }
  getHintText() { return this.hintText; }
}
