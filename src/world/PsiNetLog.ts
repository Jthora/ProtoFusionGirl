// PsiNetLog.ts
// Logs all ASI actions for the PsiNet behavior record.
// See: progress-tracker tasks 7421-7422

import { EventBus } from '../core/EventBus';

export interface PsiNetEntry {
  timestamp: number;
  action: string;
  category: 'guidance' | 'intervention' | 'observation' | 'negligence';
  details: Record<string, unknown>;
}

export class PsiNetLog {
  private eventBus: EventBus;
  private entries: PsiNetEntry[] = [];
  private gameTime = 0;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /** Record an ASI action */
  log(action: string, category: PsiNetEntry['category'], details: Record<string, unknown> = {}): void {
    const entry: PsiNetEntry = {
      timestamp: this.gameTime,
      action,
      category,
      details,
    };
    this.entries.push(entry);
    this.eventBus.emit({
      type: 'PSINET_ACTION_LOGGED',
      data: entry,
    });
  }

  /** Advance game time */
  update(dtMs: number): void {
    this.gameTime += dtMs;
  }

  getAll(): readonly PsiNetEntry[] {
    return this.entries;
  }

  getByCategory(category: PsiNetEntry['category']): PsiNetEntry[] {
    return this.entries.filter(e => e.category === category);
  }

  getRecent(count: number): PsiNetEntry[] {
    return this.entries.slice(-count);
  }

  /** Get negligence count (used for PsiNet reputation) */
  getNegligenceCount(): number {
    return this.entries.filter(e => e.category === 'negligence').length;
  }

  getLength(): number {
    return this.entries.length;
  }
}
