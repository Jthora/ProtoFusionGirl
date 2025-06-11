// StarTech.ts - Feature module for Star Tech (Type II)
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getStarTech = () => (techLevels as any[]).find((tl: any) => tl.id === 'star');
