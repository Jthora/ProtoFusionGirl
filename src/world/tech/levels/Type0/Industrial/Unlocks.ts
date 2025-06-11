// Unlocks.ts - Industrial Tech unlock handlers
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getIndustrialUnlocks = () => {
  const industrial = (techLevels as any[]).find((tl: any) => tl.id === 'industrial');
  return industrial ? industrial.gameplayUnlocks : [];
};
