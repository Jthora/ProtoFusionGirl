# Geo-Slice Terrain Overhaul (MVP)

Date: 2025-08-08
Status: Implemented (Phase 1 MVP)

This document explains the new world environment pipeline that maps a great-circle leyline "slice" of Earth elevation data onto the game’s horizontally wrapping world and feeds it into the tilemap generator.

## Overview
- World X wraps around Earth’s circumference and is mapped onto a configurable great-circle slice (leyline).
- Elevation along this path drives the surface height in world generation.
- Result: visible oceans, plains, deserts, mountains aligned to a real-earth-like path.

## Components
- `src/world/terrain/LeylineGeoSlice.ts` — Converts world X to lat/lon along a defined slice.
- `src/world/terrain/mocks/MockElevationSource.ts` — Mock elevation function (replaceable with GEBCO/SRTM).
- `src/world/tilemap/WorldGenV3.ts` — Extends base `WorldGen` to set surface/biomes using elevation slice.
- `src/world/terrain/ElevationSliceTerrainSystem.ts` — Minimal TerrainSystem bridge for future integration.

## How it works
1. TilemapManager now uses `WorldGenV3` instead of `WorldGen`.
2. For each chunk column (x), `WorldGenV3`:
   - Maps world X to lat/lon with `LeylineGeoSlice`.
   - Queries elevation from `MockElevationSource`.
   - Computes surfaceY = 16 + floor(elevation/100) and writes water/grass/dirt/stone accordingly.
3. The result is an earth-like cross-section world across the configured leyline.

## Configure the Slice
- Edit `WorldGenV3` constructor to change `start`/`end` coordinates.
- Future: expose configuration via data file or UI.

## Next Steps
- Replace mock elevation with real datasets (GEBCO/SRTM) or OpenElevation API.
- Add biome classifier using latitude and elevation for richer tiles.
- Make elevation mapping synchronous for generation (pre-sample elevation per column).
- Stream/caching for elevation queries.
- UI overlay to visualize lat/lon and elevation at cursor.

