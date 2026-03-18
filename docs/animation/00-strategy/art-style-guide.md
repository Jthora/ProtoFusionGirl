# Art Style Guide

## Core Principle

> The shape is the character. The pose is the emotion. Color is energy.

Everything in ProtoFusionGirl's visual language follows three rules:
1. **Characters and environments** are pure black silhouettes
2. **Energy, FX, and UI elements** use the accent color palette
3. **Nothing is in between** — no gradients, no grey, no texture detail on characters

---

## Silhouette Design Rules

### Rule 1: Every Pose Must Read at 32×32

Before approving any animation frame, view it scaled to 32×32 pixels.
If you can't tell what the character is doing, the pose is wrong.

Good pose indicators:
- Limbs at angles (not overlapping the body)
- Clear center of gravity
- Gesture direction obvious from silhouette alone
- Character facing direction unambiguous

### Rule 2: No Internal Detail

Characters have no internal lines, no muscle definition, no costume markings.
The only visual information is the outer edge (silhouette).

Exception: The UL gesture animation may show a faint glow aura — this is
rendered as a runtime particle effect, not baked into the sprite.

### Rule 3: Consistent Body Proportions

Jane is 5.5 heads tall. This is heroic-compact proportions — readable at
small sizes, still humanoid. All Jane frames must maintain this ratio.

Companions (Terra, Aqua) share the same base proportions — they are robots
of similar build. Enemies are taller (Terminators: 6.5 heads) or ethereal
(Phantoms: variable, fade-edge silhouette).

### Rule 4: Strong Contour, No Aliasing

The silhouette edge must be:
- 1 pixel hard black at game resolution (64×64 logical)
- Anti-aliased only at sub-pixel level in the 128×128 source render
- Never blurred or feathered at the character boundary

In Blender, this means: Freestyle line rendering with a 2px line weight
at 128×128, scaled down to 64×64 in-game (effectively 1px lines).

---

## Character Visual Specs

### Jane Tho'ra (Player Character)

```
Body type:     Athletic humanoid, light exosuit
Height:        5.5 heads in full-body poses
Proportions:   Shoulders slightly wider than hips (armored silhouette)
Key features:  Hair reads as a ponytail/crest shape in silhouette
               Exosuit shoulders create slight wing-like upper body
               Boots/greaves add mass at lower legs
Distinctive:   Recognizable from 50px away by shoulder-hair silhouette
```

### Terra (Earth Hero)

```
Body type:     Compact, wide-shouldered, heavy construction robot
Height:        Same as Jane (5.5 heads) — different SHAPE, same size
Proportions:   Much wider shoulders, shorter neck, bulkier limbs
Key features:  Circular chest element (energy core)
               Large forearms/hands (shield-capable)
Distinctive:   Square-shouldered industrial silhouette vs Jane's organic curves
```

### Aqua (Water Hero)

```
Body type:     Lithe, fluid-limbed, flowing
Height:        5.5 heads
Proportions:   Narrower shoulders, longer arms, flowing cape element
Key features:  Fin/wing elements at arms and head
               Fluid pose bias (always slightly curved, never rigid)
Distinctive:   Asymmetric, organic silhouette vs Terra's rigid geometry
```

### Remnant Terminator (Enemy)

```
Body type:     Tall, angular military robot
Height:        6.5 heads (visibly larger threat)
Proportions:   Wide shoulders, narrow waist, heavy legs
Key features:  Angular head with scanning visor fin
               Weapons visible as part of silhouette (arm cannon or rifle)
Distinctive:   Taller than any hero — threat communicated by scale
```

### Nefarium Phantom (Enemy)

```
Body type:     Ethereal, dissolving at edges
Height:        Variable (6-8 heads, floats)
Proportions:   Long torso, trailing lower body (no defined legs)
Key features:  Irregular, jagged edge silhouette — "dissolving" effect
               Runtime FX: magenta-red particle dissolve overlay
Distinctive:   Not crisp silhouette — intentionally soft/jagged edges
               Only character where edge quality is not crisp
```

---

## Animation Style Rules

### Weight and Physicality

Jane's animations should feel **physically grounded**. She has mass.
Reference: motion capture of a person in light armor.

Key principles:
- **Squash on landing**: Brief 2-3 frame compression on ground contact
- **Anticipation before jumps**: 2-frame wind-up before any explosive move
- **Follow-through**: Ponytail/cape elements lag 1-2 frames behind body
- **No float**: Feet contact ground clearly, no hovercraft sliding

### Timing Guidelines

```
Idle cycle:        24-32 frames (8fps = 3-4 seconds)
Walk cycle:        16 frames (12fps = 1.33 seconds)
Run cycle:         12 frames (12fps = 1 second)
Jump full arc:     20 frames (12fps = 1.67 seconds)
Attack strike:     8-10 frames (12fps = ~0.7 seconds)
Land:              6 frames (12fps = 0.5 seconds)
Death full anim:   24-30 frames (10fps = 2.4-3 seconds)
```

### Transition Poses

The last frame of every animation must be compatible with the first frame
of the animations it can transition to. This prevents visual pop.

Critical transitions (from iOS catalog):
```
READY ↔ STAND          (can hold either, smooth swap)
READY → DASH           (run-up into dash)
DASH → SKID            (momentum stop)
JUMP → FALL            (apex of arc)
FALL → READY (HARD/MID/LIGHT)  (three landing variants)
```

---

## Environment and World Art Rules

### Terrain

- Black outlines only on terrain/architectural elements
- Interior fill: white or near-white (maximum contrast with characters)
- Ground plane: solid black line, 2px visual weight
- Platform/structure edges: same 2px black line

### Backgrounds

Parallax layers from back to front:
1. **Sky layer**: Pure white. Optional: very faint horizontal line
   suggesting a horizon. Nothing else.
2. **Far environment**: 15% grey silhouette shapes (hills, structures).
   Max 10% of screen coverage. Must not compete with characters.
3. **Mid environment**: 40% grey to black architectural outlines.
   Doors, walls, ley-line conduits.
4. **Foreground terrain**: Pure black. The ground Jane stands on.

### Ley Lines

- Rendered as runtime effects only — never baked into backgrounds
- Color: amber `#ffaa00` with pulsing opacity (0.4 → 0.9, 2-second cycle)
- Width: 3px logical / 6px source
- Glow: Cyan outer bloom `#00e5ff` at 20% opacity, 8px radius

---

## UI and HUD Style

All UI elements follow the same black-on-white principle:
- Panels: white background, black border (1px)
- Text: black on white, white on black (inverted for active/selected)
- Trust meter: horizontal bar, black fill on white track
- UL symbol palette: black glyphs on white tiles, cyan highlight on hover
- Accent colors appear ONLY as active-state indicators

---

## What to Avoid

- **Grey fills on characters** — destroys the silhouette read
- **Outline halos or glows on characters** — reserved for FX-only elements
- **Color variation between frames** — consistency is everything
- **Complex backgrounds** — they compete with characters
- **Cute / chibi proportions** — this game is serious sci-fi
- **Particle effects on sprite sheets** — FX is always runtime
