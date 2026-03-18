import { EnemyTypes, RemnantTerminator, NefariumPhantom } from '../../src/combat/EnemyTypes';

describe('EnemyTypes (P2)', () => {
  it('defines RemnantTerminator with correct stats', () => {
    expect(RemnantTerminator.id).toBe('remnant_terminator');
    expect(RemnantTerminator.maxHealth).toBe(60);
    expect(RemnantTerminator.damage).toBe(10);
    expect(RemnantTerminator.aiType).toBe('patrol');
    expect(RemnantTerminator.speed).toBe(80);
  });

  it('defines NefariumPhantom with correct stats', () => {
    expect(NefariumPhantom.id).toBe('nefarium_phantom');
    expect(NefariumPhantom.maxHealth).toBe(40);
    expect(NefariumPhantom.damage).toBe(15);
    expect(NefariumPhantom.aiType).toBe('phase');
    expect(NefariumPhantom.speed).toBe(60);
  });

  it('EnemyTypes map contains both enemies', () => {
    expect(Object.keys(EnemyTypes)).toEqual(['remnant_terminator', 'nefarium_phantom']);
  });

  it('Terminator dies after 3 hits at 20 damage', () => {
    let health = RemnantTerminator.maxHealth;
    for (let i = 0; i < 3; i++) health -= 20;
    expect(health).toBe(0);
  });

  it('Phantom dies after 2 hits at 20 damage', () => {
    let health = NefariumPhantom.maxHealth;
    for (let i = 0; i < 2; i++) health -= 20;
    expect(health).toBe(0);
  });
});
