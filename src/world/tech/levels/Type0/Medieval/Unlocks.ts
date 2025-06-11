// Unlocks.ts - Medieval Tech unlock handlers
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getMedievalUnlocks = () => {
  const medieval = (techLevels as any[]).find((tl: any) => tl.id === 'medieval');
  return medieval ? medieval.gameplayUnlocks : [];
};
