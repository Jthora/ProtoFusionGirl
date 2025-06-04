#!/usr/bin/env node
// scripts/snapshotDirectory.js
// Script to generate a snapshot of the project directory structure as an artifact

// Usage: node scripts/snapshotDirectory.js
// Onboarding: Captures a snapshot of the directory structure for traceability and onboarding.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
const ARTIFACTS_DIR = path.join(ROOT, 'artifacts');
const now = new Date();
const dateStr = now.toISOString().slice(0, 10);
const artifactName = `directory_structure_${dateStr}.artifact`;
const artifactPath = path.join(ARTIFACTS_DIR, artifactName);

function walk(dir, prefix = '') {
  let tree = '';
  const files = fs.readdirSync(dir).filter(f => !f.startsWith('.') && f !== 'node_modules' && f !== 'coverage');
  files.sort();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(dir, file);
    const isDir = fs.statSync(fullPath).isDirectory();
    const connector = (i === files.length - 1) ? '└── ' : '├── ';
    tree += prefix + connector + file + (isDir ? '/' : '') + '\n';
    if (isDir) {
      tree += walk(fullPath, prefix + (i === files.length - 1 ? '    ' : '│   '));
    }
  }
  return tree;
}

const header = `---\nartifact: directory_structure_${dateStr}\ncreated: ${dateStr}\npurpose: Snapshot of the full project directory structure for context and change tracking.\ntype: directory\ntags: [directory, structure, snapshot, context]\nformat: markdown\n---\n`;
const tree = '/ (root)\n' + walk(ROOT);
const footer = '\n---\n\n(End of artifact)';

fs.writeFileSync(artifactPath, header + '\n' + tree + footer, 'utf8');
console.log(`Directory structure snapshot saved to ${artifactPath}`);
