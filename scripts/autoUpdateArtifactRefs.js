// autoUpdateArtifactRefs.js
// Usage: node scripts/autoUpdateArtifactRefs.js <oldArtifactName> <newArtifactName>
// Onboarding: Updates all code references from old artifact name to new artifact name, and warns if the old artifact is still referenced or missing.

const fs = require('fs');
const path = require('path');

const CODE_DIR = path.join(__dirname, '../protoFusionGirl/src');
const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
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
  console.log(`\nUsage: node scripts/autoUpdateArtifactRefs.js <oldArtifactName> <newArtifactName> [--json] [--help]\n`);
  console.log('Onboarding: Updates all code references from old artifact name to new artifact name, and warns if the old artifact is still referenced or missing.');
  console.log('\nOptions:');
  console.log('  --json   Output results and warnings in machine-readable JSON format.');
  console.log('  --help   Show this help message.');
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    printHelp();
    process.exit(0);
  }
  const outputJson = args.includes('--json');
  const filtered = args.filter(a => !a.startsWith('--'));
  const [oldName, newName] = filtered;
  if (!oldName || !newName) {
    if (outputJson) {
      console.log(JSON.stringify({ error: 'Missing arguments', usage: 'node scripts/autoUpdateArtifactRefs.js <oldArtifactName> <newArtifactName> [--json] [--help]' }, null, 2));
    } else {
      printHelp();
    }
    process.exit(1);
  }
  const codeFiles = getAllFiles(CODE_DIR, ['.ts', '.js', '.json']);
  let updated = 0;
  let updatedFiles = [];
  for (const file of codeFiles) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(oldName)) {
      content = content.replace(new RegExp(oldName, 'g'), newName);
      fs.writeFileSync(file, content, 'utf8');
      updated++;
      updatedFiles.push(file);
      if (!outputJson) console.log(`Updated reference in: ${file}`);
    }
  }
  if (!outputJson) {
    if (updated === 0) {
      console.log('No references to update.');
    } else {
      console.log(`\n${updated} file(s) updated.`);
    }
  }
  // Warn if old artifact is still referenced
  let stillReferenced = [];
  for (const file of codeFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(oldName)) {
      stillReferenced.push(file);
      if (!outputJson) console.warn(`WARNING: ${oldName} still referenced in ${file}`);
    }
  }
  // Warn if new artifact does not exist
  let newArtifactMissing = false;
  if (!fs.existsSync(path.join(ARTIFACTS_DIR, newName))) {
    newArtifactMissing = true;
    if (!outputJson) console.warn(`WARNING: New artifact file does not exist: ${newName}`);
  }
  if (outputJson) {
    console.log(JSON.stringify({
      updated,
      updatedFiles,
      stillReferenced,
      newArtifactMissing,
      usage: 'node scripts/autoUpdateArtifactRefs.js <oldArtifactName> <newArtifactName> [--json] [--help]'
    }, null, 2));
  }
}

if (require.main === module) {
  main();
}
