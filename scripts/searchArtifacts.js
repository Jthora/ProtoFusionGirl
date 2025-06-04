// scripts/searchArtifacts.js
// Search artifacts by tag, type, or keyword for rapid context recall
// Usage: node scripts/searchArtifacts.js <tag|type|keyword>
// Onboarding: Searches artifacts by tag, type, or keyword for rapid context recall and onboarding support.

import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const INDEX_FILE = path.join(ARTIFACTS_DIR, 'artifact_index.artifact');

function loadIndex() {
  const content = fs.readFileSync(INDEX_FILE, 'utf8');
  // Find the first line with just '['
  const lines = content.split('\n');
  const startIdx = lines.findIndex(line => line.trim() === '[');
  const endIdx = lines.findIndex(line => line.trim() === ']');
  if (startIdx === -1 || endIdx === -1) throw new Error('Could not find artifact index array.');
  const jsonText = lines.slice(startIdx, endIdx + 1).join('\n');
  return JSON.parse(jsonText);
}

function parseTags(tagsField) {
  if (Array.isArray(tagsField)) return tagsField;
  if (typeof tagsField === 'string') {
    // Try to parse as JSON array string, e.g. '[tag1, tag2]'
    try {
      // Remove whitespace and quotes, split by comma if not valid JSON
      let parsed = JSON.parse(tagsField);
      if (Array.isArray(parsed)) return parsed.map(t => t.trim());
    } catch {
      // Fallback: remove brackets and split
      return tagsField.replace(/^[\[]|[\]]$/g, '').split(',').map(t => t.trim().replace(/^"|"$/g, ''));
    }
  }
  return [];
}

function searchArtifacts({ tag, type, keyword }) {
  const index = loadIndex();
  return index.filter(entry => {
    // Robust tag parsing
    const tags = parseTags(entry.tags);
    if (tag && !tags.includes(tag)) return false;
    if (type && entry.type !== type) return false;
    if (keyword) {
      const haystack = JSON.stringify(entry).toLowerCase();
      if (!haystack.includes(keyword.toLowerCase())) return false;
    }
    return true;
  });
}

// CLI usage: node scripts/searchArtifacts.js [--tag tag] [--type type] [--keyword keyword]
const args = process.argv.slice(2);
const params = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--tag') params.tag = args[++i];
  if (args[i] === '--type') params.type = args[++i];
  if (args[i] === '--keyword') params.keyword = args[++i];
}

const results = searchArtifacts(params);
if (results.length === 0) {
  console.log('No artifacts found for query:', params);
} else {
  console.log('Artifacts found:');
  results.forEach(a => {
    console.log(`- ${a.filename} [type: ${a.type}, tags: ${a.tags}]\n  purpose: ${a.purpose}`);
  });
}
