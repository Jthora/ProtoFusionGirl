// EnemyDefinition: Metadata and stats for enemy types
export interface EnemyDefinition {
  id: string;
  name: string;
  sprite: string;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  aiType: string; // e.g., 'patrol', 'chase', 'ranged', etc.
  drops?: Array<{ itemId: string; chance: number; min: number; max: number }>;
  // ...other metadata (aggro range, resistances, etc.)
}
