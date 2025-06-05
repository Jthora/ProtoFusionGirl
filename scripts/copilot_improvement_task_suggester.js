// copilot_improvement_task_suggester.js
// Suggests improvement tasks based on missing features or weak spots
// Usage: node scripts/copilot_improvement_task_suggester.js [--dry-run] [--severity <critical|recommended|optional>]

import fs from 'fs';
import path from 'path';

const tasksDir = 'tasks/';
const codeDirs = ['src/world/missions/', 'src/world/events/', 'src/world/threats/'];
const artifactDir = 'artifacts/';

function suggestTasks(dryRun, severity) {
  let suggestions = [];
  // Example: check for TODOs in code
  codeDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
      const filePath = path.join(dir, f);
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('TODO')) {
        suggestions.push({
          title: `Complete implementation in ${f}`,
          severity: 'recommended',
          file: filePath
        });
      }
    });
  });
  // Example: check for missing artifact/code pairs
  // (Could be expanded with more logic)
  if (suggestions.length === 0) {
    suggestions.push({
      title: 'No obvious improvement tasks found. Review manually.',
      severity: 'optional',
      file: null
    });
  }
  // Filter by severity
  if (severity) suggestions = suggestions.filter(s => s.severity === severity);
  // Output or create tasks
  suggestions.forEach((s, i) => {
    const taskFile = path.join(tasksDir, `improvement_task_${Date.now()}_${i}.task`);
    const content = `# Task\ntitle: ${s.title}\nseverity: ${s.severity}\nfile: ${s.file || 'N/A'}\n`;
    if (!dryRun) {
      if (!fs.existsSync(tasksDir)) fs.mkdirSync(tasksDir);
      fs.writeFileSync(taskFile, content);
      console.log(`Created task: ${taskFile}`);
    } else {
      console.log(`[Dry Run] Would create task: ${taskFile}\n${content}`);
    }
  });
}

function main() {
  const args = process.argv.slice(2);
  let dryRun = args.includes('--dry-run');
  let severity = args.includes('--severity') ? args[args.indexOf('--severity') + 1] : null;
  suggestTasks(dryRun, severity);
}

main();
