// scripts/suggestDocsTasks.js
// Scans docs_index.json for missing summaries or TODOs and auto-generates .task files for documentation improvements.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_INDEX_PATH = path.join(__dirname, '../docs/docs_index.json');
const TASKS_DIR = path.join(__dirname, '../tasks');

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function main() {
  if (!fs.existsSync(DOCS_INDEX_PATH)) {
    console.error('docs_index.json not found. Run indexDocs.js first.');
    process.exit(1);
  }
  const docsIndex = JSON.parse(fs.readFileSync(DOCS_INDEX_PATH, 'utf8'));
  let count = 0;
  for (const doc of docsIndex.docs) {
    if (!doc.summary || /todo|tbd|fixme/i.test(doc.summary)) {
      const taskFile = path.join(TASKS_DIR, `doc_improve_${slugify(path.basename(doc.file))}.task`);
      if (!fs.existsSync(taskFile)) {
        const content = {
          title: `Improve documentation: ${doc.file}`,
          description: `Add or improve summary/sections for ${doc.file}. Current summary: '${doc.summary || 'None'}'`,
          status: 'todo',
          priority: 'medium',
          relatedDocs: [doc.file],
          created: new Date().toISOString()
        };
        fs.writeFileSync(taskFile, JSON.stringify(content, null, 2));
        count++;
      }
    }
  }
  console.log(`Suggested ${count} documentation improvement tasks.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
