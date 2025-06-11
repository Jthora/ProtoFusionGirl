// Triggers.ts - Advancement and regression triggers for Cyber Tech
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getCyberAdvancementTriggers = () => {
  const cyber = (techLevels as any[]).find((tl: any) => tl.id === 'cyber');
  return cyber ? cyber.advancementTriggers : [];
};

export const getCyberRegressionTriggers = () => {
  const cyber = (techLevels as any[]).find((tl: any) => tl.id === 'cyber');
  return cyber ? cyber.regressionTriggers : [];
};
