// Triggers.ts - Advancement and regression triggers for Fusion Tech
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getFusionAdvancementTriggers = () => {
  const fusion = (techLevels as any[]).find((tl: any) => tl.id === 'fusion');
  return fusion ? fusion.advancementTriggers : [];
};

export const getFusionRegressionTriggers = () => {
  const fusion = (techLevels as any[]).find((tl: any) => tl.id === 'fusion');
  return fusion ? fusion.regressionTriggers : [];
};
