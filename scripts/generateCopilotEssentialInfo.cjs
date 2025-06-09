// generateCopilotEssentialInfo.js
// Aggregates all essential project-wide context and onboarding outputs for Copilot/AI agent operation
// Usage: node scripts/generateCopilotEssentialInfo.js [--output <path>]

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ARTIFACTS = [
  'ai_onboarding_2025-06-03.artifact',
  'artifact_index.artifact',
  'copilot_next_steps_2025-06-03.artifact',
  'copilot_memory.artifact',
  'project_state_2025-06-03.artifact'
];
const ESSENTIAL_FILES = [
  '../.primer',
  '../.manifest',
  '../.priming',
  '../.dashboard',
  '../.feedback',
  '../.startup',
  '../.schema',
  '../.persona',
  '../.init'
];
const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const SCRIPTS_DIR = path.join(__dirname);
const DOCS_INDEX = path.join(__dirname, '../docs/docs_index.json');
const PROJECT_ROOT = path.join(__dirname, '..');
const DEFAULT_PROJECT_FILES = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'jest.config.mjs',
  'jest.setup.js',
  '.eslintrc.js',
  'index.html',
  '.gitignore',
  // Add more as needed
];

function readFileIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

function parseIfPossible(content, fileName) {
  if (!content) return null;
  if (fileName.endsWith('.json')) {
    try { return JSON.parse(content); } catch { return content; }
  }
  if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
    try { return yaml.load(content); } catch { return content; }
  }
  if (fileName.endsWith('.artifact')) {
    // Try YAML frontmatter parse
    try {
      const match = content.match(/^---[\s\S]*?---/);
      if (match) return yaml.load(match[0].replace(/^---/, ''));
    } catch {}
    return content;
  }
  if (fileName.endsWith('.js') || fileName.endsWith('.ts') || fileName.endsWith('.mjs')) {
    // For config files, just return as string
    return content;
  }
  return content;
}

function getScriptsMetadata() {
  return fs.readdirSync(SCRIPTS_DIR)
    .filter(f => f.endsWith('.js') || f.endsWith('.cjs'))
    .map(f => {
      const content = readFileIfExists(path.join(SCRIPTS_DIR, f));
      const usage = (content && content.match(/\/\/\s*Usage:\s*([^\n]*)/)) ? RegExp.$1.trim() : '';
      const onboarding = (content && content.match(/\/\/\s*Onboarding:\s*([^\n]*)/)) ? RegExp.$1.trim() : '';
      const desc = (content && content.match(/\/\/\s*([^\n]*)/)) ? RegExp.$1.trim() : '';
      return { name: f, usage, onboarding, description: desc };
    });
}

function summarizeContent(content, fileName) {
  if (!content) return null;
  if (typeof content === 'string' && content.length > 2000) {
    // If content is too large, only include the first 500 chars and a note
    return {
      summary: content.slice(0, 500) + '... [truncated]',
      length: content.length,
      note: 'Content truncated to avoid large JSON.'
    };
  }
  if (typeof content === 'object' && content !== null) {
    // If object is too large, only include keys and type info
    const keys = Object.keys(content);
    if (keys.length > 50) {
      return {
        keys: keys.slice(0, 20),
        totalKeys: keys.length,
        note: 'Object keys only, content truncated.'
      };
    }
  }
  return content;
}

function main() {
  const args = process.argv.slice(2);
  let output = args.includes('--output') ? args[args.indexOf('--output') + 1] : path.join(ARTIFACTS_DIR, 'copilot_essential_info.json');
  const result = { timestamp: new Date().toISOString() };

  // Aggregate essential artifacts (parsed, summarized)
  result.artifacts = {};
  ARTIFACTS.forEach(name => {
    const filePath = path.join(ARTIFACTS_DIR, name);
    const content = readFileIfExists(filePath);
    const parsed = parseIfPossible(content, name);
    result.artifacts[name] = summarizeContent(parsed, name);
  });

  // Aggregate essential files (parsed, summarized)
  result.essentialFiles = {};
  ESSENTIAL_FILES.forEach(rel => {
    const abs = path.join(__dirname, rel);
    const content = readFileIfExists(abs);
    const parsed = parseIfPossible(content, path.basename(rel));
    result.essentialFiles[path.basename(rel)] = summarizeContent(parsed, path.basename(rel));
  });

  // Aggregate scripts metadata (already summary)
  result.scripts = getScriptsMetadata();

  // Aggregate docs index (parsed, summarized)
  const docsContent = readFileIfExists(DOCS_INDEX);
  const docsParsed = parseIfPossible(docsContent, 'docs_index.json');
  result.docsIndex = docsParsed && docsParsed.globalSummary ? docsParsed.globalSummary : summarizeContent(docsParsed, 'docs_index.json');

  // Always include docs_index_L1.json and docs_index_L2.json (summarized)
  const DOCS_INDEX_L1 = path.join(__dirname, '../docs/docs_index_L1.json');
  const DOCS_INDEX_L2 = path.join(__dirname, '../docs/docs_index_L2.json');
  const docsL1Content = readFileIfExists(DOCS_INDEX_L1);
  const docsL2Content = readFileIfExists(DOCS_INDEX_L2);
  result.docsIndexL1 = summarizeContent(parseIfPossible(docsL1Content, 'docs_index_L1.json'), 'docs_index_L1.json');
  result.docsIndexL2 = summarizeContent(parseIfPossible(docsL2Content, 'docs_index_L2.json'), 'docs_index_L2.json');

  // Add onboarding status if present (parsed, summarized)
  const onboardingStatus = path.join(ARTIFACTS_DIR, 'copilot_onboarding_status.json');
  result.onboardingStatus = summarizeContent(parseIfPossible(readFileIfExists(onboardingStatus), 'copilot_onboarding_status.json'), 'copilot_onboarding_status.json');

  // Aggregate default project files (parsed, summarized)
  result.projectFiles = {};
  DEFAULT_PROJECT_FILES.forEach(f => {
    const abs = path.join(PROJECT_ROOT, f);
    const content = readFileIfExists(abs);
    const parsed = parseIfPossible(content, f);
    result.projectFiles[f] = summarizeContent(parsed, f);
  });

  fs.writeFileSync(output, JSON.stringify(result, null, 2));
  console.log(`Wrote Copilot essential info to ${output}`);
}

// After writing copilot_essential_info.json, also print a summary for Copilot/AI agent
if (require.main === module) {
  main();
  // Print a short summary for Copilot/AI agent
  try {
    const info = JSON.parse(fs.readFileSync(path.join(ARTIFACTS_DIR, 'copilot_essential_info.json'), 'utf8'));
    console.log('\n[Copilot Essential Info Summary]');
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
    console.warn('Could not print Copilot essential info summary:', e.message);
  }
}