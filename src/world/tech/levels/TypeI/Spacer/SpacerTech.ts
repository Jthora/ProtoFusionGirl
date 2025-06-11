// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getSpacerTech = () => (techLevels as any[]).find((tl: any) => tl.id === 'spacer');
