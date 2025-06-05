// validateTaskSchema.js
// Usage: node scripts/validateTaskSchema.js [tasksFolder]
// Validates all .task files in the given folder (default: tasks/) against the required schema.

import fs from 'fs';
import path from 'path';

const TASKS_DIR = process.argv[2] || path.join(__dirname, '../tasks');
const REQUIRED_FIELDS = [
  'title', 'description', 'status', 'priority', 'tags', 'related', 'created'
];

function validateTaskFile(filepath) {
  let content;
  try {
    content = fs.readFileSync(filepath, 'utf8');
    if (filepath.endsWith('.json')) {
      const obj = JSON.parse(content);
      return validateObj(obj, filepath);
    } else {
      // Simple YAML: parse key: value pairs (no nested objects except arrays)
      const lines = content.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#'));
      const obj = {};
      let key = null;
      for (let line of lines) {
        if (/^\s/.test(line) && key) {
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
      return validateObj(obj, filepath);
    }
  } catch (e) {
    return { file: filepath, valid: false, error: 'Parse error: ' + e.message };
  }
}

function validateObj(obj, filepath) {
  const missing = REQUIRED_FIELDS.filter(f => !(f in obj));
  return {
    file: filepath,
    valid: missing.length === 0,
    missing,
    title: obj.title || '',
    status: obj.status || '',
    priority: obj.priority || '',
  };
}

const files = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.task'));
const results = files.map(f => validateTaskFile(path.join(TASKS_DIR, f)));
const invalid = results.filter(r => !r.valid);
if (invalid.length) {
  console.error('Invalid .task files:');
  invalid.forEach(r => console.error(`${r.file}: missing fields: ${r.missing.join(', ')}`));
  process.exit(1);
} else {
  console.log('All .task files are valid.');
}
