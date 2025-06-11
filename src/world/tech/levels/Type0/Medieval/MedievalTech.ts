// MedievalTech.ts - Feature module for Medieval Tech (Type 0)
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getMedievalTech = () => (techLevels as any[]).find((tl: any) => tl.id === 'medieval');
