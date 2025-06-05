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
      statusObj.success = !(result.errors && result.errors.length > 0);
      statusObj.summary = result.summary || '';
      statusObj.errors = result.errors || [];
      // --- Enhancement: Generate Copilot Essential Info JSON after onboarding ---
      try {
        require('child_process').spawnSync('node', ['scripts/generateCopilotEssentialInfo.cjs'], { stdio: 'inherit' });
        // Merge all essential info into statusObj for Copilot
        const info = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts/copilot_essential_info.json'), 'utf8'));
        Object.assign(statusObj, info);
        // Print a Copilot onboarding summary for seamless UX
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
      // --- Copilot Instruction: Check all JSON outputs from onboarding subscripts ---
      statusObj.copilotInstructions = statusObj.copilotInstructions || [];
      statusObj.copilotInstructions.push(
        'Copilot/AI agents must read and process the JSON outputs of every script run during onboarding, not just copilot_onboarding_status.json. This includes outputs from scripts like guidedOnboarding.js, generateCopilotEssentialInfo.cjs, and any other onboarding/validation subscripts. Always check for additional JSON files in the artifacts/ directory after onboarding.'
      );
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
          // Merge all essential info into statusObj for Copilot
          const info = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts/copilot_essential_info.json'), 'utf8'));
          Object.assign(statusObj, info);
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
