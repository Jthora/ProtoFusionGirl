// JonoHologram.ts
// Mentor hologram NPC at Tho'ra Base. Triggers contextual dialogue on arrival.
// See: progress-tracker tasks 6311-6314

import { EventBus } from '../core/EventBus';

export interface JonoDialogueLine {
  id: string;
  context: string; // trigger condition
  text: string;
  priority: number; // higher = shown first
}

const MENTOR_DIALOGUES: JonoDialogueLine[] = [
  { id: 'ley_intro', context: 'first_visit', text: "The ley lines are the nervous system of this world. Keep them stable, and everything else follows.", priority: 9 },
  { id: 'ul_hint', context: 'no_ul_used', text: "The Universal Language isn't magic — it's geometry. Start with Point and Line. The rest follows.", priority: 8 },
  { id: 'terra_hint', context: 'no_companion', text: "There are damaged robots out there. If Jane can speak their language, they'll stop being a problem and start being an asset.", priority: 7 },
  { id: 'rift_warning', context: 'rift_active', text: "A rift is opening. The UL sequence is Angle, then Line, then Point — in that order. It matters.", priority: 9 },
  { id: 'encourage', context: 'low_stability', text: "The network is bleeding. The compromised nodes need attention before this cascades.", priority: 6 },
  { id: 'cosmic_fire', context: 'phase_Fire', text: "Fire phase. The ley lines are running hot — the Nefarium will push harder during this window. Jane's output is also elevated. Use both.", priority: 4 },
  { id: 'cosmic_water', context: 'phase_Water', text: "Water phase. Nether signatures pull back during Water — the ley lines run clean. Best window for node restoration.", priority: 4 },
  { id: 'trust_reminder', context: 'low_trust', text: "The guidance channels are degrading. Heavy-handed interventions do that — the HoloDeck reads resistance and attenuates the signal. Ease off.", priority: 5 },
  { id: 'farewell', context: 'revisit', text: "You're getting better at this. The timeline is responding to your care.", priority: 3 },
];

export interface JonoHologramConfig {
  baseX: number;
  baseY: number;
  triggerRadius: number; // how close Jane must be to trigger
}

const DEFAULT_CONFIG: JonoHologramConfig = {
  baseX: 400,
  baseY: 300,
  triggerRadius: 150,
};

export class JonoHologram {
  private eventBus: EventBus;
  private config: JonoHologramConfig;
  private shownDialogueIds = new Set<string>();
  private lastDialogueTime = -Infinity;
  private cooldownMs = 10_000; // 10 seconds between dialogues
  private visitCount = 0;
  private currentDialogue: JonoDialogueLine | null = null;

  constructor(eventBus: EventBus, config?: Partial<JonoHologramConfig>) {
    this.eventBus = eventBus;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Check if Jane is near the hologram and trigger dialogue */
  checkProximity(janeX: number, janeY: number, gameTime: number, context: JonoContext): JonoDialogueLine | null {
    const dx = janeX - this.config.baseX;
    const dy = janeY - this.config.baseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.config.triggerRadius) return null;
    if (gameTime - this.lastDialogueTime < this.cooldownMs) return null;

    const line = this.selectDialogue(context);
    if (!line) return null;

    this.visitCount++;
    this.lastDialogueTime = gameTime;
    this.shownDialogueIds.add(line.id);
    this.currentDialogue = line;

    this.eventBus.emit({
      type: 'JONO_DIALOGUE_TRIGGERED',
      data: { dialogueId: line.id, text: line.text, context: line.context },
    });

    return line;
  }

  private selectDialogue(ctx: JonoContext): JonoDialogueLine | null {
    const candidates = MENTOR_DIALOGUES
      .filter(d => !this.shownDialogueIds.has(d.id) && this.matchesContext(d, ctx))
      .sort((a, b) => b.priority - a.priority);

    if (candidates.length > 0) return candidates[0];

    // If all shown, allow revisit dialogue
    if (this.visitCount > 0) {
      const revisit = MENTOR_DIALOGUES.find(d => d.context === 'revisit');
      if (revisit) {
        this.shownDialogueIds.delete(revisit.id); // allow re-show
        return revisit;
      }
    }
    return null;
  }

  private matchesContext(d: JonoDialogueLine, ctx: JonoContext): boolean {
    switch (d.context) {
      case 'first_visit': return this.visitCount === 0;
      case 'revisit': return this.visitCount > 0;
      case 'no_ul_used': return !ctx.hasUsedUL;
      case 'no_companion': return !ctx.hasCompanion;
      case 'rift_active': return ctx.activeRiftCount > 0;
      case 'low_stability': return ctx.lowestStability < 30;
      case 'low_trust': return ctx.trustLevel < 30;
      case 'phase_Fire': return ctx.cosmicPhase === 'Fire';
      case 'phase_Water': return ctx.cosmicPhase === 'Water';
      default: return true;
    }
  }

  getCurrentDialogue(): JonoDialogueLine | null {
    return this.currentDialogue;
  }

  getVisitCount(): number {
    return this.visitCount;
  }

  getShownCount(): number {
    return this.shownDialogueIds.size;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.config.baseX, y: this.config.baseY };
  }

  /**
   * Auto-fire first-contact sequence on scene load — does not require proximity.
   * Called by GameScene 2 seconds after create() completes.
   */
  triggerFirstContact(isFirstVisit: boolean, fromMainSite: boolean): void {
    this.eventBus.emit({
      type: 'JONO_FIRST_CONTACT',
      data: { isFirstVisit, fromMainSite },
    });
  }
}

export interface JonoContext {
  hasUsedUL: boolean;
  hasCompanion: boolean;
  activeRiftCount: number;
  lowestStability: number;
  trustLevel: number;
  cosmicPhase: string | null;
}
