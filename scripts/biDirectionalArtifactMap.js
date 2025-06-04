// biDirectionalArtifactMap.js
// Usage: node scripts/biDirectionalArtifactMap.js
// Onboarding: Lists, for each artifact, all code files that reference it, and for each code file, all artifacts it references. Optionally, updates artifact headers with "referenced_by" fields.

import fs from 'fs';
import path from 'path';

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

function printHelp() {
  console.log(`\nUsage: node scripts/biDirectionalArtifactMap.js [--json] [--help]\n`);
  console.log('Onboarding: Lists, for each artifact, all code files that reference it, and for each code file, all artifacts it references. Optionally, updates artifact headers with "referenced_by" fields.');
  console.log('\nOptions:');
  console.log('  --json   Output result in machine-readable JSON format.');
  console.log('  --help   Show this help message.');
}

const args = process.argv.slice(2);
if (args.includes('--help')) {
  printHelp();
  process.exit(0);
}
const outputJson = args.includes('--json');

function main() {
  const artifactFiles = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.endsWith('.artifact'));
  const codeFiles = getAllFiles(CODE_DIR, ['.ts', '.js', '.json']);

  // Map: artifact -> [code files]
  const artifactToCode = {};
  // Map: code file -> [artifacts]
  const codeToArtifact = {};

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = ARTIFACT_REF_REGEX.exec(content))) {
      const artifact = match[1];
      if (!artifactToCode[artifact]) artifactToCode[artifact] = [];
      artifactToCode[artifact].push(file);
      if (!codeToArtifact[file]) codeToArtifact[file] = [];
      codeToArtifact[file].push(artifact);
    }
  }

  if (outputJson) {
    console.log(JSON.stringify({ artifactToCode, codeToArtifact, usage: 'node scripts/biDirectionalArtifactMap.js [--json] [--help]' }, null, 2));
  } else {
    console.log('Bi-Directional Artifact/Code Reference Map:\n');
    console.log('Artifacts referenced by code:');
    for (const artifact of artifactFiles) {
      const refs = artifactToCode[artifact] || [];
      console.log(`- ${artifact}:`);
      if (refs.length) {
        refs.forEach(f => console.log(`    <- ${f}`));
      } else {
        console.log('    (no code references)');
      }
    }
    console.log('\nCode files referencing artifacts:');
    for (const file of Object.keys(codeToArtifact)) {
      console.log(`- ${file}:`);
      codeToArtifact[file].forEach(a => console.log(`    -> ${a}`));
    }
  }
}

if (require.main === module) {
  main();
}
