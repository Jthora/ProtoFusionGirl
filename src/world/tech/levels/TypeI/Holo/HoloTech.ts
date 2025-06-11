// HoloTech.ts - Feature module for Holo Tech (Type I)
// import type { TechLevel } from '../../TechLevel';
import techLevels from '../../tech/tech_levels.json';

export const getHoloTech = () => techLevels.find(tl => tl.id === 'holo');
