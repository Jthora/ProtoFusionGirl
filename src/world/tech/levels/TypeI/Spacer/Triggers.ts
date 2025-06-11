// Triggers.ts - Advancement and regression triggers for Spacer Tech
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getSpacerAdvancementTriggers = () => {
  const spacer = (techLevels as any[]).find((tl: any) => tl.id === 'spacer');
  return spacer ? spacer.advancementTriggers : [];
};

export const getSpacerRegressionTriggers = () => {
  const spacer = (techLevels as any[]).find((tl: any) => tl.id === 'spacer');
  return spacer ? spacer.regressionTriggers : [];
};
