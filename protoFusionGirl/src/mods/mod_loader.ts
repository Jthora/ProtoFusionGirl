// @ts-nocheck

// Remove ESM import for Jest compatibility
// import { create } from 'ipfs-http-client';

// const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

// Mod metadata schema for validation (JSDoc only for JS compatibility)
/**
 * @typedef {{ type: string, cid: string }} ModAsset
 * @typedef {{ name: string, version: string, entry: string, assets?: ModAsset[] }} ModMetadata
 */

// Remove TypeScript interfaces for CommonJS Jest compatibility

import { z } from 'zod';

// Zod schema for mod validation
export const ModAssetSchema = z.object({
  key: z.string(),
  cid: z.string(),
});

export const ModSchema = z.object({
  name: z.string(),
  version: z.string(),
  entry: z.string(),
  assets: z.array(ModAssetSchema).optional(),
  description: z.string().optional(),
});

/**
 * Utility: Validate mod metadata structure using zod.
 * @param {any} modData - The mod metadata to validate.
 * @returns {boolean} True if the metadata is valid, false otherwise.
 */
export function validateMod(modData: unknown): boolean {
  const result = ModSchema.safeParse(modData);
  return result.success;
}

/**
 * Loads a mod from IPFS using the given CID.
 * @param {string} cid - The CID of the mod to load.
 * @returns {Promise<void>}
 */
async function loadModFromIPFS(cid) {
  try {
    const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
    const modData = await response.json();
    if (!validateMod(modData)) {
      throw new Error('Invalid mod metadata: schema validation failed');
    }
    const scriptUrl = `https://ipfs.io/ipfs/${modData.entry}`;
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    document.body.appendChild(script);
    console.log(`Loaded mod ${modData.name} v${modData.version}`);
  } catch (err) {
    console.error('Failed to load mod from IPFS:', err);
  }
}

import sampleMod from './sample_mod.json';

export function loadSampleMod() {
  if (!validateMod(sampleMod)) {
    console.error('Invalid mod schema:', sampleMod);
    return;
  }
  // Log mod info
  console.log(`Loading mod: ${sampleMod.name} v${sampleMod.version}`);
  // Load assets from IPFS (mocked: just log CIDs)
  sampleMod.assets.forEach(asset => {
    console.log(`Would load asset key: ${asset.key}, CID: ${asset.cid}`);
    // In production, fetch from IPFS and add to game cache
  });
  // Simulate loading mod script (entry)
  console.log(`Would load mod script from IPFS: ${sampleMod.entry}`);
  // In production, dynamically load and execute the mod script
}

// Optionally, call loadSampleMod() for testing
// loadSampleMod();