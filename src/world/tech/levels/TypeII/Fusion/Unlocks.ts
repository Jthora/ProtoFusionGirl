// Unlocks.ts - Fusion Tech unlock handlers
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getFusionUnlocks = () => {
  const fusion = (techLevels as any[]).find((tl: any) => tl.id === 'fusion');
  return fusion ? fusion.gameplayUnlocks : [];
};
// Add feature-specific unlock handler functions here as needed
