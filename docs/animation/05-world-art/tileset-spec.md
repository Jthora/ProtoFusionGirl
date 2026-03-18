# Tileset Specification

Defines the complete tile vocabulary for the game world.
All tiles are 128×128 px, black silhouette on white background.

---

## Tile Naming Convention

```
tile_{category}_{variant}

Examples:
  tile_ground_flat
  tile_ground_slope_l
  tile_platform_half
  tile_hazard_spike
```

---

## Ground Tiles

The terrain that characters walk/land on.

| Key | Shape | Description |
|-----|-------|-------------|
| `tile_ground_flat` | ▬ | Standard flat ground |
| `tile_ground_slope_l` | ◸ | Slope rising left-to-right |
| `tile_ground_slope_r` | ◹ | Slope rising right-to-left |
| `tile_ground_edge_l` | ▌ | Left edge of a platform |
| `tile_ground_edge_r` | ▐ | Right edge of a platform |
| `tile_ground_inner` | ■ | Interior fill (underground) |

**Blender shape for flat ground**:
```
Cube: X=1.0, Y=0.5 (depth into screen), Z=0.25
Position: Z=0 (top surface at Z=0.25)
The top face = the walking surface
```

---

## Platform Tiles

Floating platforms Jane can jump onto.

| Key | Shape | Description |
|-----|-------|-------------|
| `tile_platform_solid` | ━━ | Solid platform, ~40% height |
| `tile_platform_half` | ─ | Half-thickness platform |
| `tile_platform_wide_l` | ╾ | Wide platform left end |
| `tile_platform_wide_r` | ╼ | Wide platform right end |

---

## Structural Tiles

Background architecture elements (walls, columns, ruins).

| Key | Shape | Description |
|-----|-------|-------------|
| `tile_wall_vert` | ║ | Vertical wall section |
| `tile_wall_horiz` | ═ | Horizontal wall |
| `tile_column_base` | ⊥ | Column base |
| `tile_column_mid` | ┃ | Column middle |
| `tile_arch` | ∩ | Arch segment |
| `tile_ruin_rubble` | ~irregular~ | Rubble/debris pile |

---

## Hazard Tiles

| Key | Description | Gameplay effect |
|-----|-------------|-----------------|
| `tile_hazard_spike` | Upward spikes | Instant death on contact |
| `tile_hazard_pit` | Pit edge marker | Visual indicator of drop |
| `tile_hazard_energy` | Energy barrier | Damage on contact |

---

## UL (Universal Language) Tiles

Special tiles that appear in puzzle areas. Render as silhouette but
can be tinted at runtime by Phaser to show activation state.

| Key | Description |
|-----|-------------|
| `tile_ul_glyph_fire` | Fire glyph socket |
| `tile_ul_glyph_water` | Water glyph socket |
| `tile_ul_glyph_earth` | Earth glyph socket |
| `tile_ul_glyph_air` | Air glyph socket |
| `tile_ul_node` | UL energy node (active state) |
| `tile_ul_node_off` | UL energy node (inactive) |

**In-game tinting**:
- Inactive: standard silhouette (black)
- Active: Phaser `setTint(0x00e5ff)` for cyan glow
- Solved: Phaser `setTint(0xffaa00)` for amber

---

## Leyline Tiles

| Key | Description |
|-----|-------------|
| `tile_leyline_h` | Horizontal leyline energy channel |
| `tile_leyline_v` | Vertical leyline |
| `tile_leyline_cross` | Leyline intersection |
| `tile_vortex_core` | Leyline vortex center |

Leyline tiles get a runtime magenta tint (`0xff2d78`) when active.

---

## Minimum Viable Set (16 tiles for Stage 5)

Priority order — render these first:

1. `tile_ground_flat`
2. `tile_ground_slope_l`
3. `tile_ground_slope_r`
4. `tile_ground_edge_l`
5. `tile_ground_edge_r`
6. `tile_platform_solid`
7. `tile_platform_half`
8. `tile_wall_vert`
9. `tile_column_base`
10. `tile_column_mid`
11. `tile_hazard_spike`
12. `tile_ul_node`
13. `tile_ul_node_off`
14. `tile_leyline_h`
15. `tile_leyline_v`
16. `tile_ground_inner`

---

## Tile Atlas Budget

16 tiles × 128×128 = 262,144 pixels
256×256 atlas fits all 16 tiles (64 tiles capacity)
Final full set (32+ tiles): 512×512 atlas

All well within budget — tiles pack much more efficiently than
characters because they're static (1 frame each).
