// Triggers.ts - Advancement and regression triggers for Industrial Tech
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getIndustrialAdvancementTriggers = () => {
  const industrial = (techLevels as any[]).find((tl: any) => tl.id === 'industrial');
  return industrial ? industrial.advancementTriggers : [];
};

export const getIndustrialRegressionTriggers = () => {
  const industrial = (techLevels as any[]).find((tl: any) => tl.id === 'industrial');
  return industrial ? industrial.regressionTriggers : [];
};
