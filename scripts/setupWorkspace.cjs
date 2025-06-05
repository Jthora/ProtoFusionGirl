// setupWorkspace.cjs
// Automated environment setup for ProtoFusionGirl
const fs = require('fs');
const path = require('path');

const dotfiles = [
  '.primer', '.datapack', '.manifest', '.priming', '.dashboard', '.feedback'
];
const directories = [
  'artifacts', 'data', 'docs', 'persona_core', 'scripts', 'tasks'
];

// Ensure required directories exist
for (const dir of directories) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`Created directory: ${dir}`);
  }
}

// Copy templates for dotfiles if missing
for (const file of dotfiles) {
  if (!fs.existsSync(file)) {
    const templatePath = path.join('templates', file);
    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, file);
      console.log(`Created ${file} from template.`);
    } else {
      fs.writeFileSync(file, `# ${file} (auto-generated placeholder)\n`);
      console.log(`Created placeholder for missing template: ${file}`);
    }
  }
}

console.log('AI Agent Workspace Environment setup complete.');
