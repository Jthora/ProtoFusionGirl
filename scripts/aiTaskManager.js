// aiTaskManager.js
// Usage: node scripts/aiTaskManager.js <command> [...args]
// Onboarding: Central AI/Copilot task management interface for creating, listing, updating, and syncing tasks with full automation.
// Commands: new, list, update, sync, index

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const SCRIPTS_DIR = __dirname;

// Core commands (backward compatible)
const coreCommands = {
  new: (args) => execSync(`node scripts/newTask.js ${args.join(' ')}`, { stdio: 'inherit' }),
  list: (args) => execSync(`node scripts/listTasks.js ${args.join(' ')}`, { stdio: 'inherit' }),
  update: (args) => execSync(`node scripts/updateTask.js ${args.join(' ')}`, { stdio: 'inherit' }),
  index: (args) => execSync('node scripts/taskIndexUpdate.js', { stdio: 'inherit' }),
  sync: (args) => {
    execSync('node scripts/syncTasksWithCode.js', { stdio: 'inherit' });
    // Self-prompt pipeline trigger (as before)
    const selfPromptPipeline = path.join(__dirname, 'selfPromptPipeline.js');
    if (fs.existsSync(selfPromptPipeline)) {
      try {
        const tasks = JSON.parse(execSync('node scripts/listTasks.js --json').toString());
        const openTask = tasks.find(t => t.status === 'open' || t.status === 'in-progress');
        if (openTask) {
          const promptText = `Task detected: ${openTask.summary || openTask.description || openTask.filename}`;
          execSync(`node scripts/selfPromptPipeline.js --add "${promptText}"`, { stdio: 'ignore' });
        }
      } catch (e) { /* ignore errors */ }
    }
  }
};

// Discover all scripts in scripts/ (excluding aiTaskManager.js itself)
function discoverScripts() {
  return fs.readdirSync(SCRIPTS_DIR)
    .filter(f => f.endsWith('.js') && f !== 'aiTaskManager.js')
    .map(f => {
      const content = fs.readFileSync(path.join(SCRIPTS_DIR, f), 'utf8');
      const usage = (content.match(/\/\/\s*Usage:\s*([^\n]*)/) || [])[1] || '';
      const onboarding = (content.match(/\/\/\s*Onboarding:\s*([^\n]*)/) || [])[1] || '';
      const desc = (content.match(/\/\/\s*([^\n]*)/) || [])[1] || '';
      return { name: f.replace('.js', ''), file: f, usage, onboarding, description: desc };
    });
}

function printHelp() {
  const discovered = discoverScripts();
  const help = {
    usage: 'node scripts/aiTaskManager.js <command> [...args]',
    description: 'Central command center for all project automation, onboarding, task, artifact, and self-prompt management. All scripts are accessible as subcommands or via this help menu.',
    vscode: 'All major actions are available as one-click VSCode tasks and discoverable via the command palette. See .vscode/tasks.json.',
    discoverability: 'Run this help command or the VSCode "AI Task Manager: List Tasks" task to see all available commands, subcommands, and usage examples in both text and JSON.',
    commands: Object.assign({},
      {
        new: 'Create a new task: new <desc> [--priority=...] [--assignee=...] [--related=...]',
        list: 'List tasks: list [--status=...] [--assignee=...] [--priority=...] [--json]',
        update: 'Update a task: update <task_filename> [--status=...] [--assignee=...] [--priority=...] [--comment=...]',
        index: 'Regenerate the task index: index',
        sync: 'Sync code TODOs with tasks: sync',
        help: 'Show this help message: help'
      },
      ...discovered.map(s => ({ [s.name]: `Run any script as a plugin: ${s.name} [...args]${s.usage ? ' | Usage: ' + s.usage : ''}` }))
    ),
    scripts: discovered,
    json: 'Add --json to output machine-readable results where supported.',
    see_also: [
      'scripts_index.artifact (all scripts, usage, onboarding)',
      'artifact_index.artifact (all artifacts, cross-references)',
      'project_dashboard.js (project summary, next actions)',
      'guidedOnboarding.js (automated onboarding/self-test)',
      'selfPromptPipeline.js (self-prompt queue, automation)'
    ]
  };
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(help, null, 2));
  } else {
    console.log('AI Task Manager Help:');
    console.log(help.description);
    console.log('Usage:', help.usage);
    console.log('VSCode:', help.vscode);
    console.log('Discoverability:', help.discoverability);
    Object.entries(help.commands).forEach(([cmd, desc]) => console.log('  ' + desc));
    console.log('Add --json to output machine-readable results where supported.');
    console.log('See also:', help.see_also.join(', '));
    console.log('\nAvailable Scripts:');
    discovered.forEach(s => {
      console.log(`- ${s.name}: ${s.description}`);
      if (s.usage) console.log(`    Usage: ${s.usage}`);
      if (s.onboarding) console.log(`    Onboarding: ${s.onboarding}`);
    });
  }
}

const args = process.argv.slice(2);
const cmd = args[0];
if (!cmd || args.includes('help') || args.includes('--help')) {
  printHelp();
  process.exit(0);
}

// If core command, run as before
if (coreCommands[cmd]) {
  coreCommands[cmd](args.slice(1));
  process.exit(0);
}

// If plugin/module command, run the corresponding script with args
const discovered = discoverScripts();
const plugin = discovered.find(s => s.name === cmd);
if (plugin) {
  // Pass through all args after the command
  const pluginArgs = args.slice(1).map(a => `'${a.replace(/'/g, "'\''")}'`).join(' ');
  // Use execSync to run the script as a child process
  execSync(`node scripts/${plugin.file} ${pluginArgs}`, { stdio: 'inherit' });
  process.exit(0);
}

console.error(`Unknown command or script: ${cmd}`);
printHelp();
process.exit(1);
