// Unlocks.ts - Spacer Tech unlock handlers
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getSpacerUnlocks = () => {
  const spacer = (techLevels as any[]).find((tl: any) => tl.id === 'spacer');
  return spacer ? spacer.gameplayUnlocks : [];
};
