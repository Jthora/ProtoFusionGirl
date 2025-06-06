// scripts/indexDocs.js
// Scans docs/ for .md files, extracts headings and summaries, outputs docs/docs_index.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_FILE = path.join(DOCS_DIR, 'docs_index.json');
const OUTPUT_FILE_L1 = path.join(DOCS_DIR, 'docs_index_L1.json');
const OUTPUT_FILE_L2 = path.join(DOCS_DIR, 'docs_index_L2.json');

function getMarkdownFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(dir, f));
}

function extractHeadingsAndSummary(content) {
  const lines = content.split('\n');
  const headings = [];
  let summary = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#+)\s+(.*)/);
    if (headingMatch) {
      headings.push({
        level: headingMatch[1].length,
        text: headingMatch[2].trim()
      });
    }
    if (summary === '' && line.trim() && !line.startsWith('#')) {
      summary = line.trim();
    }
  }
  return { headings, summary };
}

function getMarkdownFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFilesRecursively(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });
  return results;
}

function extractSections(content) {
  const lines = content.split('\n');
  const sections = [];
  let current = { heading: null, level: 0, text: '', codeBlocks: [], tables: [] };
  let inCode = false, codeLang = '', codeBuffer = [], inTable = false, tableBuffer = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#+)\s+(.*)/);
    if (headingMatch) {
      if (current.heading || current.text.trim()) sections.push({ ...current });
      current = { heading: headingMatch[2].trim(), level: headingMatch[1].length, text: '', codeBlocks: [], tables: [] };
      inCode = false; inTable = false;
      continue;
    }
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.replace('```', '').trim();
        codeBuffer = [];
      } else {
        inCode = false;
        current.codeBlocks.push({ lang: codeLang, code: codeBuffer.join('\n') });
        codeLang = '';
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      continue;
    }
    if (line.startsWith('|') && line.includes('|')) {
      inTable = true;
      tableBuffer.push(line);
      continue;
    }
    if (inTable && (!line.startsWith('|') || !line.includes('|'))) {
      inTable = false;
      if (tableBuffer.length) {
        current.tables.push(tableBuffer.join('\n'));
        tableBuffer = [];
      }
    }
    if (!inCode && !inTable) {
      current.text += line + '\n';
    }
  }
  if (current.heading || current.text.trim()) sections.push({ ...current });
  return sections;
}

function extractKeywords(headings, codeBlocks) {
  const headingWords = headings.map(h => h.text.toLowerCase().split(/\W+/)).flat();
  const codeLangs = codeBlocks.map(cb => cb.lang).filter(Boolean);
  return Array.from(new Set([...headingWords, ...codeLangs])).filter(Boolean);
}

function getTitleFromHeadingsOrFilename(headings, file) {
  if (headings && headings.length > 0) return headings[0].text;
  return path.basename(file, path.extname(file));
}

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error('docs/ directory not found.');
    process.exit(1);
  }
  const files = getMarkdownFilesRecursively(DOCS_DIR);
  let globalHeadings = [], globalKeywords = [], totalSections = 0;
  const l2Index = [];
  const l1Index = [];
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const { headings, summary } = extractHeadingsAndSummary(content);
    const sections = extractSections(content);
    const codeBlocks = sections.map(s => s.codeBlocks).flat();
    const keywords = extractKeywords(headings, codeBlocks);
    globalHeadings = globalHeadings.concat(headings);
    globalKeywords = globalKeywords.concat(keywords);
    totalSections += sections.length;
    const stat = fs.statSync(file);
    // L2: Deep index
    l2Index.push({
      file: path.relative(process.cwd(), file),
      headings,
      summary,
      sections: sections.map(s => ({
        heading: s.heading,
        level: s.level,
        firstParagraph: s.text.split('\n').find(l => l.trim()),
        codeBlocks: s.codeBlocks,
        tables: s.tables
      })),
      keywords,
      lastModified: stat.mtime.toISOString()
    });
    // L1: Summary index
    l1Index.push({
      file: path.relative(process.cwd(), file),
      title: getTitleFromHeadingsOrFilename(headings, file),
      summary: summary ? summary.slice(0, 200) : ''
    });
  });
  // Automation hooks
  const automation = [
    { name: 'Update Docs Index', type: 'vscode-task', command: 'Update Docs Index' },
    { name: 'Guided Onboarding (JSON)', type: 'vscode-task', command: 'Guided Onboarding (JSON)' },
    { name: 'Project Dashboard (JSON)', type: 'vscode-task', command: 'Project Dashboard (JSON)' }
  ];
  const globalSummary = {
    indexedFiles: files.length,
    totalSections,
    uniqueKeywords: Array.from(new Set(globalKeywords)),
    allHeadings: globalHeadings.map(h => h.text),
    automation
  };
  // Write L2 (deep) index
  fs.writeFileSync(OUTPUT_FILE_L2, JSON.stringify({ globalSummary, docs: l2Index }, null, 2));
  // Write L1 (summary) index
  fs.writeFileSync(OUTPUT_FILE_L1, JSON.stringify({ indexedFiles: files.length, docs: l1Index }, null, 2));
  // For backward compatibility, keep the old index as L2
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ globalSummary, docs: l2Index }, null, 2));
  console.log(`Indexed ${files.length} docs. Output: ${OUTPUT_FILE_L1}, ${OUTPUT_FILE_L2}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
