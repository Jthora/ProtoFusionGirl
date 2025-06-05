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

import * as personaCoreUtils from './personaCoreUtils.js';

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
const TASKS_DIR = path.join(__dirname, '../tasks');

const outputJson = process.argv.includes('--json');
const autoTask = process.argv.includes('--auto-task');
const autoMode = process.argv.includes('--auto');

// --- BEGIN: Consolidated Onboarding Logic ---
import { execSync } from 'child_process';

// Helper to run a script and log output
function runScript(scriptPath, label) {
  try {
    console.log(`\n[ONBOARDING] Running: ${label} (${scriptPath})`);
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    return true;
  } catch (e) {
    console.error(`[ERROR] Failed to run ${label}:`, e.message);
    return false;
  }
}

// Foundational scripts to run in order (if they exist)
const onboardingScripts = [
  { path: path.join(__dirname, 'updateManifest.js'), label: 'Update Manifest' },
  { path: path.join(__dirname, 'aggregatePersonas.js'), label: 'Aggregate Personas' },
  { path: path.join(__dirname, 'syncDatapack.js'), label: 'Sync Datapack' },
  { path: path.join(__dirname, 'updateDashboard.js'), label: 'Update Dashboard' }
];

// Run each script if it exists
for (const s of onboardingScripts) {
  if (fs.existsSync(s.path)) {
    runScript(s.path, s.label);
  } else {
    console.warn(`[WARN] Script missing: ${s.label} (${s.path})`);
  }
}

console.log('\n[ONBOARDING] All foundational onboarding/validation scripts have been run.');
console.log('[ONBOARDING] This is the ONLY script Copilot/agents should use for onboarding, validation, and context sync.');
console.log('[ONBOARDING] Run this script for EVERY file and context change. Do NOT use any other onboarding/validation scripts directly.');
// --- END: Consolidated Onboarding Logic ---

async function main() {
  // --- Persona Core Integration ---
  let personaCore;
  try {
    personaCore = personaCoreUtils.loadPersonaCore();
  } catch (e) {
    console.warn('[WARN] Persona Core could not be loaded:', e.message);
    personaCore = null;
  }

  const result = {
    personaCore: personaCore ? {
      coreValues: personaCore.coreValues,
      operationalFocus: personaCore.operationalFocus,
      decisionHeuristics: personaCore.decisionHeuristics,
      metaPrompts: personaCore.metaPrompts,
      integrationHooks: personaCore.integrationHooks,
      version: personaCore.version
    } : null,
    artifacts: [],
    scripts: [],
    conventions: [],
    selfTest: [],
    tasks: [],
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

  // --- Enhancement: Scan and index .task files in the tasks/ folder ---
  if (fs.existsSync(TASKS_DIR)) {
    const taskFiles = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.task'));
    for (const file of taskFiles) {
      const filePath = path.join(TASKS_DIR, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Naive parse: assume JSON or YAML front matter
        let taskData;
        if (content.trim().startsWith('{')) {
          taskData = JSON.parse(content);
        } else {
          // TODO: Add YAML parsing support if needed
          continue;
        }
        // Add task to result, cross-link to related artifacts/docs
        result.tasks.push({
          name: file,
          ...taskData,
          relatedArtifacts: taskData.relatedArtifacts || [],
          relatedDocs: taskData.relatedDocs || []
        });
      } catch (e) {
        console.error(`[ERROR] Failed to process task file ${file}:`, e);
      }
    }
  }

  // --- Enhancement: Load docs index for onboarding context ---
  const DOCS_INDEX_PATH = path.join(__dirname, '../docs/docs_index.json');
  let docsIndex = null;
  if (fs.existsSync(DOCS_INDEX_PATH)) {
    try {
      docsIndex = JSON.parse(fs.readFileSync(DOCS_INDEX_PATH, 'utf8'));
    } catch (e) {
      console.warn('[WARN] Could not load docs_index.json:', e.message);
    }
  }
  // In result object, add docsIndex summary if available
  if (docsIndex && docsIndex.globalSummary) {
    result.docsIndex = {
      indexedFiles: docsIndex.globalSummary.indexedFiles,
      totalSections: docsIndex.globalSummary.totalSections,
      uniqueKeywords: docsIndex.globalSummary.uniqueKeywords.slice(0, 20),
      topDocs: docsIndex.docs ? docsIndex.docs.slice(0, 5).map(d => ({ file: d.file, summary: d.summary })) : []
    };
  }

  // Auto-create tasks for missing context if --auto-task
  if (autoTask && result.missing.length) {
    for (const miss of result.missing) {
      const desc = `Onboarding gap: missing ${miss.type} ${miss.name}`;
      // Use dynamic import for child_process
      const cp = await import('child_process');
      cp.execSync(`node scripts/aiTaskManager.js new "${desc}" --priority=high --assignee=copilot --related=guidedOnboarding.js`, { stdio: 'inherit' });
    }
  }
  // If autoMode, attempt to auto-fix or create missing artifacts/scripts
  if (autoMode && result.missing.length) {
    for (const miss of result.missing) {
      // Example: auto-create empty artifact or escalate as task
      if (miss.type === 'artifact') {
        const artifactPath = path.join(__dirname, '../artifacts', miss.name);
        if (!fs.existsSync(artifactPath)) {
          fs.writeFileSync(artifactPath, `---\nartifact: ${miss.name}\ncreated: ${new Date().toISOString()}\npurpose: Auto-created by Copilot onboarding.\n---\n`);
          console.log(`[AUTO] Created missing artifact: ${miss.name}`);
        }
      } else {
        // Escalate as task (reuse autoTask logic)
        const desc = `Onboarding gap: missing ${miss.type} ${miss.name}`;
        const cp = await import('child_process');
        cp.execSync(`node scripts/aiTaskManager.js new "${desc}" --priority=high --assignee=copilot --related=guidedOnboarding.js`, { stdio: 'inherit' });
      }
    }
  }
  if (outputJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    // Human-readable output
    if (personaCore) {
      console.log('--- Persona Core ---');
      console.log('Core Values:', personaCore.coreValues);
      console.log('Operational Focus:', personaCore.operationalFocus);
      console.log('Decision Heuristics:', personaCore.decisionHeuristics);
      console.log('Meta Prompts:', personaCore.metaPrompts);
      console.log('Integration Hooks:', personaCore.integrationHooks);
      console.log('Version:', personaCore.version);
      console.log('--------------------');
    }
    console.log('Onboarding Check Results:');
    console.log('Artifacts:', result.artifacts);
    console.log('Scripts:', result.scripts);
    console.log('Conventions:', result.conventions);
    console.log('Self-Test:', result.selfTest);
    console.log('Tasks:', result.tasks);
    console.log('Docs Index:', result.docsIndex);
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
  let statusContent = [
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
    '## Tasks:',
    ...(result.tasks.length ? result.tasks.map(t => `- ${t.name}: ${t.status || 'UNKNOWN'}`) : ['None']),
    '',
    '## Troubleshooting:',
    result.pass ? '- None' : '- See logs, feedback_*.artifact, or autoRepairArtifacts.js for repair.',
    ''
  ].join('\n');
  // In statusContent, add docs index summary if available
  if (docsIndex && docsIndex.globalSummary) {
    statusContent += [
      '',
      '## Documentation Index:',
      `- Indexed Files: ${docsIndex.globalSummary.indexedFiles}`,
      `- Total Sections: ${docsIndex.globalSummary.totalSections}`,
      `- Top Keywords: ${docsIndex.globalSummary.uniqueKeywords.slice(0, 10).join(', ')}`,
      '',
      '### Top Docs:',
      ...(docsIndex.docs ? docsIndex.docs.slice(0, 5).map(d => `- ${d.file}: ${d.summary}`) : ['None']),
      ''
    ].join('\n');
  }
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

  // --- Enhancement: Write agent onboarding checklist artifact ---
  const checklistPath = path.join(__dirname, '../artifacts/.agent_onboarding_checklist');
  const checklistContent = [
    '---',
    'title: Agent Onboarding Checklist',
    `created: ${new Date().toISOString()}`,
    'purpose: Tracks onboarding/validation status for all foundational files.',
    '---',
    '',
    '# Agent Onboarding Checklist',
    '',
    ...result.artifacts.map(a => `- ${a.name}: ${a.exists ? 'OK' : 'MISSING'}`),
    ...result.scripts.map(s => `- ${s.name}: ${s.exists ? 'OK' : 'MISSING'}`),
    '',
    `Pass: ${result.pass}`,
    '',
    ...(result.missing.length ? result.missing.map(m => `- MISSING: ${m.type} ${m.name}`) : ['All files present.'])
  ].join('\n');
  fs.writeFileSync(checklistPath, checklistContent, 'utf8');
  if (!outputJson) {
    console.log(`\nAgent onboarding checklist written to: ${checklistPath}\n`);
  }

  // --- Enhancement: Write Copilot Essential Info JSON ---
  try {
    const { spawnSync } = await import('child_process');
    spawnSync('node', [path.join(__dirname, 'generateCopilotEssentialInfo.js')], { stdio: 'inherit' });
    // Print a Copilot onboarding summary for seamless UX
    const info = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts/copilot_essential_info.json'), 'utf8'));
    console.log('\n[Copilot Onboarding Summary]');
    console.log('- Artifacts:', Object.keys(info.artifacts).length);
    console.log('- Essential Files:', Object.keys(info.essentialFiles).length);
    console.log('- Scripts:', info.scripts.length);
    console.log('- Project Files:', Object.keys(info.projectFiles).length);
    if (info.onboardingStatus && info.onboardingStatus.success !== undefined) {
      console.log('- Onboarding Status:', info.onboardingStatus.success ? 'PASS' : 'FAIL');
    }
    if (info.docsIndex && info.docsIndex.indexedFiles) {
      console.log('- Docs Indexed:', info.docsIndex.indexedFiles);
    }
    console.log('Copilot onboarding context is now fully up to date.');
  } catch (e) {
    console.warn('Could not generate Copilot essential info or summary:', e.message);
  }
}

// --- END: Enhancement: Write agent onboarding checklist artifact ---

if (import.meta.url === process.argv[1]) {
  main();
}
