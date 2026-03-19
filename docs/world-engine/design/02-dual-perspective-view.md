# Design: Dual-Perspective World View

> The world view container. Two simultaneous layers — the ASI's strategic view
> and Jane's ground-level simulation — rendered from the same underlying data.

---

## The Problem With a Single Camera

Every existing game engine assumes the player has one persistent relationship
with the world: either they are in it (first/third person, platformer) or
above it (strategy, God game). Proto FusionGirl requires both simultaneously,
because the player IS the ASI — an intelligence that spans both scales.

The ASI needs to:
- See the ley line network as a whole (strategic)
- Monitor Jane's local situation in real time (tactical)
- Issue commands that affect both scales at once

This is not solved by a minimap. A minimap is a secondary indicator. In PFG,
the network view IS the primary interface. Jane's ground view is the secondary
window into the simulation.

---

## Two Layers, One World

### Ground Layer

**What it is:** Jane's local simulation. The terrain signal rendered as a
visible landscape. Entities (Jane, enemies, robots, nodes) at world coordinates.
Physics active. This is what Jane experiences.

**Camera behavior:**
- Follows Jane with a slight horizontal lead (in her direction of travel)
- Vertical locked to terrain surface ± some headroom
- Zoom level: 1.0 (ground scale, 1 world unit ≈ 1 pixel at base resolution)
- Scroll factor on background parallax layers: 0.1 / 0.3 / 0.6 (3 depth levels)

**Render content at this zoom:**
- Terrain polygon filled with biome color + surface line
- Parallax background layers
- Phaser sprites: Jane, enemies, Beu, robots, NPCs
- Node structures (authored terrain + visual indicator)
- UL puzzle panels (at node locations)
- Combat effects, psionic aura, HUD

### Network Layer

**What it is:** The ASI's strategic view. The ley line as an energy graph.
Jane is a glowing dot on the line. Nodes are landmarks. Energy states are
color-coded. Rifts and instabilities are visible anomalies.

**Camera behavior:**
- Free-roam: player pans with drag/WASD
- Zoom level: 0.02–0.08 (network scale, shows the full ley line arc)
- Camera is NOT locked to Jane. The ASI has omniscient awareness.
- Exception: low trust → camera range limited to Jane's vicinity (ASI bandwidth
  is limited without Jane's cooperation)

**Render content at this zoom:**
- Ley line drawn as an energy path (color = energy level, animated pulse)
- Nodes as landmarks (icon + name + status indicator)
- Jane as an animated dot (color = current AI state)
- Companion robots as smaller dots
- Enemies as threat indicators
- Instability events as flare markers
- Rifts as anomaly markers
- The terrain signal drawn as a mini waveform along the line (semantic LOD)

---

## The Zoom Transition

The two layers are NOT separate scenes. They are the same world data rendered
through a zoom-reactive pipeline.

```
Zoom level:  1.0 ──────────────────────── 0.05
             ↑ Ground Layer              ↑ Network Layer
             (full terrain detail)       (energy graph abstraction)
```

**At zoom > 0.2:** render Ground Layer content
**At zoom < 0.1:** render Network Layer content
**Between 0.1–0.2:** crossfade / blend transition

The terrain signal function evaluates at the same coordinates regardless of zoom.
What changes is:
- How the signal is *rendered* (terrain shape vs. waveform icon)
- How many harmonic terms are evaluated (fidelity tracks speed, not zoom)
- Which Phaser game objects are visible (sprites hidden at network zoom, icons shown)

### Transition trigger

| Input | Action |
|-------|--------|
| Scroll wheel up (hold) | Zoom out toward network view |
| Scroll wheel down (hold) | Zoom in toward ground view |
| TAB / double-tap (mobile) | Toggle between ground and network zoom |
| Automatic | During hypersonic travel, zoom shifts toward network automatically |

The zoom transition is animated (300ms ease-in-out). It should feel like the
ASI "pulling back" to see the bigger picture, then "zooming in" to focus on Jane.

---

## ASI Input Model Per Layer

### At Ground Zoom (watching Jane closely)

| Input | Effect |
|-------|--------|
| Click near Jane | Suggest movement direction (GuidanceEngine hint) |
| Click far from Jane | Set waypoint (Jane evaluates based on trust) |
| Click entity | Focus ASI attention on that entity |
| Q key | Toggle ASI direct override (consent system) |
| Number keys 1–3 | Command tier: 1=subtle hint, 2=strong suggest, 3=urgent |

### At Network Zoom (strategic overview)

| Input | Effect |
|-------|--------|
| Click node | Set destination waypoint for Jane/Speeder |
| Click ley line segment | Inspect energy state |
| Click rift/instability | Prioritize: route Jane toward it |
| Drag | Pan ASI camera |
| Right-click segment | ASI action menu: boost energy, scan for Nefarium, redirect flow |

---

## Trust-Based Visibility

The ASI's omniscience is not unlimited — it depends on its relationship with Jane.

| Trust level | Network view range | Ground view detail |
|-------------|-------------------|-------------------|
| 0–20 (hostile) | Jane's immediate vicinity only (±5 nodes) | Restricted — camera lag, fog |
| 21–50 (neutral) | Current ley line segment | Normal |
| 51–80 (cooperative) | Full current ley line | Enhanced — ASI overlays visible |
| 81–100 (synergy) | All connected ley lines | Full — predictive markers, AI state visible |

**Lore justification:** At low trust, Jane is not sharing her sensor data with
the PsiNet. The ASI has limited bandwidth into the simulation. High trust means
Jane is actively cooperating with the monitoring system, and the data stream
is rich.

---

## The Camera Architecture

```
WorldCamera (Phaser.Cameras.Scene2D.Camera)
├── Ground sub-camera: follows Jane, depth filter for ground content
└── Network sub-camera: free-roam, depth filter for network content

ZoomController
├── currentZoom: number (animated)
├── targetZoom: number
├── groundThreshold: 0.2
├── networkThreshold: 0.1
└── update(delta): lerp toward targetZoom, trigger layer swap at thresholds

LayerManager
├── groundLayer: Phaser.GameObjects.Layer (depth 0–999)
├── networkLayer: Phaser.GameObjects.Layer (depth 1000–1999)
├── hudLayer: Phaser.GameObjects.Layer (depth 2000+, always visible)
└── setActiveLayer(zoom): swap visibility at threshold
```

---

## Implementation Notes

### Phaser-specific

Phaser 3 supports multiple cameras via `this.cameras.add()`. The ground and
network cameras can be two separate camera objects pointing at the same world.
The zoom controller drives `camera.setZoom()`. Layer visibility switches hide/show
relevant game objects.

Alternatively (simpler for MVP): a single camera with zoom, and all game objects
check their own visibility based on `camera.zoom`. Less clean but faster to build.

**Recommended for prototype:** Single camera, zoom-reactive visibility toggle per
game object group. Upgrade to dual-camera after prototype loop works.

### Performance at Network Zoom

At network zoom, ground layer sprites can all be set to `setVisible(false)`.
The terrain renderer draws a simplified waveform icon instead of a full polygon.
Entity sprites are replaced by small color-coded circles. This makes network zoom
extremely cheap to render.

### The "Pull Back" Moment

The first time a player zooms to network view and sees the ley line as a living
energy graph — Jane as a dot moving along it, rifts flaring, energy pulsing —
that is the moment the player feels they ARE the ASI. This moment needs to be
visually polished before it is functionally complete. The aesthetic impression
of this view IS the game's identity.
