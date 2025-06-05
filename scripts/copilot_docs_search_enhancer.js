// copilot_docs_search_enhancer.js
// Enhanced Documentation Search Script
// Usage: node scripts/copilot_docs_search_enhancer.js <query> [--output <json|md|txt>] [--file <filename>]

import fs from 'fs';
import path from 'path';

const docsIndexPath = path.join('docs', 'docs_index.json');

function searchDocs(query, fileFilter) {
  if (!fs.existsSync(docsIndexPath)) {
    console.error('docs_index.json not found. Run Update Docs Index first.');
    process.exit(1);
  }
  const docsIndex = JSON.parse(fs.readFileSync(docsIndexPath, 'utf-8'));
  let results = docsIndex.filter(entry =>
    (!fileFilter || entry.file.includes(fileFilter)) &&
    (entry.headings.some(h => h.text.toLowerCase().includes(query.toLowerCase())) ||
     entry.summary.toLowerCase().includes(query.toLowerCase()))
  );
  return results;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/copilot_docs_search_enhancer.js <query> [--output <json|md|txt>] [--file <filename>]');
    process.exit(1);
  }
  const query = args[0];
  let output = args.includes('--output') ? args[args.indexOf('--output') + 1] : 'txt';
  let fileFilter = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;
  const results = searchDocs(query, fileFilter);
  if (results.length === 0) {
    console.log('No results found.');
    return;
  }
  if (output === 'json') {
    fs.writeFileSync('docs_search_results.json', JSON.stringify(results, null, 2));
    console.log('Wrote docs_search_results.json');
  } else if (output === 'md') {
    const md = results.map(r => `### ${r.file}\n${r.summary}\n${r.headings.map(h => `- ${'#'.repeat(h.level)} ${h.text}`).join('\n')}`).join('\n\n');
    fs.writeFileSync('docs_search_results.md', md);
    console.log('Wrote docs_search_results.md');
  } else {
    const txt = results.map(r => `${r.file}: ${r.summary}`).join('\n');
    fs.writeFileSync('docs_search_results.txt', txt);
    console.log('Wrote docs_search_results.txt');
  }
}

main();
