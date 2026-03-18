// ULMiscommunication.ts
// Handles failure consequences when Jane uses wrong UL symbols.
// See: progress-tracker tasks 7131-7133

import { EventBus } from '../core/EventBus';

export type MiscommunicationOutcome =
  | 'confusion'       // target confused, no action
  | 'aggression'      // target becomes hostile
  | 'flee'            // target flees
  | 'partial_success' // partial effect (wrong modifier, right base)
  | 'backfire';       // effect rebounds on Jane

export interface MiscommunicationResult {
  outcome: MiscommunicationOutcome;
  targetId: string;
  attemptedSymbol: string;
  description: string;
}

/** Table mapping target hostility + error severity → outcome */
const OUTCOME_TABLE: Record<string, MiscommunicationOutcome[]> = {
  hostile_major:  ['aggression', 'aggression', 'backfire'],
  hostile_minor:  ['aggression', 'confusion', 'flee'],
  neutral_major:  ['flee', 'confusion', 'aggression'],
  neutral_minor:  ['confusion', 'partial_success', 'confusion'],
  friendly_major: ['confusion', 'flee', 'partial_success'],
  friendly_minor: ['partial_success', 'confusion', 'partial_success'],
};

const DESCRIPTIONS: Record<MiscommunicationOutcome, string> = {
  confusion: 'The target is confused by the unfamiliar sequence.',
  aggression: 'The target interprets the symbol as a threat and becomes hostile!',
  flee: 'The target is startled and flees.',
  partial_success: 'The symbol partially resonates — a weaker effect occurs.',
  backfire: 'The energy rebounds — Jane takes minor feedback damage!',
};

export class ULMiscommunication {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Resolve a miscommunication event (task 7131-7132).
   * @param targetId The entity Jane tried to communicate with
   * @param attemptedSymbol The symbol Jane used incorrectly
   * @param targetDisposition 'hostile' | 'neutral' | 'friendly'
   * @param errorSeverity 'major' (wrong base) | 'minor' (wrong modifier)
   * @param rng Optional RNG for testing
   */
  resolve(
    targetId: string,
    attemptedSymbol: string,
    targetDisposition: 'hostile' | 'neutral' | 'friendly',
    errorSeverity: 'major' | 'minor',
    rng?: () => number,
  ): MiscommunicationResult {
    const key = `${targetDisposition}_${errorSeverity}`;
    const outcomes = OUTCOME_TABLE[key] ?? ['confusion'];
    const roll = (rng ?? Math.random)();
    const idx = Math.min(Math.floor(roll * outcomes.length), outcomes.length - 1);
    const outcome = outcomes[idx];

    const result: MiscommunicationResult = {
      outcome,
      targetId,
      attemptedSymbol,
      description: DESCRIPTIONS[outcome],
    };

    this.eventBus.emit({
      type: 'UL_MISCOMMUNICATION',
      data: result,
    });

    return result;
  }
}
