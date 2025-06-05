// scripts/generatePersonaCoreDashboard.js
// Generates a Persona Core Dashboard artifact from modular persona_core/ modules.

const fs = require('fs');
const path = require('path');

const PERSONA_CORE_DIR = path.join(__dirname, '../persona_core');
const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const DASHBOARD_PATH = path.join(ARTIFACTS_DIR, `persona_core_dashboard_${new Date().toISOString().slice(0,10)}.artifact`);

function loadModule(module) {
  const file = path.join(PERSONA_CORE_DIR, module);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return null;
}

function main() {
  const coreValues = loadModule('core_values.json') || [];
  const operationalFocus = loadModule('operational_focus.json') || {};
  const decisionHeuristics = loadModule('decision_heuristics.json') || [];
  const metaPrompts = loadModule('meta_prompts.json') || [];
  const integrationHooks = loadModule('integration_hooks.json') || {};
  const version = (loadModule('version.json') || {}).version || new Date().toISOString();

  const content = [
    '---',
    `artifact: persona_core_dashboard_${new Date().toISOString().slice(0,10)}`,
    `created: ${new Date().toISOString()}`,
    'purpose: Persona Core Dashboard - summary of current values, focus, heuristics, and integration for all contributors',
    'format: markdown',
    '---',
    '',
    '# Persona Core Dashboard',
    '',
    '## Core Values',
    ...coreValues.map(v => `- ${v}`),
    '',
    '## Operational Focus',
    `- **Current Priority:** ${operationalFocus.currentPriority || ''}`,
    operationalFocus.secondaryFocus ? `- **Secondary Focus:** ${operationalFocus.secondaryFocus.join(', ')}` : '',
    '',
    '## Decision Heuristics',
    ...decisionHeuristics.map(h => `- ${h}`),
    '',
    '## Meta-Prompts',
    ...metaPrompts.map(m => `- ${m}`),
    '',
    '## Integration Hooks',
    ...Object.entries(integrationHooks).map(([k,v]) => `- ${k}: ${v}`),
    '',
    '## Version',
    `- ${version}`,
    '',
    '---',
    '',
    '> This dashboard is auto-generated from persona_core/ modules. For details or to propose changes, see the changelog or update scripts.'
  ].filter(Boolean).join('\n');

  fs.writeFileSync(DASHBOARD_PATH, content, 'utf8');
  console.log(`Persona Core Dashboard generated: ${DASHBOARD_PATH}`);
}

if (require.main === module) {
  main();
}
