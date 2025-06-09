#!/usr/bin/env node
// Script: summarize-directory-structure.cjs
// Summarizes directory-structure.txt into a concise JSON for Copilot skimming (max ~60 lines)

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, 'directory-structure.txt');
const OUTPUT = path.join(__dirname, 'directory-structure-summary.json');
const MAX_LINES = 60;

function summarizeDirectoryStructure(inputFile, maxLines) {
  const lines = fs.readFileSync(inputFile, 'utf-8').split('\n');
  const summary = {
    topLevelFiles: [],
    topLevelDirs: {},
    note: 'This summary is truncated for Copilot context window. Only top-level and a few sub-items are shown.'
  };
  let fileCount = 0;
  let dirCount = 0;
  let inTopLevel = true;
  for (let i = 0; i < lines.length && fileCount + dirCount < maxLines - 5; i++) {
    const line = lines[i].trim();
    if (line.startsWith('├──') || line.startsWith('└──')) {
      const name = line.replace(/^├── |^└── /, '');
      if (!line.includes('/')) {
        // Top-level file or dir
        if (name.endsWith('/')) {
          // Directory
          if (dirCount < 10) {
            summary.topLevelDirs[name.replace(/\/$/, '')] = [];
            dirCount++;
          }
        } else {
          if (fileCount < 10) {
            summary.topLevelFiles.push(name);
            fileCount++;
          }
        }
      } else if (dirCount > 0 && Object.keys(summary.topLevelDirs).length > 0) {
        // Sub-item (show only a few per dir)
        const parts = line.split('/');
        if (parts.length === 2) {
          const dir = parts[0].replace(/^├── |^└── /, '');
          const sub = parts[1].replace(/^├── |^└── /, '');
          const dirKey = Object.keys(summary.topLevelDirs).find(d => dir.startsWith(d));
          if (dirKey && summary.topLevelDirs[dirKey].length < 3) {
            summary.topLevelDirs[dirKey].push(sub);
          }
        }
      }
    }
  }
  return summary;
}

const summary = summarizeDirectoryStructure(INPUT, MAX_LINES);
fs.writeFileSync(OUTPUT, JSON.stringify(summary, null, 2));
console.log(`Summary written to ${OUTPUT}`);
