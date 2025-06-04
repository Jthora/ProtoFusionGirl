// aiTaskManager.js
// Usage: node scripts/aiTaskManager.js <command> [...args]
// Onboarding: Central AI/Copilot task management interface for creating, listing, updating, and syncing tasks with full automation.
// Commands: new, list, update, sync, index

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPTS_DIR = __dirname;

console.log('[DEBUG] aiTaskManager.js starting. Args:', process.argv);
console.log('[DEBUG] __dirname:', __dirname);
console.log('[DEBUG] SCRIPTS_DIR:', SCRIPTS_DIR);

// Core commands (backward compatible)
const coreCommands = {
  new: (args) => {
    // Use execFileSync to avoid shell parsing issues
    const cmd = 'node';
    const script = path.join('scripts', 'newTask.js');
    // Always treat the first arg as the description, keep the rest as flags
    const [desc, ...rest] = args;
    const argArray = [script, desc, ...rest];
    execFileSync(cmd, argArray, { stdio: 'inherit' });
  },
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

// Robust argument parsing with yargs
const argv = yargs(hideBin(process.argv))
  .command('new <desc>', 'Create a new task', (yargs) => {
    yargs.positional('desc', {
      describe: 'Task description',
      type: 'string',
    })
    .option('priority', {
      alias: 'p',
      describe: 'Task priority',
      default: 'medium',
      type: 'string',
    })
    .option('assignee', {
      alias: 'a',
      describe: 'Task assignee',
      default: 'copilot',
      type: 'string',
    })
    .option('related', {
      alias: 'r',
      describe: 'Related files/artifacts',
      type: 'string',
    });
  })
  .command('list', 'List tasks', (yargs) => {
    yargs.option('status', { describe: 'Status filter', type: 'string' })
      .option('assignee', { describe: 'Assignee filter', type: 'string' })
      .option('priority', { describe: 'Priority filter', type: 'string' })
      .option('json', { describe: 'Output as JSON', type: 'boolean' });
  })
  .command('update <task_filename>', 'Update a task', (yargs) => {
    yargs.positional('task_filename', { describe: 'Task artifact filename', type: 'string' })
      .option('status', { describe: 'New status', type: 'string' })
      .option('assignee', { describe: 'New assignee', type: 'string' })
      .option('priority', { describe: 'New priority', type: 'string' })
      .option('comment', { describe: 'Comment', type: 'string' });
  })
  .command('index', 'Regenerate the task index')
  .command('sync', 'Sync code TODOs with tasks')
  .option('self-test', { describe: 'Run a self-test and print parsed arguments', type: 'boolean' })
  .help()
  .argv;

if (argv['self-test']) {
  console.log('[SELF-TEST] argv:', argv);
  process.exit(0);
}

const cmd = argv._[0];
console.log('[DEBUG] yargs cmd:', cmd, 'argv:', argv);

// Core commands using yargs
if (cmd === 'new') {
  const desc = argv.desc;
  const args = [desc];
  if (argv.priority) args.push(`--priority=${argv.priority}`);
  if (argv.assignee) args.push(`--assignee=${argv.assignee}`);
  if (argv.related) args.push(`--related=${argv.related}`);
  coreCommands.new(args);
  process.exit(0);
}
if (cmd === 'list') {
  const args = [];
  if (argv.status) args.push(`--status=${argv.status}`);
  if (argv.assignee) args.push(`--assignee=${argv.assignee}`);
  if (argv.priority) args.push(`--priority=${argv.priority}`);
  if (argv.json) args.push('--json');
  coreCommands.list(args);
  process.exit(0);
}
if (cmd === 'update') {
  const args = [argv.task_filename];
  if (argv.status) args.push(`--status=${argv.status}`);
  if (argv.assignee) args.push(`--assignee=${argv.assignee}`);
  if (argv.priority) args.push(`--priority=${argv.priority}`);
  if (argv.comment) args.push(`--comment=${argv.comment}`);
  coreCommands.update(args);
  process.exit(0);
}
if (cmd === 'index') {
  coreCommands.index([]);
  process.exit(0);
}
if (cmd === 'sync') {
  coreCommands.sync([]);
  process.exit(0);
}

// Fallback to help if unknown command
printHelp();
process.exit(1);
