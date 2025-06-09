// leyLineLoader.ts
// Loads ley line definitions from data/leyLines.json
import leyLinesData from './leyLines.json';

export interface LeyLineDefinition {
  id: string;
  fromZone: string;
  toZone: string;
  energy: number;
  status: 'stable' | 'unstable';
}

export function loadLeyLines(): LeyLineDefinition[] {
  return leyLinesData as LeyLineDefinition[];
}
