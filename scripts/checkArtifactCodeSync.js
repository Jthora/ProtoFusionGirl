// checkArtifactCodeSync.js
// Usage: node scripts/checkArtifactCodeSync.js
// Onboarding: Scans code for artifact references, checks if referenced artifacts exist and are current, and reports unused or outdated artifacts.

import fs from 'fs';
import path from 'path';

const CODE_DIRS = [
  path.join(__dirname, '../src'),
];
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

function getBaseArtifactName(filename) {
  // Remove version/timestamp suffix if present
  return filename.replace(/(_\d{8}T\d{6,})?\.artifact$/, '.artifact');
}

function getLatestArtifactVersions(artifactFiles) {
  // Map: baseName.artifact -> latest version filename
  const latest = {};
  for (const f of artifactFiles) {
    const base = getBaseArtifactName(f);
    if (!latest[base]) {
      latest[base] = f;
    } else {
      // Compare timestamps if present
      const ts1 = f.match(/_(\d{8}T\d{6,})/);
      const ts2 = latest[base].match(/_(\d{8}T\d{6,})/);
      if (ts1 && (!ts2 || ts1[1] > ts2[1])) {
        latest[base] = f;
      }
    }
  }
  return latest;
}

function main() {
  const codeFiles = CODE_DIRS.flatMap(dir =>
    fs.existsSync(dir) ? getAllFiles(dir, ['.ts', '.js', '.json']) : []
  );
  const artifactFilesArr = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.endsWith('.artifact'));
  const artifactFiles = new Set(artifactFilesArr);
  const referencedArtifacts = new Set();
  const missing = [];
  const found = [];
  const outdated = [];

  // Find latest version for each artifact base name
  const latestVersions = getLatestArtifactVersions(artifactFilesArr);

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      let match;
      while ((match = ARTIFACT_REF_REGEX.exec(line))) {
        const artifact = match[1];
        referencedArtifacts.add(artifact);
        if (artifactFiles.has(artifact)) {
          // Check if this is the latest version
          const base = getBaseArtifactName(artifact);
          if (artifact !== latestVersions[base]) {
            outdated.push({ file, artifact, latest: latestVersions[base], line: idx + 1 });
          }
          found.push({ file, artifact, line: idx + 1 });
        } else {
          missing.push({ file, artifact, line: idx + 1 });
        }
      }
    });
  }

  // Unused artifacts: in artifacts/ but not referenced
  const unused = Array.from(artifactFiles).filter(f => !referencedArtifacts.has(f));

  console.log('Artifact Reference Sync Report:');
  if (found.length) {
    console.log('\nValid references:');
    found.forEach(r => console.log(`  ✓ ${r.artifact} in ${r.file}:${r.line}`));
  }
  if (outdated.length) {
    console.log('\nOutdated artifact references (not latest version):');
    outdated.forEach(r => console.log(`  ! ${r.artifact} in ${r.file}:${r.line} (latest: ${r.latest})`));
  }
  if (missing.length) {
    console.log('\nMissing artifact references:');
    missing.forEach(r => console.log(`  ✗ ${r.artifact} in ${r.file}:${r.line}`));
  } else {
    console.log('\nNo missing artifact references.');
  }
  if (unused.length) {
    console.log('\nUnused artifacts (not referenced in code):');
    unused.forEach(f => console.log(`  • ${f}`));
  } else {
    console.log('\nNo unused artifacts.');
  }
  // Summary
  console.log(`\nSummary: ${found.length} valid, ${outdated.length} outdated, ${missing.length} missing, ${unused.length} unused artifacts.`);
}

if (require.main === module) {
  main();
}
