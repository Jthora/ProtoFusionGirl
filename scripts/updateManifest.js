// updateManifest.js
// Usage: node scripts/updateManifest.js [--json] [--auto-commit]
// Onboarding: Updates the .manifest file to reflect the current state of all key files, artifacts, scripts, and folders.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MANIFEST_PATH = path.join(__dirname, '../.manifest');
const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const SCRIPTS_DIR = path.join(__dirname);
const DOCS_DIR = path.join(__dirname, '../docs');
const DATA_DIR = path.join(__dirname, '../data');

const outputJson = process.argv.includes('--json');
const autoCommit = process.argv.includes('--auto-commit');

function scanDir(dir, filter) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(filter).map(f => path.join(dir, f));
}

if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/updateManifest.js [--json] [--auto-commit]');
  console.log('Updates the .manifest file to reflect the current state of all key files, artifacts, scripts, and folders.');
  process.exit(0);
}

function diffSummary(oldManifest, newManifest) {
  // Print added/removed files for each section
  const summary = [];
  for (const key of Object.keys(newManifest)) {
    if (Array.isArray(newManifest[key]) && oldManifest && Array.isArray(oldManifest[key])) {
      const added = newManifest[key].filter(x => !oldManifest[key].includes(x));
      const removed = oldManifest[key].filter(x => !newManifest[key].includes(x));
      if (added.length) summary.push(`[+] ${key}: ${added.join(', ')}`);
      if (removed.length) summary.push(`[-] ${key}: ${removed.join(', ')}`);
    }
  }
  return summary;
}

function main() {
  let oldManifest = null;
  if (fs.existsSync(MANIFEST_PATH)) {
    try { oldManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')); } catch {}
  }
  const manifest = {
    artifacts: scanDir(ARTIFACTS_DIR, f => f.endsWith('.artifact')),
    scripts: scanDir(SCRIPTS_DIR, f => f.endsWith('.js')),
    docs: scanDir(DOCS_DIR, f => f.endsWith('.md') || f.endsWith('.json')),
    data: scanDir(DATA_DIR, f => !f.startsWith('.')),
    updated: new Date().toISOString()
  };
  // No schema validation for artifacts/scripts
  if (outputJson) {
    console.log(JSON.stringify(manifest, null, 2));
  } else {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`[updateManifest] .manifest updated at ${MANIFEST_PATH}`);
    if (oldManifest) {
      const summary = diffSummary(oldManifest, manifest);
      if (summary.length) console.log('[updateManifest] Diff summary:', summary.join(' | '));
    }
  }
  if (autoCommit) {
    try {
      require('child_process').execSync('git add ../.manifest && git commit -m "Update manifest"', { stdio: 'inherit' });
      console.log('[updateManifest] Auto-committed manifest changes.');
    } catch (e) {
      console.warn('[updateManifest] Auto-commit failed:', e.message);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
