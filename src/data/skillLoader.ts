// skillLoader.ts
// Loads skill definitions from data/skills.json
import skillsData from './skills.json';

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  effects: string[];
  requirements: string[];
}

export function loadSkills(): SkillDefinition[] {
  return skillsData as SkillDefinition[];
}
