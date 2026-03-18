# Phaser Constraints and Workarounds

> What Phaser 3 cannot do and how we work around it for the prototype.

## Engine: Phaser 3.90.0 + TypeScript + Vite 7 + Arcade Physics

### What Phaser CAN Do (Already Working)

| Capability | Status | Notes |
|-----------|--------|-------|
| 2D side-scrolling with parallax | ✅ Working | Multiple parallax layers |
| Sprite-based characters | ✅ Working | Jane, speeder, enemies |
| Event-driven architecture | ✅ Working | EventBus with 110+ event types |
| UI overlays (HUD, menus, modals) | ✅ Working | UIManager system |
| Speed transitions with camera zoom | ✅ Working | Best code in codebase |
| Chunk-based world streaming | ✅ Working | Terrain chunks load/unload |
| Keyboard + touch + gamepad input | ✅ Working | InputManager |
| Arcade physics (AABB) | ✅ Working | Sufficient for 2D platform combat |
| Audio playback | ✅ Working | Phaser audio (no positional) |

### What Phaser CANNOT Do

| Limitation | Impact | Workaround |
|-----------|--------|-----------|
| **No 3D rendering** | Cannot render 3D globe for fast travel | 2D network graph = Holo Deck tactical display |
| **No complex physics** | No joints, soft bodies, fluid sim | Not needed for prototype combat/movement |
| **No multiplayer networking** | Cannot do real-time multiplayer | Not in prototype scope |
| **No RTS camera** (bird's-eye + unit selection) | God-view is 2D zoom, not true isometric | 2D zoom with overlay markers works for ASI |
| **~500 active sprite limit** | Performance ceiling per frame | LOD system already handles this |
| **No positional audio** | Sound doesn't scale with distance | Not critical — use volume mixing |
| **Browser memory ~1-2 GB** | Limits world size in memory | Chunk loading already manages this |
| **No external audio access** | Cannot access user's media player audio | Use built-in soundtrack; defer media integration |

### Performance Budget

- **Target**: 60 FPS in Chrome on mid-range hardware
- **Sprite budget**: ≤ 200 active sprites simultaneously (comfortable)
- **Terrain**: Chunk loading with LOD at high speed tiers (working)
- **UI overlays**: Minimal DOM; prefer Phaser graphics for HUD
- **Critical path**: Instability events + combat + terrain streaming at speed ≥ 3

### Known Risk Areas

| Area | Risk | Mitigation |
|------|------|-----------|
| Many enemies + robots + effects at Node 3 | Frame drops | Cap active entities at 30; use sprite pools |
| UL puzzle overlay + combat simultaneously | UI complexity | Pause/slow-mo during puzzle (ASI controls time) |
| Network map overlay rendering | DOM vs Canvas mixing | Use Phaser Graphics for map, not DOM |
| Behavior tree tick on every frame | CPU load | Tick Jane AI every 3-5 frames, not every frame |
| Event history growing large | Memory | Cap history at 1000 entries, FIFO |

### Holo Deck Justification

Every visual limitation of Phaser is explained in-universe:
- 2D rendering = Holo Deck is a holographic projection, not photorealistic VR
- No 3D globe = PsiNet tactical display, not satellite imagery
- Limited sprites = simulation fidelity of the Proto Holo Deck
- Simple physics = the Holo Deck simulates enough for training, not reality

This is not an excuse — it's a design choice. The Holo Deck's limitation IS the prototype's art style. When we move to Godot (Phase 3), the Holo Deck upgrades in-story to higher fidelity, and the improved rendering is narratively justified.
