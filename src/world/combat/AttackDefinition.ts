// AttackDefinition: Metadata for attacks (melee, ranged, etc)
export interface AttackDefinition {
  id: string;
  name: string;
  type: 'melee' | 'ranged' | 'magic';
  damage: number;
  range: number;
  cooldown: number;
  effect?: string; // e.g., 'burn', 'poison', etc.
  // ...other metadata (animation, sound, etc.)
}
