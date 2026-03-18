# Stage 3 — Pipeline Tool

> **Goal**: Automate the Blender render pipeline so that rendering or updating
> any animation takes a single `npm run sprites` command.
> No more manual frame-stepping in Blender.

---

## Prerequisites

- Stage 2 complete: all 24 Jane animations rendered and working in-game
- `jane.blend` has all 24 actions named correctly
- Python 3.10+ available (`python3 --version`)
- Blender 4.x installed and accessible from command line (`blender --version`)

---

## Acceptance Criteria

This stage is complete when:

- [ ] `npm run sprites` runs end-to-end without errors
- [ ] All 24 Jane animations are re-rendered from scratch automatically
- [ ] `jane_atlas.png` and `jane_atlas.json` are generated in `public/assets/sprites/jane/`
- [ ] Phaser atlas JSON passes validation (all frame keys match expected pattern)
- [ ] CI pipeline runs `npm run sprites -- --dry-run` to validate the script exists
- [ ] Adding a new animation requires only: add action to Blender + add entry to `sprite-catalog.json`
- [ ] Render time for full Jane set is under 10 minutes on a modern GPU

---

## Tasks

### Task 3.1 — Blender Python Render Script

Create `scripts/render-sprites.py` — a Python script that Blender runs
in headless mode to render all frames for one animation.

See [render-sprite-sheet-spec.md](render-sprite-sheet-spec.md) for the
complete script design and API.

**Key responsibilities:**
1. Accept CLI args: `--blend-file`, `--action`, `--output-dir`, `--frame-step`
2. Load the specified `.blend` file
3. Set the active action on the armature
4. Iterate through the action's frame range (respecting `--frame-step`)
5. Render each frame to `output-dir/frame_{n:04d}.png`
6. Exit cleanly with code 0 on success, non-zero on error

---

### Task 3.2 — Atlas Assembler Script

Create `scripts/assemble-atlas.py` — a Python script (uses Pillow) that:

1. Takes a directory of `frame_NNNN.png` files
2. Arranges them into a grid (8 frames per row × N rows)
3. Outputs a single `jane_<animation>.png` sprite sheet
4. Outputs a matching JSON fragment with frame coordinates

See [atlas-catalog-format.md](atlas-catalog-format.md) for the JSON schema.

Install dependency:
```bash
pip3 install Pillow
```

---

### Task 3.3 — Sprite Catalog Config

Create `scripts/sprite-catalog.json` — the single source of truth for
what gets rendered:

```json
{
  "characters": {
    "jane": {
      "blend_file": "assets-src/jane/jane.blend",
      "armature_name": "Armature",
      "output_dir": "public/assets/sprites/jane",
      "atlas_name": "jane_atlas",
      "frame_width": 128,
      "frame_height": 128,
      "atlas_max_size": 2048,
      "animations": [
        { "key": "jane_idle",        "action": "jane_idle",        "frame_step": 4, "fps": 8  },
        { "key": "jane_walk",        "action": "jane_walk",        "frame_step": 3, "fps": 12 },
        { "key": "jane_run",         "action": "jane_run",         "frame_step": 2, "fps": 16 },
        { "key": "jane_combat_idle", "action": "jane_combat_idle", "frame_step": 4, "fps": 8  }
      ]
    }
  }
}
```

Adding a new animation = add one line to the `animations` array.

---

### Task 3.4 — Orchestrator Script

Create `scripts/build-sprites.sh` (or `scripts/build-sprites.js`) that:

1. Reads `sprite-catalog.json`
2. For each character + animation:
   a. Calls Blender headless with `render-sprites.py`
   b. Calls `assemble-atlas.py` to build per-animation sprite sheet
3. Calls FreeTexturePacker CLI (or custom packer) to combine all sprite
   sheets into the final `jane_atlas.png` + `jane_atlas.json`
4. Validates the atlas JSON against expected frame count

See [build-integration.md](build-integration.md) for npm wiring.

---

### Task 3.5 — Atlas Validation

Add a validation step that runs after atlas generation:

```bash
node scripts/validate-atlas.js public/assets/sprites/jane/jane_atlas.json
```

Validates:
- All expected frame keys exist (from sprite-catalog.json)
- Frame coordinates are within atlas bounds
- No duplicate frame keys
- JSON is valid Phaser texture atlas format

This step fails the build if atlas is malformed, catching Blender render
failures before they silently corrupt the game.

---

### Task 3.6 — Incremental Render Support

Optimize for developer iteration speed:

1. **Hash check**: Before rendering an animation, hash the `.blend` file
   modification time + action name. If a cached render exists with a
   matching hash, skip re-rendering.
2. **`--force` flag**: Override cache and re-render everything.
3. **`--animation` flag**: Re-render only one specific animation.

Example usage:
```bash
npm run sprites                        # render only what changed
npm run sprites -- --force            # re-render everything
npm run sprites -- --animation jane_walk  # only re-render walk
```

---

## Outputs of Stage 3

```
scripts/
  render-sprites.py          Blender headless render script
  assemble-atlas.py          Per-animation sprite sheet assembler
  build-sprites.sh           Orchestrator (calls all scripts in order)
  validate-atlas.js          Atlas JSON validator
  sprite-catalog.json        Animation manifest (single source of truth)

package.json:
  "sprites": "bash scripts/build-sprites.sh",
  "sprites:validate": "node scripts/validate-atlas.js"
```

---

## Time Estimate

| Task | Time |
|------|------|
| 3.1 Blender render script | 2-3 hours |
| 3.2 Atlas assembler | 1-2 hours |
| 3.3 Sprite catalog config | 30 min |
| 3.4 Orchestrator script | 1-2 hours |
| 3.5 Atlas validation | 1 hour |
| 3.6 Incremental render | 1-2 hours |
| **Total** | **6-10 hours** |

---

## Next Stage

With a fully automated pipeline, proceed to
[Stage 4: Full Roster](../04-full-roster/stage-overview.md) to apply
the same pipeline to all other characters (Terra, Aqua, enemies, Jono hologram).
