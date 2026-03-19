# Design: Ley Line Signal Engine

> The terrain generation model. Replaces WorldGenV3 + ChunkLoader + ElevationCache.

---

## Core Principle

Terrain height at any world X coordinate is a pure mathematical function:

```
terrain_height(X) = f(X, ley_line_state)
```

No data to load. No chunks. No cache misses. No async. Evaluating f(X) for
one coordinate takes microseconds. Evaluating it for every visible pixel takes
less than a frame budget.

The function is a **harmonic decomposition** — a sum of frequency components,
each carrying a different layer of meaning. This is analogous to audio synthesis:
the terrain IS the ley line's "sound" made visible.

---

## The Signal Function

```typescript
function terrain_height(worldX: number, state: LeyLineSignalState): number {
  const pos = leyLineArc.worldXToArcPosition(worldX); // uses LeylineGeoSlice

  return (
    H1_global_contour(pos, state.leyLineId)          // very low frequency
    + H2_regional_terrain(pos, state.biomeState)     // medium frequency
    + H3_local_features(pos, state.energyLevel)      // higher frequency
    + H4_corruption_noise(pos, state.corruptionLevel)// chaos harmonics
    + node_spikes(worldX, state.nodeRegistry)        // authored: node locations
  );
}
```

### H1 — Global Contour
**Frequency:** 1 cycle per ~10,000 world units
**Seeded by:** ley line identity (ley_line_id hash → seed)
**Meaning:** The large-scale character of the ley line path. A volcanic ley line
has high amplitude. An oceanic ley line has low, flat contour. This does NOT
change during gameplay.

```typescript
function H1_global_contour(arcPos: number, leyLineId: string): number {
  const seed = hashToFloat(leyLineId);
  const freq = 0.0001;
  return sin(arcPos * freq + seed) * 80 + cos(arcPos * freq * 0.7 + seed) * 40;
}
```

### H2 — Regional Terrain
**Frequency:** 1 cycle per ~500 world units
**Seeded by:** biome state (biome type → characteristic frequency profile)
**Meaning:** The regional character. Mountains cluster in runs; plains stretch
between them. This changes only when the player's biome zone changes (rare).

```typescript
function H2_regional_terrain(arcPos: number, biomeState: BiomeState): number {
  const profile = BIOME_FREQUENCY_PROFILES[biomeState.type];
  return profile.terms.reduce((sum, term) =>
    sum + sin(arcPos * term.freq + term.phase) * term.amplitude
  , 0);
}
```

**Biome profiles (Tho'ra = volcanic):**

| Biome | Character | Amplitude | Frequency profile |
|-------|-----------|-----------|-------------------|
| Volcanic / Core | Sharp peaks, calderas | High | High amp, irregular spacing |
| Forest / Omega | Rolling hills, dense | Medium | Medium amp, regular |
| Polar / Void | Flat with ice ridges | Low+sharp | Low base, spike term |
| Desert / Alpha | Dune waves | Medium | Smooth sine, slow |

### H3 — Local Features
**Frequency:** 1 cycle per ~20 world units
**Seeded by:** energy level (0–100)
**Meaning:** Fine detail — ledges, crevices, outcroppings. Amplitude is
proportional to ley line energy. At 100% energy: rich, varied terrain.
At 10% energy: flat, eroded, almost featureless.

```typescript
function H3_local_features(arcPos: number, energyLevel: number): number {
  const amplitude = (energyLevel / 100) * 25;
  return sin(arcPos * 0.05 + 1.3) * amplitude
       + sin(arcPos * 0.08 + 0.7) * amplitude * 0.5;
}
```

### H4 — Corruption Noise
**Frequency:** Aperiodic (noise-based)
**Seeded by:** corruption level (0–100) from Nefarium activity
**Meaning:** Chaos injected into the terrain by Nefarium corruption. Not
sine-based — uses value noise or a pseudo-random displacement. At 0%
corruption: zero contribution. At 100%: terrain is violently unstable,
spiky, impassable in places.

```typescript
function H4_corruption_noise(arcPos: number, corruptionLevel: number): number {
  if (corruptionLevel === 0) return 0;
  const intensity = (corruptionLevel / 100) * 40;
  // pseudo-random displacement seeded by position
  const n = fract(sin(arcPos * 127.1) * 43758.5453);
  return (n * 2 - 1) * intensity;
}
```

### node_spikes — Authored Node Terrain
**Frequency:** Discrete (per registered node)
**Seeded by:** node registry
**Meaning:** Specific authored terrain shapes centered on known ley line nodes.
A volcanic launch base has a caldera profile. A forest node has a cliff edge
and sheltered valley. These blend into the procedural terrain within a radius.

```typescript
function node_spikes(worldX: number, nodes: NodeRegistry): number {
  let total = 0;
  for (const node of nodes.nearbyNodes(worldX, 200)) {
    const dist = abs(worldX - node.worldX);
    const blend = max(0, 1 - dist / node.influenceRadius);
    total += node.terrainProfile(dist) * blend;
  }
  return total;
}
```

---

## LeyLineSignalState

The live parameter object. Owned by LeyLineManager, read by the terrain function
every frame or whenever terrain needs evaluation.

```typescript
interface LeyLineSignalState {
  leyLineId: string;           // determines H1 seed
  biomeState: BiomeState;      // determines H2 profile
  energyLevel: number;         // 0–100, drives H3 amplitude
  corruptionLevel: number;     // 0–100, drives H4 amplitude
  nodeRegistry: NodeRegistry;  // authored node positions
}
```

**LeyLineManager is the single source of truth.** When a ley line instability
event fires (`LEYLINE_INSTABILITY`), `energyLevel` drops. When the player solves
a UL puzzle to stabilize, `energyLevel` rises. When Nefarium attacks a node,
`corruptionLevel` rises. The terrain function is called the next frame and the
ground has changed.

---

## Performance Characteristics

| Operation | Cost | Notes |
|-----------|------|-------|
| Single point evaluation | ~0.005ms | 5 sin/cos + 2 lookups |
| Full screen width (800 points) | ~4ms | Worst case, pre-optimized |
| Full screen width (optimized) | ~0.5ms | SIMD-friendly, unrolled |
| With H4 (corruption) | +50% | Hash function dominates |
| Without H3+H4 (low fidelity) | -60% | 2 harmonics only |

**The Web Worker path** (optional optimization for H4 or pre-computation):
Pre-compute a lookahead buffer of terrain heights 2–3 screen widths ahead of
the player position. Post from worker, consume on main thread. Eliminates any
micro-stalls during rapid traversal.

---

## LOD by Harmonic Count

Speed → fidelity → which harmonics are evaluated:

| Speed | Fidelity | Terms evaluated | Visual result |
|-------|----------|-----------------|---------------|
| Walking / Combat | HIGH | H1+H2+H3+H4 | Full detail |
| Jogging / Speeder slow | STANDARD | H1+H2+H3 | No corruption noise |
| Speeder fast | LOW | H1+H2 | Regional terrain only |
| Hypersonic (Mach 10+) | CRITICAL | H1 only | Broad landscape silhouette |

This is not just a performance trick. It is semantically correct: at Mach 100,
individual rocks don't matter. The ley line's energy waveform is all that exists
at that scale.

---

## Terrain Mutation Events

Events that change LeyLineSignalState and trigger terrain re-evaluation:

| Event | Parameter changed | Visual effect |
|-------|------------------|---------------|
| `LEYLINE_INSTABILITY` (minor) | energyLevel −15 | H3 amplitude shrinks |
| `LEYLINE_INSTABILITY` (major) | energyLevel −40 | Terrain flattens noticeably |
| `LEYLINE_DISRUPTION` | energyLevel −70 | Near-flat terrain, impassable sections |
| `NEFARIUM_CORRUPTION` | corruptionLevel +30 | Chaotic spikes appear |
| `UL_PUZZLE_SOLVED` (stabilize) | energyLevel +20 | Terrain recovers, gains features |
| `UL_PUZZLE_SOLVED` (cleanse) | corruptionLevel −40 | Noise clears, terrain smooths |
| `RIFT_FORMED` | node spike added | Crater-spike at rift X coordinate |
| `RIFT_SEALED` | node spike removed | Crater fills, terrain heals |

---

## Integration Points

- **LeyLineManager** → owns `LeyLineSignalState`, emits mutation events
- **TerrainRenderer** → calls `terrain_height()` every frame for visible X range
- **TerrainPhysics** → retraces polygon body when state changes significantly
- **JaneAI** → calls `terrain_height(jane.x + offset)` for pathfinding decisions
- **ChunkLoader** → **deleted** (replaced by this system entirely)
- **WorldGenV3** → **deleted**
- **ElevationCache** → **deleted**
