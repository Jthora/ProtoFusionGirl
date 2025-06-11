// FusionTech.ts - Feature module for Fusion Tech (Type II)
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getFusionTech = () => (techLevels as any[]).find((tl: any) => tl.id === 'fusion');
