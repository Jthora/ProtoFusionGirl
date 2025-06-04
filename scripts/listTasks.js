// listTasks.js
// Usage: node scripts/listTasks.js [--status=open|in-progress|done|blocked] [--assignee=copilot|human|name] [--priority=high|medium|low|urgent] [--json]
// Onboarding: Lists all task.artifact files with status, priority, assignee, and summary for AI/human workflow.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const args = process.argv.slice(2);
const statusFilter = (args.find(a => a.startsWith('--status=')) || '').split('=')[1];
const assigneeFilter = (args.find(a => a.startsWith('--assignee=')) || '').split('=')[1];
const priorityFilter = (args.find(a => a.startsWith('--priority=')) || '').split('=')[1];

const files = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.endsWith('.artifact') && f.startsWith('task_'));
const tasks = files.map(f => {
  const content = fs.readFileSync(path.join(ARTIFACTS_DIR, f), 'utf8');
  const get = (key) => {
    const m = content.match(new RegExp(key + ': ([^\n]+)'));
    return m ? m[1].replace(/['\[\]]/g, '').trim() : '';
  };
  return {
    id: get('artifact'),
    status: get('status'),
    priority: get('priority'),
    assignee: get('assignee'),
    purpose: get('purpose'),
    related: get('related'),
    file: f
  };
});

const filtered = tasks.filter(t =>
  (!statusFilter || t.status === statusFilter) &&
  (!assigneeFilter || t.assignee === assigneeFilter) &&
  (!priorityFilter || t.priority === priorityFilter)
);

const outputJson = args.includes('--json');

function printHelp() {
  console.log(`\nUsage: node scripts/listTasks.js [--status=open|in-progress|done|blocked] [--assignee=copilot|human|name] [--priority=high|medium|low|urgent] [--json] [--help]\n`);
  console.log('Onboarding: Lists all task.artifact files with status, priority, assignee, and summary for AI/human workflow.');
  console.log('\nOptions:');
  console.log('  --json     Output result in machine-readable JSON format.');
  console.log('  --help     Show this help message.');
  console.log('  --status   Filter by status.');
  console.log('  --assignee Filter by assignee.');
  console.log('  --priority Filter by priority.');
}

if (args.includes('--help')) {
  printHelp();
  process.exit(0);
}

if (outputJson) {
  console.log(JSON.stringify(filtered, null, 2));
} else {
  console.log('Tasks:');
  filtered.forEach(t => {
    console.log(`- [${t.status}] (${t.priority}) ${t.purpose} (Assignee: ${t.assignee}) [${t.file}]`);
    if (t.related) console.log(`    Related: ${t.related}`);
  });
  if (filtered.length === 0) console.log('No tasks found.');
}
