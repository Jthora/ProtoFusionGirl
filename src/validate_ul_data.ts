// validate_ul_data.ts
// Validates all canonical UL data artifacts against the canonical TypeScript interfaces.
// Usage: npx ts-node src/validate_ul_data.ts

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import * as ulTypes from './ul_canonical_types';

// Map artifact filenames to their expected canonical types (update as needed)
const artifactTypeMap: Record<string, z.ZodTypeAny> = {
  'ul_grammar_rules_copilot.artifact': ulTypes.ULGrammarRulesSchema,
  'ul_test_cases_copilot.artifact': ulTypes.ULTestCasesSchema,
  'ul_puzzle_templates_copilot.artifact': ulTypes.ULPuzzleTemplatesSchema,
  'ul_symbol_index_copilot.artifact': ulTypes.ULSymbolIndexSchema,
  'ul_spell_recipes_copilot.artifact': ulTypes.ULSpellRecipesSchema,
  'ul_phonetic_glyph_map_copilot.artifact': ulTypes.ULPhoneticGlyphMapSchema,
  'ul_cosmic_rules_copilot.artifact': ulTypes.ULCosmicRulesSchema,
};

const ARTIFACTS_DIR = path.resolve(__dirname, '../artifacts');

function loadArtifact(filename: string): any {
  const filePath = path.join(ARTIFACTS_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  // Remove any YAML/Markdown frontmatter if present
  const jsonStart = raw.indexOf('{');
  if (jsonStart >= 0) {
    try {
      return JSON.parse(raw.slice(jsonStart));
    } catch (e) {
      return null;
    }
  }
  return null;
}

function validateArtifacts() {
  const report: Array<{file: string, valid: boolean, errors?: string[]}> = [];
  for (const [filename, schema] of Object.entries(artifactTypeMap)) {
    const data = loadArtifact(filename);
    if (!data) {
      report.push({file: filename, valid: false, errors: ['Could not parse JSON from artifact.']});
      continue;
    }
    const result = schema.safeParse(data);
    if (result.success) {
      report.push({file: filename, valid: true});
    } else {
      report.push({file: filename, valid: false, errors: result.error.errors.map(e => e.message)});
    }
  }
  return report;
}

function main() {
  const report = validateArtifacts();
  let allValid = true;
  for (const entry of report) {
    if (entry.valid) {
      console.log(`✅ ${entry.file}: VALID`);
    } else {
      allValid = false;
      console.error(`❌ ${entry.file}: INVALID`);
      if (entry.errors) {
        for (const err of entry.errors) {
          console.error(`   - ${err}`);
        }
      }
    }
  }
  if (!allValid) {
    process.exit(1);
  }
}

main();
