// Triggers.ts - Advancement and regression triggers for Star Tech
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getStarAdvancementTriggers = () => {
  const star = (techLevels as any[]).find((tl: any) => tl.id === 'star');
  return star ? star.advancementTriggers : [];
};

export const getStarRegressionTriggers = () => {
  const star = (techLevels as any[]).find((tl: any) => tl.id === 'star');
  return star ? star.regressionTriggers : [];
};
