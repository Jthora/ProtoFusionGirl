// SimpleBiomeClassifier.ts
// Basic implementation of biome classification based on elevation and latitude
// Uses simplified climate zones and elevation bands

import { BiomeClassifier, BiomeType, MaterialType } from './types';

export class SimpleBiomeClassifier implements BiomeClassifier {
  
  classifyBiome(
    elevation: number,
    lat: number,
    temperature?: number,
    precipitation?: number
  ): BiomeType {
    const absLat = Math.abs(lat);
    
    // Ocean/Water
    if (elevation < 0) {
      return BiomeType.Ocean;
    }
    
    // Coastal areas (just above sea level)
    if (elevation >= 0 && elevation < 10) {
      return BiomeType.Coastal;
    }
    
    // High elevation biomes (elevation-based classification)
    if (elevation > 4000) {
      return BiomeType.Alpine;
    }
    
    if (elevation > 2000) {
      if (absLat > 60) {
        return BiomeType.Arctic;
      }
      return BiomeType.Mountain;
    }
    
    if (elevation > 1000) {
      if (absLat > 60) {
        return BiomeType.Tundra;
      }
      return BiomeType.Mountain;
    }
    
    // Latitude-based classification for lower elevations
    
    // Polar regions (>66.5° latitude)
    if (absLat > 66.5) {
      if (elevation > 500) {
        return BiomeType.Alpine;
      }
      return BiomeType.Arctic;
    }
    
    // Subpolar regions (60-66.5° latitude)
    if (absLat > 60) {
      if (elevation > 200) {
        return BiomeType.Mountain;
      }
      return BiomeType.Tundra;
    }
    
    // Temperate regions (30-60° latitude)
    if (absLat > 30) {
      // Use temperature and precipitation if available
      if (temperature !== undefined && precipitation !== undefined) {
        if (temperature < 0) {
          return BiomeType.Tundra;
        }
        if (precipitation < 250) {
          return BiomeType.Desert;
        }
        if (precipitation > 1000) {
          return BiomeType.Forest;
        }
      }
      
      // Fallback to elevation-based classification
      if (elevation > 500) {
        return BiomeType.Forest;
      }
      return BiomeType.Plains;
    }
    
    // Subtropical regions (23.5-30° latitude)
    if (absLat > 23.5) {
      if (precipitation !== undefined) {
        if (precipitation < 300) {
          return BiomeType.Desert;
        }
        if (precipitation > 800) {
          return BiomeType.Forest;
        }
      }
      
      // Mediterranean/subtropical classification
      if (elevation > 300) {
        return BiomeType.Forest;
      }
      return BiomeType.Grassland;
    }
    
    // Tropical regions (0-23.5° latitude)
    if (precipitation !== undefined) {
      if (precipitation < 400) {
        return BiomeType.Desert;
      }
      if (precipitation > 1500) {
        return BiomeType.Rainforest;
      }
      if (precipitation > 600) {
        return BiomeType.Tropical;
      }
    }
    
    // Fallback tropical classification
    if (elevation > 1000) {
      return BiomeType.Mountain;
    }
    if (elevation > 200) {
      return BiomeType.Tropical;
    }
    
    return BiomeType.Tropical;
  }

  getBiomeMaterials(biome: BiomeType): MaterialType[] {
    const materials: MaterialType[] = [];
    
    switch (biome) {
      case BiomeType.Ocean:
      case BiomeType.Coastal:
        materials.push(MaterialType.Water, MaterialType.Salt);
        break;
        
      case BiomeType.Mountain:
      case BiomeType.Alpine:
        materials.push(
          MaterialType.Stone,
          MaterialType.Metal,
          MaterialType.Crystal,
          MaterialType.Coal
        );
        break;
        
      case BiomeType.Forest:
      case BiomeType.Rainforest:
        materials.push(
          MaterialType.Wood,
          MaterialType.Organic,
          MaterialType.Water
        );
        break;
        
      case BiomeType.Desert:
        materials.push(
          MaterialType.Sand,
          MaterialType.Stone,
          MaterialType.Salt
        );
        break;
        
      case BiomeType.Arctic:
      case BiomeType.Tundra:
        materials.push(
          MaterialType.Ice,
          MaterialType.Water,
          MaterialType.Stone
        );
        break;
        
      case BiomeType.Plains:
      case BiomeType.Grassland:
        materials.push(
          MaterialType.Organic,
          MaterialType.Clay,
          MaterialType.Water
        );
        break;
        
      case BiomeType.Tropical:
        materials.push(
          MaterialType.Wood,
          MaterialType.Organic,
          MaterialType.Water
        );
        break;
        
      case BiomeType.Savanna:
        materials.push(
          MaterialType.Organic,
          MaterialType.Clay,
          MaterialType.Wood
        );
        break;
        
      case BiomeType.Swamp:
        materials.push(
          MaterialType.Water,
          MaterialType.Organic,
          MaterialType.Clay
        );
        break;
        
      case BiomeType.Urban:
        materials.push(
          MaterialType.Metal,
          MaterialType.Stone,
          MaterialType.Coal
        );
        break;
        
      default:
        // Default materials for unknown biomes
        materials.push(MaterialType.Stone, MaterialType.Organic);
        break;
    }
    
    return materials;
  }

  isBiomeWalkable(biome: BiomeType): boolean {
    switch (biome) {
      case BiomeType.Ocean:
        return false; // Cannot walk on water
        
      case BiomeType.Swamp:
        return true; // Difficult but possible
        
      case BiomeType.Alpine:
        return true; // Difficult terrain but walkable
        
      case BiomeType.Desert:
        return true; // Harsh but walkable
        
      case BiomeType.Arctic:
      case BiomeType.Tundra:
        return true; // Cold but walkable
        
      default:
        return true; // Most biomes are walkable
    }
  }

  // Additional helper methods for enhanced classification
  
  getSeasonalBiomeVariation(
    baseBiome: BiomeType,
    season: 'spring' | 'summer' | 'autumn' | 'winter',
    lat: number
  ): BiomeType {
    const absLat = Math.abs(lat);
    
    // Seasonal variations are more pronounced at higher latitudes
    if (absLat < 23.5) {
      // Tropical regions have minimal seasonal variation
      return baseBiome;
    }
    
    switch (season) {
      case 'winter':
        if (absLat > 45 && baseBiome === BiomeType.Forest) {
          return BiomeType.Tundra; // Winter forest conditions
        }
        if (absLat > 60 && baseBiome === BiomeType.Plains) {
          return BiomeType.Arctic; // Winter conditions
        }
        break;
        
      case 'summer':
        if (baseBiome === BiomeType.Tundra && absLat < 70) {
          return BiomeType.Plains; // Summer thaw
        }
        break;
        
      default:
        // Spring and autumn typically match base biome
        break;
    }
    
    return baseBiome;
  }

  getBiomeTemperatureRange(biome: BiomeType): { min: number; max: number } {
    // Temperature ranges in Celsius
    switch (biome) {
      case BiomeType.Arctic:
        return { min: -40, max: -10 };
      case BiomeType.Tundra:
        return { min: -20, max: 5 };
      case BiomeType.Alpine:
        return { min: -10, max: 10 };
      case BiomeType.Mountain:
        return { min: 0, max: 20 };
      case BiomeType.Forest:
        return { min: 5, max: 25 };
      case BiomeType.Plains:
      case BiomeType.Grassland:
        return { min: 10, max: 30 };
      case BiomeType.Desert:
        return { min: 15, max: 50 };
      case BiomeType.Tropical:
      case BiomeType.Rainforest:
        return { min: 20, max: 35 };
      case BiomeType.Savanna:
        return { min: 18, max: 35 };
      case BiomeType.Swamp:
        return { min: 15, max: 30 };
      case BiomeType.Ocean:
      case BiomeType.Coastal:
        return { min: 0, max: 30 };
      default:
        return { min: 0, max: 25 };
    }
  }

  getBiomePrecipitationRange(biome: BiomeType): { min: number; max: number } {
    // Precipitation ranges in mm/year
    switch (biome) {
      case BiomeType.Desert:
        return { min: 0, max: 400 };
      case BiomeType.Arctic:
      case BiomeType.Tundra:
        return { min: 100, max: 400 };
      case BiomeType.Plains:
      case BiomeType.Grassland:
        return { min: 300, max: 800 };
      case BiomeType.Savanna:
        return { min: 400, max: 1200 };
      case BiomeType.Forest:
        return { min: 600, max: 1500 };
      case BiomeType.Tropical:
        return { min: 800, max: 2000 };
      case BiomeType.Rainforest:
        return { min: 1500, max: 4000 };
      case BiomeType.Swamp:
        return { min: 1000, max: 3000 };
      default:
        return { min: 400, max: 1200 };
    }
  }
}
