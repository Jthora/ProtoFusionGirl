// updateTaskIndex.js
// Usage: node scripts/updateTaskIndex.js
// Scans all .task files in /tasks and generates tasks/task_index.json for automation and onboarding.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TASKS_DIR = path.join(__dirname, '../tasks');
const INDEX_FILE = path.join(TASKS_DIR, 'task_index.json');

function parseTaskFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  // Try YAML, fallback to JSON
  try {
    // Use a simple YAML parser (assume no nested objects except arrays)
    const lines = content.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('//'));
    const obj = {};
    let key = null;
    for (let line of lines) {
      if (/^\s/.test(line) && key) {
        // Array or multiline
        if (!Array.isArray(obj[key])) obj[key] = [];
        obj[key].push(line.trim().replace(/^- /, ''));
      } else {
        const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
        if (m) {
          key = m[1];
          let val = m[2];
          if (val === '') continue;
          if (val.startsWith('[') && val.endsWith(']')) {
            obj[key] = val.slice(1, -1).split(',').map(s => s.trim());
          } else {
            obj[key] = val;
          }
        }
      }
    }
    return obj;
  } catch (e) {
    try {
      return JSON.parse(content);
    } catch (e2) {
      return { error: 'Parse error', file: filepath };
    }
  }
}

const files = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.task'));
const tasks = files.map(f => {
  const obj = parseTaskFile(path.join(TASKS_DIR, f));
  obj.filename = f;
  return obj;
});

fs.writeFileSync(INDEX_FILE, JSON.stringify(tasks, null, 2));
console.log(`Updated ${INDEX_FILE} with ${tasks.length} tasks.`);
