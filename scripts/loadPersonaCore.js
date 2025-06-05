// loadPersonaCore.js
// Loads and validates persona_core.json, exposes API for scripts and Copilot

import fs from 'fs';
import path from 'path';

const PERSONA_PATH = path.join(__dirname, '../data/persona_core.json');

export function loadPersonaCore() {
  const content = fs.readFileSync(PERSONA_PATH, 'utf8');
  const persona = JSON.parse(content);
  // Basic validation
  if (!persona.coreValues || !persona.operationalFocus || !persona.decisionHeuristics) {
    throw new Error('Persona Core missing required fields.');
  }
  return persona;
}

if (require.main === module) {
  try {
    const persona = loadPersonaCore();
    console.log(JSON.stringify(persona, null, 2));
  } catch (e) {
    console.error('Error loading Persona Core:', e.message);
    process.exit(1);
  }
}
