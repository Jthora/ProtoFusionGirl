// ULPuzzleController.ts
// Bridges ULPuzzleOverlay (WASM puzzle UI) with game-world targets.
// Handles repair puzzle (5131-5133), rift seal puzzle (5141-5143),
// and 3-component expanded puzzles (7211-7213): communication, navigation, combat.

import Phaser from 'phaser';
import { ULPuzzleOverlay } from './ULPuzzleOverlay';
import { ulEventBus } from './ulEventBus';
import type { Gir, Grade } from './ulForgeTypes';

// ── 3-Component GIR Architecture (P5) ──
// Each puzzle GIR uses exactly 3 nodes: base + modifier + harmonic.
// base: the core subject or entity
// modifier: the action or transformation
// harmonic: the contextual binding that unifies base+modifier

// ── Target GIR definitions ──

/**
 * REPAIR_TARGET_GIR — Σ_UL expression for "mend entity through process"
 * Formal: modify_entity(curve, point) wrapped in enclosure of restored wholeness
 * Primitives: Point (entity to repair) → Curve (mending process) → Enclosure (wholeness)
 * Task 5131
 */
export const REPAIR_TARGET_GIR: Gir = {
  ul_gir: '1.0',
  root: 'n1',
  nodes: [
    { id: 'n1', type: 'point',     sort: 'entity',    label: 'target' },
    { id: 'n2', type: 'curve',     sort: 'relation',  label: 'mend' },
    { id: 'n3', type: 'enclosure', sort: 'assertion', label: 'restored' },
  ],
  edges: [
    { source: 'n1', target: 'n2', type: 'modified_by' },
    { source: 'n2', target: 'n3', type: 'contains' },
  ],
};

/**
 * RIFT_SEAL_TARGET_GIR — Σ_UL expression for "banish through directed negation"
 * Formal: negate(predicate(angle, line, point)) — directed force sealing the rift
 * Primitives: Angle (directed force) → Line (banishment direction) → Point (rift location)
 * Task 5141
 */
export const RIFT_SEAL_TARGET_GIR: Gir = {
  ul_gir: '1.0',
  root: 'n1',
  nodes: [
    { id: 'n1', type: 'angle',  sort: 'modifier',  label: 'force' },
    { id: 'n2', type: 'line',   sort: 'relation',  label: 'banish' },
    { id: 'n3', type: 'point',  sort: 'entity',    label: 'rift' },
  ],
  edges: [
    { source: 'n1', target: 'n2', type: 'connects' },
    { source: 'n2', target: 'n3', type: 'connects' },
  ],
};

// ── P5 Expanded 3-Component Puzzles (7211-7213) ──

/**
 * COMMUNICATION_TARGET_GIR — "establish understanding through shared symbols"
 * 3-component: base (entity to communicate with) + modifier (message) + harmonic (shared context)
 * Task 7211/7212
 */
export const COMMUNICATION_TARGET_GIR: Gir = {
  ul_gir: '1.0',
  root: 'n1',
  nodes: [
    { id: 'n1', type: 'point',     sort: 'entity',    label: 'speaker' },     // base
    { id: 'n2', type: 'curve',     sort: 'relation',  label: 'message' },     // modifier
    { id: 'n3', type: 'enclosure', sort: 'assertion', label: 'understanding' }, // harmonic
  ],
  edges: [
    { source: 'n1', target: 'n2', type: 'modified_by' },
    { source: 'n2', target: 'n3', type: 'contains' },
  ],
};

/**
 * NAVIGATION_TARGET_GIR — "find path through charted waypoints"
 * 3-component: base (origin) + modifier (traversal) + harmonic (destination binding)
 * Task 7211/7212
 */
export const NAVIGATION_TARGET_GIR: Gir = {
  ul_gir: '1.0',
  root: 'n1',
  nodes: [
    { id: 'n1', type: 'point', sort: 'entity',   label: 'origin' },      // base
    { id: 'n2', type: 'line',  sort: 'relation',  label: 'traverse' },    // modifier
    { id: 'n3', type: 'angle', sort: 'modifier',  label: 'destination' }, // harmonic
  ],
  edges: [
    { source: 'n1', target: 'n2', type: 'connects' },
    { source: 'n2', target: 'n3', type: 'connects' },
  ],
};

/**
 * COMBAT_TARGET_GIR — "neutralize threat through coordinated strike"
 * 3-component: base (threat) + modifier (strike action) + harmonic (coordination)
 * Task 7211/7212
 */
export const COMBAT_TARGET_GIR: Gir = {
  ul_gir: '1.0',
  root: 'n1',
  nodes: [
    { id: 'n1', type: 'angle',     sort: 'modifier',  label: 'threat' },     // base
    { id: 'n2', type: 'line',      sort: 'relation',  label: 'strike' },     // modifier
    { id: 'n3', type: 'enclosure', sort: 'assertion', label: 'neutralize' }, // harmonic
  ],
  edges: [
    { source: 'n1', target: 'n2', type: 'connects' },
    { source: 'n2', target: 'n3', type: 'contains' },
  ],
};

// ── Game effect types ──

export type GameEffect =
  | { type: 'repair_success'; targetId: string; grade: Grade }
  | { type: 'repair_confused'; targetId: string; score: number }
  | { type: 'repair_hostile'; targetId: string; score: number }
  | { type: 'rift_sealed'; targetId: string; stabilityGain: number }
  | { type: 'rift_seal_partial'; targetId: string; score: number }
  | { type: 'rift_seal_failed'; targetId: string; score: number }
  // P5 expanded
  | { type: 'communication_success'; targetId: string; grade: Grade }
  | { type: 'communication_partial'; targetId: string; score: number }
  | { type: 'communication_failed'; targetId: string; score: number }
  | { type: 'navigation_success'; targetId: string; grade: Grade }
  | { type: 'navigation_partial'; targetId: string; score: number }
  | { type: 'navigation_failed'; targetId: string; score: number }
  | { type: 'combat_success'; targetId: string; grade: Grade }
  | { type: 'combat_partial'; targetId: string; score: number }
  | { type: 'combat_failed'; targetId: string; score: number };

export type PuzzleType = 'damaged_robot' | 'rift' | 'communication' | 'navigation' | 'combat';

export interface PuzzleTargetInfo {
  id: string;
  type: PuzzleType;
  x: number;
  y: number;
  label?: string;
}

// ── Controller ──

export type RepairSuccessCallback = (targetId: string, grade: Grade, x: number, y: number) => void;

export class ULPuzzleController {
  private activeOverlay: ULPuzzleOverlay | null = null;
  private activeTarget: PuzzleTargetInfo | null = null;
  private onRepairSuccess: RepairSuccessCallback | null = null;

  /** Register a callback fired when a damaged_robot puzzle succeeds (task 5224) */
  setRepairSuccessCallback(cb: RepairSuccessCallback): void {
    this.onRepairSuccess = cb;
  }

  /**
   * Open a WASM puzzle overlay for a game-world target.
   * Returns the overlay instance (or null if one is already open).
   */
  openPuzzle(scene: Phaser.Scene, target: PuzzleTargetInfo): ULPuzzleOverlay | null {
    if (this.activeOverlay) return null;

    const targetGir = this.getTargetGir(target.type);
    const label = target.label ?? (target.type === 'damaged_robot' ? 'Repair Robot' : 'Seal Rift');

    this.activeTarget = target;
    this.activeOverlay = new ULPuzzleOverlay({
      scene,
      targetGir,
      targetLabel: label,
      onComplete: (result) => this.handleComplete(target, result),
      x: 40,
      y: 40,
    });

    ulEventBus.emit('ul:puzzle:started', {
      metadata: { targetId: target.id, targetType: target.type },
    });

    return this.activeOverlay;
  }

  /** Get the canonical target GIR for a puzzle type */
  getTargetGir(type: PuzzleType): Gir {
    switch (type) {
      case 'damaged_robot': return REPAIR_TARGET_GIR;
      case 'rift': return RIFT_SEAL_TARGET_GIR;
      case 'communication': return COMMUNICATION_TARGET_GIR;
      case 'navigation': return NAVIGATION_TARGET_GIR;
      case 'combat': return COMBAT_TARGET_GIR;
    }
  }

  /** Determine the game effect from the puzzle result (5132, 5133, 5142, 5143, 7211-7213) */
  resolveEffect(target: PuzzleTargetInfo, result: { success: boolean; score: number; grade: string }): GameEffect {
    if (target.type === 'damaged_robot') {
      return this.resolveRepairEffect(target.id, result);
    }
    if (target.type === 'rift') {
      return this.resolveRiftSealEffect(target.id, result);
    }
    // P5: 3-component expanded puzzles
    return this.resolveGenericEffect(target.id, target.type, result);
  }

  // ── Repair effects (5132, 5133) ──

  private resolveRepairEffect(targetId: string, result: { success: boolean; score: number; grade: string }): GameEffect {
    // 5132: exact or close → repair succeeds
    if (result.grade === 'exact' || result.grade === 'close') {
      return { type: 'repair_success', targetId, grade: result.grade as Grade };
    }
    // 5133: partial (40-80%) → confused response
    if (result.grade === 'partial') {
      return { type: 'repair_confused', targetId, score: result.score };
    }
    // 5133: unrelated (<40%) → hostile response
    return { type: 'repair_hostile', targetId, score: result.score };
  }

  // ── Rift seal effects (5142, 5143) ──

  private resolveRiftSealEffect(targetId: string, result: { success: boolean; score: number; grade: string }): GameEffect {
    // 5142: exact or close → rift sealed, 5143: stability recovery proportional to score
    if (result.grade === 'exact' || result.grade === 'close') {
      const stabilityGain = Math.round(result.score * 50); // up to 50 stability
      return { type: 'rift_sealed', targetId, stabilityGain };
    }
    // partial → partial seal (weakens rift but doesn't close it)
    if (result.grade === 'partial') {
      return { type: 'rift_seal_partial', targetId, score: result.score };
    }
    // unrelated → full failure
    return { type: 'rift_seal_failed', targetId, score: result.score };
  }

  // ── P5: Generic 3-component puzzle effects (7211-7213) ──

  private resolveGenericEffect(
    targetId: string,
    type: 'communication' | 'navigation' | 'combat',
    result: { success: boolean; score: number; grade: string },
  ): GameEffect {
    if (result.grade === 'exact' || result.grade === 'close') {
      return { type: `${type}_success` as GameEffect['type'], targetId, grade: result.grade as Grade } as GameEffect;
    }
    if (result.grade === 'partial') {
      return { type: `${type}_partial` as GameEffect['type'], targetId, score: result.score } as GameEffect;
    }
    return { type: `${type}_failed` as GameEffect['type'], targetId, score: result.score } as GameEffect;
  }

  // ── Complete handler ──

  private handleComplete(target: PuzzleTargetInfo, result: { success: boolean; score: number; grade: string }): void {
    const effect = this.resolveEffect(target, result);

    ulEventBus.emit('ul:puzzle:completed', {
      result: result.score,
      metadata: { targetId: target.id, targetType: target.type, effect: effect.type },
      stats: { score: result.score, grade: result.grade },
    });

    // Task 5224: Fire repair success callback for Terra activation
    if (effect.type === 'repair_success' && this.onRepairSuccess) {
      this.onRepairSuccess(target.id, effect.grade, target.x, target.y);
    }

    this.activeOverlay = null;
    this.activeTarget = null;
  }

  /** Close the active puzzle overlay without completing */
  cancel(): void {
    if (this.activeOverlay) {
      this.activeOverlay = null;
      this.activeTarget = null;
    }
  }

  isActive(): boolean {
    return this.activeOverlay !== null;
  }

  getActiveTarget(): PuzzleTargetInfo | null {
    return this.activeTarget;
  }
}
