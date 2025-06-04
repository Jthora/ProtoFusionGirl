// guidedOnboarding.js
// Usage: node scripts/guidedOnboarding.js [--json] [--auto-task]
// Onboarding: Automated onboarding and self-test for Copilot/AI agent workflows. Detects missing context, outdated artifacts, or onboarding gaps and auto-creates tasks if --auto-task is set.

import fs from 'fs';
import path from 'path';
import readline from 'readline';
// Use import.meta.url to get directory in ES module scope
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const ONBOARDING_STATUS_PATH = path.join(__dirname, '../artifacts/ai_onboarding_status.artifact');

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

  // --- Enhancement: Write onboarding status artifact ---
  let nextActions = [];
  // Try to load next actions from copilot_next_steps_2025-06-03.artifact if it exists
  const nextStepsPath = path.join(__dirname, '../artifacts/copilot_next_steps_2025-06-03.artifact');
  if (fs.existsSync(nextStepsPath)) {
    try {
      const content = fs.readFileSync(nextStepsPath, 'utf8');
      // Naive parse: look for lines starting with '-' or numbered list
      nextActions = content.split('\n').filter(l => l.match(/^\s*[-0-9]/));
    } catch (e) { /* ignore */ }
  }
  // Compose status artifact content
  const statusContent = [
    '---',
    'artifact: ai_onboarding_status',
    `created: ${new Date().toISOString()}`,
    'purpose: Onboarding status summary for Copilot/AI agent',
    'type: status',
    'format: markdown',
    '---',
    '',
    '# AI Onboarding Status',
    '',
    `**Pass:** ${result.pass}`,
    '',
    '## Artifacts Checked:',
    ...result.artifacts.map(a => `- ${a.name}: ${a.exists ? 'OK' : 'MISSING'}`),
    '',
    '## Scripts Checked:',
    ...result.scripts.map(s => `- ${s.name}: ${s.exists ? 'OK' : 'MISSING'}`),
    '',
    '## Self-Test:',
    ...result.selfTest.map(q => `- ${q.question} (${q.check ? 'PASS' : 'FAIL'})`),
    '',
    '## Missing Context:',
    ...(result.missing.length ? result.missing.map(m => `- ${m.type}: ${m.name}`) : ['None']),
    '',
    '## Next Actions:',
    ...(nextActions.length ? nextActions : ['- See Project Dashboard or copilot_next_steps_2025-06-03.artifact']),
    '',
    '## Troubleshooting:',
    result.pass ? '- None' : '- See logs, feedback_*.artifact, or autoRepairArtifacts.js for repair.',
    ''
  ].join('\n');
  // Extra logging for debugging artifact creation
  console.log('[DEBUG] About to write onboarding status artifact.');
  console.log('[DEBUG] Artifact path:', ONBOARDING_STATUS_PATH);
  try {
    fs.writeFileSync(ONBOARDING_STATUS_PATH, statusContent, 'utf8');
    console.log('[DEBUG] Artifact write successful.');
  } catch (err) {
    console.error('[ERROR] Failed to write onboarding status artifact:', err);
  }
  if (!outputJson) {
    console.log(`\nOnboarding status written to: ${ONBOARDING_STATUS_PATH}\n`);
  }
}

if (import.meta.url === process.argv[1]) {
  main();
}
