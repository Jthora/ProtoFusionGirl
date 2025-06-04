// guidedOnboarding.js
// Usage: node scripts/guidedOnboarding.js [--json] [--auto-task]
// Onboarding: Automated onboarding and self-test for Copilot/AI agent workflows. Detects missing context, outdated artifacts, or onboarding gaps and auto-creates tasks if --auto-task is set.

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const ARTIFACTS = [
  'ai_onboarding_2025-06-03.artifact',
  'artifact_index.artifact',
  'copilot_next_steps_2025-06-03.artifact',
  'copilot_memory.artifact',
  'project_state_2025-06-03.artifact'
];
const SCRIPTS = [
  'listScripts.js',
  'generateArtifactIndex.js',
  'snapshotDirectory.js',
  'checkArtifactCodeSync.js',
  'updatePrimer.js',
  'searchArtifacts.js',
  'listArtifactRelations.js'
];

const outputJson = process.argv.includes('--json');
const autoTask = process.argv.includes('--auto-task');

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  const result = {
    artifacts: [],
    scripts: [],
    conventions: [],
    selfTest: [],
    pass: true,
    missing: []
  };
  // Step 1: Key Artifacts
  for (const art of ARTIFACTS) {
    const exists = fs.existsSync(path.join(__dirname, '../artifacts', art));
    result.artifacts.push({ name: art, exists });
    if (!exists) {
      result.pass = false;
      result.missing.push({ type: 'artifact', name: art });
    }
  }
  // Step 2: Key Scripts
  for (const s of SCRIPTS) {
    const exists = fs.existsSync(path.join(__dirname, s));
    result.scripts.push({ name: s, exists });
    if (!exists) {
      result.pass = false;
      result.missing.push({ type: 'script', name: s });
    }
  }
  // Step 3: Conventions & Best Practices (static checks)
  result.conventions = [
    'Reference artifacts in code comments for traceability.',
    'Keep artifact headers and cross-references up to date.',
    'Use scripts for automation and context expansion.'
  ];
  // Step 4: Self-Test (programmatic)
  result.selfTest = [
    {
      question: 'Where can you find a manifest of all artifacts?',
      expected: 'artifact_index.artifact',
      check: fs.existsSync(path.join(__dirname, '../artifacts/artifact_index.artifact'))
    },
    {
      question: 'Which script checks for missing or outdated artifact references in code?',
      expected: 'checkArtifactCodeSync.js',
      check: fs.existsSync(path.join(__dirname, 'checkArtifactCodeSync.js'))
    },
    {
      question: 'What artifact should you expand with new heuristics and lessons?',
      expected: 'copilot_memory.artifact',
      check: fs.existsSync(path.join(__dirname, '../artifacts/copilot_memory.artifact'))
    }
  ];
  if (!result.selfTest.every(q => q.check)) result.pass = false;
  // Auto-create tasks for missing context if --auto-task
  if (autoTask && result.missing.length) {
    for (const miss of result.missing) {
      const desc = `Onboarding gap: missing ${miss.type} ${miss.name}`;
      // Use dynamic import for child_process
      const cp = await import('child_process');
      cp.execSync(`node scripts/aiTaskManager.js new "${desc}" --priority=high --assignee=copilot --related=guidedOnboarding.js`, { stdio: 'inherit' });
    }
  }
  if (outputJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    // Human-readable output
    console.log('Onboarding Check Results:');
    console.log('Artifacts:', result.artifacts);
    console.log('Scripts:', result.scripts);
    console.log('Conventions:', result.conventions);
    console.log('Self-Test:', result.selfTest);
    console.log('Pass:', result.pass);
    if (result.missing.length) {
      console.log('Missing context or artifacts:', result.missing);
    }
  }
  // After onboarding checks, auto-enqueue a self-prompt for the first missing artifact or script if selfPromptPipeline.js exists
  const selfPromptPipeline = path.join(__dirname, 'selfPromptPipeline.js');
  if (fs.existsSync(selfPromptPipeline) && result.missing && result.missing.length) {
    const firstMissing = result.missing[0];
    const promptText = `Onboarding gap detected: missing ${firstMissing.type} ${firstMissing.name}`;
    try {
      const cp = await import('child_process');
      cp.execSync(`node scripts/selfPromptPipeline.js --add "${promptText}"`, { stdio: 'ignore' });
    } catch (e) { /* ignore errors */ }
  }
}

if (import.meta.url === process.argv[1]) {
  main();
}
