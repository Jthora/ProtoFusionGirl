// archiveCompletedTasks.js
// Moves completed (status: done) .task files to tasks/archive/ for cleanliness.
// Usage: node scripts/archiveCompletedTasks.js

import fs from 'fs';
import path from 'path';

const TASKS_DIR = path.join(__dirname, '../tasks');
const ARCHIVE_DIR = path.join(TASKS_DIR, 'archive');
if (!fs.existsSync(ARCHIVE_DIR)) fs.mkdirSync(ARCHIVE_DIR);

const files = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.task'));
let archived = 0;
for (const f of files) {
  const filePath = path.join(TASKS_DIR, f);
  const content = fs.readFileSync(filePath, 'utf8');
  if (/status:\s*done/.test(content) || /"status"\s*:\s*"done"/.test(content)) {
    fs.renameSync(filePath, path.join(ARCHIVE_DIR, f));
    archived++;
  }
}
console.log(`Archived ${archived} completed tasks to tasks/archive/`);
