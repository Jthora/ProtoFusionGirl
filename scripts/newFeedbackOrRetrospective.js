// newFeedbackOrRetrospective.js
// Usage: node scripts/newFeedbackOrRetrospective.js <type:feedback|retrospective> <related-artifact-filename>
// Onboarding: Creates a new feedback or retrospective artifact and links it to related artifacts for project learning and improvement.
// Prompts for summary, blockers, insights, next steps, and creates a new artifact.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  const [,, type, related] = process.argv;
  if (!type || !['feedback','retrospective'].includes(type)) {
    console.error('Usage: node scripts/newFeedbackOrRetrospective.js <type:feedback|retrospective> <related-artifact-filename>');
    process.exit(1);
  }
  const timestamp = getTimestamp();
  const filename = `${type}_${timestamp}.artifact`;
  const filePath = path.join(ARTIFACTS_DIR, filename);
  const summary = await prompt('Summary of change: ');
  const blockers = await prompt('Blockers (if any): ');
  const insights = await prompt('Insights: ');
  const nextSteps = await prompt('Next steps: ');
  const header = `// filepath: ${filePath}\n---\nartifact: ${type}_${timestamp}\ncreated: ${timestamp.slice(0,8)}\npurpose: ${type.charAt(0).toUpperCase()+type.slice(1)} for ${related || 'project'} change.\ntype: ${type}\ntags: [${type}, workflow, summary, automation]\nformat: markdown\nrelated: [${related ? '"'+related+'"' : ''}]\n---\n`;
  const body = `\n# ${type.charAt(0).toUpperCase()+type.slice(1)} (${timestamp.slice(0,8)})\n\n## Summary\n${summary}\n\n## Blockers\n${blockers}\n\n## Insights\n${insights}\n\n## Next Steps\n${nextSteps}\n`;
  fs.writeFileSync(filePath, header + body, 'utf8');
  console.log(`Created ${type} artifact: ${filename}`);
}

if (require.main === module) {
  main();
}
