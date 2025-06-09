// scripts/copilotOnboarding.cjs
// Script to onboard GitHub Copilot (or any AI agent) to ProtoFusionGirl
// Runs the main onboarding script, waits for completion, parses output, and reports results

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function runOnboarding() {
  const proc = spawn('node', ['scripts/guidedOnboarding.js']);
  let stdout = '';
  let stderr = '';

  proc.stdout.on('data', (data) => {
    stdout += data.toString();
    process.stdout.write(data);
  });

  proc.stderr.on('data', (data) => {
    stderr += data.toString();
    process.stderr.write(data);
  });

  proc.on('close', (code) => {
    const timestamp = new Date().toISOString();
    console.log(`\n--- Copilot Onboarding Result [${timestamp}] ---`);
    let result = null;
    let statusObj = { success: false, errors: [], summary: '', timestamp };
    if (code !== 0) {
      console.error(`Onboarding script exited with code ${code}.`);
      if (stderr) {
        console.error('Error output:', stderr);
        statusObj.errors.push(stderr);
      }
      writeStatusFile(statusObj);
      process.exit(code);
    }
    // Try to extract and parse last JSON output if present
    result = extractLastJson(stdout);
    if (result) {
      // Only keep the most critical fields at the top
      statusObj.success = !(result.errors && result.errors.length > 0);
      statusObj.summary = result.summary || '';
      statusObj.errors = result.errors || [];
      // Place verbose or deep fields under a 'details' key
      statusObj.details = {
        artifacts: result.artifacts,
        essentialFiles: result.essentialFiles,
        scripts: result.scripts,
        projectFiles: result.projectFiles,
        onboardingStatus: result.onboardingStatus,
        docsIndex: result.docsIndex,
        docsIndexL1: result.docsIndexL1,
        docsIndexL2: result.docsIndexL2
      };
      // --- Enhancement: Generate Copilot Essential Info JSON after onboarding ---
      try {
        require('child_process').spawnSync('node', ['scripts/generateCopilotEssentialInfo.cjs'], { stdio: 'inherit' });
        // Only merge in summary fields at the top level (avoid hyper-engaging the file)
        const info = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts/copilot_essential_info.json'), 'utf8'));
        statusObj.copilotSummary = {
          artifacts: Object.keys(info.artifacts || {}).length,
          essentialFiles: Object.keys(info.essentialFiles || {}).length,
          scripts: info.scripts ? info.scripts.length : 0,
          projectFiles: Object.keys(info.projectFiles || {}).length,
          onboardingStatus: info.onboardingStatus && info.onboardingStatus.success !== undefined ? (info.onboardingStatus.success ? 'PASS' : 'FAIL') : undefined,
          docsIndexed: info.docsIndex && info.docsIndex.indexedFiles ? info.docsIndex.indexedFiles : undefined
        };
      } catch (e) {
        console.warn('Could not generate Copilot essential info:', e.message);
      }
      // --- Copilot Instruction: Check all JSON outputs from onboarding subscripts ---
      statusObj.copilotInstructions = statusObj.copilotInstructions || [];
      statusObj.copilotInstructions.push(
        'Copilot/AI agents must read and process the JSON outputs of every script run during onboarding, not just copilot_onboarding_status.json. This includes outputs from scripts like guidedOnboarding.js, generateCopilotEssentialInfo.cjs, and any other onboarding/validation subscripts. Always check for additional JSON files in the artifacts/ directory after onboarding.'
      );
      // Remove verbose fields from top level if present (forcefully)
      ['artifacts','essentialFiles','scripts','projectFiles','onboardingStatus','docsIndex','docsIndexL1','docsIndexL2'].forEach(k=>{if(statusObj[k])delete statusObj[k];});
      // Move all verbose fields under a single 'details' key (overwrite if needed)
      statusObj.details = {
        artifacts: result.artifacts,
        essentialFiles: result.essentialFiles,
        scripts: result.scripts,
        projectFiles: result.projectFiles,
        onboardingStatus: result.onboardingStatus,
        docsIndex: result.docsIndex,
        docsIndexL1: result.docsIndexL1,
        docsIndexL2: result.docsIndexL2
      };
      writeStatusFile(statusObj);
    } else {
      console.warn('Could not parse onboarding output as JSON. Raw output:');
      console.log(stdout);
      if (stdout.toLowerCase().includes('success') || stdout.includes('Onboarding Pass: true')) {
        statusObj.success = true;
        statusObj.summary = 'Onboarding appears successful.';
        // --- Enhancement: Generate Copilot Essential Info JSON after onboarding ---
        try {
          require('child_process').spawnSync('node', ['scripts/generateCopilotEssentialInfo.cjs'], { stdio: 'inherit' });
          // Only merge in summary fields at the top level (avoid hyper-engaging the file)
          const info = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts/copilot_essential_info.json'), 'utf8'));
          statusObj.copilotSummary = {
            artifacts: Object.keys(info.artifacts || {}).length,
            essentialFiles: Object.keys(info.essentialFiles || {}).length,
            scripts: info.scripts ? info.scripts.length : 0,
            projectFiles: Object.keys(info.projectFiles || {}).length,
            onboardingStatus: info.onboardingStatus && info.onboardingStatus.success !== undefined ? (info.onboardingStatus.success ? 'PASS' : 'FAIL') : undefined,
            docsIndexed: info.docsIndex && info.docsIndex.indexedFiles ? info.docsIndex.indexedFiles : undefined
          };
        } catch (e) {
          console.warn('Could not generate Copilot essential info:', e.message);
        }
        // --- Copilot Instruction: Check all JSON outputs from onboarding subscripts ---
        statusObj.copilotInstructions = statusObj.copilotInstructions || [];
        statusObj.copilotInstructions.push(
          'Copilot/AI agents must read and process the JSON outputs of every script run during onboarding, not just copilot_onboarding_status.json. This includes outputs from scripts like guidedOnboarding.js, generateCopilotEssentialInfo.cjs, and any other onboarding/validation subscripts. Always check for additional JSON files in the artifacts/ directory after onboarding.'
        );
        writeStatusFile(statusObj);
        console.log('Onboarding appears successful.');
        // Do not exit with error if onboarding appears successful
      } else {
        statusObj.errors.push('Could not parse onboarding output as JSON.');
        writeStatusFile(statusObj);
        console.error('Onboarding may have failed. Please review the output above.');
        process.exit(1);
      }
    }
  });
}

function extractLastJson(str) {
  // Find the last JSON object in a string (robust to logs before/after)
  const matches = str.match(/({[\s\S]*})/g);
  if (!matches) return null;
  try {
    return JSON.parse(matches[matches.length - 1]);
  } catch (e) {
    return null;
  }
}

function writeStatusFile(statusObj) {
  const statusPath = path.join(__dirname, '../artifacts/copilot_onboarding_status.json');
  statusObj.timestamp = new Date().toISOString();
  fs.writeFileSync(statusPath, JSON.stringify(statusObj, null, 2));
  console.log(`Onboarding status written to ${statusPath}`);
}

function writeSummaryFile(statusObj, info) {
  // Compose minimal summary for Copilot/AI (≤50 lines)
  // 1. Gather all tasks from all artifacts with a .tasks array
  let allTasks = [];
  if (info && info.artifacts) {
    Object.values(info.artifacts).forEach(artifact => {
      if (artifact && Array.isArray(artifact.tasks)) {
        allTasks = allTasks.concat(artifact.tasks);
      }
    });
  }
  // Sort tasks by priority (if available), then status (open/todo first)
  allTasks = allTasks.sort((a, b) => {
    const prioA = a.priority !== undefined ? a.priority : 99;
    const prioB = b.priority !== undefined ? b.priority : 99;
    if (prioA !== prioB) return prioA - prioB;
    if (a.status === 'open' || a.status === 'todo') return -1;
    if (b.status === 'open' || b.status === 'todo') return 1;
    return 0;
  });
  // 2. Find 2 most recent artifacts by created/last_updated date
  let recentArtifacts = [];
  if (info && info.artifacts) {
    recentArtifacts = Object.entries(info.artifacts)
      .map(([filename, v]) => {
        let date = v && (v.created || v.last_updated);
        return { filename, type: v.type || '', created: date || '', _sort: date ? new Date(date) : new Date(0) };
      })
      .sort((a, b) => b._sort - a._sort)
      .slice(0, 2)
      .map(({ filename, type, created }) => ({ filename, type, created }));
  }
  // 3. Extract blockers and next steps from any artifact with those fields
  let blockers = [];
  let nextSteps = [];
  if (info && info.artifacts) {
    Object.values(info.artifacts).forEach(artifact => {
      if (artifact && Array.isArray(artifact.blockers)) {
        blockers = blockers.concat(artifact.blockers);
      }
      if (artifact && Array.isArray(artifact.nextSteps)) {
        nextSteps = nextSteps.concat(artifact.nextSteps);
      }
    });
  }
  // Fallbacks
  if (blockers.length === 0 && statusObj.errors && statusObj.errors.length) {
    blockers = statusObj.errors.slice(0, 2);
  }
  if (nextSteps.length === 0) {
    nextSteps = [
      'Run Validate Schemas task',
      'Review open tasks in tasks/ folder'
    ];
  }
  // Truncate arrays to keep summary ≤50 lines
  const summary = {
    success: statusObj.success,
    timestamp: statusObj.timestamp,
    errors: statusObj.errors && statusObj.errors.length ? statusObj.errors.slice(0, 3) : [],
    criticalTasks: allTasks.slice(0, 3).map(t => ({
      title: t.title || t.name || '',
      status: t.status || '',
      priority: t.priority || ''
    })),
    recentArtifacts,
    blockers: blockers.slice(0, 2),
    nextSteps: nextSteps.slice(0, 3)
  };
  const summaryPath = path.join(__dirname, '../artifacts/copilot_onboarding_status_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`Minimal Copilot onboarding summary written to ${summaryPath}`);
}

function remediationHints(errors) {
  if (!errors || errors.length === 0) return;
  console.log('\n--- Remediation Hints ---');
  errors.forEach((err, i) => {
    console.log(`Error ${i + 1}:`, err);
    if (typeof err === 'string') {
      if (err.toLowerCase().includes('schema')) {
        console.log('Hint: Run "Validate Schemas" task or check your schema files.');
      } else if (err.toLowerCase().includes('manifest')) {
        console.log('Hint: Run "Update Manifest" task.');
      } else if (err.toLowerCase().includes('permission')) {
        console.log('Hint: Check file/folder permissions.');
      }
    }
  });
}

runOnboarding();
