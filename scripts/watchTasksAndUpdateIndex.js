// watchTasksAndUpdateIndex.js
// Usage: node scripts/watchTasksAndUpdateIndex.js
// Watches the /tasks folder for changes to .task files and auto-runs updateTaskIndex.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TASKS_DIR = path.join(__dirname, '../tasks');
const UPDATE_SCRIPT = path.join(__dirname, 'updateTaskIndex.js');

function runUpdate() {
  const proc = spawn('node', [UPDATE_SCRIPT], { stdio: 'inherit' });
}

console.log('Watching /tasks for .task changes...');
runUpdate();

fs.watch(TASKS_DIR, (eventType, filename) => {
  if (filename && filename.endsWith('.task')) {
    console.log(`Detected change: ${filename} (${eventType})`);
    runUpdate();
  }
});
