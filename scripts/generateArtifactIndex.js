#!/usr/bin/env node
// scripts/generateArtifactIndex.js
// Script to auto-generate artifact_index.artifact from artifact headers

// Usage: node scripts/generateArtifactIndex.js
// Onboarding: Auto-generates artifact_index.artifact from artifact headers for discoverability and traceability.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const INDEX_FILE = path.join(ARTIFACTS_DIR, 'artifact_index.artifact');

function parseHeader(content) {
  const headerMatch = content.match(/---([\s\S]*?)---/);
  if (!headerMatch) return null;
  const header = headerMatch[1];
  const lines = header.split('\n').map(l => l.trim()).filter(Boolean);
  const meta = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (!key || rest.length === 0) continue;
    let value = rest.join(':').trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      try { value = JSON.parse(value.replace(/'/g, '"')); } catch { /* fallback */ }
    }
    meta[key.trim()] = value;
  }
  return meta;
}

function main() {
  const files = fs.readdirSync(ARTIFACTS_DIR)
    .filter(f => f.endsWith('.artifact') && f !== 'artifact_index.artifact');
  const index = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(ARTIFACTS_DIR, file), 'utf8');
    const meta = parseHeader(content);
    if (meta) {
      index.push({
        filename: file,
        ...meta
      });
    }
  }
  const output = `---\nartifact: artifact_index\ncreated: ${new Date().toISOString().slice(0,10)}\npurpose: Manifest and metadata index for all artifacts in the folder.\ntype: index\ntags: [index, manifest, automation]\nformat: json\n---\n\n${JSON.stringify(index, null, 2)}\n\n---\n\n(End of artifact)`;
  fs.writeFileSync(INDEX_FILE, output, 'utf8');
  console.log(`Updated ${INDEX_FILE} with ${index.length} artifacts.`);
}

// Replace CommonJS require.main check with ES module equivalent
if (process.argv[1] === fileURLToPath(import.meta.url)) main();
