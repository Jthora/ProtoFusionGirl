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

/**
 * Loads a mod from IPFS using the given CID.
 * @param {string} cid - The CID of the mod to load.
 * @returns {Promise<void>}
 */
async function loadModFromIPFS(cid) {
  try {
    const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
    const modData = await response.json();
    if (!modData.name || !modData.version || !modData.entry) {
      throw new Error('Invalid mod metadata: missing required fields');
    }
    if (modData.assets && !Array.isArray(modData.assets)) {
      throw new Error('Invalid mod metadata: assets must be an array');
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

/**
 * Utility: Validate mod metadata structure.
 * @param {any} modData - The mod metadata to validate.
 * @returns {boolean} True if the metadata is valid, false otherwise.
 */
function validateMod(modData) {
  return (
    typeof modData === 'object' &&
    typeof modData.name === 'string' &&
    typeof modData.version === 'string' &&
    typeof modData.entry === 'string' &&
    (modData.assets === undefined || Array.isArray(modData.assets))
  );
}

module.exports = { loadModFromIPFS, validateMod };