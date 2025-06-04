// autoRepairArtifacts.js
// Usage: node scripts/autoRepairArtifacts.js [--json]
// Onboarding: Detects and fixes missing headers, broken links, outdated fields, or inconsistent tags in artifacts/tasks. Outputs a summary (optionally as JSON).

import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const args = process.argv.slice(2);
const outputJson = args.includes('--json');

const files = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.endsWith('.artifact'));
const fixed = [], warned = [], unchanged = [];

function hasHeader(content) {
  return content.trim().startsWith('---');
}

function fixHeader(content, filename) {
  if (!hasHeader(content)) {
    // Add a minimal header
    const today = new Date().toISOString().slice(0, 10);
    const header = `---\nartifact: ${path.basename(filename, '.artifact')}\ncreated: ${today}\npurpose: (auto-repaired, add purpose)\ntype: unknown\ntags: [auto-repaired]\nformat: markdown\n---\n`;
    return header + content;
  }
  return content;
}

for (const f of files) {
  let content = fs.readFileSync(path.join(ARTIFACTS_DIR, f), 'utf8');
  let changed = false;
  // Fix missing header
  if (!hasHeader(content)) {
    content = fixHeader(content, f);
    changed = true;
    warned.push({ file: f, issue: 'Missing header, auto-added.' });
  }
  // Check for required fields in header
  const required = ['artifact:', 'created:', 'purpose:', 'type:', 'tags:', 'format:'];
  for (const req of required) {
    if (!content.includes(req)) {
      content = content.replace(/---\n/, `---\n${req} (auto-repaired)\n`);
      changed = true;
      warned.push({ file: f, issue: `Missing field: ${req}` });
    }
  }
  // Fix inconsistent tags (e.g., duplicate, empty)
  content = content.replace(/tags: \[([^\]]*)\]/, (m, tags) => {
    const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
    const unique = Array.from(new Set(tagArr));
    if (unique.length !== tagArr.length) changed = true;
    return `tags: [${unique.join(', ')}]`;
  });
  // TODO: Add more auto-repair logic (broken links, outdated fields, etc.)
  if (changed) {
    fs.writeFileSync(path.join(ARTIFACTS_DIR, f), content);
    fixed.push(f);
  } else {
    unchanged.push(f);
  }
}

const summary = { fixed, warned, unchanged };
if (outputJson) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log('Auto-Repair Summary:');
  if (fixed.length) console.log('Fixed:', fixed);
  if (warned.length) console.log('Warnings:', warned);
  if (!fixed.length && !warned.length) console.log('No issues found.');
}
