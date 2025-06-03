// versionArtifact.js
// Usage: node scripts/versionArtifact.js <artifact-filename>
// Onboarding: Copies the artifact to a versioned filename and optionally updates a version field in the header for version control.

const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
}

function versionArtifact(filename) {
  const srcPath = path.join(ARTIFACTS_DIR, filename);
  if (!fs.existsSync(srcPath)) {
    console.error('Artifact not found:', filename);
    process.exit(1);
  }
  const content = fs.readFileSync(srcPath, 'utf8');
  const timestamp = getTimestamp();
  const ext = path.extname(filename);
  const base = filename.replace(ext, '');
  const versionedName = `${base}_${timestamp}${ext}`;
  const destPath = path.join(ARTIFACTS_DIR, versionedName);

  // Optionally update version in header
  let newContent = content.replace(/(---[\s\S]*?)(---)/, (match, p1, p2) => {
    if (/version:/i.test(p1)) {
      return p1.replace(/version:.*/i, `version: ${timestamp}`) + p2;
    } else {
      return p1 + `version: ${timestamp}\n` + p2;
    }
  });

  fs.writeFileSync(destPath, newContent, 'utf8');
  console.log(`Versioned artifact created: ${versionedName}`);
}

function printHelp() {
  console.log(`\nUsage: node scripts/versionArtifact.js <artifact-filename> [--json] [--help]\n`);
  console.log('Onboarding: Copies the artifact to a versioned filename and optionally updates a version field in the header for version control.');
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
if (require.main === module) {
  const filename = filtered[0];
  if (!filename) {
    if (outputJson) {
      console.log(JSON.stringify({ error: 'Missing artifact-filename', usage: 'node scripts/versionArtifact.js <artifact-filename> [--json] [--help]' }, null, 2));
    } else {
      printHelp();
    }
    process.exit(1);
  }
  const srcPath = path.join(ARTIFACTS_DIR, filename);
  if (!fs.existsSync(srcPath)) {
    if (outputJson) {
      console.log(JSON.stringify({ error: 'Artifact not found', filename }, null, 2));
    } else {
      console.error('Artifact not found:', filename);
    }
    process.exit(1);
  }
  const content = fs.readFileSync(srcPath, 'utf8');
  const timestamp = getTimestamp();
  const ext = path.extname(filename);
  const base = filename.replace(ext, '');
  const versionedName = `${base}_${timestamp}${ext}`;
  const destPath = path.join(ARTIFACTS_DIR, versionedName);
  let newContent = content.replace(/(---[\s\S]*?)(---)/, (match, p1, p2) => {
    if (/version:/i.test(p1)) {
      return p1.replace(/version:.*/i, `version: ${timestamp}`) + p2;
    } else {
      return p1 + `version: ${timestamp}\n` + p2;
    }
  });
  fs.writeFileSync(destPath, newContent, 'utf8');
  if (outputJson) {
    console.log(JSON.stringify({ versioned: versionedName, timestamp, usage: 'node scripts/versionArtifact.js <artifact-filename> [--json] [--help]' }, null, 2));
  } else {
    console.log(`Versioned artifact created: ${versionedName}`);
  }
}
