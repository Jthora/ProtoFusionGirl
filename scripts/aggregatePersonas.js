// aggregatePersonas.js
// Usage: node scripts/aggregatePersonas.js [--json]
// Onboarding: Aggregates and validates all persona definitions in persona_core/ into a unified index.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PERSONA_DIR = path.join(__dirname, '../persona_core');
const INDEX_PATH = path.join(__dirname, '../artifacts/persona_index.artifact');
const outputJson = process.argv.includes('--json');

if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/aggregatePersonas.js [--json]');
  console.log('Aggregates and validates all persona definitions in persona_core/ into a unified index.');
  process.exit(0);
}

function validatePersona(persona) {
  // Require name, role, and at least one capability
  return persona && persona.name && persona.role && Array.isArray(persona.capabilities) && persona.capabilities.length > 0;
}

function main() {
  let personas = [];
  let invalid = [];
  if (fs.existsSync(PERSONA_DIR)) {
    for (const file of fs.readdirSync(PERSONA_DIR)) {
      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(PERSONA_DIR, file), 'utf8'));
          if (validatePersona(data)) {
            personas.push({ ...data, file });
          } else {
            invalid.push(file);
          }
        } catch (e) {
          invalid.push(file);
        }
      }
    }
  }
  // Output persona coverage table
  if (!outputJson) {
    console.log('Persona Coverage:');
    personas.forEach(p => console.log(`- ${p.name} (${p.role}) [${p.capabilities.length} capabilities]`));
    if (invalid.length) console.warn('[aggregatePersonas] Invalid/missing personas:', invalid);
  }
  // Copilot/AI: Output table of personas, warn about missing fields, suggest improvements
  if (outputJson) {
    console.log(JSON.stringify(personas, null, 2));
  } else {
    fs.writeFileSync(INDEX_PATH, JSON.stringify(personas, null, 2), 'utf8');
    console.log(`[aggregatePersonas] Persona index written to ${INDEX_PATH}`);
  }
  if (invalid.length) {
    try {
      require('child_process').execSync(`node scripts/aiTaskManager.js new "Invalid/missing personas: ${invalid.join(', ')}" --priority=high --assignee=copilot --related=aggregatePersonas.js`, { stdio: 'inherit' });
    } catch {}
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
