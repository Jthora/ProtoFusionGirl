// ULPuzzleManager.ts
// Manages UL puzzle interactions: symbol palette, composition, deploy-to-target.
// Integrates with cosmicRules for element combinations and ulEngine for validation.
// See: progress-tracker tasks 5111-5134

import { EventBus } from '../core/EventBus';
import { getCombination } from './cosmicRules';
import { getSymbolEntry, ULSymbolIndexEntry } from './symbolIndex';
import { encodeULExpression } from './ulEngine';

export interface PuzzleTarget {
  id: string;
  type: string; // 'damaged_robot' | 'rift' | 'npc' | ...
  x: number;
  y: number;
  requiredSymbol?: string; // symbol name needed for success
}

export interface PuzzleRule {
  id: string;
  name: string;
  baseElement: string;   // e.g. 'Earth'
  modifierElement: string; // e.g. 'Water'
  resultSymbol: string;  // e.g. 'curve' (Earth+Water=Curve from cosmicRules)
  effect: string;        // e.g. 'repair', 'seal', 'diplomacy'
  description: string;
}

export interface PuzzleAttempt {
  targetId: string;
  symbolBase: string;
  symbolModifier: string;
  resultSymbol: string;
  success: boolean;
  effect?: string;
}

export class ULPuzzleManager {
  private eventBus: EventBus;
  private rules: Map<string, PuzzleRule> = new Map();
  private targets: Map<string, PuzzleTarget> = new Map();
  private activeTarget: PuzzleTarget | null = null;
  private isOpen: boolean = false;
  private _guidedSymbol: string | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /** Register a puzzle rule (e.g. Earth+Water = Repair) */
  registerRule(rule: PuzzleRule): void {
    this.rules.set(rule.id, rule);
  }

  /** Register a puzzle target (e.g. a damaged robot at a location) */
  registerTarget(target: PuzzleTarget): void {
    this.targets.set(target.id, target);
  }

  removeTarget(targetId: string): void {
    this.targets.delete(targetId);
    if (this.activeTarget?.id === targetId) {
      this.activeTarget = null;
      this.isOpen = false;
    }
  }

  getTarget(targetId: string): PuzzleTarget | undefined {
    return this.targets.get(targetId);
  }

  /** Open the puzzle palette for a specific target */
  openPuzzle(targetId: string): boolean {
    const target = this.targets.get(targetId);
    if (!target) return false;
    this.activeTarget = target;
    this.isOpen = true;
    this.eventBus.emit({
      type: 'UL_PUZZLE_OPENED',
      data: { targetId: target.id, targetType: target.type, x: target.x, y: target.y }
    });
    return true;
  }

  /** Select a base+modifier symbol pair */
  selectSymbols(baseSymbol: string, modifierSymbol: string): { resultSymbol: string | undefined; baseEntry: ULSymbolIndexEntry | undefined; modEntry: ULSymbolIndexEntry | undefined } {
    const baseEntry = getSymbolEntry(baseSymbol);
    const modEntry = getSymbolEntry(modifierSymbol);
    if (!baseEntry || !modEntry) return { resultSymbol: undefined, baseEntry, modEntry };

    const resultSymbol = getCombination(baseEntry.element, modEntry.element);
    this.eventBus.emit({
      type: 'UL_PUZZLE_SYMBOL_SELECTED',
      data: { symbolBase: baseSymbol, symbolModifier: modifierSymbol }
    });
    return { resultSymbol: resultSymbol?.toLowerCase(), baseEntry, modEntry };
  }

  /** Deploy the composed symbol to the active target */
  deploy(baseSymbol: string, modifierSymbol: string): PuzzleAttempt | null {
    if (!this.activeTarget || !this.isOpen) return null;

    const { resultSymbol, baseEntry, modEntry } = this.selectSymbols(baseSymbol, modifierSymbol);
    if (!resultSymbol || !baseEntry || !modEntry) {
      const attempt: PuzzleAttempt = {
        targetId: this.activeTarget.id,
        symbolBase: baseSymbol,
        symbolModifier: modifierSymbol,
        resultSymbol: 'none',
        success: false,
      };
      this.eventBus.emit({
        type: 'UL_PUZZLE_FAILURE',
        data: { targetId: this.activeTarget.id, attempted: `${baseSymbol}+${modifierSymbol}`, reason: 'invalid_combination' }
      });
      return attempt;
    }

    this.eventBus.emit({
      type: 'UL_PUZZLE_DEPLOYED',
      data: { targetId: this.activeTarget.id, symbolBase: baseSymbol, symbolModifier: modifierSymbol, resultSymbol }
    });

    // Check if any rule matches
    const matchingRule = this.findMatchingRule(baseEntry.element, modEntry.element, resultSymbol);
    const targetRequires = this.activeTarget.requiredSymbol;
    const success = matchingRule !== undefined && (targetRequires === undefined || targetRequires === resultSymbol);

    const attempt: PuzzleAttempt = {
      targetId: this.activeTarget.id,
      symbolBase: baseSymbol,
      symbolModifier: modifierSymbol,
      resultSymbol,
      success,
      effect: matchingRule?.effect,
    };

    if (success && matchingRule) {
      this.eventBus.emit({
        type: 'UL_PUZZLE_SUCCESS',
        data: { targetId: this.activeTarget.id, effect: matchingRule.effect, resultSymbol }
      });
    } else {
      this.eventBus.emit({
        type: 'UL_PUZZLE_FAILURE',
        data: { targetId: this.activeTarget.id, attempted: resultSymbol, reason: targetRequires ? 'wrong_symbol' : 'no_matching_rule' }
      });
    }

    this.isOpen = false;
    this.activeTarget = null;
    return attempt;
  }

  /** Find a puzzle rule that matches the given base+modifier elements and result */
  private findMatchingRule(baseElement: string, modifierElement: string, resultSymbol: string): PuzzleRule | undefined {
    for (const rule of this.rules.values()) {
      if (
        ((rule.baseElement === baseElement && rule.modifierElement === modifierElement) ||
         (rule.baseElement === modifierElement && rule.modifierElement === baseElement)) &&
        rule.resultSymbol === resultSymbol
      ) {
        return rule;
      }
    }
    return undefined;
  }

  /** Enable guided mode for the first UL puzzle — single base symbol, no modifier. */
  setGuidedMode(symbolKey: string): void {
    this._guidedSymbol = symbolKey;
  }

  getGuidedSymbol(): string | null {
    return this._guidedSymbol;
  }

  /**
   * Single-symbol deploy for the guided first puzzle.
   * Returns true on success, false on wrong symbol (puzzle stays open), null if no active puzzle.
   */
  deployGuided(baseSymbol: string): boolean | null {
    if (!this.activeTarget || !this.isOpen) return null;
    const targetId = this.activeTarget.id;

    this.eventBus.emit({
      type: 'UL_PUZZLE_DEPLOYED',
      data: { targetId, symbolBase: baseSymbol, symbolModifier: 'none', resultSymbol: baseSymbol }
    });

    if (baseSymbol === this._guidedSymbol) {
      this.eventBus.emit({
        type: 'UL_PUZZLE_SUCCESS',
        data: { targetId, effect: 'repair', resultSymbol: baseSymbol }
      });
      this.isOpen = false;
      this.activeTarget = null;
      this._guidedSymbol = null;
      return true;
    } else {
      // Wrong symbol — gentle bounce, puzzle stays open
      this.eventBus.emit({
        type: 'UL_GUIDED_BOUNCE',
        data: { targetId, attempted: baseSymbol }
      });
      return false;
    }
  }

  isActive(): boolean {
    return this.isOpen;
  }

  getActiveTarget(): PuzzleTarget | null {
    return this.activeTarget;
  }

  getRules(): PuzzleRule[] {
    return Array.from(this.rules.values());
  }

  destroy(): void {
    this.rules.clear();
    this.targets.clear();
    this.activeTarget = null;
    this.isOpen = false;
  }
}
