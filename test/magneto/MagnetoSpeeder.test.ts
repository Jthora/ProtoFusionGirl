// MagnetoSpeeder.test.ts
// Unit and integration tests for MagnetoSpeeder

import { MagnetoSpeeder, SpeederUpgrade } from '../../src/magneto/MagnetoSpeeder';

describe('MagnetoSpeeder', () => {
  let speeder: MagnetoSpeeder;

  beforeEach(() => {
    speeder = new MagnetoSpeeder();
  });

  it('switches between manual and auto modes', () => {
    speeder.setMode('auto');
    expect(speeder.mode).toBe('auto');
    speeder.setMode('manual');
    expect(speeder.mode).toBe('manual');
  });

  it('applies upgrades and tracks them', () => {
    const upgrade: SpeederUpgrade = { id: 'boost', name: 'Speed Boost', effect: '+20% speed' };
    speeder.applyUpgrade(upgrade);
    expect(speeder.upgrades).toContain(upgrade);
  });

  it('updates energy and clamps between 0 and 100', () => {
    speeder.updateEnergy(-150);
    expect(speeder.energy).toBe(0);
    speeder.updateEnergy(200);
    expect(speeder.energy).toBe(100);
  });

  it('adjusts energy by ley line strength', () => {
    speeder.energy = 50;
    speeder.adjustEnergyByLeyLine(100); // +5
    expect(speeder.energy).toBe(55);
    speeder.adjustEnergyByLeyLine(0);   // -5
    expect(speeder.energy).toBe(50);
  });

  it('can set accessibility features (stub)', () => {
    // Should not throw
    expect(() => speeder.setAccessibilityFeature('colorblind', true)).not.toThrow();
  });
});
