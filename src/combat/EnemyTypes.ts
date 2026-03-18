// EnemyTypes.ts
// P2 enemy archetype definitions for Remnant Terminators and Nefarium Phantoms.
// See: docs/rebuild/01-systems/combat/enemy-factions.md

import { EnemyDefinition } from '../world/enemies/EnemyDefinition';

export const RemnantTerminator: EnemyDefinition = {
  id: 'remnant_terminator',
  name: 'Remnant Terminator',
  sprite: 'enemy_terminator',
  maxHealth: 60,
  attack: 15,
  damage: 10,
  defense: 5,
  speed: 80,
  aiType: 'patrol',
  drops: [
    { itemId: 'scrap_metal', chance: 0.5, min: 1, max: 3 },
  ],
};

export const NefariumPhantom: EnemyDefinition = {
  id: 'nefarium_phantom',
  name: 'Nefarium Phantom',
  sprite: 'enemy_phantom',
  maxHealth: 40,
  attack: 20,
  damage: 15,
  defense: 2,
  speed: 60,
  aiType: 'phase',
  drops: [
    { itemId: 'shadow_essence', chance: 0.3, min: 1, max: 1 },
  ],
};

export const EnemyTypes = {
  remnant_terminator: RemnantTerminator,
  nefarium_phantom: NefariumPhantom,
};
