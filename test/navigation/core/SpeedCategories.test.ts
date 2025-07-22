// SpeedCategories.test.ts
// Test suite for speed classification system
// Validates speed category transitions and configurations

import { 
  SpeedCategory, 
  SpeedClassifier, 
  CollisionMethod, 
  UILayout 
} from '../../../src/navigation/core/SpeedCategories';

describe('SpeedCategories', () => {
  describe('SpeedClassifier', () => {
    test('should classify walking speeds correctly', () => {
      const config = SpeedClassifier.classifySpeed(5);
      expect(config.category).toBe(SpeedCategory.WALKING);
      expect(config.minSpeedKmh).toBe(0);
      expect(config.maxSpeedKmh).toBe(50);
      expect(config.physicsSubsteps).toBe(1);
      expect(config.collisionMethod).toBe(CollisionMethod.PRECISE_PIXEL);
      expect(config.cameraZoom).toBe(1.0);
      expect(config.uiLayout).toBe(UILayout.DETAILED);
    });

    test('should classify ground vehicle speeds correctly', () => {
      const config = SpeedClassifier.classifySpeed(100);
      expect(config.category).toBe(SpeedCategory.GROUND_VEHICLE);
      expect(config.minSpeedKmh).toBe(50);
      expect(config.maxSpeedKmh).toBe(200);
      expect(config.physicsSubsteps).toBe(1);
      expect(config.collisionMethod).toBe(CollisionMethod.BOUNDING_BOX);
      expect(config.cameraZoom).toBe(0.5);
      expect(config.uiLayout).toBe(UILayout.AUTOMOTIVE);
    });

    test('should classify aircraft speeds correctly', () => {
      const config = SpeedClassifier.classifySpeed(500);
      expect(config.category).toBe(SpeedCategory.AIRCRAFT);
      expect(config.minSpeedKmh).toBe(200);
      expect(config.maxSpeedKmh).toBe(1200);
      expect(config.physicsSubsteps).toBe(2);
      expect(config.collisionMethod).toBe(CollisionMethod.SWEPT_VOLUME);
      expect(config.cameraZoom).toBe(0.1);
      expect(config.uiLayout).toBe(UILayout.AVIATION);
    });

    test('should classify supersonic speeds correctly', () => {
      const config = SpeedClassifier.classifySpeed(3000);
      expect(config.category).toBe(SpeedCategory.SUPERSONIC);
      expect(config.minSpeedKmh).toBe(1200);
      expect(config.maxSpeedKmh).toBe(12000);
      expect(config.physicsSubsteps).toBe(10);
      expect(config.collisionMethod).toBe(CollisionMethod.RAYCAST_TUNNEL);
      expect(config.cameraZoom).toBe(0.02);
      expect(config.uiLayout).toBe(UILayout.MILITARY);
    });

    test('should classify hypersonic speeds correctly', () => {
      const config = SpeedClassifier.classifySpeed(50000);
      expect(config.category).toBe(SpeedCategory.HYPERSONIC);
      expect(config.minSpeedKmh).toBe(12000);
      expect(config.maxSpeedKmh).toBe(343000);
      expect(config.physicsSubsteps).toBe(100);
      expect(config.collisionMethod).toBe(CollisionMethod.PREDICTIVE_PATH);
      expect(config.cameraZoom).toBe(0.002);
      expect(config.uiLayout).toBe(UILayout.ORBITAL);
    });

    test('should handle edge cases at speed boundaries', () => {
      // Test exact boundary values
      expect(SpeedClassifier.classifySpeed(0).category).toBe(SpeedCategory.WALKING);
      expect(SpeedClassifier.classifySpeed(49).category).toBe(SpeedCategory.WALKING);
      expect(SpeedClassifier.classifySpeed(50).category).toBe(SpeedCategory.GROUND_VEHICLE);
      expect(SpeedClassifier.classifySpeed(199).category).toBe(SpeedCategory.GROUND_VEHICLE);
      expect(SpeedClassifier.classifySpeed(200).category).toBe(SpeedCategory.AIRCRAFT);
      expect(SpeedClassifier.classifySpeed(1199).category).toBe(SpeedCategory.AIRCRAFT);
      expect(SpeedClassifier.classifySpeed(1200).category).toBe(SpeedCategory.SUPERSONIC);
      expect(SpeedClassifier.classifySpeed(11999).category).toBe(SpeedCategory.SUPERSONIC);
      expect(SpeedClassifier.classifySpeed(12000).category).toBe(SpeedCategory.HYPERSONIC);
    });

    test('should default to hypersonic for extremely high speeds', () => {
      const config = SpeedClassifier.classifySpeed(1000000);
      expect(config.category).toBe(SpeedCategory.HYPERSONIC);
    });

    test('should handle negative speeds', () => {
      const config = SpeedClassifier.classifySpeed(-25); // abs(-25) = 25, which is walking
      expect(config.category).toBe(SpeedCategory.WALKING);
    });
  });

  describe('Speed Configuration Utilities', () => {
    test('should return all speed configurations', () => {
      const configs = SpeedClassifier.getSpeedConfigs();
      expect(configs).toHaveLength(5);
      expect(configs[0].category).toBe(SpeedCategory.WALKING);
      expect(configs[4].category).toBe(SpeedCategory.HYPERSONIC);
    });

    test('should get configuration by category', () => {
      const walkingConfig = SpeedClassifier.getConfigByCategory(SpeedCategory.WALKING);
      expect(walkingConfig).toBeDefined();
      expect(walkingConfig?.category).toBe(SpeedCategory.WALKING);
      expect(walkingConfig?.cameraZoom).toBe(1.0);

      const supersonicConfig = SpeedClassifier.getConfigByCategory(SpeedCategory.SUPERSONIC);
      expect(supersonicConfig).toBeDefined();
      expect(supersonicConfig?.category).toBe(SpeedCategory.SUPERSONIC);
      expect(supersonicConfig?.physicsSubsteps).toBe(10);
    });

    test('should return undefined for invalid category', () => {
      const invalidConfig = SpeedClassifier.getConfigByCategory('invalid' as SpeedCategory);
      expect(invalidConfig).toBeUndefined();
    });

    test('should get next speed category', () => {
      expect(SpeedClassifier.getNextSpeedCategory(SpeedCategory.WALKING))
        .toBe(SpeedCategory.GROUND_VEHICLE);
      expect(SpeedClassifier.getNextSpeedCategory(SpeedCategory.GROUND_VEHICLE))
        .toBe(SpeedCategory.AIRCRAFT);
      expect(SpeedClassifier.getNextSpeedCategory(SpeedCategory.AIRCRAFT))
        .toBe(SpeedCategory.SUPERSONIC);
      expect(SpeedClassifier.getNextSpeedCategory(SpeedCategory.SUPERSONIC))
        .toBe(SpeedCategory.HYPERSONIC);
      expect(SpeedClassifier.getNextSpeedCategory(SpeedCategory.HYPERSONIC))
        .toBe(null);
    });

    test('should get previous speed category', () => {
      expect(SpeedClassifier.getPreviousSpeedCategory(SpeedCategory.WALKING))
        .toBe(null);
      expect(SpeedClassifier.getPreviousSpeedCategory(SpeedCategory.GROUND_VEHICLE))
        .toBe(SpeedCategory.WALKING);
      expect(SpeedClassifier.getPreviousSpeedCategory(SpeedCategory.AIRCRAFT))
        .toBe(SpeedCategory.GROUND_VEHICLE);
      expect(SpeedClassifier.getPreviousSpeedCategory(SpeedCategory.SUPERSONIC))
        .toBe(SpeedCategory.AIRCRAFT);
      expect(SpeedClassifier.getPreviousSpeedCategory(SpeedCategory.HYPERSONIC))
        .toBe(SpeedCategory.SUPERSONIC);
    });

    test('should handle invalid categories in navigation methods', () => {
      expect(SpeedClassifier.getNextSpeedCategory('invalid' as SpeedCategory))
        .toBe(null);
      expect(SpeedClassifier.getPreviousSpeedCategory('invalid' as SpeedCategory))
        .toBe(null);
    });
  });

  describe('Speed Category Properties', () => {
    test('should have appropriate physics substeps for each category', () => {
      const walking = SpeedClassifier.getConfigByCategory(SpeedCategory.WALKING);
      const supersonic = SpeedClassifier.getConfigByCategory(SpeedCategory.SUPERSONIC);
      const hypersonic = SpeedClassifier.getConfigByCategory(SpeedCategory.HYPERSONIC);

      expect(walking?.physicsSubsteps).toBe(1);
      expect(supersonic?.physicsSubsteps).toBe(10);
      expect(hypersonic?.physicsSubsteps).toBe(100);
    });

    test('should have appropriate camera zoom levels', () => {
      const walking = SpeedClassifier.getConfigByCategory(SpeedCategory.WALKING);
      const aircraft = SpeedClassifier.getConfigByCategory(SpeedCategory.AIRCRAFT);
      const hypersonic = SpeedClassifier.getConfigByCategory(SpeedCategory.HYPERSONIC);

      expect(walking?.cameraZoom).toBe(1.0);
      expect(aircraft?.cameraZoom).toBe(0.1);
      expect(hypersonic?.cameraZoom).toBe(0.002);
    });

    test('should have appropriate collision methods', () => {
      const walking = SpeedClassifier.getConfigByCategory(SpeedCategory.WALKING);
      const aircraft = SpeedClassifier.getConfigByCategory(SpeedCategory.AIRCRAFT);
      const hypersonic = SpeedClassifier.getConfigByCategory(SpeedCategory.HYPERSONIC);

      expect(walking?.collisionMethod).toBe(CollisionMethod.PRECISE_PIXEL);
      expect(aircraft?.collisionMethod).toBe(CollisionMethod.SWEPT_VOLUME);
      expect(hypersonic?.collisionMethod).toBe(CollisionMethod.PREDICTIVE_PATH);
    });

    test('should have appropriate UI layouts', () => {
      const walking = SpeedClassifier.getConfigByCategory(SpeedCategory.WALKING);
      const ground = SpeedClassifier.getConfigByCategory(SpeedCategory.GROUND_VEHICLE);
      const aircraft = SpeedClassifier.getConfigByCategory(SpeedCategory.AIRCRAFT);
      const supersonic = SpeedClassifier.getConfigByCategory(SpeedCategory.SUPERSONIC);
      const hypersonic = SpeedClassifier.getConfigByCategory(SpeedCategory.HYPERSONIC);

      expect(walking?.uiLayout).toBe(UILayout.DETAILED);
      expect(ground?.uiLayout).toBe(UILayout.AUTOMOTIVE);
      expect(aircraft?.uiLayout).toBe(UILayout.AVIATION);
      expect(supersonic?.uiLayout).toBe(UILayout.MILITARY);
      expect(hypersonic?.uiLayout).toBe(UILayout.ORBITAL);
    });
  });

  describe('Speed Category Performance Characteristics', () => {
    test('should have increasing physics substeps with speed', () => {
      const configs = SpeedClassifier.getSpeedConfigs();
      
      for (let i = 1; i < configs.length; i++) {
        expect(configs[i].physicsSubsteps).toBeGreaterThanOrEqual(configs[i - 1].physicsSubsteps);
      }
    });

    test('should have decreasing camera zoom with speed', () => {
      const configs = SpeedClassifier.getSpeedConfigs();
      
      for (let i = 1; i < configs.length; i++) {
        expect(configs[i].cameraZoom).toBeLessThan(configs[i - 1].cameraZoom);
      }
    });

    test('should have increasing maximum speeds', () => {
      const configs = SpeedClassifier.getSpeedConfigs();
      
      for (let i = 1; i < configs.length; i++) {
        expect(configs[i].maxSpeedKmh).toBeGreaterThan(configs[i - 1].maxSpeedKmh);
      }
    });
  });

  describe('Real-world Speed Mappings', () => {
    test('should classify human walking speed correctly', () => {
      const config = SpeedClassifier.classifySpeed(5); // 5 km/h human walking
      expect(config.category).toBe(SpeedCategory.WALKING);
    });

    test('should classify car highway speed correctly', () => {
      const config = SpeedClassifier.classifySpeed(120); // 120 km/h highway driving
      expect(config.category).toBe(SpeedCategory.GROUND_VEHICLE);
    });

    test('should classify commercial aircraft speed correctly', () => {
      const config = SpeedClassifier.classifySpeed(900); // 900 km/h commercial aircraft
      expect(config.category).toBe(SpeedCategory.AIRCRAFT);
    });

    test('should classify Mach 1 correctly', () => {
      const config = SpeedClassifier.classifySpeed(1235); // ~Mach 1 (1235 km/h)
      expect(config.category).toBe(SpeedCategory.SUPERSONIC);
    });

    test('should classify Mach 5 correctly', () => {
      const config = SpeedClassifier.classifySpeed(6125); // ~Mach 5 
      expect(config.category).toBe(SpeedCategory.SUPERSONIC);
    });

    test('should classify extreme hypersonic speeds correctly', () => {
      const config = SpeedClassifier.classifySpeed(123500); // ~Mach 100
      expect(config.category).toBe(SpeedCategory.HYPERSONIC);
    });
  });
});
