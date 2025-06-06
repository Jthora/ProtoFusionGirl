// assetValidation.ts
// Asset validation utility for ProtoFusionGirl
import * as fs from 'fs';
import * as path from 'path';

const requiredAssets = [
  'src/assets/tiles.json',
  'src/assets/tiles.png'
];

export function validateAssets(): boolean {
  let allExist = true;
  for (const asset of requiredAssets) {
    if (!fs.existsSync(path.resolve(asset))) {
      console.error(`[Asset Validation] Missing required asset: ${asset}`);
      allExist = false;
    }
  }
  if (allExist) {
    console.log('[Asset Validation] All required assets are present.');
  }
  return allExist;
}

if (require.main === module) {
  process.exit(validateAssets() ? 0 : 1);
}
