#!/usr/bin/env node
/**
 * masterOnboarding.cjs
 * Runs all key onboarding scripts and produces a single onboarding.json summary for Copilot/AI agents.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runScript(script, args = []) {
  try {
    const cmd = `node scripts/${script} ${args.join(' ')}`;
    return execSync(cmd, { encoding: 'utf8' });
  } catch (e) {
    return `Error running ${script}: ${e.message}`;
  }
}

function safeRead(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function main() {
  const onboarding = {};
  // 1. Guided Onboarding
  onboarding.guidedOnboarding = runScript('guidedOnboarding.js');
  // 2. Docs Index
  onboarding.docsIndex = safeRead(path.join('docs', 'docs_index.json'));
  // 3. Scan Dev Environment
  onboarding.devEnvironment = runScript('scanDevEnvironment.cjs');
  // 4. List Scripts
  onboarding.scriptsList = runScript('listScripts.js');
  // 5. List Tasks
  onboarding.tasksList = runScript('listTasks.js');
  // 6. Project Dashboard
  onboarding.projectDashboard = runScript('project_dashboard.js');
  // 7. Artifact Index
  onboarding.artifactIndex = safeRead(path.join('artifacts', 'artifact_index.artifact'));
  // 8. Directory Structure
  onboarding.directoryStructure = safeRead(path.join('artifacts', 'directory_structure_2025-06-04.artifact')) || safeRead(path.join('artifacts', 'directory_structure_2025-06-03.artifact'));

  // Write to onboarding.json
  fs.writeFileSync('onboarding.json', JSON.stringify(onboarding, null, 2));
  console.log('Master onboarding complete. See onboarding.json for full summary.');
}

main();
