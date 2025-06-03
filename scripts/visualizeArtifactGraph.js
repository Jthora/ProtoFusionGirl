// visualizeArtifactGraph.js
// Usage: node scripts/visualizeArtifactGraph.js > artifact_graph.dot
// Onboarding: Outputs a Graphviz DOT file visualizing artifact dependency/importance graph (foundational vs. advanced artifacts, onboarding order).

const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');

function getArtifactHeaders() {
  const files = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.endsWith('.artifact'));
  const headers = {};
  for (const file of files) {
    const content = fs.readFileSync(path.join(ARTIFACTS_DIR, file), 'utf8');
    const headerMatch = content.match(/---([\s\S]*?)---/);
    if (!headerMatch) continue;
    const header = headerMatch[1];
    const meta = {};
    header.split('\n').forEach(line => {
      const m = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
      if (m) {
        let [_, key, value] = m;
        if (key === 'related') {
          try {
            value = JSON.parse(value.replace(/'/g, '"'));
          } catch {
            value = value.match(/\w+\.artifact/g) || [];
          }
        }
        meta[key] = value;
      }
    });
    headers[file] = meta;
  }
  return headers;
}

function main() {
  const headers = getArtifactHeaders();
  console.log('digraph ArtifactGraph {');
  // Node styling: foundational = blue, advanced = orange, onboarding = green, memory = purple, todo = red, feedback = gray
  for (const [file, meta] of Object.entries(headers)) {
    let color = 'gray';
    if (meta.type === 'onboarding') color = 'green';
    else if (meta.type === 'memory') color = 'purple';
    else if (meta.type === 'todo') color = 'red';
    else if (meta.type === 'feedback' || meta.type === 'retrospective') color = 'gray';
    else if (meta.type === 'state' || meta.type === 'index' || meta.type === 'directory') color = 'blue';
    else color = 'orange';
    console.log(`  "${file}" [style=filled, fillcolor=${color}];`);
  }
  for (const [file, meta] of Object.entries(headers)) {
    if (meta.related && Array.isArray(meta.related)) {
      for (const rel of meta.related) {
        if (headers[rel]) {
          console.log(`  "${file}" -> "${rel}";`);
        }
      }
    }
  }
  console.log('}');
}

if (require.main === module) {
  main();
}
