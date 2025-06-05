// copilot_content_consistency_checker.js
// Checks for consistency between artifact files and code for missions, events, and threats
// Usage: node scripts/copilot_content_consistency_checker.js [--type <mission|event|threat>] [--output <json|txt>]

import fs from 'fs';
import path from 'path';

const artifactDirs = [
  'artifacts/',
];
const codeDirs = [
  'src/world/missions/',
  'src/world/events/',
  'src/world/threats/'
];

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(ext));
}

function scanArtifacts(type) {
  let files = [];
  artifactDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    files = files.concat(fs.readdirSync(dir).filter(f => f.includes(type)));
  });
  return files;
}

function scanCode(type) {
  const dir = type === 'mission' ? codeDirs[0] : type === 'event' ? codeDirs[1] : codeDirs[2];
  return listFiles(dir, '.ts');
}

function main() {
  const args = process.argv.slice(2);
  let type = args.includes('--type') ? args[args.indexOf('--type') + 1] : null;
  let output = args.includes('--output') ? args[args.indexOf('--output') + 1] : 'txt';
  const types = type ? [type] : ['mission', 'event', 'threat'];
  let report = '';
  types.forEach(t => {
    const artifacts = scanArtifacts(t);
    const code = scanCode(t);
    const missingInCode = artifacts.filter(a => !code.some(c => c.includes(a.replace('.artifact', ''))));
    const missingInArtifacts = code.filter(c => !artifacts.some(a => c.includes(a.replace('.artifact', ''))));
    report += `Type: ${t}\n`;
    report += `  Artifacts: ${artifacts.join(', ') || 'None'}\n`;
    report += `  Code: ${code.join(', ') || 'None'}\n`;
    report += `  Missing in code: ${missingInCode.join(', ') || 'None'}\n`;
    report += `  Missing in artifacts: ${missingInArtifacts.join(', ') || 'None'}\n\n`;
  });
  if (output === 'json') {
    fs.writeFileSync('consistency_report.json', JSON.stringify({ report }, null, 2));
    console.log('Wrote consistency_report.json');
  } else {
    fs.writeFileSync('consistency_report.txt', report);
    console.log('Wrote consistency_report.txt');
  }
}

main();
