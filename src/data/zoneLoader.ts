// zoneLoader.ts
// Loads zone definitions from data/zones.json
import zonesData from './zones.json';

export interface ZoneDefinition {
  id: string;
  name: string;
  description: string;
  type: string;
  connectedLeyLines: string[];
}

export function loadZones(): ZoneDefinition[] {
  return zonesData as ZoneDefinition[];
}
