// WarpTech.ts - Feature module for Warp Tech (Type II)
// @ts-ignore
import techLevels from '../../tech/tech_levels.json';

export const getWarpTech = () => (techLevels as any[]).find((tl: any) => tl.id === 'warp');
