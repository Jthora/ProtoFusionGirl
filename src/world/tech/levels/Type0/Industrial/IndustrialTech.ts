// IndustrialTech.ts - Feature module for Industrial Tech (Type 0)
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getIndustrialTech = () => (techLevels as any[]).find((tl: any) => tl.id === 'industrial');
