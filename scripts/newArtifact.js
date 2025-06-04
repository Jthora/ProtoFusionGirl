// newArtifact.js
// Usage: node scripts/newArtifact.js --type=<type> --purpose="<purpose>" --tags=tag1,tag2 --format=<format> --related=artifact1,script2
// Onboarding: Scriptable generator for new artifact templates with all required fields for Copilot/AI agent workflows.

import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const today = new Date().toISOString().slice(0, 10);

const args = process.argv.slice(2);
function getArg(name, def = '') {
  const found = args.find(a => a.startsWith(`--${name}=`));
  return found ? found.split('=')[1] : def;
}

const type = getArg('type', 'other');
const purpose = getArg('purpose', '');
const tags = getArg('tags', '').split(',').filter(Boolean);
const format = getArg('format', 'markdown');
const related = getArg('related', '').split(',').filter(Boolean);

function printHelp() {
  console.log(`\nUsage: node scripts/newArtifact.js --type=<type> --purpose="<purpose>" --tags=tag1,tag2 --format=<format> --related=artifact1,script2 [--json] [--help]\n`);
  console.log('Onboarding: Scriptable generator for new artifact templates with all required fields for Copilot/AI agent workflows.');
  console.log('\nOptions:');
  console.log('  --json   Output result in machine-readable JSON format.');
  console.log('  --help   Show this help message.');
}

if (args.includes('--help')) {
  printHelp();
  process.exit(0);
}
const outputJson = args.includes('--json');
if (!purpose) {
  if (outputJson) {
    console.log(JSON.stringify({ error: 'Missing purpose', usage: 'node scripts/newArtifact.js --type=<type> --purpose="<purpose>" --tags=tag1,tag2 --format=<format> --related=artifact1,script2 [--json] [--help]' }, null, 2));
  } else {
    printHelp();
  }
  process.exit(1);
}

const slug = purpose.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const id = `${type}_${slug}_${today.replace(/-/g, '')}`;
const filename = path.join(ARTIFACTS_DIR, `${id}.artifact`);

const header = `---\nartifact: ${id}\ncreated: ${today}\npurpose: ${purpose}\ntype: ${type}\ntags: [${tags.join(', ')}]\nformat: ${format}\nrelated: [${related.map(r => `'${r}'`).join(', ')}]\n---\n`;
const body = `\n# ${purpose}\n\n## Details\n- ...\n`;

fs.writeFileSync(filename, header + body);
if (outputJson) {
  console.log(JSON.stringify({ created: filename, id, type, purpose, tags, format, related, usage: 'node scripts/newArtifact.js --type=<type> --purpose="<purpose>" --tags=tag1,tag2 --format=<format> --related=artifact1,script2 [--json] [--help]' }, null, 2));
} else {
  console.log(`Created ${filename}`);
}
