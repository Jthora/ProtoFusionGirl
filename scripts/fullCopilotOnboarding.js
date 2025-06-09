#!/usr/bin/env node
/**
 * fullCopilotOnboarding.js
 *
 * Fully automates the Copilot/AI onboarding process as described in ONBOARDING.md.
 * Runs all onboarding phases, validates context, and outputs a summary artifact.
 *
 * Usage: node scripts/fullCopilotOnboarding.js [--auto-task]
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const ARTIFACTS = path.join(ROOT, 'artifacts');
const DOCS = path.join(ROOT, 'docs');
const SCRIPTS = path.join(ROOT, 'scripts');
const TASKS = path.join(ROOT, 'tasks');

function readFileSafe(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function runScript(script, args = []) {
  try {
    const result = spawnSync('node', [path.join(SCRIPTS, script), ...args], { encoding: 'utf8' });
    return { code: result.status, stdout: result.stdout, stderr: result.stderr };
  } catch (e) {
    return { code: 1, stdout: '', stderr: e.message };
  }
}

function phase(title, fn) {
  console.log(`\n=== ${title} ===`);
  try {
    return fn();
  } catch (e) {
    console.error(`[ERROR] ${title}:`, e);
    return { error: e.message };
  }
}

function listFiles(dir, filter) {
  try {
    return fs.readdirSync(dir).filter(f => !filter || filter(f));
  } catch {
    return [];
  }
}

// Helper to truncate long strings or arrays
function truncateOutput(output, maxLines = 20, maxChars = 1000) {
  if (typeof output === 'string') {
    const lines = output.split('\n');
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n') + `\n... (truncated, ${lines.length - maxLines} more lines)`;
    }
    if (output.length > maxChars) {
      return output.slice(0, maxChars) + `\n... (truncated, exceeded ${maxChars} chars)`;
    }
    return output;
  } else if (Array.isArray(output)) {
    if (output.length > maxLines) {
      return output.slice(0, maxLines).concat([`... (truncated, ${output.length - maxLines} more items)`]);
    }
    return output;
  } else if (typeof output === 'object' && output !== null) {
    // Recursively truncate object values
    const result = {};
    for (const key in output) {
      result[key] = truncateOutput(output[key], maxLines, maxChars);
    }
    return result;
  }
  return output;
}

// Helper: Summarize file by extracting YAML/JSON header or first 3 lines
function summarizeFile(content) {
  if (!content) return '';
  // Try YAML/Markdown header
  if (content.startsWith('---')) {
    const end = content.indexOf('---', 3);
    if (end > 0) return content.slice(0, end + 3);
  }
  // Try JSON
  if (content.trim().startsWith('{')) {
    try {
      const obj = JSON.parse(content);
      return JSON.stringify(obj, null, 2).split('\n').slice(0, 5).join('\n') + '\n...';
    } catch {}
  }
  // Fallback: first 3 lines
  return content.split('\n').slice(0, 3).join('\n') + '\n...';
}

// Helper: Summarize Jest output (show summary and first error only)
function summarizeTestResults(stdout) {
  if (!stdout) return '';
  const lines = stdout.split('\n');
  const summary = lines.filter(l => l.match(/Tests:|Snapshots:|Time:/)).join(' ');
  const firstErrorIdx = lines.findIndex(l => l.match(/●|FAIL|Error|Exception/));
  let error = '';
  if (firstErrorIdx !== -1) {
    error = lines.slice(firstErrorIdx, firstErrorIdx + 10).join('\n') + '\n...';
  }
  return summary + (error ? '\nFirst error:\n' + error : '');
}

// Helper: Write JSON file safely
function writeJsonFile(file, obj) {
  try {
    fs.writeFileSync(file, JSON.stringify(obj, null, 2));
    return true;
  } catch (e) {
    console.error(`[ONBOARDING] Failed to write ${file}:`, e);
    return false;
  }
}

// Helper: Make concise summary from full output (50-100 lines)
function makeSummaryFromFull(full) {
  const summary = {
    phases: [],
    errors: full.errors || []
  };
  if (full.phases && Array.isArray(full.phases)) {
    for (const p of full.phases) {
      if (!p) continue;
      // Only keep title, summary, and error if present
      const phaseSummary = {};
      if (p.title) phaseSummary.title = p.title;
      if (p.summary) phaseSummary.summary = p.summary;
      if (p.error) phaseSummary.error = p.error;
      summary.phases.push(phaseSummary);
    }
  }
  // Optionally add top-level metadata if present
  if (full.meta) summary.meta = full.meta;
  return summary;
}

// Parse CLI args for optional test phase
const args = process.argv.slice(2);
const withTest = args.includes('--with-test');

function main() {
  // Store full output for detailed report
  const summaryFull = { phases: [], errors: [] };

  // Phase 1: Core Context & Rules
  const phase1 = phase('Phase 1: Core Context & Rules', () => {
    const files = ['.primer', '.priming', '.manifest', '.dashboard', '.feedback'];
    const results = files.map(f => {
      const content = readFileSafe(path.join(ROOT, f));
      return { file: f, summary: summarizeFile(content) };
    });
    return {
      summary: `Summarized ${results.length} core onboarding files.`,
      files: results
    };
  });
  summaryFull.phases.push({ title: 'Phase 1: Core Context & Rules', ...phase1 });
  if (phase1.error) summaryFull.errors.push({ phase: 'Core Context & Rules', error: phase1.error });

  // Phase 2: Artifact & Documentation Index (dynamic listing)
  const phase2 = phase('Phase 2: Artifact & Documentation Index', () => {
    const artifactFiles = listFiles(ARTIFACTS, f => f.endsWith('.artifact'));
    const docFiles = listFiles(DOCS, f => f.endsWith('.json') || f.endsWith('.md'));
    return {
      summary: `Indexed ${artifactFiles.length} artifacts, ${docFiles.length} docs.`,
      artifactFiles: artifactFiles.slice(0, 10).concat(artifactFiles.length > 10 ? [`... (${artifactFiles.length - 10} more)`] : []),
      docFiles: docFiles.slice(0, 10).concat(docFiles.length > 10 ? [`... (${docFiles.length - 10} more)`] : [])
    };
  });
  summaryFull.phases.push({ title: 'Phase 2: Artifact & Documentation Index', ...phase2 });
  if (phase2.error) summaryFull.errors.push({ phase: 'Artifact & Documentation Index', error: phase2.error });

  // Phase 3: Scripts & Automation
  const phase3 = phase('Phase 3: Scripts & Automation', () => {
    const scriptFiles = listFiles(SCRIPTS, f => f.endsWith('.js') || f.endsWith('.cjs') || f.endsWith('.ts'));
    const keyScripts = scriptFiles.slice(0, 3);
    const scriptSummaries = keyScripts.map(name => {
      const result = runScript(name, name === 'guidedOnboarding.js' ? ['--auto'] : []);
      return {
        script: name,
        code: result.code,
        stdout: summarizeFile(result.stdout),
        stderr: summarizeFile(result.stderr)
      };
    });
    return {
      summary: `Found ${scriptFiles.length} scripts. Ran ${keyScripts.length} key scripts for validation.`,
      scripts: scriptFiles,
      keyScriptResults: scriptSummaries
    };
  });
  summaryFull.phases.push({ title: 'Phase 3: Scripts & Automation', ...phase3 });
  if (phase3.error) summaryFull.errors.push({ phase: 'Scripts & Automation', error: phase3.error });

  // Phase 4: Directory & Data
  const phase4 = phase('Phase 4: Directory & Data', () => {
    const dirStruct = readFileSafe(path.join(ROOT, 'directory-structure.txt'));
    const folders = ['artifacts', 'tasks', 'persona_core', 'data', 'docs', 'scripts'];
    const readmes = folders.map(folder => {
      const file = path.join(ROOT, folder, 'README.md');
      return { folder, summary: summarizeFile(readFileSafe(file)) };
    });
    const taskFiles = listFiles(TASKS, f => f.endsWith('.task'));
    return {
      summary: `Loaded directory structure. ${folders.length} folders, ${taskFiles.length} tasks indexed.`,
      dirStruct: summarizeFile(dirStruct),
      readmes,
      taskFiles: taskFiles.slice(0, 10).concat(taskFiles.length > 10 ? [`... (${taskFiles.length - 10} more)`] : [])
    };
  });
  summaryFull.phases.push({ title: 'Phase 4: Directory & Data', ...phase4 });
  if (phase4.error) summaryFull.errors.push({ phase: 'Directory & Data', error: phase4.error });

  // Optional Phase 5: Validation & Test
  if (withTest) {
    const phase5 = phase('Phase 5: Validation & Test', () => {
      try {
        const result = spawnSync('npx', ['jest', '--runInBand', '--detectOpenHandles', '--forceExit', '--no-cache'], { encoding: 'utf8' });
        return {
          summary: summarizeTestResults(result.stdout),
          code: result.status
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    summaryFull.phases.push({ title: 'Phase 5: Validation & Test', ...phase5 });
    if (phase5.error) summaryFull.errors.push({ phase: 'Validation & Test', error: phase5.error });
  } else {
    summaryFull.phases.push({ title: 'Phase 5: Validation & Test', summary: 'Test phase skipped (run with --with-test to enable).' });
  }

  // Derive concise summary from full
  const summary = makeSummaryFromFull(summaryFull);

  // Write both summary and full artifacts
  const SUMMARY_FILE = path.join(ARTIFACTS, 'copilot_onboarding_status_summary.json');
  const FULL_FILE = path.join(ARTIFACTS, 'copilot_onboarding_status_full.json');
  writeJsonFile(SUMMARY_FILE, summary);
  writeJsonFile(FULL_FILE, summaryFull);
  console.log(`\n[ONBOARDING] Status summary written to ${SUMMARY_FILE}`);
  console.log(`[ONBOARDING] Full onboarding report written to ${FULL_FILE}`);

  // Escalate if errors found
  if (summaryFull.errors.length > 0 || summaryFull.phases.some(p => p && p.error)) {
    console.error('\n[ONBOARDING] Errors detected during onboarding. Please check the summary and escalate via a feedback artifact if needed.');
    process.exit(1);
  } else {
    console.log('\n[ONBOARDING] Full Copilot onboarding completed successfully.');
    process.exit(0);
  }
}

main();
