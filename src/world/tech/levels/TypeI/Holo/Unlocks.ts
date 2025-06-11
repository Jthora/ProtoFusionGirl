// @ts-ignore
import techLevels from '../../tech/tech_levels.json';
import type { TechLevel } from '../../TechLevel';

export const getHoloUnlocks = () => {
  const holo = (techLevels as TechLevel[]).find((tl: TechLevel) => tl.id === 'holo');
  return holo ? holo.gameplayUnlocks : [];
};
