# Background Layer Specification

Defines the parallax background layers for the game world.

---

## Layer System

Three depth layers scroll at different rates creating depth illusion:

| Layer | Key | Scroll Rate | Size | Description |
|-------|-----|------------|------|-------------|
| Far | `bg_far` | 0.1× player speed | 512×288 | Distant terrain, skyline |
| Mid | `bg_mid` | 0.3× player speed | 512×288 | Mid-range ruins, towers |
| Near | `bg_near` | 0.6× player speed | 256×144 | Close foreground details |

All layers are rendered as **black silhouette** shapes on **white background**,
consistent with character and tile style.

---

## Phaser Parallax Implementation

```typescript
// In GameScene.create():
const bgFar  = this.add.tileSprite(0, 0, 800, 600, 'bg_far').setScrollFactor(0.1);
const bgMid  = this.add.tileSprite(0, 0, 800, 600, 'bg_mid').setScrollFactor(0.3);
const bgNear = this.add.tileSprite(0, 0, 800, 600, 'bg_near').setScrollFactor(0.6);

// Layer order (back to front):
// 1. bg_far  (furthest back)
// 2. bg_mid
// 3. bg_near
// 4. tiles (gameplay layer)
// 5. characters (sprites)
// 6. UI (fixed to camera)
```

`tileSprite` tiles the image horizontally as the player moves — works
because the background image repeats seamlessly at its edges.

---

## Blender Scene for Backgrounds

Background renders need a different camera setup than characters:

**Camera:**
```
Type: Orthographic
Ortho Scale: 8.0  (wide view vs 2.2 for characters)
Resolution: 512×288 (16:9 ratio)
Position: X=0, Y=-10, Z=1.5
Rotation: X=90°, Y=0°, Z=0°
```

**World background**: White (same as characters)
**Silhouette material**: Same `PFG_Silhouette` material

---

## Far Background (bg_far)

**Content**: Abstract distant terrain silhouettes.

Blender scene composition:
```
1. Add distant hills: Add → Mesh → UV Sphere, flatten Y and Z
   Scale: X=3, Y=0.2, Z=0.8 — creates a dome-like hill
   Place at Y=0, Z=-0.5 (at the bottom edge of frame)

2. Add distant tower: Add → Mesh → Cylinder
   Scale: X=0.05, Y=0.05, Z=2.0 — tall thin tower
   Place at X=-2, Z=-0.2

3. Add distant mountains: Edit-mode custom shapes from simple meshes

4. Keep shapes simple: at small render sizes, simple geometry
   produces cleaner silhouettes than complex organic shapes
```

**Seamlessness**: The left edge and right edge of the render should match
so the image tiles without a visible seam. Achieve this by placing terrain
features away from the edges, or by symmetrically wrapping features.

Test seamlessness: in Photoshop/GIMP, use `Offset → half width` —
if the seam is visible, adjust object positions.

---

## Mid Background (bg_mid)

**Content**: Ruins, broken structures, leyline energy pillars.

Blender composition:
```
1. Ruined arch: Add → Mesh → Torus (delete half)
   Scale to arch shape at Z=0 base

2. Broken column: Cylinder with Edit mode damage cuts

3. Leyline pillar: Tall thin cylinder with slight glow
   (in-game cyan tint applied at runtime: setTint(0x00e5ff, 0x00e5ff, 0, 0))

4. Energy conduit: Thin curved mesh connecting points
```

---

## Near Background (bg_near)

**Content**: Close-range foreground details that pop against the mid layer.

Smaller render size (256×144) means fewer polygons needed.

Content:
- Ground rock formations
- Close-up debris/rubble silhouettes
- Vegetation silhouettes (alien plants — abstract organic shapes)

---

## Animated Backgrounds (Future Enhancement)

For Stage 7+ (Integration), background layers can be subtly animated:

**Option A — Multiple frames**: Render 4-frame background animations
(e.g., energy particles flowing through leyline pillars) and use
`tileSprite` with animation.

**Option B — Phaser particle overlay**: Add low-density cyan particle
emitters on top of bg_mid to suggest energy flow. No Blender needed —
pure Phaser runtime effect. Covered in Stage 6.

---

## Outputs

```
assets-src/world/background.blend

public/assets/sprites/bg/
  bg_far.png     512×288
  bg_mid.png     512×288
  bg_near.png    256×144
```
