// updateDashboard.js
// Usage: node scripts/updateDashboard.js [--json]
// Onboarding: Updates the .dashboard file with latest project status, open tasks, and onboarding health.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DASHBOARD_PATH = path.join(__dirname, '../.dashboard');
const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const TASKS_DIR = path.join(__dirname, '../tasks');
const outputJson = process.argv.includes('--json');

if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/updateDashboard.js [--json]');
  console.log('Updates the .dashboard file with latest project status, open tasks, and onboarding health.');
  process.exit(0);
}

function main() {
  let status = { openTasks: [], artifactCount: 0, onboardingPass: true, updated: new Date().toISOString(), urgentTasks: [], suggestions: [] };
  // Aggregate open tasks
  if (fs.existsSync(TASKS_DIR)) {
    for (const file of fs.readdirSync(TASKS_DIR)) {
      if (file.endsWith('.task')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(TASKS_DIR, file), 'utf8'));
          if (data.status !== 'done') status.openTasks.push({ name: file, ...data });
          if (data.priority === 'urgent' && data.status !== 'done') status.urgentTasks.push({ name: file, ...data });
        } catch (e) {
          // skip invalid
        }
      }
    }
  }
  // Count artifacts
  if (fs.existsSync(ARTIFACTS_DIR)) {
    status.artifactCount = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.endsWith('.artifact')).length;
  }
  // Onboarding health: fail if urgent tasks exist
  if (status.urgentTasks.length) {
    status.onboardingPass = false;
    status.suggestions.push('Resolve urgent tasks to restore onboarding health.');
    try {
      require('child_process').execSync(`node scripts/aiTaskManager.js new "Urgent onboarding blockers: ${status.urgentTasks.map(t=>t.name).join(', ')}" --priority=high --assignee=copilot --related=updateDashboard.js`, { stdio: 'inherit' });
    } catch {}
  } else {
    status.suggestions.push('No urgent blockers. Continue regular onboarding.');
  }
  // Output quick status
  if (!outputJson) {
    console.log(`[updateDashboard] Quick Status: Onboarding Pass: ${status.onboardingPass}, Open Tasks: ${status.openTasks.length}, Urgent: ${status.urgentTasks.length}`);
    if (status.suggestions.length) console.log('Suggestions:', status.suggestions.join(' | '));
  }
  // Copilot/AI: Add onboarding health, urgent tasks, quick status, and suggestions
  if (outputJson) {
    console.log(JSON.stringify(status, null, 2));
  } else {
    fs.writeFileSync(DASHBOARD_PATH, JSON.stringify(status, null, 2), 'utf8');
    console.log(`[updateDashboard] .dashboard updated at ${DASHBOARD_PATH}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
