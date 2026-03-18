// spriteConstants.ts
// Feature flag and path constants for the real sprite pipeline.
// Set VITE_REAL_SPRITES=true in .env.local to enable atlas-based sprites.

// In Jest (Node.js), use process.env; in Vite browser builds, process.env is shimmed to {} via define
export const REAL_SPRITES_ENABLED = (typeof process !== 'undefined' && process.env?.VITE_REAL_SPRITES) === 'true';

export const SPRITE_ATLAS_BASE = 'public/assets/sprites';

export const JANE_ATLAS_KEY = 'jane';
export const JANE_ATLAS_PNG = `${SPRITE_ATLAS_BASE}/jane/jane_atlas.png`;
export const JANE_ATLAS_JSON = `${SPRITE_ATLAS_BASE}/jane/jane_atlas.json`;
