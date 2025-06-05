// scripts/validateSchemas.js
// Validates foundational files against the .schema definition

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const SCHEMA_FILE = path.join(__dirname, '../.schema');
const ROOT = path.join(__dirname, '..');

function loadYAMLorMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Extract YAML frontmatter if present
  const match = content.match(/^---[\s\S]*?---/);
  if (match) {
    return yaml.load(match[0].replace(/^---|---$/g, ''));
  }
  // Try parsing as YAML
  try {
    return yaml.load(content);
  } catch {
    return null;
  }
}

function validateFile(filePath, schemaFields) {
  const data = loadYAMLorMarkdown(filePath);
  if (!data) return [`Could not parse: ${filePath}`];
  const missing = schemaFields.filter(f => !(f in data));
  return missing.length ? [`${filePath} missing fields: ${missing.join(', ')}`] : [];
}

function main() {
  const schema = loadYAMLorMarkdown(SCHEMA_FILE);
  if (!schema) {
    console.error('Could not load .schema');
    process.exit(1);
  }
  let errors = [];
  for (const [fileType, fields] of Object.entries(schema)) {
    // Find all files of this type in root
    const files = fs.readdirSync(ROOT).filter(f => f.endsWith(fileType));
    for (const file of files) {
      errors.push(...validateFile(path.join(ROOT, file), fields));
    }
  }
  if (errors.length) {
    console.error('Schema validation errors:');
    errors.forEach(e => console.error(e));
    process.exit(1);
  } else {
    console.log('All foundational files are schema-compliant.');
  }
}

if (require.main === module) main();
