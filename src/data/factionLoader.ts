// factionLoader.ts
// Loads faction definitions from data/factions.json
import factionsData from './factions.json';

export interface FactionDefinition {
  id: string;
  name: string;
  description: string;
  reputationRange: [number, number];
}

export function loadFactions(): FactionDefinition[] {
  return factionsData as FactionDefinition[];
}
