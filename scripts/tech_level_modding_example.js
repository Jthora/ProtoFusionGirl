// Example script for modders: Add a new tech level to tech_levels.json
// Usage: node scripts/tech_level_modding_example.js <id> <name> <description>
const fs = require('fs');
const path = require('path');

const techLevelsPath = path.join(__dirname, '../src/world/tech/tech_levels.json');
const [,, id, name, description] = process.argv;

if (!id || !name || !description) {
  console.error('Usage: node scripts/tech_level_modding_example.js <id> <name> <description>');
  process.exit(1);
}

const newTechLevel = {
  id,
  name,
  type: 'Custom',
  era: 'Custom',
  sphere: 'Custom',
  age: 'Custom',
  description,
  gameplayUnlocks: [],
  advancementTriggers: [],
  regressionTriggers: [],
  risks: [],
  relatedArtifacts: []
};

const techLevels = JSON.parse(fs.readFileSync(techLevelsPath, 'utf-8'));
techLevels.push(newTechLevel);
fs.writeFileSync(techLevelsPath, JSON.stringify(techLevels, null, 2));
console.log(`Added new tech level: ${name}`);
