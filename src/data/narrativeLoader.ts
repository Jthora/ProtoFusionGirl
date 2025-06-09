// narrativeLoader.ts
// Loads narrative event definitions from data/narrative.json
import narrativeData from './narrative.json';

export interface NarrativeEventDefinition {
  id: string;
  trigger: string;
  actions: string[];
}

export function loadNarrativeEvents(): NarrativeEventDefinition[] {
  return narrativeData as NarrativeEventDefinition[];
}
