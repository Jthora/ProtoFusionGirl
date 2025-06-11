// Triggers.ts - Advancement and regression triggers for Medieval Tech
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getMedievalAdvancementTriggers = () => {
  const medieval = (techLevels as any[]).find((tl: any) => tl.id === 'medieval');
  return medieval ? medieval.advancementTriggers : [];
};

export const getMedievalRegressionTriggers = () => {
  const medieval = (techLevels as any[]).find((tl: any) => tl.id === 'medieval');
  return medieval ? medieval.regressionTriggers : [];
};
