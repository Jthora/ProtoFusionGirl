// scripts/personaCoreUtils.js
// Utility functions for loading and accessing Persona Core fields

import fs from 'fs';
import path from 'path';

const PERSONA_CORE_PATH = path.join(path.dirname(new URL(import.meta.url).pathname), '../data/persona_core.json');

export function loadPersonaCore() {
  try {
    const raw = fs.readFileSync(PERSONA_CORE_PATH, 'utf-8');
    const personaCore = JSON.parse(raw);
    return personaCore;
  } catch (err) {
    throw new Error('Failed to load Persona Core: ' + err.message);
  }
}

export function getCoreValues() {
  return loadPersonaCore().coreValues;
}

export function getOperationalFocus() {
  return loadPersonaCore().operationalFocus;
}

export function getDecisionHeuristics() {
  return loadPersonaCore().decisionHeuristics;
}

export function getMetaPrompts() {
  return loadPersonaCore().metaPrompts;
}

export function getIntegrationHooks() {
  return loadPersonaCore().integrationHooks;
}
