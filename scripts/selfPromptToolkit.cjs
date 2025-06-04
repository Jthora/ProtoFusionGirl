#!/usr/bin/env node
// selfPromptToolkit.cjs
// Toolkit for processing self_prompt_queue.json and extending the AI self-prompt pipeline (CommonJS version)

const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts');
const QUEUE_FILE = path.join(ARTIFACTS_DIR, 'self_prompt_queue.json');

function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) return { queue: [], history: [] };
  try {
    return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  } catch (e) {
    return { queue: [], history: [] };
  }
}

function saveQueue(data) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function listQueue() {
  const { queue } = loadQueue();
  if (queue.length === 0) {
    console.log('No prompts in queue.');
    return;
  }
  queue.forEach((item, idx) => {
    console.log(`[${idx}] Task: ${item.taskId || 'N/A'} | Purpose: ${item.purpose || 'N/A'} | Status: ${item.status || 'pending'} | Created: ${item.timestamp || item.created}`);
    if (item.prompt) console.log(`  Prompt: ${item.prompt}`);
  });
}

function processNextPrompt() {
  const data = loadQueue();
  if (data.queue.length === 0) {
    console.log('No prompts to process.');
    return;
  }
  const prompt = data.queue.shift();
  prompt.status = 'processed';
  prompt.processedAt = new Date().toISOString();
  data.history = data.history || [];
  data.history.push(prompt);
  saveQueue(data);
  console.log(`Processed prompt for task: ${prompt.taskId || 'N/A'}`);
  // In a real system, this is where codegen or AI action would occur
}

function processAllPrompts() {
  const data = loadQueue();
  if (data.queue.length === 0) {
    console.log('No prompts to process.');
    return;
  }
  while (data.queue.length > 0) {
    const prompt = data.queue.shift();
    prompt.status = 'processed';
    prompt.processedAt = new Date().toISOString();
    data.history = data.history || [];
    data.history.push(prompt);
    console.log(`Processed prompt for task: ${prompt.taskId || 'N/A'}`);
    // In a real system, this is where codegen or AI action would occur
  }
  saveQueue(data);
  console.log('All prompts processed.');
}

function clearQueue() {
  const data = loadQueue();
  data.history = data.history || [];
  data.history.push(...data.queue.map(p => ({ ...p, status: 'cleared', clearedAt: new Date().toISOString() })));
  data.queue = [];
  saveQueue(data);
  console.log('Cleared all prompts from queue.');
}

function showHistory() {
  const { history } = loadQueue();
  if (!history || history.length === 0) {
    console.log('No prompt history.');
    return;
  }
  history.forEach((item, idx) => {
    console.log(`[${idx}] Task: ${item.taskId || 'N/A'} | Status: ${item.status} | Processed: ${item.processedAt || item.clearedAt || 'N/A'}`);
    if (item.prompt) console.log(`  Prompt: ${item.prompt}`);
  });
}

function help() {
  console.log(`Self-Prompt Toolkit Usage:\n` +
    `  node scripts/selfPromptToolkit.cjs list         # List all prompts in the queue\n` +
    `  node scripts/selfPromptToolkit.cjs process      # Process the next prompt in the queue\n` +
    `  node scripts/selfPromptToolkit.cjs processAll   # Process all prompts in the queue\n` +
    `  node scripts/selfPromptToolkit.cjs clear        # Clear all prompts from the queue\n` +
    `  node scripts/selfPromptToolkit.cjs history      # Show processed prompt history\n` +
    `  node scripts/selfPromptToolkit.cjs help         # Show this help message\n`);
}

const cmd = process.argv[2];
switch (cmd) {
  case 'list':
    listQueue();
    break;
  case 'process':
    processNextPrompt();
    break;
  case 'processAll':
    processAllPrompts();
    break;
  case 'clear':
    clearQueue();
    break;
  case 'history':
    showHistory();
    break;
  default:
    help();
}
