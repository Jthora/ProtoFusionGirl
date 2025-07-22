// SpeedCategories.ts
// Core speed classification system for magnetospeeder navigation
// Implementation follows docs/navigation/implementation-guide-2d.md

export enum SpeedCategory {
  WALKING = "walking",           // 5-50 km/h
  GROUND_VEHICLE = "ground",     // 50-200 km/h
  AIRCRAFT = "aircraft",         // 200-2000 km/h
  SUPERSONIC = "supersonic",     // Mach 1-10 (343-3430 m/s)
  HYPERSONIC = "hypersonic"      // Mach 10-1000 (3430-343000 m/s)
}

export enum CollisionMethod {
  PRECISE_PIXEL = "precise_pixel",
  BOUNDING_BOX = "bounding_box",
  SWEPT_VOLUME = "swept_volume",
  RAYCAST_TUNNEL = "raycast_tunnel",
  PREDICTIVE_PATH = "predictive_path"
}

export enum UILayout {
  DETAILED = "detailed",
  AUTOMOTIVE = "automotive",
  AVIATION = "aviation",
  MILITARY = "military",
  ORBITAL = "orbital"
}

export interface SpeedConfig {
  category: SpeedCategory;
  minSpeedKmh: number;
  maxSpeedKmh: number;
  physicsSubsteps: number;
  collisionMethod: CollisionMethod;
  cameraZoom: number;
  uiLayout: UILayout;
}

export class SpeedClassifier {
  private static readonly SPEED_CONFIGS: SpeedConfig[] = [
    {
      category: SpeedCategory.WALKING,
      minSpeedKmh: 0,
      maxSpeedKmh: 50,
      physicsSubsteps: 1,
      collisionMethod: CollisionMethod.PRECISE_PIXEL,
      cameraZoom: 1.0,
      uiLayout: UILayout.DETAILED
    },
    {
      category: SpeedCategory.GROUND_VEHICLE,
      minSpeedKmh: 50,
      maxSpeedKmh: 200,
      physicsSubsteps: 1,
      collisionMethod: CollisionMethod.BOUNDING_BOX,
      cameraZoom: 0.5,
      uiLayout: UILayout.AUTOMOTIVE
    },
    {
      category: SpeedCategory.AIRCRAFT,
      minSpeedKmh: 200,
      maxSpeedKmh: 1200,  // Reduced to make room for supersonic at Mach 1
      physicsSubsteps: 2,
      collisionMethod: CollisionMethod.SWEPT_VOLUME,
      cameraZoom: 0.1,
      uiLayout: UILayout.AVIATION
    },
    {
      category: SpeedCategory.SUPERSONIC,
      minSpeedKmh: 1200,  // Mach 1 ≈ 1235 km/h, start slightly below
      maxSpeedKmh: 12000, // Mach 10 ≈ 12350 km/h
      physicsSubsteps: 10,
      collisionMethod: CollisionMethod.RAYCAST_TUNNEL,
      cameraZoom: 0.02,
      uiLayout: UILayout.MILITARY
    },
    {
      category: SpeedCategory.HYPERSONIC,
      minSpeedKmh: 12000,  // Mach 10+
      maxSpeedKmh: 343000, // Mach 1000
      physicsSubsteps: 100,
      collisionMethod: CollisionMethod.PREDICTIVE_PATH,
      cameraZoom: 0.002,
      uiLayout: UILayout.ORBITAL
    }
  ];

  static classifySpeed(speedKmh: number): SpeedConfig {
    // Use absolute value to handle negative speeds (backward movement)
    const absSpeedKmh = Math.abs(speedKmh);
    
    for (const config of this.SPEED_CONFIGS) {
      if (absSpeedKmh >= config.minSpeedKmh && absSpeedKmh < config.maxSpeedKmh) {
        return config;
      }
    }
    return this.SPEED_CONFIGS[this.SPEED_CONFIGS.length - 1]; // Default to hypersonic
  }

  static getSpeedConfigs(): SpeedConfig[] {
    return [...this.SPEED_CONFIGS];
  }

  static getConfigByCategory(category: SpeedCategory): SpeedConfig | undefined {
    return this.SPEED_CONFIGS.find(config => config.category === category);
  }

  static getNextSpeedCategory(currentCategory: SpeedCategory): SpeedCategory | null {
    const currentIndex = this.SPEED_CONFIGS.findIndex(config => config.category === currentCategory);
    if (currentIndex === -1 || currentIndex >= this.SPEED_CONFIGS.length - 1) {
      return null;
    }
    return this.SPEED_CONFIGS[currentIndex + 1].category;
  }

  static getPreviousSpeedCategory(currentCategory: SpeedCategory): SpeedCategory | null {
    const currentIndex = this.SPEED_CONFIGS.findIndex(config => config.category === currentCategory);
    if (currentIndex <= 0) {
      return null;
    }
    return this.SPEED_CONFIGS[currentIndex - 1].category;
  }
}
