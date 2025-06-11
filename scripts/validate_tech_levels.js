// validate_tech_levels.js
// Script to validate tech_levels.json for modding best practices and artifact compliance
const fs = require('fs');
const path = require('path');

const techLevelsPath = path.join(__dirname, '../src/world/tech/tech_levels.json');
const techLevels = JSON.parse(fs.readFileSync(techLevelsPath, 'utf-8'));

let valid = true;
const ids = new Set();

for (const level of techLevels) {
  if (!level.id || !level.name) {
    console.error(`Tech level missing id or name:`, level);
    valid = false;
  }
  if (ids.has(level.id)) {
    console.error(`Duplicate tech level id: ${level.id}`);
    valid = false;
  }
  ids.add(level.id);
  if (!Array.isArray(level.advancementTriggers) || !Array.isArray(level.regressionTriggers)) {
    console.error(`Tech level ${level.id} missing advancement/regression triggers array.`);
    valid = false;
  }
  // Check for narrative/gameplay context
  if (!level.description || !level.gameplayUnlocks) {
    console.error(`Tech level ${level.id} missing description or gameplayUnlocks.`);
    valid = false;
  }
}

if (valid) {
  console.log('All tech levels are valid and artifact-compliant.');
  process.exit(0);
} else {
  console.error('Tech level validation failed. See errors above.');
  process.exit(1);
}
