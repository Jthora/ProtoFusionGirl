import { WarpZone } from './WarpZoneUtils';

/**
 * Generates a strong hash (SHA-256, hex) from a warp zone datablob for use as a datakey/seed.
 * Uses the SubtleCrypto API if available, otherwise falls back to a simple hash.
 */
export async function hashWarpZoneDatablob(datablob: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    // Browser: use SubtleCrypto
    const encoder = new TextEncoder();
    const data = encoder.encode(datablob);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  } else if (typeof require !== 'undefined') {
    // Node.js: use built-in crypto
    try {
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(datablob).digest('hex');
    } catch {
      // Fallback
      return simpleHash(datablob);
    }
  } else {
    // Fallback
    return simpleHash(datablob);
  }
}

/**
 * Simple non-cryptographic hash (fallback only).
 */
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Utility: Generate a datakey/seed for a warp zone (async, returns hex string).
 */
export async function getWarpZoneDatakey(zone: WarpZone): Promise<string> {
  const datablob = JSON.stringify(zone);
  return hashWarpZoneDatablob(datablob);
}
