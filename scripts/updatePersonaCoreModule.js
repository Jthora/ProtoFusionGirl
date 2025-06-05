// scripts/updatePersonaCoreModule.js
// Update a Persona Core module, log to changelog, and support review workflow.

const fs = require('fs');
const path = require('path');

const PERSONA_CORE_DIR = path.join(__dirname, '../persona_core');
const CHANGELOG_PATH = path.join(PERSONA_CORE_DIR, 'changelog.json');

function logChangelog(module, oldValue, newValue, author, rationale) {
  let changelog = [];
  if (fs.existsSync(CHANGELOG_PATH)) {
    changelog = JSON.parse(fs.readFileSync(CHANGELOG_PATH, 'utf8'));
  }
  changelog.push({
    date: new Date().toISOString(),
    module,
    oldValue,
    newValue,
    author,
    rationale
  });
  fs.writeFileSync(CHANGELOG_PATH, JSON.stringify(changelog, null, 2), 'utf8');
}

function main() {
  const [,, module, author, rationale, newValueFile] = process.argv;
  if (!module || !author || !rationale || !newValueFile) {
    console.error('Usage: node scripts/updatePersonaCoreModule.js <module> <author> <rationale> <newValueFile>');
    process.exit(1);
  }
  const modulePath = path.join(PERSONA_CORE_DIR, module);
  if (!fs.existsSync(modulePath)) {
    console.error('Module not found:', modulePath);
    process.exit(1);
  }
  const oldValue = fs.readFileSync(modulePath, 'utf8');
  const newValue = fs.readFileSync(newValueFile, 'utf8');
  // Write new value
  fs.writeFileSync(modulePath, newValue, 'utf8');
  // Log changelog
  logChangelog(module, oldValue, newValue, author, rationale);
  console.log(`Module ${module} updated and changelog entry created.`);
}

if (require.main === module) {
  main();
}
