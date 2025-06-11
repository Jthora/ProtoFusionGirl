// NeolithicTech.ts - Feature module for Neolithic Tech (Type 0)
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getNeolithicTech = () => (techLevels as any[]).find((tl: any) => tl.id === 'neolithic');
