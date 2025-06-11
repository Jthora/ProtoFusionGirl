// Unlocks.ts - Cyber Tech unlock handlers
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getCyberUnlocks = () => {
  const cyber = (techLevels as any[]).find((tl: any) => tl.id === 'cyber');
  return cyber ? cyber.gameplayUnlocks : [];
};
