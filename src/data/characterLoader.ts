// characterLoader.ts
// Utility to load character data from JSON for data-driven design
import characterData from './characters.json';

export interface CharacterData {
  id: string;
  name: string;
  baseStats: {
    health: number;
    maxHealth: number;
    psi: number;
    maxPsi: number;
    level: number;
    experience: number;
    skills: Record<string, number>;
  };
  factionId?: string;
  cosmeticIds?: string[];
}

export function getCharacterData(id: string): CharacterData | undefined {
  return (characterData as CharacterData[]).find(c => c.id === id);
}
