// SelfHealingEngine.test.ts
// Unit tests for SelfHealingEngine

import { SelfHealingEngine } from '../../src/automation/SelfHealingEngine';

describe('SelfHealingEngine', () => {
  let engine: SelfHealingEngine;

  beforeEach(() => {
    engine = new SelfHealingEngine();
  });

  it('returns an array of issues from validateAll (stub)', () => {
    const issues = engine.validateAll();
    expect(Array.isArray(issues)).toBe(true);
  });

  it('returns an array of repairs from autoRepair (stub)', () => {
    const repairs = engine.autoRepair();
    expect(Array.isArray(repairs)).toBe(true);
  });

  it('can call generateFeedbackArtifact (stub)', () => {
    expect(() => engine.generateFeedbackArtifact('Test issue')).not.toThrow();
  });
});
