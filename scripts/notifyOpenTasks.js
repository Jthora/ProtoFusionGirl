// notifyOpenTasks.js
// Usage: node scripts/notifyOpenTasks.js [--json]
// Onboarding: Outputs summaries of open/high-priority/blocked/overdue tasks for Copilot/AI agent workflows. Optionally outputs JSON for integration with VSCode notifications.

const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const args = process.argv.slice(2);
const outputJson = args.includes('--json');

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

const open = tasks.filter(t => t.status === 'open');
const blocked = tasks.filter(t => t.status === 'blocked');
const high = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent');

if (outputJson) {
  console.log(JSON.stringify({ open, blocked, high }, null, 2));
} else {
  if (open.length) {
    console.log('Open Tasks:');
    open.forEach(t => console.log(`- [${t.priority}] ${t.purpose} (${t.file})`));
  }
  if (blocked.length) {
    console.log('\nBlocked Tasks:');
    blocked.forEach(t => console.log(`- [${t.priority}] ${t.purpose} (${t.file})`));
  }
  if (high.length) {
    console.log('\nHigh/Urgent Priority Tasks:');
    high.forEach(t => console.log(`- [${t.status}] ${t.purpose} (${t.file})`));
  }
  if (!open.length && !blocked.length && !high.length) {
    console.log('No open, blocked, or high-priority tasks.');
  }
}
