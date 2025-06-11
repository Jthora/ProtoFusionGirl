// Unlocks.ts - Star Tech unlock handlers
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getStarUnlocks = () => {
  const star = (techLevels as any[]).find((tl: any) => tl.id === 'star');
  return star ? star.gameplayUnlocks : [];
};
