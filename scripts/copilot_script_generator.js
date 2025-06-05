// copilot_script_generator.js
// Script Generator for Missions, World Events, and Threats
// Usage: node scripts/copilot_script_generator.js --type <mission|event|threat> --name <Name> [--desc <Description>] [--output <yaml|json|ts>] [--overwrite]

import fs from 'fs';
import path from 'path';
import readline from 'readline';
let yaml;
try {
  yaml = require('js-yaml');
} catch (e) {
  yaml = null;
}

const templates = {
  mission: (name, desc) => ({
    id: name,
    type: 'mission',
    description: desc,
    // objectives: List of mission objectives. See docs/coding_mission_objectives.md
    objectives: [
      {
        id: 'obj1',
        description: 'Example: Complete the first task',
        completed: false
      }
    ],
    // triggers: List of mission triggers. See docs/coding_mission_triggers.md
    triggers: [
      {
        type: 'onStart',
        action: 'logStart'
      }
    ]
  }),
  event: (name, desc) => ({
    id: name,
    type: 'event',
    description: desc,
    // parameters: Key-value pairs for event configuration. See docs/coding_event_parameters.md
    parameters: {
      exampleParam: 'value'
    }
  }),
  threat: (name, desc) => ({
    id: name,
    type: 'threat',
    description: desc,
    // effects: List of threat effects. See docs/coding_threat_effects.md
    effects: [
      {
        type: 'damage',
        amount: 10
      }
    ]
  })
};

function toKebabCase(str) {
  return str && str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  const args = process.argv.slice(2);
  let type = args.includes('--type') ? args[args.indexOf('--type') + 1] : null;
  let name = args.includes('--name') ? args[args.indexOf('--name') + 1] : null;
  let desc = args.includes('--desc') ? args[args.indexOf('--desc') + 1] : '';
  let output = args.includes('--output') ? args[args.indexOf('--output') + 1] : 'ts';
  let overwrite = args.includes('--overwrite');

  if (!type) type = await prompt('Type (mission/event/threat): ');
  if (!name) name = await prompt('Name: ');
  if (!desc) desc = await prompt('Description: ');

  if (!['mission', 'event', 'threat'].includes(type)) {
    console.error('Invalid type. Must be mission, event, or threat.');
    process.exit(1);
  }

  const fileName = toKebabCase(name) + (output === 'ts' ? '.ts' : output === 'yaml' ? '.yaml' : '.json');
  const dir = type === 'mission' ? 'src/world/missions/' : type === 'event' ? 'src/world/events/' : 'src/world/threats/';
  const filePath = path.join(process.cwd(), dir, fileName);

  if (fs.existsSync(filePath) && !overwrite) {
    console.error(`File ${filePath} already exists. Use --overwrite to replace.`);
    process.exit(1);
  }

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const data = templates[type](name, desc);
  let fileContent;
  if (output === 'ts') {
    fileContent = `// ${type.charAt(0).toUpperCase() + type.slice(1)}: ${name}\nexport default ${JSON.stringify(data, null, 2)};\n`;
  } else if (output === 'yaml') {
    if (!yaml) {
      console.error('js-yaml is not installed. Run: npm install js-yaml');
      process.exit(1);
    }
    fileContent = yaml.dump(data);
  } else if (output === 'json') {
    fileContent = JSON.stringify(data, null, 2);
  } else {
    console.error('Invalid output format. Use ts, yaml, or json.');
    process.exit(1);
  }
  fs.writeFileSync(filePath, fileContent);
  console.log(`Created ${type} at ${filePath}`);
  // Auto-register in index/registry file if possible
  let registryFile;
  if (type === 'mission') registryFile = path.join(process.cwd(), 'src/world/missions/index.ts');
  if (type === 'event') registryFile = path.join(process.cwd(), 'src/world/events/index.ts');
  if (type === 'threat') registryFile = path.join(process.cwd(), 'src/world/threats/index.ts');
  if (registryFile && fs.existsSync(registryFile)) {
    const importName = toKebabCase(name).replace(/-/g, '_');
    const relPath = `./${toKebabCase(name)}`;
    let regContent = fs.readFileSync(registryFile, 'utf-8');
    // Add import/export if not already present
    if (!regContent.includes(relPath)) {
      regContent += `\nexport * as ${importName} from '${relPath}';\n`;
      fs.writeFileSync(registryFile, regContent);
      console.log(`Auto-registered in ${registryFile}`);
    } else {
      console.log(`Already registered in ${registryFile}`);
    }
  } else {
    console.log('No registry/index file found for auto-registration. Please add manually if needed.');
  }
  console.log('Next steps:');
  console.log('- Edit the generated file to customize objectives, triggers, parameters, or effects.');
  console.log('- Reference documentation:');
  if (type === 'mission') {
    console.log('  - docs/coding_mission_objectives.md');
    console.log('  - docs/coding_mission_triggers.md');
  } else if (type === 'event') {
    console.log('  - docs/coding_event_parameters.md');
  } else if (type === 'threat') {
    console.log('  - docs/coding_threat_effects.md');
  }
  console.log('- Add the new content to the appropriate registry or index if not auto-registered.');
  if (output === 'yaml') {
    console.log('Tip: You can edit YAML files easily in VS Code with the YAML extension.');
  }
}

main();
