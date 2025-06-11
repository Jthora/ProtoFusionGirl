// Unlocks.ts - Neolithic Tech unlock handlers
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getNeolithicUnlocks = () => {
  const neolithic = (techLevels as any[]).find((tl: any) => tl.id === 'neolithic');
  return neolithic ? neolithic.gameplayUnlocks : [];
};
