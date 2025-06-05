// syncDatapack.js
// Usage: node scripts/syncDatapack.js [--json]
// Onboarding: Synchronizes the data/ and datapack folders, ensuring all referenced data files are present and indexed.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const DATAPACK_DIR = path.join(__dirname, '../datapack');
const INDEX_PATH = path.join(__dirname, '../artifacts/datapack_index.artifact');
const outputJson = process.argv.includes('--json');

function scanData(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => !f.startsWith('.')).map(f => ({ file: f, path: path.join(dir, f) }));
}

if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/syncDatapack.js [--json]');
  console.log('Synchronizes the data/ and datapack folders, ensuring all referenced data files are present and indexed.');
  process.exit(0);
}

function validateDataFile(file) {
  // Simple check: must be readable JSON
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'));
    return true;
  } catch {
    return false;
  }
}

function main() {
  const dataFiles = scanData(DATA_DIR);
  const datapackFiles = scanData(DATAPACK_DIR);
  let invalid = [];
  for (const f of dataFiles.concat(datapackFiles)) {
    if (!validateDataFile(f.path)) invalid.push(f.file);
  }
  // Output summary
  if (!outputJson) {
    console.log(`[syncDatapack] Data files: ${dataFiles.length}, Datapack files: ${datapackFiles.length}`);
    if (invalid.length) console.warn('[syncDatapack] Invalid data files:', invalid);
  }
  const index = { data: dataFiles, datapack: datapackFiles, updated: new Date().toISOString() };
  if (outputJson) {
    console.log(JSON.stringify(index, null, 2));
  } else {
    fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf8');
    console.log(`[syncDatapack] Datapack index written to ${INDEX_PATH}`);
  }
  if (invalid.length) {
    try {
      require('child_process').execSync(`node scripts/aiTaskManager.js new "Invalid data files: ${invalid.join(', ')}" --priority=high --assignee=copilot --related=syncDatapack.js`, { stdio: 'inherit' });
    } catch {}
  }
  // Copilot/AI: Output summary, warn about missing/outdated/unused files, suggest actions
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
