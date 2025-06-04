import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPTS_DIR = path.join(__dirname);

const outputJson = process.argv.includes('--json');
const scripts = [];
const args = process.argv.slice(2);
fs.readdirSync(SCRIPTS_DIR)
  .filter(f => f.endsWith('.js'))
  .forEach(f => {
    const filePath = path.join(SCRIPTS_DIR, f);
    const content = fs.readFileSync(filePath, 'utf8');
    const descMatch = content.match(/\/\/\s*([^\n]*)/);
    const usageMatch = content.match(/\/\/\s*Usage:\s*([^\n]*)/);
    const onboardingMatch = content.match(/\/\/\s*Onboarding:\s*([^\n]*)/);
    const desc = descMatch ? descMatch[1] : null;
    const usage = usageMatch ? usageMatch[1] : null;
    const onboarding = onboardingMatch ? onboardingMatch[1] : null;
    scripts.push({ name: f, description: desc, usage, onboarding });
    if (!outputJson) {
      console.log(`\n${f}:`);
      if (desc) {
        console.log(`  Description: ${desc}`);
      } else {
        console.log('  [!] No description found.');
      }
      if (usage) {
        console.log(`  Usage: ${usage}`);
      } else {
        console.log('  [!] No usage example found.');
      }
      if (onboarding) {
        console.log(`  Onboarding: ${onboarding}`);
      } else {
        console.log('  [!] No onboarding relevance found.');
      }
    }
  });
if (outputJson) {
  console.log(JSON.stringify(scripts, null, 2));
}

if (args.includes('--update-index')) {
  const indexFile = path.join(__dirname, '../artifacts/scripts_index.artifact');
  const today = new Date().toISOString().slice(0, 10);
  const header = `---
artifact: scripts_index
created: ${today}
purpose: Auto-generated index of all scripts, their usage, options, and onboarding relevance for Copilot/AI agent workflows.
type: index
tags: [script, index, automation, ai, copilot]
related: [artifact_index.artifact, aiTaskManager.js, listScripts.js]
format: markdown
---

# Scripts Index

- This file is auto-updated by the \`listScripts.js --update-index\` output.
- Lists all scripts, their usage, onboarding relevance, and options for discoverability and automation.

## Scripts
`;
  const list = scripts.map(s => `- ${s.name}: ${s.description}\n    Usage: ${s.usage}\n    Onboarding: ${s.onboarding}`).join('\n');
  fs.writeFileSync(indexFile, header + '\n' + list + '\n');
  console.log(`Updated ${indexFile}`);
  process.exit(0);
}

function printHelp() {
  console.log(`\nUsage: node scripts/listScripts.js [--json] [--help]\n`);
  console.log('Onboarding: Lists all available scripts in the scripts/ directory with descriptions, usage, and onboarding info.');
  console.log('\nOptions:');
  console.log('  --json   Output result in machine-readable JSON format.');
  console.log('  --help   Show this help message.');
}

if (args.includes('--help')) {
  printHelp();
  process.exit(0);
}

console.log('\nTo run a script: node scripts/<scriptname>.js');

// Usage: node scripts/listScripts.js [--json]
// Onboarding: Lists all available scripts with descriptions, usage, and onboarding relevance for discoverability and onboarding.
