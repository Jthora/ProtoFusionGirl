// Risks.ts - Risks and consequences for Holo Tech
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getHoloRisks = () => {
  const holo = (techLevels as any[]).find((tl: any) => tl.id === 'holo');
  return holo ? holo.risks : [];
};
