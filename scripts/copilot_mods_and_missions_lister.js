// copilot_mods_and_missions_lister.js
// Lists all available mods, missions, and world events
// Usage: node scripts/copilot_mods_and_missions_lister.js [--output <json|md|txt>]

import fs from 'fs';
import path from 'path';

const dirs = [
  { type: 'mission', dir: 'src/world/missions/' },
  { type: 'event', dir: 'src/world/events/' },
  { type: 'threat', dir: 'src/world/threats/' },
  { type: 'mod', dir: 'src/mods/' }
];

function listContent() {
  let results = [];
  dirs.forEach(({ type, dir }) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
      if (f.endsWith('.ts') || f.endsWith('.js')) {
        results.push({
          name: f.replace(/\.(ts|js)$/, ''),
          type,
          file: path.join(dir, f)
        });
      }
    });
  });
  return results;
}

function main() {
  const args = process.argv.slice(2);
  let output = args.includes('--output') ? args[args.indexOf('--output') + 1] : 'txt';
  const results = listContent();
  if (results.length === 0) {
    console.log('No content found.');
    return;
  }
  if (output === 'json') {
    fs.writeFileSync('mods_and_missions_list.json', JSON.stringify(results, null, 2));
    console.log('Wrote mods_and_missions_list.json');
  } else if (output === 'md') {
    const md = results.map(r => `- **${r.type}**: ${r.name}  
  Path: \\`${r.file}\\``).join('\n');
    fs.writeFileSync('mods_and_missions_list.md', md);
    console.log('Wrote mods_and_missions_list.md');
  } else {
    const txt = results.map(r => `${r.type}: ${r.name} (${r.file})`).join('\n');
    fs.writeFileSync('mods_and_missions_list.txt', txt);
    console.log('Wrote mods_and_missions_list.txt');
  }
}

main();
