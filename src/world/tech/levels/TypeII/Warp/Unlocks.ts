// Unlocks.ts - Warp Tech unlock handlers
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getWarpUnlocks = () => {
  const warp = (techLevels as any[]).find((tl: any) => tl.id === 'warp');
  return warp ? warp.gameplayUnlocks : [];
};
