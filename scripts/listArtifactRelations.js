// listArtifactRelations.js
// Script to parse artifact headers and output a relationship map/list

// Usage: node scripts/listArtifactRelations.js
// Onboarding: Outputs a relationship map/list of artifact dependencies and cross-links for context expansion.

const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');

function parseHeader(fileContent) {
  const headerMatch = fileContent.match(/---([\s\S]*?)---/);
  if (!headerMatch) return null;
  const header = headerMatch[1];
  const lines = header.split('\n');
  const meta = {};
  let currentKey = null;
  let currentValue = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const m = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (m) {
      if (currentKey) {
        meta[currentKey] = currentValue.trim();
      }
      currentKey = m[1];
      currentValue = m[2];
    } else if (currentKey) {
      currentValue += ' ' + line;
    }
  }
  if (currentKey) {
    meta[currentKey] = currentValue.trim();
  }
  // Parse related as array
  if (meta.related) {
    try {
      meta.related = JSON.parse(meta.related.replace(/'/g, '"'));
    } catch {
      // fallback: try to extract artifact names from string
      meta.related = meta.related.match(/\w+\.artifact/g) || [];
    }
  } else {
    meta.related = [];
  }
  return meta;
}

function printHelp() {
  console.log(`\nUsage: node scripts/listArtifactRelations.js [--json] [--help]\n`);
  console.log('Onboarding: Outputs a relationship map/list of artifact dependencies and cross-links for context expansion.');
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
  const files = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.endsWith('.artifact'));
  const relations = {};
  const artifactNames = {};

  for (const file of files) {
    const content = fs.readFileSync(path.join(ARTIFACTS_DIR, file), 'utf8');
    const meta = parseHeader(content);
    if (meta && meta.artifact) {
      artifactNames[file] = meta.artifact;
      relations[file] = meta.related || [];
    }
  }

  if (outputJson) {
    console.log(JSON.stringify(relations, null, 2));
  } else {
    // Output as a simple relationship list
    console.log('Artifact Relationship Map:');
    for (const [file, related] of Object.entries(relations)) {
      const name = artifactNames[file] || file;
      console.log(`- ${name} (${file}):`);
      if (related && related.length) {
        for (const rel of related) {
          // Try to resolve to artifact name if possible
          const relFile = files.find(f => f === rel) || rel;
          const relName = artifactNames[relFile] || rel;
          console.log(`    -> ${relName} (${rel})`);
        }
      } else {
        console.log('    (no related artifacts)');
      }
    }
  }
}

if (require.main === module) {
  main();
}
