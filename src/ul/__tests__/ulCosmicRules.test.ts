// src/ul/__tests__/ulCosmicRules.test.ts
// Tests for cosmicRules.ts, based on ul_cosmic_rules.artifact and ul_test_cases.artifact
import { doesBeat, getCombination, cosmicForces, modalityCycles, elementalCycles } from '../cosmicRules';

describe('cosmicRules', () => {
  test('doesBeat: canonical force relationships', () => {
    expect(doesBeat('Core', 'Chaos')).toBe(true);
    expect(doesBeat('Chaos', 'Void')).toBe(true);
    expect(doesBeat('Void', 'Order')).toBe(true);
    expect(doesBeat('Order', 'Core')).toBe(true);
    expect(doesBeat('Core', 'Order')).toBe(false);
    expect(doesBeat('Chaos', 'Order')).toBe(false);
  });

  test('doesBeat: modality relationships', () => {
    expect(doesBeat('Cardinal', 'Mutable')).toBe(true);
    expect(doesBeat('Mutable', 'Fixed')).toBe(true);
    expect(doesBeat('Fixed', 'Cardinal')).toBe(true);
    expect(doesBeat('Mutable', 'Cardinal')).toBe(false);
  });

  test('getCombination: element combinations', () => {
    expect(getCombination('Fire', 'Air')).toBe('Angle');
    expect(getCombination('Air', 'Fire')).toBe('Angle');
    expect(getCombination('Water', 'Earth')).toBe('Curve');
    expect(getCombination('Earth', 'Water')).toBe('Curve');
    expect(getCombination('Earth', 'Air')).toBe('Line');
    expect(getCombination('Fire', 'Water')).toBe('Wave');
    expect(getCombination('Water', 'Air')).toBe('Circle');
    expect(getCombination('Earth', 'Fire')).toBe('Point');
    expect(getCombination('Fire', 'Void')).toBeUndefined();
  });

  test('cosmicForces: includes all canonical forces', () => {
    expect(cosmicForces).toEqual([
      'Core', 'Void', 'Order', 'Chaos', 'Alpha', 'Omega', 'Omni', 'Power', 'Flux'
    ]);
  });

  test('modalityCycles: structure', () => {
    expect(modalityCycles[0]).toEqual(['Cardinal', 'Mutable', 'Fixed', 'Cardinal']);
  });

  test('elementalCycles: structure', () => {
    expect(elementalCycles[0]).toEqual(['Fire', 'Air', 'Water', 'Earth', 'Fire']);
  });
});
