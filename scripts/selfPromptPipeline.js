// selfPromptPipeline.js
// Usage: node scripts/selfPromptPipeline.js [--json] [--init] [--queue=<file>]
// Onboarding: Enables Copilot to autonomously self-prompt in a cycle, with a JSON interface and a pipeline request queue for iterative development.

import fs from 'fs';
import path from 'path';

const QUEUE_FILE = path.join(__dirname, '../artifacts/self_prompt_queue.json');
const args = process.argv.slice(2);
const outputJson = args.includes('--json');
const init = args.includes('--init');
const queueFile = (args.find(a => a.startsWith('--queue=')) || '').split('=')[1] || QUEUE_FILE;

if (init) {
  // Initialize the self-prompt queue
  fs.writeFileSync(queueFile, JSON.stringify({ queue: [], history: [] }, null, 2));
  if (!outputJson) console.log('Initialized self-prompt pipeline queue.');
  else console.log(JSON.stringify({ status: 'initialized', queueFile }));
  process.exit(0);
}

// Load or create the queue
let queue = { queue: [], history: [] };
if (fs.existsSync(queueFile)) {
  queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
}

// Add a new prompt to the queue
function addPrompt(prompt) {
  queue.queue.push({ prompt, created: new Date().toISOString(), status: 'pending' });
  fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));
}

// Get the next prompt
function getNextPrompt() {
  return queue.queue.find(p => p.status === 'pending');
}

// Mark a prompt as complete
function completePrompt(index, result) {
  if (queue.queue[index]) {
    queue.queue[index].status = 'done';
    queue.queue[index].result = result;
    queue.history.push(queue.queue[index]);
    queue.queue.splice(index, 1);
    fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));
  }
}

// Add a prompt from CLI: node scripts/selfPromptPipeline.js --add "Prompt text here"
const addArg = args.find(a => a === '--add');
const addIndex = args.indexOf('--add');
if (addIndex !== -1 && args[addIndex + 1]) {
  addPrompt(args[addIndex + 1]);
  if (!outputJson) console.log('Added prompt to queue.');
  else console.log(JSON.stringify({ status: 'added', prompt: args[addIndex + 1] }));
  process.exit(0);
}

// Complete the next prompt: node scripts/selfPromptPipeline.js --complete "Result text here"
const completeArg = args.find(a => a === '--complete');
const completeIndex = args.indexOf('--complete');
if (completeIndex !== -1 && args[completeIndex + 1]) {
  const next = getNextPrompt();
  if (next) {
    const idx = queue.queue.findIndex(p => p === next);
    completePrompt(idx, args[completeIndex + 1]);
    if (!outputJson) console.log('Completed prompt.');
    else console.log(JSON.stringify({ status: 'completed', result: args[completeIndex + 1] }));
  } else {
    console.log('No pending prompts to complete.');
  }
  process.exit(0);
}

// Example usage: node scripts/selfPromptPipeline.js --json
if (outputJson) {
  console.log(JSON.stringify({ queue: queue.queue, history: queue.history }, null, 2));
} else {
  console.log('Self-Prompt Pipeline Queue:');
  queue.queue.forEach((p, i) => console.log(`${i + 1}. ${p.prompt} [${p.status}]`));
  if (!queue.queue.length) console.log('No pending prompts.');
}

// Export functions for Copilot/AI agent use
export { addPrompt, getNextPrompt, completePrompt, queueFile };
