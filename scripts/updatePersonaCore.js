// updatePersonaCore.js
// CLI/VS Code task for updating persona_core.json fields with rationale and changelog
import fs from 'fs';
import path from 'path';

const PERSONA_PATH = path.join(__dirname, '../data/persona_core.json');
const persona = JSON.parse(fs.readFileSync(PERSONA_PATH, 'utf8'));

function updateField(field, value, rationale, author = 'unknown') {
  const now = new Date().toISOString();
  persona[field] = value;
  if (!persona.changeLog) persona.changeLog = [];
  persona.changeLog.push({
    field,
    value,
    rationale,
    author,
    timestamp: now
  });
  persona.version = now;
  fs.writeFileSync(PERSONA_PATH, JSON.stringify(persona, null, 2));
  console.log(`Updated ${field} in persona_core.json. Rationale: ${rationale}`);
}

// CLI usage: node scripts/updatePersonaCore.js field value rationale [author]
if (require.main === module) {
  const [,, field, value, rationale, author] = process.argv;
  if (!field || !value || !rationale) {
    console.error('Usage: node scripts/updatePersonaCore.js field value rationale [author]');
    process.exit(1);
  }
  updateField(field, JSON.parse(value), rationale, author);
}
