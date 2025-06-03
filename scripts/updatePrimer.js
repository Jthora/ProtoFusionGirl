// updatePrimer.js
// Updates .primer with recent artifact highlights and latest directory snapshot.
// Usage: node scripts/updatePrimer.js
// Onboarding: Updates the .primer with new onboarding, context, or project state information.

const fs = require('fs');
const path = require('path');

const PRIMER_PATH = path.join(__dirname, '../.primer');
const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');

function getLatestDirectorySnapshot() {
  const files = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.startsWith('directory_structure_') && f.endsWith('.artifact'));
  if (!files.length) return null;
  files.sort(); // lexicographical, so latest is last
  return fs.readFileSync(path.join(ARTIFACTS_DIR, files[files.length - 1]), 'utf8');
}

function getRecentArtifacts(limit = 5) {
  const files = fs.readdirSync(ARTIFACTS_DIR)
    .filter(f => f.endsWith('.artifact'))
    .map(f => ({
      name: f,
      mtime: fs.statSync(path.join(ARTIFACTS_DIR, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, limit);
  return files.map(f => f.name);
}

function updateSection(content, sectionTitle, newSection) {
  const regex = new RegExp(`(## ${sectionTitle}[^#]*)`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `## ${sectionTitle}\n${newSection}\n`);
  } else {
    // Append at end
    return content + `\n\n## ${sectionTitle}\n${newSection}\n`;
  }
}

function main() {
  let primer = fs.readFileSync(PRIMER_PATH, 'utf8');
  // Update Recent Artifacts
  const recent = getRecentArtifacts(5).map(f => `- [36m${f}[0m`).join('\n');
  primer = updateSection(primer, 'Recent Artifacts', recent);
  // Update Directory Structure Snapshot
  const dirSnap = getLatestDirectorySnapshot();
  let dirSection = dirSnap ? dirSnap.split('---').pop().trim().slice(0, 1000) : 'No snapshot found.';
  primer = updateSection(primer, 'Directory Structure Snapshot', dirSection);
  fs.writeFileSync(PRIMER_PATH, primer, 'utf8');
  console.log('Primer updated with recent artifacts and directory snapshot.');
}

if (require.main === module) {
  main();
}
