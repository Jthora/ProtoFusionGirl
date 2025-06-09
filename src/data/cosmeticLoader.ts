// cosmeticLoader.ts
// Loads cosmetic definitions from data/cosmetics.json
import cosmeticsData from './cosmetics.json';

export interface CosmeticDefinition {
  id: string;
  type: 'outfit' | 'hairstyle' | 'wings';
  name: string;
  unlockCondition: string;
}

export function loadCosmetics(): CosmeticDefinition[] {
  return cosmeticsData as CosmeticDefinition[];
}
