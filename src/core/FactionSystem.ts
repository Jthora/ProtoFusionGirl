// FactionSystem.ts
// Handles faction and reputation logic with threshold events.
// 3 canonical factions: Tho'ra, Earth Alliance, PsiSys
// See: progress-tracker tasks 5331-5334

import { EventBus } from './EventBus';

export interface FactionDef {
  id: string;
  name: string;
  description: string;
  defaultRep: number;
  thresholds: { name: string; value: number }[];
}

export const FACTIONS: FactionDef[] = [
  {
    id: 'thora',
    name: "Tho'ra",
    description: 'Ancient protectors of the ley network. Value wisdom and balance.',
    defaultRep: 0,
    thresholds: [
      { name: 'hostile', value: -50 },
      { name: 'wary', value: -20 },
      { name: 'neutral', value: 0 },
      { name: 'friendly', value: 30 },
      { name: 'allied', value: 60 },
      { name: 'champion', value: 90 },
    ],
  },
  {
    id: 'earth_alliance',
    name: 'Earth Alliance',
    description: 'Human coalition defending against dimensional threats.',
    defaultRep: 10,
    thresholds: [
      { name: 'hostile', value: -50 },
      { name: 'wary', value: -20 },
      { name: 'neutral', value: 0 },
      { name: 'friendly', value: 30 },
      { name: 'allied', value: 60 },
      { name: 'champion', value: 90 },
    ],
  },
  {
    id: 'psisys',
    name: 'PsiSys',
    description: 'AI collective managing psionic infrastructure. Logic-driven.',
    defaultRep: 5,
    thresholds: [
      { name: 'hostile', value: -50 },
      { name: 'wary', value: -20 },
      { name: 'neutral', value: 0 },
      { name: 'friendly', value: 30 },
      { name: 'allied', value: 60 },
      { name: 'champion', value: 90 },
    ],
  },
];

export class FactionSystem {
  private eventBus: EventBus;
  private reputations: Map<string, number> = new Map();
  private factions: Map<string, FactionDef> = new Map();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    for (const f of FACTIONS) {
      this.factions.set(f.id, f);
      this.reputations.set(f.id, f.defaultRep);
    }
  }

  /** Get current reputation for a faction */
  getReputation(factionId: string): number {
    return this.reputations.get(factionId) ?? 0;
  }

  /** Get current threshold name for a faction */
  getThresholdName(factionId: string): string {
    const rep = this.getReputation(factionId);
    const faction = this.factions.get(factionId);
    if (!faction) return 'unknown';
    // Walk thresholds descending; return first where rep >= value
    const sorted = [...faction.thresholds].sort((a, b) => b.value - a.value);
    for (const t of sorted) {
      if (rep >= t.value) return t.name;
    }
    // Below all thresholds — return the lowest
    return sorted.length > 0 ? sorted[sorted.length - 1].name : 'neutral';
  }

  /** Adjust reputation and emit events, including threshold crossing */
  adjustReputation(factionId: string, delta: number, reason: string): void {
    const prev = this.getReputation(factionId);
    const newRep = prev + delta;
    this.reputations.set(factionId, newRep);

    this.eventBus.emit({
      type: 'FACTION_REPUTATION_ADJUSTED',
      data: { factionId, previousRep: prev, newRep, reason }
    });

    // Check threshold crossings
    const faction = this.factions.get(factionId);
    if (faction) {
      for (const t of faction.thresholds) {
        const crossedUp = prev < t.value && newRep >= t.value;
        const crossedDown = prev >= t.value && newRep < t.value;
        if (crossedUp || crossedDown) {
          this.eventBus.emit({
            type: 'FACTION_THRESHOLD_REACHED',
            data: { factionId, threshold: t.name, reputation: newRep }
          });
        }
      }
    }
  }

  getFactionDef(factionId: string): FactionDef | undefined {
    return this.factions.get(factionId);
  }

  getAllFactions(): FactionDef[] {
    return Array.from(this.factions.values());
  }

  destroy(): void {
    this.reputations.clear();
    this.factions.clear();
  }
}
