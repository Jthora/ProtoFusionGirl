# Vision and Constraints

## What We Are Building

A fully procedural, 3D-sourced sprite pipeline that generates the complete
visual language of ProtoFusionGirl from source 3D models — maintaining the
original hand-crafted **black silhouette on white, vibrant color-accented**
aesthetic, but built so any asset can be regenerated at any time.

---

## The Original Visual Language (Reference)

The iOS prototype established the core aesthetic:

- **Figures**: Pure black silhouettes. No internal detail, no shading.
  The shape IS the character. Posture and gesture carry all emotion.
- **Backgrounds**: Pure white or very pale neutral. Environments read as
  architectural/structural outlines only — black line-art, no fill.
- **Accent colors**: Used ONLY for energy, effects, UI, and ley-line elements.
  Not on characters or terrain. Examples: cyan for PsiNet/UL symbols,
  magenta for ion storm FX, amber for ley-line energy, green for health.
- **Contrast ratio**: Maximum. Black on white everywhere except FX.
- **Animation style**: Weighty, physical. Influenced by rotoscoping —
  Jane's movement should feel like a real human in a spacesuit, not a cartoon.

### Color Reference

```
Character fill:      #000000  (pure black)
Background:          #ffffff  (pure white)
UL/PsiNet energy:    #00e5ff  (cyan)
Ley-line energy:     #ffaa00  (amber)
Ion storm / danger:  #ff2d78  (magenta-red)
Health / healing:    #44ff88  (green)
Terra (earth hero):  #8B5E3C  (earth brown — subtle, accent only)
Aqua (water hero):   #00bfff  (water blue — accent only)
Trust meter:         #e0e0e0 → #ffffff (grey to white gradient)
```

---

## Core Constraints

### Visual Constraints

1. **No color on sprite sheets.** All sprite renders are pure black on white.
   Color is applied at runtime via Phaser tint, particle systems, and shaders.

2. **Silhouette must read at small sizes.** Every pose must be recognizable
   as a 32×32 thumbnail. This drives posture choices — exaggerated, readable
   gesture over realistic subtlety.

3. **Consistent body proportions across all animations.** The 3D model is the
   single source of truth. No per-animation artistic drift.

4. **No outline softening.** The silhouette edge must be crisp at game
   resolution. Anti-aliasing is acceptable at sub-pixel level only.

### Technical Constraints

5. **Phaser 3 sprite atlas format.** Output must be JSON texture atlas
   compatible with `this.anims.create()` and `scene.load.atlas()`.

6. **128×128 px per frame.** This is the canonical frame size. Scaled to
   64×64 logical pixels at 2× pixel ratio for retina.

7. **Max atlas size: 2048×2048 px.** One character fits one atlas file.
   At 128×128 with 24 animations averaging 10 frames each = ~240 frames
   = 15 rows of 16 frames. Fits comfortably in 2048×2048.

8. **All source `.blend` files checked in.** The 3D source is the canonical
   master, not the rendered PNGs. PNGs are build artifacts.

9. **`npm run sprites` regenerates everything.** Any developer with Blender
   installed can rebuild all sprites from source.

### Scope Constraints

10. **Do not attempt to solve everything at once.** Each stage is independently
    shippable. A game running with Stage 1 sprites is better than a game
    waiting for Stage 8 sprites.

11. **FX are never baked.** Particles, glows, UL glyphs are always runtime.
    This lets us tune them without regenerating sprites.

---

## Why This Approach

### Why Not Pure AI Generation

- Image AI cannot yet maintain sub-pixel positional consistency across a grid
  of animation frames. Frame drift is still the core failure mode.
- The silhouette style requires clean hard edges that current diffusion models
  struggle to produce reliably without artifacts.
- 3D rendering gives us deterministic, repeatable outputs.
- One 3D model → infinite animation variations via Mixamo/Blender Actions.

### Why Not Hand-Drawn Sprites

- Inconsistent style across contributors.
- No automated pipeline — each new animation requires manual art.
- Extremely time-consuming for a team building everything else in parallel.
- The 3D source approach achieves the same aesthetic at a fraction of the time.

### Why Not a Full 3D Game

- Phaser is the chosen engine — 2D rendering is its strength.
- The silhouette style is intrinsically 2D and would lose its graphic quality
  in a 3D context.
- The original iOS prototype validated this aesthetic with players.

### Why Meshy.ai + Mixamo + Blender

- **Meshy.ai**: Best text/image-to-3D quality in 2026 for character forms.
  Free tier supports the models we need.
- **Mixamo**: Free from Adobe. 200+ motion-captured animations. Auto-rigging
  from uploaded mesh. No manual rigging required.
- **Blender**: Free, scriptable, best-in-class rendering pipeline.
  Python API allows full automation. Cross-platform.

---

## Success Criteria

The animation system is complete when:

1. Every JaneAI state (`Idle`, `Navigate`, `FollowGuidance`, `Combat`,
   `Retreat`, `Bored`, `Refusing`) has a distinct, recognizable animation.
2. All companion characters (Terra, Aqua) have their core 8 animations.
3. All enemies (Terminator, Phantom) have their core 6 animations.
4. `npm run sprites` regenerates everything from `.blend` sources in < 10 min.
5. The visual style is indistinguishable from the original iOS aesthetic.
6. The game runs at 60 FPS with all characters visible simultaneously.
