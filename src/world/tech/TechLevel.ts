// TechLevel.ts - Canonical data model for tech levels, auto-generated from artifact
export interface TechLevel {
  id: string;
  name: string;
  type: string; // e.g., Type 0, Type I, etc.
  era: string;
  sphere: string;
  age: string;
  description: string;
  gameplayUnlocks: string[];
  advancementTriggers: string[];
  regressionTriggers: string[];
  risks: string[];
  relatedArtifacts: string[];
}

// Example: Import tech level data from JSON or artifact
// import techLevels from '../../data/tech_levels.json';
