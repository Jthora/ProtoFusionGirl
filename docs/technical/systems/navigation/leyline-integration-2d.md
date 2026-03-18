# Leyline Integration for 2D Side-Scroller High-Speed Travel

## Overview

Leylines in the 2D side-scroller provide horizontal energy corridors that enhance magnetospeeder performance. Unlike 3D planetary leyline networks, these form linear paths along the horizontal plane at various altitudes, creating speed-enhancing channels for efficient high-velocity travel.

## 2D Leyline Network Structure

### Horizontal Energy Corridors

#### Primary Leylines (Surface Level)
```typescript
interface PrimaryLeyline {
  type: "surface_leyline";
  altitude: number;           // meters above sea level
  direction: "east" | "west"; // Primary horizontal directions
  strength: number;           // 0.0 - 1.0 energy density
  width: number;              // meters wide
  speedBonus: number;         // 1.0 - 5.0 speed multiplier
  length: number;             // kilometers long
  stability: LeylineStability;
}

const primaryLeylines: PrimaryLeyline[] = [
  {
    type: "surface_leyline",
    altitude: 100,             // 100m above sea level
    direction: "east",
    strength: 0.8,
    width: 500,               // 500m wide corridor
    speedBonus: 2.5,          // 2.5x speed boost
    length: 50000,            // 50km long
    stability: LeylineStability.STABLE
  },
  {
    type: "surface_leyline", 
    altitude: 100,
    direction: "west",
    strength: 0.8,
    width: 500,
    speedBonus: 2.5,
    length: 50000,
    stability: LeylineStability.STABLE
  }
];
```

#### Atmospheric Leylines (High Altitude)
```typescript
interface AtmosphericLeyline {
  type: "atmospheric_leyline";
  altitude: number;           // 1000-10000m altitude
  direction: "east" | "west";
  strength: number;           // 0.5 - 1.0 energy density
  width: number;              // 200-1000m wide
  speedBonus: number;         // 3.0 - 8.0 speed multiplier
  turbulence: number;         // 0.0 - 1.0 instability factor
  requirements: {
    minSpeed: number;         // km/h required to access
    magneticResonance: boolean;
  };
}

const atmosphericLeylines: AtmosphericLeyline[] = [
  {
    type: "atmospheric_leyline",
    altitude: 2000,           // 2km altitude
    direction: "east",
    strength: 0.9,
    width: 300,
    speedBonus: 5.0,          // 5x speed boost
    turbulence: 0.2,
    requirements: {
      minSpeed: 1000,         // Must be supersonic to access
      magneticResonance: true
    }
  },
  {
    type: "atmospheric_leyline",
    altitude: 5000,           // 5km altitude  
    direction: "west",
    strength: 1.0,
    width: 200,
    speedBonus: 8.0,          // 8x speed boost
    turbulence: 0.4,
    requirements: {
      minSpeed: 5000,         // Must be hypersonic to access
      magneticResonance: true
    }
  }
];
```

#### Deep Underground Leylines
```typescript
interface UndergroundLeyline {
  type: "underground_leyline";
  depth: number;              // meters below surface
  direction: "east" | "west";
  strength: number;           // 0.3 - 0.7 energy density
  width: number;              // 100-300m wide
  speedBonus: number;         // 1.5 - 3.0 speed multiplier
  accessibility: "tunnel_only" | "phase_through";
  dangers: UndergroundHazard[];
}
```

## Leyline Detection and Visualization

### Magnetospeeder Leyline Sensors
```typescript
class LeylineDetectionSystem {
  private detectionRange: Map<number, number> = new Map([
    [50, 100],      // At 50 km/h, detect leylines within 100m
    [200, 500],     // At 200 km/h, detect within 500m
    [1000, 2000],   // At 1000 km/h, detect within 2km
    [10000, 10000], // At 10000 km/h, detect within 10km
    [100000, 50000] // At 100000 km/h, detect within 50km
  ]);
  
  detectNearbyLeylines(
    position: { x: number; y: number },
    speed: number
  ): DetectedLeyline[] {
    const range = this.getDetectionRange(speed);
    const nearbyLeylines: DetectedLeyline[] = [];
    
    // Check all leylines for proximity
    for (const leyline of this.getAllLeylines()) {
      const distance = this.calculateDistanceToLeyline(position, leyline);
      
      if (distance <= range) {
        nearbyLeylines.push({
          leyline: leyline,
          distance: distance,
          alignment: this.calculateAlignment(position, leyline),
          accessLevel: this.checkAccessibility(speed, leyline)
        });
      }
    }
    
    return nearbyLeylines.sort((a, b) => a.distance - b.distance);
  }
  
  private calculateDistanceToLeyline(
    position: { x: number; y: number },
    leyline: Leyline
  ): number {
    // Calculate perpendicular distance to leyline corridor
    const altitudeDiff = Math.abs(position.y - leyline.altitude);
    const corridorEdge = leyline.width / 2;
    
    // If within altitude range of leyline
    if (altitudeDiff <= 50) { // 50m vertical tolerance
      return 0; // Already in leyline
    }
    
    return altitudeDiff;
  }
}
```

### Visual Leyline Indicators

```typescript
class LeylineVisualization {
  renderLeylineIndicators(
    detectedLeylines: DetectedLeyline[],
    cameraZoom: number
  ): LeylineVisual[] {
    const visuals: LeylineVisual[] = [];
    
    for (const detected of detectedLeylines) {
      const leyline = detected.leyline;
      
      // Different visualization based on leyline type and distance
      if (detected.distance === 0) {
        // Currently in leyline - show active effect
        visuals.push(this.createActiveLeylineEffect(leyline));
      } else {
        // Nearby leyline - show indicator
        visuals.push(this.createLeylineIndicator(leyline, detected.distance));
      }
    }
    
    return visuals;
  }
  
  private createActiveLeylineEffect(leyline: Leyline): LeylineVisual {
    return {
      type: "active_stream",
      particles: {
        count: Math.floor(leyline.strength * 100),
        color: this.getLeylineColor(leyline.type),
        speed: leyline.speedBonus * 10,
        direction: leyline.direction === "east" ? 0 : 180
      },
      aura: {
        color: this.getLeylineColor(leyline.type),
        opacity: 0.3,
        pulsing: true
      },
      powerReadout: {
        text: `${(leyline.speedBonus * 100 - 100).toFixed(0)}% boost`,
        color: "cyan"
      }
    };
  }
  
  private createLeylineIndicator(leyline: Leyline, distance: number): LeylineVisual {
    const indicator: LeylineVisual = {
      type: "proximity_indicator",
      direction: this.calculateDirectionToLeyline(leyline),
      distance: distance,
      strength: leyline.strength,
      accessible: distance < leyline.width / 2
    };
    
    if (distance < 1000) {
      // Show detailed info for nearby leylines
      indicator.details = {
        type: leyline.type,
        speedBonus: leyline.speedBonus,
        width: leyline.width,
        stability: leyline.stability
      };
    }
    
    return indicator;
  }
}
```

## Leyline Interaction Mechanics

### Speed Boost Calculation
```typescript
class LeylineSpeedSystem {
  calculateSpeedBoost(
    baseSpeed: number,
    leyline: Leyline,
    alignmentFactor: number,
    penetrationDepth: number
  ): number {
    // Base speed multiplier from leyline
    let speedMultiplier = leyline.speedBonus;
    
    // Alignment bonus (moving with leyline direction)
    if (alignmentFactor > 0.8) {
      speedMultiplier *= 1.2; // 20% bonus for perfect alignment
    } else if (alignmentFactor < 0.2) {
      speedMultiplier *= 0.8; // 20% penalty for poor alignment
    }
    
    // Penetration depth (how deep in the leyline corridor)
    const penetrationBonus = Math.min(1.0, penetrationDepth / (leyline.width * 0.3));
    speedMultiplier *= (0.7 + 0.3 * penetrationBonus); // 70%-100% based on depth
    
    // Stability factor
    if (leyline.stability === LeylineStability.UNSTABLE) {
      const variation = 0.8 + Math.random() * 0.4; // 80%-120% random variation
      speedMultiplier *= variation;
    }
    
    return baseSpeed * speedMultiplier;
  }
  
  calculateEnergyEfficiency(leylineBoost: number): number {
    // Higher leyline boost = better energy efficiency
    const baseEfficiency = 1.0;
    const efficiencyBonus = (leylineBoost - 1.0) * 0.5; // 50% of speed bonus
    
    return baseEfficiency + efficiencyBonus;
  }
}
```

### Leyline Transition Management
```typescript
class LeylineTransitionManager {
  handleLeylineEntry(
    leyline: Leyline,
    entryAngle: number,
    entrySpeed: number
  ): TransitionResult {
    // Smooth transition into leyline
    const transitionDuration = this.calculateTransitionTime(entrySpeed);
    
    return {
      duration: transitionDuration,
      speedCurve: this.generateSpeedTransitionCurve(entrySpeed, leyline.speedBonus),
      effects: [
        {
          type: "energy_surge",
          intensity: leyline.strength,
          duration: transitionDuration * 0.3
        },
        {
          type: "magnetic_alignment",
          targetDirection: leyline.direction,
          duration: transitionDuration * 0.7
        }
      ],
      soundEffects: [
        {
          type: "harmonic_resonance",
          frequency: this.getLeylineFrequency(leyline),
          volume: leyline.strength
        }
      ]
    };
  }
  
  handleLeylineExit(
    leyline: Leyline,
    exitSpeed: number,
    exitAngle: number
  ): TransitionResult {
    // Gradual loss of leyline boost
    const decayDuration = this.calculateDecayTime(exitSpeed);
    
    return {
      duration: decayDuration,
      speedCurve: this.generateSpeedDecayCurve(exitSpeed, leyline.speedBonus),
      effects: [
        {
          type: "energy_dissipation",
          intensity: leyline.strength,
          duration: decayDuration
        }
      ]
    };
  }
}
```

## Multi-Leyline Interactions

### Leyline Confluence Points
```typescript
interface LeylineConfluence {
  position: { x: number; y: number };
  participatingLeylines: Leyline[];
  combinedStrength: number;
  stabilityField: number;
  maxSpeedBonus: number;
  specialEffects: ConfluenceEffect[];
}

class ConfluenceManager {
  calculateConfluenceEffect(
    confluencePoint: LeylineConfluence,
    playerPosition: { x: number; y: number },
    playerSpeed: number
  ): ConfluenceResult {
    const distance = this.calculateDistance(playerPosition, confluencePoint.position);
    
    if (distance > 1000) {
      return { effect: "none" }; // Too far from confluence
    }
    
    // Confluence effects intensify as player approaches center
    const intensity = Math.max(0, 1 - (distance / 1000));
    
    return {
      effect: "confluence_boost",
      speedMultiplier: 1 + (confluencePoint.maxSpeedBonus - 1) * intensity,
      energyRegeneration: confluencePoint.combinedStrength * intensity,
      stabilityBonus: confluencePoint.stabilityField * intensity,
      specialEffects: confluencePoint.specialEffects.map(effect => ({
        ...effect,
        intensity: effect.intensity * intensity
      }))
    };
  }
}
```

### Leyline Interference Patterns
```typescript
class LeylineInterference {
  checkInterference(
    activeLeylines: Leyline[],
    position: { x: number; y: number }
  ): InterferenceResult {
    if (activeLeylines.length < 2) {
      return { type: "none" };
    }
    
    // Check for conflicting leylines (opposite directions)
    const eastLeylines = activeLeylines.filter(l => l.direction === "east");
    const westLeylines = activeLeylines.filter(l => l.direction === "west");
    
    if (eastLeylines.length > 0 && westLeylines.length > 0) {
      return this.calculateDirectionalInterference(eastLeylines, westLeylines);
    }
    
    // Check for altitude conflicts
    const altitudes = activeLeylines.map(l => l.altitude);
    const altitudeRange = Math.max(...altitudes) - Math.min(...altitudes);
    
    if (altitudeRange < 200) { // Leylines too close vertically
      return this.calculateAltitudeInterference(activeLeylines);
    }
    
    return { type: "harmonious" };
  }
  
  private calculateDirectionalInterference(
    eastLeylines: Leyline[],
    westLeylines: Leyline[]
  ): InterferenceResult {
    const eastStrength = eastLeylines.reduce((sum, l) => sum + l.strength, 0);
    const westStrength = westLeylines.reduce((sum, l) => sum + l.strength, 0);
    
    const strengthDifference = Math.abs(eastStrength - westStrength);
    
    if (strengthDifference < 0.1) {
      return {
        type: "cancellation",
        effect: "speed_nullified",
        turbulence: 0.8,
        energyDrain: 0.5
      };
    } else {
      const dominantDirection = eastStrength > westStrength ? "east" : "west";
      return {
        type: "partial_interference",
        effect: "reduced_efficiency",
        dominantDirection: dominantDirection,
        efficiencyReduction: strengthDifference * 0.3,
        turbulence: 0.4
      };
    }
  }
}
```

## Leyline Navigation Assistance

### Leyline Pathfinding
```typescript
class LeylinePathfinder {
  findOptimalLeylinePath(
    start: { x: number; y: number },
    destination: { x: number; y: number },
    currentSpeed: number
  ): LeylinePath {
    const availableLeylines = this.getLeylinesBetweenPoints(start, destination);
    const accessibleLeylines = availableLeylines.filter(leyline => 
      this.canAccessLeyline(currentSpeed, leyline)
    );
    
    if (accessibleLeylines.length === 0) {
      return { type: "direct", leylines: [], estimatedTime: this.calculateDirectTime(start, destination, currentSpeed) };
    }
    
    // Find most efficient leyline combination
    const optimalPath = this.calculateOptimalPath(start, destination, accessibleLeylines);
    
    return {
      type: "leyline_assisted",
      leylines: optimalPath.leylines,
      transitionPoints: optimalPath.transitions,
      estimatedTime: optimalPath.totalTime,
      speedProfile: optimalPath.speedProfile,
      energyEfficiency: optimalPath.efficiency
    };
  }
  
  private calculateOptimalPath(
    start: { x: number; y: number },
    destination: { x: number; y: number },
    leylines: Leyline[]
  ): OptimalPath {
    // Use A* pathfinding with leyline nodes
    const pathNodes = this.createLeylinePathNodes(start, destination, leylines);
    const optimalSequence = this.aStarSearch(pathNodes, start, destination);
    
    return this.convertToPath(optimalSequence);
  }
}
```

### Automatic Leyline Alignment
```typescript
class LeylineAlignment {
  private alignmentAssist = true;
  private alignmentStrength = 0.7; // 70% assistance
  
  calculateAlignmentCorrection(
    currentVelocity: { x: number; y: number },
    targetLeyline: Leyline,
    alignmentFactor: number
  ): { x: number; y: number } {
    if (!this.alignmentAssist || alignmentFactor > 0.9) {
      return { x: 0, y: 0 }; // No correction needed
    }
    
    // Calculate desired velocity direction
    const leylineDirection = targetLeyline.direction === "east" ? 1 : -1;
    const currentSpeed = Math.sqrt(currentVelocity.x ** 2 + currentVelocity.y ** 2);
    
    const idealVelocity = {
      x: currentSpeed * leylineDirection,
      y: currentVelocity.y * 0.9 // Slight vertical dampening toward leyline altitude
    };
    
    // Calculate correction force
    const correction = {
      x: (idealVelocity.x - currentVelocity.x) * this.alignmentStrength,
      y: (targetLeyline.altitude - getCurrentAltitude()) * 0.1 // Gentle altitude correction
    };
    
    return correction;
  }
}
```

## WarpBoom and Leyline Interaction

### Emergency Deceleration in Leylines
```typescript
class LeylineWarpBoomSystem {
  handleWarpBoomInLeyline(
    leyline: Leyline,
    warpBoomEvent: WarpBoomEvent
  ): LeylineWarpBoomResult {
    // Leylines can either help or hinder WarpBoom deceleration
    const alignmentWithDeceleration = this.calculateDecelerationAlignment(
      leyline,
      warpBoomEvent.decelerationVector
    );
    
    if (alignmentWithDeceleration > 0.5) {
      // Leyline assists deceleration
      return {
        effect: "assisted_deceleration",
        decelerationBonus: leyline.strength * 0.5,
        energyDissipationBonus: leyline.speedBonus * 0.3,
        stabilityBonus: 0.2
      };
    } else {
      // Leyline opposes deceleration
      return {
        effect: "opposed_deceleration",
        decelerationPenalty: leyline.strength * 0.3,
        turbulenceIncrease: 0.4,
        energyConflict: true
      };
    }
  }
  
  calculateLeylineDisruption(warpBoomEvent: WarpBoomEvent): LeylineDisruption {
    // WarpBoom events can temporarily disrupt nearby leylines
    const affectedRadius = warpBoomEvent.shockwaveRadius;
    const disruptionDuration = Math.min(300, warpBoomEvent.energyMagnitude / 1000); // seconds
    
    return {
      radius: affectedRadius,
      duration: disruptionDuration,
      effects: [
        {
          type: "strength_reduction",
          magnitude: 0.5,
          recoveryTime: disruptionDuration * 0.7
        },
        {
          type: "instability_increase",
          magnitude: 0.8,
          recoveryTime: disruptionDuration * 1.2
        }
      ]
    };
  }
}
```

The 2D leyline system provides horizontal energy corridors that enhance magnetospeeder performance while adding strategic depth to navigation choices. Players can choose between direct routes or longer but faster leyline-assisted paths, creating meaningful gameplay decisions at all speed ranges.
