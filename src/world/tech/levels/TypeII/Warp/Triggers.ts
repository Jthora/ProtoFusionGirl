// Triggers.ts - Advancement and regression triggers for Warp Tech
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getWarpAdvancementTriggers = () => {
  const warp = (techLevels as any[]).find((tl: any) => tl.id === 'warp');
  return warp ? warp.advancementTriggers : [];
};

export const getWarpRegressionTriggers = () => {
  const warp = (techLevels as any[]).find((tl: any) => tl.id === 'warp');
  return warp ? warp.regressionTriggers : [];
};
