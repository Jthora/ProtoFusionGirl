// promptFeedbackLinkage.js
// Usage: node scripts/promptFeedbackLinkage.js <feedbackArtifact> <relatedArtifactOrCode>
// Onboarding: Prompts for feedback/retrospective linkage and updates both artifacts with cross-links.

const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');

function updateRelatedField(filePath, relatedToAdd) {
  let content = fs.readFileSync(filePath, 'utf8');
  const headerMatch = content.match(/---([\s\S]*?)---/);
  if (!headerMatch) return;
  let header = headerMatch[1];
  let relatedMatch = header.match(/related:\s*\[([\s\S]*?)\]/);
  let relatedArr = [];
  if (relatedMatch) {
    try {
      relatedArr = JSON.parse('[' + relatedMatch[1].replace(/'/g, '"') + ']');
    } catch {
      relatedArr = relatedMatch[1].match(/\w+\.artifact/g) || [];
    }
  }
  if (!relatedArr.includes(relatedToAdd)) {
    relatedArr.push(relatedToAdd);
    header = header.replace(/related:\s*\[[^\]]*\]/, `related: ${JSON.stringify(relatedArr, null, 2)}`);
    content = content.replace(/---([\s\S]*?)---/, '---' + header + '---');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated related field in ${filePath}`);
  }
}

function main() {
  const [,, feedbackArtifact, related] = process.argv;
  if (!feedbackArtifact || !related) {
    console.error('Usage: node scripts/promptFeedbackLinkage.js <feedbackArtifact> <relatedArtifactOrCode>');
    process.exit(1);
  }
  const feedbackPath = path.join(ARTIFACTS_DIR, feedbackArtifact);
  const relatedPath = path.join(ARTIFACTS_DIR, related);
  if (fs.existsSync(feedbackPath) && fs.existsSync(relatedPath)) {
    updateRelatedField(feedbackPath, related);
    updateRelatedField(relatedPath, feedbackArtifact);
  } else {
    console.warn('One or both files do not exist in artifacts/. For code files, please add a reference comment manually.');
  }
}

if (require.main === module) {
  main();
}
