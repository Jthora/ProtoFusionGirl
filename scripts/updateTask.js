// updateTask.js
// Usage: node scripts/updateTask.js <task_filename> [--status=...] [--assignee=...] [--priority=...] [--comment="..."]
// Onboarding: Updates status, assignee, priority, or adds a comment/history entry to a task artifact.

const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');

function printHelp() {
  console.log(`\nUsage: node scripts/updateTask.js <task_filename> [--status=...] [--assignee=...] [--priority=...] [--comment="..."] [--json] [--help]\n`);
  console.log('Onboarding: Updates status, assignee, priority, or adds a comment/history entry to a task artifact.');
  console.log('\nOptions:');
  console.log('  --json   Output result in machine-readable JSON format.');
  console.log('  --help   Show this help message.');
}

const args = process.argv.slice(2);
if (args.includes('--help')) {
  printHelp();
  process.exit(0);
}
const outputJson = args.includes('--json');
const filtered = args.filter(a => !a.startsWith('--'));
if (filtered.length < 1) {
  if (outputJson) {
    console.log(JSON.stringify({ error: 'Missing task_filename', usage: 'node scripts/updateTask.js <task_filename> [--status=...] [--assignee=...] [--priority=...] [--comment="..."] [--json] [--help]' }, null, 2));
  } else {
    printHelp();
  }
  process.exit(1);
}
const filename = path.join(ARTIFACTS_DIR, filtered[0]);
if (!fs.existsSync(filename)) {
  if (outputJson) {
    console.log(JSON.stringify({ error: 'Task file not found', filename }, null, 2));
  } else {
    console.error('Task file not found:', filename);
  }
  process.exit(1);
}
let content = fs.readFileSync(filename, 'utf8');
const today = new Date().toISOString().slice(0, 10);

function updateField(key, value) {
  const re = new RegExp(`(${key}: ).*`);
  if (content.match(re)) {
    content = content.replace(re, `$1${value}`);
  } else {
    content = content.replace(/---\n/, `---\n${key}: ${value}\n`);
  }
}

const status = (args.find(a => a.startsWith('--status=')) || '').split('=')[1];
const assignee = (args.find(a => a.startsWith('--assignee=')) || '').split('=')[1];
const priority = (args.find(a => a.startsWith('--priority=')) || '').split('=')[1];
const comment = (args.find(a => a.startsWith('--comment=')) || '').split('=')[1];

if (status) updateField('status', status);
if (assignee) updateField('assignee', assignee);
if (priority) updateField('priority', priority);

if (comment) {
  // Add to history
  const historyLine = `  - { date: ${today}, action: updated, by: copilot, notes: ${comment} }`;
  content = content.replace(/history:\n/, `history:\n${historyLine}\n`);
  // Add to Comments/History section
  content = content.replace(/## Comments\/History\n/, `## Comments/History\n- ${today}: ${comment}\n`);
}

fs.writeFileSync(filename, content);
if (outputJson) {
  console.log(JSON.stringify({ updated: filename, status, assignee, priority, comment, usage: 'node scripts/updateTask.js <task_filename> [--status=...] [--assignee=...] [--priority=...] [--comment="..."] [--json] [--help]' }, null, 2));
} else {
  console.log(`Updated ${filename}`);
}
