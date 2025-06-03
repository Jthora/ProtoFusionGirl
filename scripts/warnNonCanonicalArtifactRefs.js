// warnNonCanonicalArtifactRefs.js
// Usage: node scripts/warnNonCanonicalArtifactRefs.js
// Onboarding: Warns if code references a non-canonical (not latest) artifact version.

const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const CODE_DIR = path.join(__dirname, '../protoFusionGirl/src');
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

function getBaseArtifactName(filename) {
  return filename.replace(/(_\d{8}T\d{6,})?\.artifact$/, '.artifact');
}

function getLatestArtifactVersions(artifactFiles) {
  const latest = {};
  for (const f of artifactFiles) {
    const base = getBaseArtifactName(f);
    if (!latest[base]) {
      latest[base] = f;
    } else {
      const ts1 = f.match(/_(\d{8}T\d{6,})/);
      const ts2 = latest[base].match(/_(\d{8}T\d{6,})/);
      if (ts1 && (!ts2 || ts1[1] > ts2[1])) {
        latest[base] = f;
      }
    }
  }
  return latest;
}

function printHelp() {
  console.log(`\nUsage: node scripts/warnNonCanonicalArtifactRefs.js [--json] [--help]\n`);
  console.log('Onboarding: Warns if code references a non-canonical (not latest) artifact version.');
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
  const artifactFilesArr = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.endsWith('.artifact'));
  const artifactFiles = new Set(artifactFilesArr);
  const latestVersions = getLatestArtifactVersions(artifactFilesArr);
  const codeFiles = getAllFiles(CODE_DIR, ['.ts', '.js', '.json']);
  let foundNonCanonical = false;
  const nonCanonicalRefs = [];

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      let match;
      while ((match = ARTIFACT_REF_REGEX.exec(line))) {
        const artifact = match[1];
        const base = getBaseArtifactName(artifact);
        if (artifact !== latestVersions[base]) {
          foundNonCanonical = true;
          const message = `! Non-canonical artifact reference: ${artifact} in ${file}:${idx + 1} (latest: ${latestVersions[base]})`;
          nonCanonicalRefs.push({ artifact, file, line: idx + 1, latest: latestVersions[base] });
          if (!outputJson) {
            console.log(message);
          }
        }
      }
    });
  }
  if (!foundNonCanonical) {
    console.log('All code references are to canonical (latest) artifact versions.');
  } else if (outputJson) {
    console.log(JSON.stringify({ nonCanonicalRefs, usage: 'node scripts/warnNonCanonicalArtifactRefs.js [--json] [--help]' }, null, 2));
  }
}

if (require.main === module) {
  main();
}
