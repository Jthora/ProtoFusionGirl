// CyberTech.ts - Feature module for Cyber Tech (Type I)

// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getCyberTech = () => (techLevels as any[]).find((tl: any) => tl.id === 'cyber');
