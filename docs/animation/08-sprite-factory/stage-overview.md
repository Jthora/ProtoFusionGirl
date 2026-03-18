# Stage 8 — Sprite Factory (Developer Tool)

> **Goal**: A standalone Electron or web-based developer tool that lets
> team members preview animations, adjust timing, and generate sprites
> without needing to know Blender or the pipeline internals.
> Optional stage — build after Stages 1-7 are solid.

---

## Why Build This?

After Stages 1-7:
- Adding a new animation requires: open Blender, set up action, run pipeline, check in-game
- Adjusting a frame rate requires: edit sprite-catalog.json, re-run pipeline
- Non-developers (artists) can't easily iterate on animation feel

The Sprite Factory reduces this to a GUI:
- Click animation → see preview in real-time
- Drag FPS slider → see timing change instantly
- Click "Export" → pipeline runs automatically

---

## Scope Options

This stage has three scope levels. Choose based on team needs:

### Scope A — Web Viewer (Minimal, 1-2 days)

A simple HTML page that:
- Loads all atlas JSONs
- Lets you select character + animation
- Plays the animation in a Phaser canvas
- Shows current FPS, frame count, loop/hold settings

No Blender integration — just viewing what's already rendered.

**Value**: Lets anyone on the team review animations without running the game.

### Scope B — Web Editor (Medium, 3-5 days)

Scope A + edits that write back to `sprite-catalog.json`:
- FPS slider updates catalog entry
- Loop/hold toggle updates catalog entry
- "Re-render" button triggers `npm run sprites -- --animation {key}`

**Value**: Non-developers can adjust animation timing.

### Scope C — Full Sprite Factory (Full, 1-2 weeks)

Scope B + Blender preview integration:
- Live Blender render in background as you scrub timeline
- Frame selection to mark render range
- Add new animation: fill in name + Mixamo file → pipeline auto-runs
- Character comparison: side-by-side view of two characters

**Value**: Professional animation tool tailored to this specific pipeline.

---

## Recommended Starting Point

Build Scope A first. It's 1-2 days of work and provides immediate value
for reviewing animation quality. Scope B and C are enhancements.

---

## Acceptance Criteria (Scope A)

- [ ] `npm run sprite-factory` opens a browser tab at `localhost:4567`
- [ ] All characters listed in a sidebar
- [ ] Clicking a character shows available animations
- [ ] Clicking an animation plays it in the preview canvas
- [ ] FPS and frame count displayed
- [ ] Animation plays at correct speed matching in-game feel

---

## Tasks (Scope A)

### Task 8.1 — Vite Dev Server Extension

The sprite factory can be a separate Vite app or a route in the main app:

**Option A — Separate Vite app:**
```
tools/sprite-factory/
  index.html
  src/main.ts        (separate Phaser instance)
  vite.config.ts     (port 4567)
```

Run with: `npm run sprite-factory`

**Option B — Route in main app:**
Add `?sprite-factory` query param that loads a factory scene instead
of the main game scene. Simpler but mixes dev tooling with game code.

Option A recommended — cleaner separation.

### Task 8.2 — Atlas Loader

```typescript
// Load all atlas JSONs and build character/animation index
const catalog = await fetch('/sprite-catalog.json').then(r => r.json());

for (const [charId, charConfig] of Object.entries(catalog.characters)) {
  const atlasJson = await fetch(`/${charConfig.output_dir}/${charConfig.atlas_name}.json`)
    .then(r => r.json());
  // Build animation list from pfg metadata
  const animList = Object.keys(atlasJson.meta.pfg.animations);
  // Render sidebar entry
}
```

### Task 8.3 — Phaser Preview Scene

```typescript
class SpriteFactoryScene extends Phaser.Scene {
  preload() {
    // Load all atlases from catalog
    for each character → this.load.atlas(...)
  }

  create() {
    // Create centered preview sprite
    this.previewSprite = this.add.sprite(400, 300, 'jane');

    // Listen for animation selection from UI
    window.addEventListener('select-animation', (e) => {
      this.previewSprite.setTexture(e.detail.character);
      this.previewSprite.play(e.detail.animKey);
    });
  }
}
```

### Task 8.4 — Sidebar UI

Simple HTML sidebar outside the Phaser canvas:

```html
<div id="sidebar">
  <select id="character-select">
    <option value="jane">Jane</option>
    <option value="terra">Terra</option>
    <!-- etc -->
  </select>
  <div id="animation-list">
    <!-- Populated dynamically from catalog -->
  </div>
</div>
<canvas id="phaser-canvas"></canvas>
```

---

## See Also

[tool-spec.md](tool-spec.md) for the complete technical specification.

---

## Time Estimate (Scope A)

| Task | Time |
|------|------|
| 8.1 Vite app setup | 2 hours |
| 8.2 Atlas loader | 1 hour |
| 8.3 Phaser preview scene | 2 hours |
| 8.4 Sidebar UI | 2 hours |
| **Total** | **7 hours** |

---

## This is the Final Stage

Completing Stage 8 means the full animation pipeline is not just functional
but ergonomic — any team member can preview, adjust, and iterate on animations
without deep technical knowledge of the underlying pipeline.

The game has gone from placeholder colored squares to a fully animated
silhouette world with dynamic particle FX, driven by a maintainable
automated pipeline.
