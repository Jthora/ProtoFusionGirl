// listOrDiffArtifactVersions.js
// Usage: node scripts/listOrDiffArtifactVersions.js <artifact-base-name> [<version1> <version2>]
// Onboarding: Lists all versions of an artifact or diffs two versions for version control and traceability.

// Lists all versions of an artifact, or diffs two versions if both are provided.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');

function printHelp() {
  console.log(`\nUsage: node scripts/listOrDiffArtifactVersions.js <artifact-base-name> [<version1> <version2>] [--json] [--help]\n`);
  console.log('Onboarding: Lists all versions of an artifact or diffs two versions for version control and traceability.');
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
const filtered = args.filter(a => !a.startsWith('--'));
function listVersions(baseName) {
  const files = fs.readdirSync(ARTIFACTS_DIR)
    .filter(f => f.startsWith(baseName) && f.endsWith('.artifact'))
    .sort();
  if (outputJson) {
    console.log(JSON.stringify({ baseName, versions: files, usage: 'node scripts/listOrDiffArtifactVersions.js <artifact-base-name> [<version1> <version2>] [--json] [--help]' }, null, 2));
    return;
  }
  if (files.length === 0) {
    console.log('No versions found for', baseName);
    return;
  }
  console.log(`Versions for ${baseName}:`);
  files.forEach(f => console.log('  -', f));
}
function diffVersions(baseName, v1, v2) {
  const file1 = path.join(ARTIFACTS_DIR, v1);
  const file2 = path.join(ARTIFACTS_DIR, v2);
  if (!fs.existsSync(file1) || !fs.existsSync(file2)) {
    if (outputJson) {
      console.log(JSON.stringify({ error: 'One or both version files do not exist.', v1, v2 }, null, 2));
    } else {
      console.error('One or both version files do not exist.');
    }
    process.exit(1);
  }
  try {
    const diff = execSync(`diff -u "${file1}" "${file2}"`, { encoding: 'utf8' });
    if (outputJson) {
      console.log(JSON.stringify({ baseName, v1, v2, diff, usage: 'node scripts/listOrDiffArtifactVersions.js <artifact-base-name> [<version1> <version2>] [--json] [--help]' }, null, 2));
    } else {
      console.log(diff);
    }
  } catch (e) {
    if (outputJson) {
      console.log(JSON.stringify({ baseName, v1, v2, diff: e.stdout || '', usage: 'node scripts/listOrDiffArtifactVersions.js <artifact-base-name> [<version1> <version2>] [--json] [--help]' }, null, 2));
    } else if (e.stdout) {
      console.log(e.stdout);
    } else {
      console.log('No differences or diff error.');
    }
  }
}
if (require.main === module) {
  const [baseName, v1, v2] = filtered;
  if (!baseName) {
    if (outputJson) {
      console.log(JSON.stringify({ error: 'Missing artifact-base-name', usage: 'node scripts/listOrDiffArtifactVersions.js <artifact-base-name> [<version1> <version2>] [--json] [--help]' }, null, 2));
    } else {
      printHelp();
    }
    process.exit(1);
  }
  if (v1 && v2) {
    diffVersions(baseName, v1, v2);
  } else {
    listVersions(baseName);
  }
}
