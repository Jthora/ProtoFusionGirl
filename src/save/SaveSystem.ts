// SaveSystem.ts
// Handles persistence of Jane and Magneto Speeder state
// References: magneto_speeder_gameplay_foundation_2025-06-06.artifact

import { Jane } from '../core/Jane';

// ─── Session State (operator-level, cross-session) ──────────────────────────

const SESSION_KEY = 'pfg_session_v1';

export interface JaneSaveData {
  level: number;
  experience: number;
  maxHealth: number;
  maxPsi: number;
  skills: Record<string, number>;
  speederUpgrades?: Array<{ id: string; name: string; effect: string }>;
  speederMode?: string;
}

export interface SessionState {
  operatorId: string;
  visitCount: number;
  trustLevel: number;          // saved on win/session end
  bestTimelineScore: number;   // highest trust % on a win
  lastNodeStabilities: Record<string, number>;
  janeData?: JaneSaveData;     // Jane's progression stats (level, XP, skills)
}

export class SessionPersistence {
  static load(): SessionState | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as SessionState) : null;
    } catch {
      return null;
    }
  }

  static save(state: SessionState): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch {
      // localStorage unavailable (private mode, storage full, etc.) — silently ignore
    }
  }

  static update(patch: Partial<Omit<SessionState, 'operatorId'>>): SessionState {
    const existing = this.load();
    const operatorId = localStorage.getItem('pfg_operator_id') || Date.now().toString();
    const merged: SessionState = {
      operatorId,
      visitCount: (existing?.visitCount ?? 0) + (patch.visitCount !== undefined ? 0 : 0),
      trustLevel: patch.trustLevel ?? existing?.trustLevel ?? 50,
      bestTimelineScore: Math.max(patch.bestTimelineScore ?? 0, existing?.bestTimelineScore ?? 0),
      lastNodeStabilities: patch.lastNodeStabilities ?? existing?.lastNodeStabilities ?? {},
    };
    this.save(merged);
    return merged;
  }

  /** Call at game start to increment visit count. */
  static incrementVisit(): SessionState {
    const existing = this.load();
    const operatorId = localStorage.getItem('pfg_operator_id') || Date.now().toString();
    const state: SessionState = {
      operatorId,
      visitCount: (existing?.visitCount ?? 0) + 1,
      trustLevel: existing?.trustLevel ?? 50,
      bestTimelineScore: existing?.bestTimelineScore ?? 0,
      lastNodeStabilities: existing?.lastNodeStabilities ?? {},
    };
    this.save(state);
    return state;
  }
}

// ─── Jane progression helpers ────────────────────────────────────────────────

/** Extracts the saveable progression snapshot from a Jane entity. */
export function extractJaneSaveData(jane: Jane): JaneSaveData {
  const j = jane.toJSON();
  return {
    level: j.stats?.level ?? 1,
    experience: j.stats?.experience ?? 0,
    maxHealth: j.stats?.maxHealth ?? 100,
    maxPsi: j.stats?.maxPsi ?? 50,
    skills: j.stats?.skills ?? {},
    speederUpgrades: j.speeder?.upgrades ?? [],
    speederMode: j.speeder?.mode ?? 'hover',
  };
}

/** Applies saved progression data back to a live Jane entity. */
export function applyJaneSaveData(jane: Jane, data: JaneSaveData): void {
  jane.stats.level = data.level ?? 1;
  jane.stats.experience = data.experience ?? 0;
  jane.stats.maxHealth = data.maxHealth ?? 100;
  jane.stats.maxPsi = data.maxPsi ?? 50;
  jane.stats.skills = { ...(data.skills ?? {}) };
  // Restore health/psi to saved maxes (new session starts full)
  jane.stats.health = jane.stats.maxHealth;
  jane.stats.psi = jane.stats.maxPsi;
  if (jane.speeder && data.speederUpgrades) {
    jane.speeder.upgrades = [...data.speederUpgrades];
  }
}

// ─── Jane entity save/load ───────────────────────────────────────────────────

export class SaveSystem {
  /**
   * Serializes Jane and her speeder to JSON for saving.
   */
  static save(jane: Jane): string {
    return JSON.stringify(jane.toJSON());
  }

  /**
   * Loads Jane and her speeder from JSON.
   */
  static load(data: string, eventBus: any): Jane {
    const parsed = JSON.parse(data);
    return Jane.fromJSON(parsed, eventBus);
  }
}
