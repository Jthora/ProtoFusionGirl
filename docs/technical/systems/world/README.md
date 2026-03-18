# World Systems — Technical Docs

The largest subsystem (17,601 lines in `src/world/`). Covers tilemap, chunks, persistence, terrain, ley lines, missions, enemies, and combat.

## Subsections

| Folder | Description |
|--------|-------------|
| [planetary-architecture/](planetary-architecture/) | 6-part series on spherical coordinates, projections, and coordinate transformation |
| [leylines/](leylines/) | 8-part series on planetary-scale ley line implementation |

## Planetary Architecture

Series covering the mathematical and architectural foundations for planetary-scale gaming:

| Document | Focus |
|----------|-------|
| [planetary-architecture/01-current-system-analysis.md](planetary-architecture/01-current-system-analysis.md) | Assessment of existing tilemap/terrain architecture |
| [planetary-architecture/02-spherical-coordinate-theory.md](planetary-architecture/02-spherical-coordinate-theory.md) | Mathematical foundations for spherical coordinates |
| [planetary-architecture/03-projection-systems.md](planetary-architecture/03-projection-systems.md) | Map projection techniques |
| [planetary-architecture/04-hybrid-architecture-design.md](planetary-architecture/04-hybrid-architecture-design.md) | Hybrid 2D/spherical architecture |
| [planetary-architecture/05-coordinate-transformation-layer.md](planetary-architecture/05-coordinate-transformation-layer.md) | Coordinate abstraction layer |
| [planetary-architecture/06-planetary-ley-line-mathematics.md](planetary-architecture/06-planetary-ley-line-mathematics.md) | Great circle ley line math on Earth |

## Ley Line Implementation

Series covering the ley line system from data sources through streaming to implementation:

| Document | Focus |
|----------|-------|
| [leylines/00-planetary-scale-overview.md](leylines/00-planetary-scale-overview.md) | High-level strategy |
| [leylines/01-preprocessing-approach.md](leylines/01-preprocessing-approach.md) | Pre-computed data loading |
| [leylines/02-streaming-approach.md](leylines/02-streaming-approach.md) | Real-time generation |
| [leylines/03-hybrid-approach.md](leylines/03-hybrid-approach.md) | Combined preprocessing + streaming |
| [leylines/04-data-sources.md](leylines/04-data-sources.md) | SRTM, GEBCO, geological data integration |
| [leylines/05-technical-implementation.md](leylines/05-technical-implementation.md) | Code patterns |
| [leylines/06-implementation-roadmap.md](leylines/06-implementation-roadmap.md) | Phased delivery plan |
| [leylines/07-geo-slice-terrain-overhaul.md](leylines/07-geo-slice-terrain-overhaul.md) | Grand terrain refactor |

## Key Source Files

| File | Lines | Role |
|------|-------|------|
| `src/world/tilemap/TilemapManager.ts` | 551 | World API hub — 40M tile Earth circumference, toroidal wrapping |
| `src/world/tilemap/ChunkLoader.ts` | 167 | Speed-adaptive chunk rendering (4-12 chunks) |
| `src/world/tilemap/WorldPersistence.ts` | 493 | LocalStorage save/load with branch management |
| `src/world/terrain/HighSpeedTerrainSystem.ts` | 386 | LOD streaming per speed category |
| `src/world/leylines/LeylineEnergySystem.ts` | 504 | Ley line energy for speeder interaction |
| `src/world/leyline/LeyLineManager.ts` | 196 | Ley line queries, strength, pathfinding delegation |
