// project_dashboard.js
// Usage: node scripts/project_dashboard.js [--json] [--next-action]
// Onboarding: Central command/dashboard for ProtoFusionGirl. Summarizes project state, lists key artifacts/scripts, and provides actionable next steps.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const PRIMER = path.join(__dirname, '../.primer');
const ARTIFACT_INDEX = path.join(ARTIFACTS_DIR, 'artifact_index.artifact');

// --- Fix: Working Directory Check ---
if (!fs.existsSync(ARTIFACTS_DIR)) {
  console.error('Error: Please run this script from the project root directory.');
  process.exit(1);
}

// --- Fix: Dynamic Artifact File Discovery ---
function findLatestArtifact(prefix) {
  if (!fs.existsSync(ARTIFACTS_DIR)) return null;
  const files = fs.readdirSync(ARTIFACTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.artifact'))
    .sort()
    .reverse();
  return files.length ? path.join(ARTIFACTS_DIR, files[0]) : null;
}
const PROJECT_STATE = findLatestArtifact('project_state_');

console.log('[DEBUG] project_dashboard.js starting. Args:', process.argv);
console.log('[DEBUG] __dirname:', __dirname);
console.log('[DEBUG] ARTIFACTS_DIR:', ARTIFACTS_DIR);
console.log('[DEBUG] PRIMER:', PRIMER);
console.log('[DEBUG] ARTIFACT_INDEX:', ARTIFACT_INDEX);
console.log('[DEBUG] PROJECT_STATE:', PROJECT_STATE);

// --- Enhancement: Load docs index for dashboard context ---
const DOCS_INDEX_PATH = path.join(__dirname, '../docs/docs_index.json');
let docsIndex = null;
if (fs.existsSync(DOCS_INDEX_PATH)) {
  try {
    docsIndex = JSON.parse(fs.readFileSync(DOCS_INDEX_PATH, 'utf8'));
  } catch (e) {
    console.warn('[WARN] Could not load docs_index.json:', e.message);
  }
}

function readSection(file, header) {
  if (!fs.existsSync(file)) return '';
  const content = fs.readFileSync(file, 'utf8');
  const idx = content.indexOf(header);
  if (idx === -1) return '';
  const after = content.slice(idx + header.length);
  const nextHeader = after.search(/^# /m);
  return after.slice(0, nextHeader === -1 ? undefined : nextHeader).trim();
}

function listKeyScripts() {
  const scriptsDir = path.join(__dirname);
  const files = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
  console.log('\nKey Scripts:');
  files.forEach(f => {
    const content = fs.readFileSync(path.join(scriptsDir, f), 'utf8');
    const desc = (content.match(/\/\/\s*([^\n]*)/) || [])[1] || '';
    const usage = (content.match(/\/\/\s*Usage:\s*([^\n]*)/) || [])[1] || '';
    console.log(`- ${f}: ${desc}`);
    if (usage) console.log(`    Usage: ${usage}`);
  });
}

function main() {
  console.log('[DEBUG] Entered main()');
  // Primer summary
  if (fs.existsSync(PRIMER)) {
    console.log('[DEBUG] PRIMER exists');
    console.log('--- Primer Summary ---');
    const primer = fs.readFileSync(PRIMER, 'utf8');
    console.log(primer.split('\n').slice(0, 10).join('\n'));
    console.log('...\n');
  }
  // Project state
  if (PROJECT_STATE && fs.existsSync(PROJECT_STATE)) {
    console.log('[DEBUG] PROJECT_STATE exists');
    console.log('--- Project State ---');
    const state = readSection(PROJECT_STATE, '# Project State & Next Steps');
    console.log(state || '(No summary found)');
    console.log();
  } else {
    console.error('Error: No project_state_*.artifact found in artifacts/. Please generate one.');
  }
  // Artifact index
  if (fs.existsSync(ARTIFACT_INDEX)) {
    console.log('[DEBUG] ARTIFACT_INDEX exists');
    console.log('--- Artifact Index (first 10) ---');
    const idx = fs.readFileSync(ARTIFACT_INDEX, 'utf8');
    const lines = idx.split('\n').filter(l => l.trim().startsWith('- '));
    lines.slice(0, 10).forEach(l => console.log(l));
    if (lines.length > 10) console.log('...');
    console.log();
  }
  // Documentation index summary
  if (docsIndex && docsIndex.globalSummary) {
    console.log('--- Documentation Index Summary ---');
    console.log(`Indexed Files: ${docsIndex.globalSummary.indexedFiles}`);
    console.log(`Total Sections: ${docsIndex.globalSummary.totalSections}`);
    console.log(`Top Keywords: ${docsIndex.globalSummary.uniqueKeywords.slice(0, 10).join(', ')}`);
    if (docsIndex.docs) {
      console.log('Top Docs:');
      docsIndex.docs.slice(0, 5).forEach(d => {
        console.log(`- ${d.file}: ${d.summary}`);
      });
    }
    console.log();
  }
  // Key scripts
  listKeyScripts();
  // Next steps
  console.log('\n--- Next Steps ---');
  console.log('- Run guidedOnboarding.js for onboarding.');
  console.log('- Use listScripts.js to explore all automation scripts.');
  console.log('- Use generateArtifactIndex.js after editing artifacts.');
  console.log('- Use biDirectionalArtifactMap.js and checkArtifactCodeSync.js for code/artifact linkage.');
  console.log('- Use summarizeAndCleanUnusedArtifacts.js for cleanup.');
  console.log('- Use visualizeArtifactGraph.js for dependency graph.');
  console.log('- Review copilot_advanced_todos_2025-06-03.artifact for advanced TODOs.');
}

const outputJson = process.argv.includes('--json');
const nextAction = process.argv.includes('--next-action');

if (import.meta.url === process.argv[1]) {
  console.log('[DEBUG] Running as main module');
  // Output a machine-readable JSON summary for Copilot/AI agent use
  const dashboard = {};
  // Primer summary
  if (fs.existsSync(PRIMER)) {
    const primer = fs.readFileSync(PRIMER, 'utf8');
    dashboard.primer = primer.split('\n').slice(0, 10).join('\n');
  }
  // Project state
  if (PROJECT_STATE && fs.existsSync(PROJECT_STATE)) {
    dashboard.projectState = readSection(PROJECT_STATE, '# Project State & Next Steps');
  } else {
    dashboard.projectState = null;
  }
  // Artifact index (first 10)
  if (fs.existsSync(ARTIFACT_INDEX)) {
    const idx = fs.readFileSync(ARTIFACT_INDEX, 'utf8');
    const lines = idx.split('\n').filter(l => l.trim().startsWith('- '));
    dashboard.artifactIndex = lines.slice(0, 10);
  }
  // Key scripts
  const scriptsDir = path.join(__dirname);
  const files = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
  dashboard.keyScripts = files.map(f => {
    const content = fs.readFileSync(path.join(scriptsDir, f), 'utf8');
    return {
      name: f,
      description: (content.match(/\/\/\s*([^\n]*)/) || [])[1] || '',
      usage: (content.match(/\/\/\s*Usage:\s*([^\n]*)/) || [])[1] || '',
      onboarding: (content.match(/\/\/\s*Onboarding:\s*([^\n]*)/) || [])[1] || ''
    };
  });
  // Add docs index summary to dashboard JSON
  if (docsIndex && docsIndex.globalSummary) {
    dashboard.docsIndex = {
      indexedFiles: docsIndex.globalSummary.indexedFiles,
      totalSections: docsIndex.globalSummary.totalSections,
      uniqueKeywords: docsIndex.globalSummary.uniqueKeywords.slice(0, 20),
      topDocs: docsIndex.docs ? docsIndex.docs.slice(0, 5).map(d => ({ file: d.file, summary: d.summary })) : []
    };
  }
  // Next actions for Copilot/AI agent
  dashboard.nextActions = [
    { action: 'run', script: 'guidedOnboarding.js', reason: 'onboarding' },
    { action: 'run', script: 'listScripts.js', reason: 'explore scripts' },
    { action: 'run', script: 'generateArtifactIndex.js', reason: 'update artifact index' },
    { action: 'run', script: 'biDirectionalArtifactMap.js', reason: 'code/artifact linkage' },
    { action: 'run', script: 'checkArtifactCodeSync.js', reason: 'code/artifact sync check' },
    { action: 'run', script: 'summarizeAndCleanUnusedArtifacts.js', reason: 'cleanup' },
    { action: 'run', script: 'visualizeArtifactGraph.js', reason: 'dependency graph' },
    { action: 'review', artifact: 'copilot_advanced_todos_2025-06-03.artifact', reason: 'advanced TODOs' }
  ];
  if (outputJson) {
    console.log('[DEBUG] Outputting JSON');
    console.log(JSON.stringify(dashboard, null, 2));
  } else if (nextAction) {
    console.log('[DEBUG] Outputting nextAction');
    // Output the most important next action for Copilot
    const actions = dashboard.nextActions || [];
    if (actions.length) {
      console.log(JSON.stringify(actions[0], null, 2));
    } else {
      console.log('No next actions found.');
    }
  } else {
    console.log('[DEBUG] Outputting human-readable dashboard');
    // Human-readable output
    main();
  }
  // After nextActions are generated, auto-enqueue a self-prompt if a next action is detected and selfPromptPipeline.js exists
  const selfPromptPipeline = path.join(__dirname, 'selfPromptPipeline.js');
  if (fs.existsSync(selfPromptPipeline) && dashboard.nextActions && dashboard.nextActions.length) {
    const firstAction = dashboard.nextActions[0];
    // Only enqueue if not already in the queue (basic check)
    try {
      // Use dynamic import for child_process
      const cp = await import('child_process');
      const { queue } = await import('./selfPromptPipeline.js');
      const alreadyQueued = queue && queue.queue && queue.queue.some(p => p.prompt && p.prompt.includes(firstAction.script || firstAction.artifact));
      if (!alreadyQueued) {
        cp.execSync(`node scripts/selfPromptPipeline.js --add "${JSON.stringify(firstAction)}"`, { stdio: 'ignore' });
      }
    } catch (e) {
      // Fallback: just try to enqueue
      const cp = await import('child_process');
      cp.execSync(`node scripts/selfPromptPipeline.js --add "${JSON.stringify(firstAction)}"`, { stdio: 'ignore' });
    }
  }
}
