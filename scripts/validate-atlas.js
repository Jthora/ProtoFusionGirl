#!/usr/bin/env node
/**
 * validate-atlas.js — validates built atlas JSON files against sprite-catalog.json.
 *
 * Usage:
 *   npm run sprites:validate
 *   node scripts/validate-atlas.js [--character jane]
 *
 * Exit codes:
 *   0 — all atlases valid
 *   1 — validation failure(s) found
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
const filterCharIdx = args.indexOf('--character');
const filterChar = filterCharIdx !== -1 ? args[filterCharIdx + 1] : null;

const catalog = JSON.parse(readFileSync(resolve(__dirname, 'sprite-catalog.json'), 'utf8'));

let errors = 0;

for (const [charId, cfg] of Object.entries(catalog.characters)) {
  if (filterChar && charId !== filterChar) continue;

  for (const anim of cfg.animations) {
    const key = anim.key;
    const jsonPath = resolve(ROOT, cfg.output_dir, `${key}.json`);
    const pngPath  = resolve(ROOT, cfg.output_dir, `${key}.png`);

    if (!existsSync(jsonPath)) {
      console.error(`[validate] MISSING JSON: ${jsonPath}`);
      errors++;
      continue;
    }
    if (!existsSync(pngPath)) {
      console.error(`[validate] MISSING PNG:  ${pngPath}`);
      errors++;
    }

    let atlasJson;
    try {
      atlasJson = JSON.parse(readFileSync(jsonPath, 'utf8'));
    } catch (e) {
      console.error(`[validate] INVALID JSON: ${jsonPath} — ${e.message}`);
      errors++;
      continue;
    }

    const frames = atlasJson.frames ?? {};
    const frameKeys = Object.keys(frames);

    // Check at least 1 frame
    if (frameKeys.length === 0) {
      console.error(`[validate] EMPTY: ${key} has no frames`);
      errors++;
      continue;
    }

    // Check naming pattern: <key>_NNN
    const badKeys = frameKeys.filter(k => !k.startsWith(key + '_'));
    if (badKeys.length > 0) {
      console.error(`[validate] BAD KEYS in ${key}: ${badKeys.slice(0, 3).join(', ')}`);
      errors++;
    }

    // Check for duplicates
    const seen = new Set();
    for (const k of frameKeys) {
      if (seen.has(k)) {
        console.error(`[validate] DUPLICATE KEY in ${key}: ${k}`);
        errors++;
      }
      seen.add(k);
    }

    // Bounds check: all frame coords must be positive
    for (const [fkey, fdata] of Object.entries(frames)) {
      const { x, y, w, h } = fdata.frame ?? {};
      if (x == null || y == null || w == null || h == null) {
        console.error(`[validate] MISSING COORDS: ${key}/${fkey}`);
        errors++;
      } else if (x < 0 || y < 0 || w <= 0 || h <= 0) {
        console.error(`[validate] INVALID COORDS: ${key}/${fkey} x=${x} y=${y} w=${w} h=${h}`);
        errors++;
      }
    }

    console.log(`[validate] OK: ${key} (${frameKeys.length} frames)`);
  }
}

if (errors > 0) {
  console.error(`\n[validate] FAILED: ${errors} error(s) found.`);
  process.exit(1);
} else {
  console.log('\n[validate] All atlases valid.');
  process.exit(0);
}
