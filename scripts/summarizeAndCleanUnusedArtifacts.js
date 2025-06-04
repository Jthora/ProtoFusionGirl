// summarizeAndCleanUnusedArtifacts.js
// Usage: node scripts/summarizeAndCleanUnusedArtifacts.js [--delete]
// Onboarding: Summarizes unused or deprecated artifacts and optionally prompts for archival or deletion.

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const CODE_DIR = path.join(__dirname, '../src');
const ARTIFACT_REF_REGEX = /artifacts\/(\w[\w\-\d_]*\.artifact)/g;
const EXCLUDE_DIRS = new Set(['coverage', 'docs', 'test', 'tests', 'node_modules', 'public', 'contracts', 'ignition']);

function getAllFiles(dir, exts, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry)) {
        getAllFiles(full, exts, files);
      }
    } else if (exts.some(e => full.endsWith(e))) {
      files.push(full);
    }
  }
  return files;
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

function printHelp() {
  console.log(`\nUsage: node scripts/summarizeAndCleanUnusedArtifacts.js [--delete] [--json] [--help]\n`);
  console.log('Onboarding: Summarizes unused or deprecated artifacts and optionally prompts for archival or deletion.');
  console.log('\nOptions:');
  console.log('  --delete  Prompt to delete unused artifacts.');
  console.log('  --json    Output result in machine-readable JSON format.');
  console.log('  --help    Show this help message.');
}

const args = process.argv.slice(2);
if (args.includes('--help')) {
  printHelp();
  process.exit(0);
}
const outputJson = args.includes('--json');

async function main() {
  const codeFiles = getAllFiles(CODE_DIR, ['.ts', '.js', '.json']);
  const artifactFiles = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.endsWith('.artifact'));
  const referencedArtifacts = new Set();

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = ARTIFACT_REF_REGEX.exec(content))) {
      referencedArtifacts.add(match[1]);
    }
  }

  const unused = artifactFiles.filter(f => !referencedArtifacts.has(f));
  if (!unused.length) {
    console.log('No unused artifacts found.');
    return;
  }
  console.log('Unused artifacts:');
  unused.forEach(f => console.log('  •', f));

  if (outputJson) {
    console.log(JSON.stringify({ unusedArtifacts, usage: 'node scripts/summarizeAndCleanUnusedArtifacts.js [--delete] [--json] [--help]' }, null, 2));
    if (args.includes('--delete')) {
      // Deletion is interactive, so just note that deletion is not supported in JSON mode
      console.log(JSON.stringify({ warning: 'Deletion is not supported in --json mode. Run without --json to delete interactively.' }, null, 2));
    }
    return;
  }

  if (process.argv.includes('--delete')) {
    for (const f of unused) {
      const ans = await prompt(`Delete ${f}? (y/N): `);
      if (ans.trim().toLowerCase() === 'y') {
        fs.unlinkSync(path.join(ARTIFACTS_DIR, f));
        console.log(`Deleted: ${f}`);
      }
    }
  } else {
    console.log('\nRun with --delete to interactively delete unused artifacts.');
  }
}

if (require.main === module) {
  main();
}
