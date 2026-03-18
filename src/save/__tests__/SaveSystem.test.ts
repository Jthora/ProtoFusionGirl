// SaveSystem.test.ts
// Unit tests for SessionPersistence (operator cross-session state).
// localStorage is provided by jsdom and cleared before each test by jest.setup.js.

import { SessionPersistence, SessionState } from '../SaveSystem';

// ─── SessionPersistence.load ──────────────────────────────────────────────────

describe('SessionPersistence.load', () => {
  it('returns null when localStorage is empty', () => {
    expect(SessionPersistence.load()).toBeNull();
  });

  it('parses and returns a stored session', () => {
    const state: SessionState = {
      operatorId: 'op_1',
      visitCount: 3,
      trustLevel: 72,
      bestTimelineScore: 80,
      lastNodeStabilities: { node_1: 65 },
    };
    localStorage.setItem('pfg_session_v1', JSON.stringify(state));
    const loaded = SessionPersistence.load();
    expect(loaded).toEqual(state);
  });

  it('returns null when stored JSON is corrupted', () => {
    localStorage.setItem('pfg_session_v1', '{ not valid json ');
    expect(SessionPersistence.load()).toBeNull();
  });

  it('returns null for an empty string value', () => {
    localStorage.setItem('pfg_session_v1', '');
    expect(SessionPersistence.load()).toBeNull();
  });
});

// ─── SessionPersistence.save ──────────────────────────────────────────────────

describe('SessionPersistence.save', () => {
  it('writes a session to localStorage', () => {
    const state: SessionState = {
      operatorId: 'op_2',
      visitCount: 1,
      trustLevel: 50,
      bestTimelineScore: 50,
      lastNodeStabilities: {},
    };
    SessionPersistence.save(state);
    const raw = localStorage.getItem('pfg_session_v1');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual(state);
  });

  it('overwrites an existing session', () => {
    SessionPersistence.save({ operatorId: 'a', visitCount: 1, trustLevel: 30, bestTimelineScore: 30, lastNodeStabilities: {} });
    SessionPersistence.save({ operatorId: 'a', visitCount: 2, trustLevel: 60, bestTimelineScore: 60, lastNodeStabilities: {} });
    expect(SessionPersistence.load()?.visitCount).toBe(2);
  });
});

// ─── SessionPersistence.update ────────────────────────────────────────────────

describe('SessionPersistence.update', () => {
  it('creates a new session when none exists', () => {
    localStorage.setItem('pfg_operator_id', 'op_new');
    const result = SessionPersistence.update({ trustLevel: 55 });
    expect(result.operatorId).toBe('op_new');
    expect(result.trustLevel).toBe(55);
  });

  it('merges trustLevel patch into existing session', () => {
    SessionPersistence.save({ operatorId: 'op_3', visitCount: 2, trustLevel: 40, bestTimelineScore: 40, lastNodeStabilities: {} });
    const result = SessionPersistence.update({ trustLevel: 70 });
    expect(result.trustLevel).toBe(70);
  });

  it('keeps existing trustLevel when patch omits it', () => {
    SessionPersistence.save({ operatorId: 'op_3', visitCount: 2, trustLevel: 65, bestTimelineScore: 50, lastNodeStabilities: {} });
    const result = SessionPersistence.update({});
    expect(result.trustLevel).toBe(65);
  });

  it('uses max for bestTimelineScore', () => {
    SessionPersistence.save({ operatorId: 'op_4', visitCount: 1, trustLevel: 50, bestTimelineScore: 70, lastNodeStabilities: {} });
    const result = SessionPersistence.update({ bestTimelineScore: 55 }); // lower than existing 70
    expect(result.bestTimelineScore).toBe(70);
  });

  it('updates bestTimelineScore when patch is higher', () => {
    SessionPersistence.save({ operatorId: 'op_4', visitCount: 1, trustLevel: 50, bestTimelineScore: 40, lastNodeStabilities: {} });
    const result = SessionPersistence.update({ bestTimelineScore: 85 });
    expect(result.bestTimelineScore).toBe(85);
  });

  it('persists the merged result to localStorage', () => {
    localStorage.setItem('pfg_operator_id', 'op_5');
    SessionPersistence.update({ trustLevel: 88 });
    const stored = SessionPersistence.load();
    expect(stored?.trustLevel).toBe(88);
  });

  it('merges lastNodeStabilities when provided', () => {
    const stabilities = { node_a: 45, node_b: 80 };
    const result = SessionPersistence.update({ lastNodeStabilities: stabilities });
    expect(result.lastNodeStabilities).toEqual(stabilities);
  });
});

// ─── SessionPersistence.incrementVisit ───────────────────────────────────────

describe('SessionPersistence.incrementVisit', () => {
  it('starts visitCount at 1 on first call', () => {
    localStorage.setItem('pfg_operator_id', 'op_6');
    const result = SessionPersistence.incrementVisit();
    expect(result.visitCount).toBe(1);
  });

  it('increments visitCount on subsequent calls', () => {
    localStorage.setItem('pfg_operator_id', 'op_6');
    SessionPersistence.incrementVisit(); // 1
    SessionPersistence.incrementVisit(); // 2
    const result = SessionPersistence.incrementVisit(); // 3
    expect(result.visitCount).toBe(3);
  });

  it('preserves existing trustLevel across increments', () => {
    localStorage.setItem('pfg_operator_id', 'op_7');
    SessionPersistence.save({ operatorId: 'op_7', visitCount: 5, trustLevel: 77, bestTimelineScore: 77, lastNodeStabilities: {} });
    const result = SessionPersistence.incrementVisit();
    expect(result.trustLevel).toBe(77);
    expect(result.visitCount).toBe(6);
  });

  it('uses pfg_operator_id from localStorage as operatorId', () => {
    localStorage.setItem('pfg_operator_id', 'my_operator');
    const result = SessionPersistence.incrementVisit();
    expect(result.operatorId).toBe('my_operator');
  });

  it('generates a fallback operatorId when pfg_operator_id is missing', () => {
    // No pfg_operator_id set — fallback is Date.now().toString()
    const result = SessionPersistence.incrementVisit();
    expect(typeof result.operatorId).toBe('string');
    expect(result.operatorId.length).toBeGreaterThan(0);
  });
});
