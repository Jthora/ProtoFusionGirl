// Triggers.ts - Advancement and regression triggers for Holo Tech
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getHoloAdvancementTriggers = () => {
  const holo = (techLevels as any[]).find((tl: any) => tl.id === 'holo');
  return holo ? holo.advancementTriggers : [];
};

export const getHoloRegressionTriggers = () => {
  const holo = (techLevels as any[]).find((tl: any) => tl.id === 'holo');
  return holo ? holo.regressionTriggers : [];
};
