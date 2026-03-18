# Navigation System — Technical Docs

The navigation system is the most sophisticated subsystem in the codebase. Three tightly integrated components handle speed physics, camera control, and terrain streaming across a 5-order-of-magnitude speed range (5 km/h walking to 343,000 km/h hypersonic).

## Core Source Files

| File | Lines | Role |
|------|-------|------|
| `src/navigation/core/NavigationManager.ts` | 548 | Coordinator — ties speed, camera, and terrain together |
| `src/world/speed/SpeedTransitionController.ts` | 523 | Jerk physics engine — adaptive acceleration, 5 speed categories |
| `src/world/camera/SideScrollCameraController.ts` | 326 | 50x zoom range, predictive look-ahead, motion-sickness prevention |
| `src/world/terrain/HighSpeedTerrainSystem.ts` | 386 | LOD streaming — 1km/64-sample chunks to 100km/4-sample chunks |

## Documentation Index

### API & Design
| Document | Description |
|----------|-------------|
| [api-reference.md](api-reference.md) | Complete API reference (3D original) |
| [api-reference-2d.md](api-reference-2d.md) | 2D-specific API reference |
| [navigation-interface-design.md](navigation-interface-design.md) | UI design patterns |
| [navigation-interface-2d.md](navigation-interface-2d.md) | 2D navigation UI |

### Speed & Camera
| Document | Description |
|----------|-------------|
| [dynamic-zoom-system.md](dynamic-zoom-system.md) | Speed-adaptive zoom mechanics |
| [dynamic-camera-system-2d.md](dynamic-camera-system-2d.md) | 2D camera behavior at extreme speeds |
| [extreme-speed-issues.md](extreme-speed-issues.md) | Known bugs and gotchas at hypersonic speeds |
| [extreme-speed-challenges-2d.md](extreme-speed-challenges-2d.md) | Technical challenges at Mach speeds in 2D |
| [warpboom-deceleration.md](warpboom-deceleration.md) | WarpBoom deceleration mechanics |
| [warpboom-deceleration-2d.md](warpboom-deceleration-2d.md) | 2D WarpBoom |

### Terrain & Speeder
| Document | Description |
|----------|-------------|
| [magnetospeeder-terrain-system.md](magnetospeeder-terrain-system.md) | Speeder physics and terrain interaction |
| [magnetospeeder-terrain-system-2d.md](magnetospeeder-terrain-system-2d.md) | 2D speeder terrain |
| [leyline-integration.md](leyline-integration.md) | Ley line integration with navigation |
| [leyline-integration-2d.md](leyline-integration-2d.md) | 2D ley line integration |

### Implementation & Integration
| Document | Description |
|----------|-------------|
| [implementation-guide.md](implementation-guide.md) | Step-by-step implementation guide |
| [implementation-guide-2d.md](implementation-guide-2d.md) | 2D implementation guide |
| [NavigationManager-GameScene-Integration-Plan.md](NavigationManager-GameScene-Integration-Plan.md) | GameScene refactoring plan |
| [NavigationManagerIntegration.example.ts](NavigationManagerIntegration.example.ts) | Example integration code |

### Development History
| Document | Description |
|----------|-------------|
| [development-tracking.md](development-tracking.md) | Full development log |
| [development-tracking-CLEANED.md](development-tracking-CLEANED.md) | Cleaned version |
| [development-tracking-integration-implementation.md](development-tracking-integration-implementation.md) | Integration progress |
| [development-tracking-paradigm-validation.md](development-tracking-paradigm-validation.md) | Architecture decisions |

> **Note**: Many docs have both 3D and 2D variants. The 2D variants are the authoritative versions for the current Phaser prototype.
