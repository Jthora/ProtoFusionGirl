// SaveSystem.ts
// Handles persistence of Jane and Magneto Speeder state
// References: magneto_speeder_gameplay_foundation_2025-06-06.artifact

import { Jane } from '../core/Jane';

// ─── Session State (operator-level, cross-session) ──────────────────────────

const SESSION_KEY = 'pfg_session_v2';

export interface JaneSaveData {
  level: number;
  experience: number;
  maxHealth: number;
  maxPsi: number;
  skills: Record<string, number>;
  speederUpgrades?: Array<{ id: string; name: string; effect: string }>;
  speederMode?: string;
}

export interface SessionStats {
  totalSessions: number;
  totalObservationMs: number;         // cumulative wall-clock time in-session
  timelinesCorreected: number;
  timelinesFailed: number;
  guidancePulsesDelivered: number;
  leyLinesRestored: number;
  nefariumNodesDisrupted: number;
  beuBondsFacilitated: number;
  coherenceCollapses: number;
  peakCoherenceObserved: number;      // 0–100
  timelineDeltaCumulative: number;
}

export interface SessionState {
  operatorId: string;
  callsign: string | null;            // null = not yet registered (first boot)
  registeredAt: number | null;        // epoch ms of callsign registration
  visitCount: number;
  lastSessionStart: number | null;    // epoch ms
  lastSessionEnd: number | null;      // epoch ms
  // Field state at last session end (for status diff)
  lastJaneCoherence: number;          // 0–100
  lastLeylineStability: number;       // 0–100
  lastNefariumActivity: 'none' | 'low' | 'elevated' | 'critical';
  lastTimelineDelta: number;
  lastAnchorDescription: string | null;
  trustLevel: number;                 // saved on win/session end
  bestTimelineScore: number;
  lastNodeStabilities: Record<string, number>;
  janeData?: JaneSaveData;
  stats: SessionStats;
}

export function defaultSessionStats(): SessionStats {
  return {
    totalSessions: 0,
    totalObservationMs: 0,
    timelinesCorreected: 0,
    timelinesFailed: 0,
    guidancePulsesDelivered: 0,
    leyLinesRestored: 0,
    nefariumNodesDisrupted: 0,
    beuBondsFacilitated: 0,
    coherenceCollapses: 0,
    peakCoherenceObserved: 0,
    timelineDeltaCumulative: 0,
  };
}

export function isFirstBoot(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return true;
    const state = JSON.parse(raw) as SessionState;
    return !state.callsign;
  } catch {
    return true;
  }
}

export class SessionPersistence {
  static load(): SessionState | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SessionState;
      // Backfill missing fields from older save versions
      if (!parsed.stats) parsed.stats = defaultSessionStats();
      if (parsed.callsign === undefined) parsed.callsign = null;
      if (parsed.registeredAt === undefined) parsed.registeredAt = null;
      if (parsed.lastSessionStart === undefined) parsed.lastSessionStart = null;
      if (parsed.lastSessionEnd === undefined) parsed.lastSessionEnd = null;
      if (parsed.lastJaneCoherence === undefined) parsed.lastJaneCoherence = 100;
      if (parsed.lastLeylineStability === undefined) parsed.lastLeylineStability = 72;
      if (parsed.lastNefariumActivity === undefined) parsed.lastNefariumActivity = 'none';
      if (parsed.lastTimelineDelta === undefined) parsed.lastTimelineDelta = 0;
      if (parsed.lastAnchorDescription === undefined) parsed.lastAnchorDescription = null;
      return parsed;
    } catch {
      return null;
    }
  }

  static save(state: SessionState): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch {
      // localStorage unavailable — silently ignore
    }
  }

  /** Register a callsign for the first time. */
  static registerCallsign(callsign: string): SessionState {
    const existing = this.load();
    const operatorId = existing?.operatorId ?? Date.now().toString();
    const state: SessionState = {
      ...(existing ?? {}),
      operatorId,
      callsign: callsign.trim().slice(0, 14),
      registeredAt: Date.now(),
      visitCount: 0,
      lastSessionStart: null,
      lastSessionEnd: null,
      lastJaneCoherence: 100,
      lastLeylineStability: 72,
      lastNefariumActivity: 'none',
      lastTimelineDelta: 0,
      lastAnchorDescription: null,
      trustLevel: existing?.trustLevel ?? 50,
      bestTimelineScore: existing?.bestTimelineScore ?? 0,
      lastNodeStabilities: existing?.lastNodeStabilities ?? {},
      stats: existing?.stats ?? defaultSessionStats(),
    };
    this.save(state);
    return state;
  }

  /** Call at session start — increments visit count and records start time. */
  static startSession(): SessionState {
    const existing = this.load();
    const operatorId = existing?.operatorId ?? Date.now().toString();
    const stats = existing?.stats ?? defaultSessionStats();
    const state: SessionState = {
      ...(existing ?? {}),
      operatorId,
      callsign: existing?.callsign ?? null,
      registeredAt: existing?.registeredAt ?? null,
      visitCount: (existing?.visitCount ?? 0) + 1,
      lastSessionStart: Date.now(),
      lastSessionEnd: existing?.lastSessionEnd ?? null,
      lastJaneCoherence: existing?.lastJaneCoherence ?? 100,
      lastLeylineStability: existing?.lastLeylineStability ?? 72,
      lastNefariumActivity: existing?.lastNefariumActivity ?? 'none',
      lastTimelineDelta: existing?.lastTimelineDelta ?? 0,
      lastAnchorDescription: existing?.lastAnchorDescription ?? null,
      trustLevel: existing?.trustLevel ?? 50,
      bestTimelineScore: existing?.bestTimelineScore ?? 0,
      lastNodeStabilities: existing?.lastNodeStabilities ?? {},
      stats: { ...stats, totalSessions: stats.totalSessions + 1 },
    };
    this.save(state);
    return state;
  }

  /** Call at session end — records end time and field state for next status diff. */
  static endSession(patch: {
    janeCoherence?: number;
    leylineStability?: number;
    nefariumActivity?: SessionState['lastNefariumActivity'];
    timelineDelta?: number;
    anchorDescription?: string;
    observationMs?: number;
  }): SessionState {
    const existing = this.load();
    if (!existing) return this.startSession();
    const stats = existing.stats ?? defaultSessionStats();
    const state: SessionState = {
      ...existing,
      lastSessionEnd: Date.now(),
      lastJaneCoherence: patch.janeCoherence ?? existing.lastJaneCoherence,
      lastLeylineStability: patch.leylineStability ?? existing.lastLeylineStability,
      lastNefariumActivity: patch.nefariumActivity ?? existing.lastNefariumActivity,
      lastTimelineDelta: patch.timelineDelta ?? existing.lastTimelineDelta,
      lastAnchorDescription: patch.anchorDescription ?? existing.lastAnchorDescription,
      stats: {
        ...stats,
        totalObservationMs: stats.totalObservationMs + (patch.observationMs ?? 0),
      },
    };
    this.save(state);
    return state;
  }

  static update(patch: Partial<Omit<SessionState, 'operatorId'>>): SessionState {
    const existing = this.load();
    const operatorId = existing?.operatorId ?? Date.now().toString();
    const merged: SessionState = {
      ...(existing ?? {}),
      operatorId,
      callsign: existing?.callsign ?? null,
      registeredAt: existing?.registeredAt ?? null,
      visitCount: existing?.visitCount ?? 0,
      lastSessionStart: existing?.lastSessionStart ?? null,
      lastSessionEnd: existing?.lastSessionEnd ?? null,
      lastJaneCoherence: existing?.lastJaneCoherence ?? 100,
      lastLeylineStability: existing?.lastLeylineStability ?? 72,
      lastNefariumActivity: existing?.lastNefariumActivity ?? 'none',
      lastTimelineDelta: existing?.lastTimelineDelta ?? 0,
      lastAnchorDescription: existing?.lastAnchorDescription ?? null,
      trustLevel: patch.trustLevel ?? existing?.trustLevel ?? 50,
      bestTimelineScore: Math.max(patch.bestTimelineScore ?? 0, existing?.bestTimelineScore ?? 0),
      lastNodeStabilities: patch.lastNodeStabilities ?? existing?.lastNodeStabilities ?? {},
      stats: existing?.stats ?? defaultSessionStats(),
      ...patch,
    };
    this.save(merged);
    return merged;
  }

  /**
   * Increment a single `SessionStats` counter by `amount` (default 1).
   * Cheap: load → patch stats → save. Safe to call per-event.
   */
  static incrementStat(key: keyof import('./SaveSystem').SessionStats, amount = 1): void {
    const existing = this.load();
    if (!existing) return;
    const stats = { ...(existing.stats ?? defaultSessionStats()) };
    (stats as any)[key] = ((stats as any)[key] ?? 0) + amount;
    this.save({ ...existing, stats });
  }

  /** Legacy — kept for backwards compat. Prefer startSession(). */
  static incrementVisit(): SessionState {
    return this.startSession();
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
