// syncTasksWithCode.js
// Usage: node scripts/syncTasksWithCode.js
// Onboarding: Scans code for TODO/FIXME/@task comments, auto-creates/updates task.artifact files, and marks tasks as done if code reference is removed.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CODE_DIR = path.join(__dirname, '../src');
const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const TASK_PREFIX = 'task_';
const TODO_REGEX = /(?:\/\/|#|<!--)\s*(TODO|FIXME|@task)[:\s-]+(.+)/gi;
const today = new Date().toISOString().slice(0, 10);

function getAllCodeFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      getAllCodeFiles(full, files);
    } else if (full.match(/\.(js|ts|tsx|jsx|json|md)$/)) {
      files.push(full);
    }
  }
  return files;
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function printHelp() {
  console.log(`\nUsage: node scripts/syncTasksWithCode.js [--json] [--help]\n`);
  console.log('Onboarding: Scans code for TODO/FIXME/@task comments, auto-creates/updates task.artifact files, and marks tasks as done if code reference is removed.');
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

// 1. Scan code for TODOs
const codeFiles = getAllCodeFiles(CODE_DIR);
const foundTasks = [];
for (const file of codeFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = TODO_REGEX.exec(content))) {
    const [, type, desc] = match;
    foundTasks.push({
      desc: desc.trim(),
      file,
      line: content.slice(0, match.index).split('\n').length,
      type
    });
  }
}

// 2. Create/update task.artifact files for found TODOs
const created = [], updated = [], closed = [];
const existingTasks = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.startsWith(TASK_PREFIX) && f.endsWith('.artifact'));
const foundTaskSlugs = new Set();
for (const t of foundTasks) {
  const slug = slugify(`${t.desc}_${path.basename(t.file)}_${t.line}`);
  foundTaskSlugs.add(slug);
  const id = `${TASK_PREFIX}${slug}_${today.replace(/-/g, '')}`;
  const filename = path.join(ARTIFACTS_DIR, `${id}.artifact`);
  if (!fs.existsSync(filename)) {
    // Create new task artifact
    const header = `---\nartifact: ${id}\ncreated: ${today}\npurpose: ${t.desc}\ntype: task\ntags: [task, open, copilot]\nstatus: open\npriority: medium\nassignee: copilot\nrelated: ['${path.relative(process.cwd(), t.file)}']\nhistory:\n  - { date: ${today}, action: created, by: copilot, notes: auto-created from code TODO }\nformat: markdown\n---\n`;
    const body = `\n# Task: ${t.desc}\n\n## Details\n- Found in ${t.file}:${t.line}\n- Type: ${t.type}\n\n## Subtasks\n- [ ] ...\n\n## Comments/History\n- Auto-created from code TODO on ${today}.\n`;
    fs.writeFileSync(filename, header + body);
    created.push(filename);
  } else {
    // Update existing task (touch file, could add more logic)
    updated.push(filename);
  }
}

// 3. Mark tasks as done if code reference is gone
for (const f of existingTasks) {
  const content = fs.readFileSync(path.join(ARTIFACTS_DIR, f), 'utf8');
  const m = content.match(/purpose: ([^\n]+)/);
  const desc = m ? m[1].trim() : '';
  const fileMatch = content.match(/related: \['([^']+)'\]/);
  const file = fileMatch ? fileMatch[1] : '';
  const slug = slugify(`${desc}_${path.basename(file)}`);
  if (!Array.from(foundTaskSlugs).some(s => s.startsWith(slug))) {
    // Mark as done
    const updatedContent = content.replace(/status: .*/, 'status: done')
      .replace(/tags: \[([^\]]*)\]/, (m, tags) => `tags: [${tags.replace(/open/, 'done')}]`)
      .replace(/history:\n/, `history:\n  - { date: ${today}, action: auto-closed, by: copilot, notes: code reference removed }\n`)
      .replace(/## Comments\/History\n/, `## Comments/History\n- ${today}: Auto-closed, code reference removed.\n`);
    fs.writeFileSync(path.join(ARTIFACTS_DIR, f), updatedContent);
    closed.push(f);
  }
}

if (outputJson) {
  console.log(JSON.stringify({ foundTasks, created, updated, closed, usage: 'node scripts/syncTasksWithCode.js [--json] [--help]' }, null, 2));
} else {
  console.log(JSON.stringify({ created, updated, closed, found: foundTasks.length }, null, 2));
}
