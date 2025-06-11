// Triggers.ts - Advancement and regression triggers for Neolithic Tech
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getNeolithicAdvancementTriggers = () => {
  const neolithic = (techLevels as any[]).find((tl: any) => tl.id === 'neolithic');
  return neolithic ? neolithic.advancementTriggers : [];
};

export const getNeolithicRegressionTriggers = () => {
  const neolithic = (techLevels as any[]).find((tl: any) => tl.id === 'neolithic');
  return neolithic ? neolithic.regressionTriggers : [];
};
