// validatePersonaCore.js
// Validates persona_core.json for required fields and logical consistency
import fs from 'fs';
import path from 'path';

const PERSONA_PATH = path.join(__dirname, '../data/persona_core.json');
const persona = JSON.parse(fs.readFileSync(PERSONA_PATH, 'utf8'));

const required = ['coreValues', 'operationalFocus', 'decisionHeuristics', 'metaPrompts', 'integrationHooks', 'version'];
let valid = true;
for (const field of required) {
  if (!(field in persona)) {
    console.error(`Missing required field: ${field}`);
    valid = false;
  }
}
if (!Array.isArray(persona.coreValues) || persona.coreValues.length === 0) {
  console.error('coreValues must be a non-empty array');
  valid = false;
}
if (!persona.operationalFocus.currentPriority) {
  console.error('operationalFocus.currentPriority is required');
  valid = false;
}
if (!Array.isArray(persona.decisionHeuristics) || persona.decisionHeuristics.length === 0) {
  console.error('decisionHeuristics must be a non-empty array');
  valid = false;
}
if (!Array.isArray(persona.metaPrompts) || persona.metaPrompts.length === 0) {
  console.error('metaPrompts must be a non-empty array');
  valid = false;
}
if (!persona.integrationHooks.onboarding || !persona.integrationHooks.taskSelection) {
  console.error('integrationHooks must include onboarding and taskSelection');
  valid = false;
}
if (valid) {
  console.log('persona_core.json is valid.');
  process.exit(0);
} else {
  process.exit(1);
}
