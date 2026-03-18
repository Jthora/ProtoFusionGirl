# Animation Pipeline — Progress Tracker

Track completion of all animation system work.
Numbers are permanent IDs — never reuse a number, never renumber.

**Legend**: `[ ]` not started · `[~]` in progress · `[x]` complete · `[—]` skipped/deferred

---

## Stage 0 — Strategy & Documentation

> Decisions, style guide, architecture docs. No code or renders yet.

### Phase 0.1 — Vision & Constraints

#### Step 0.1.1 — Art Direction

- [x] `0101` Define silhouette color rule (`#000000` on `#ffffff`)
- [x] `0102` Define accent color palette (cyan `#00e5ff`, amber `#ffaa00`, magenta `#ff2d78`)
- [x] `0103` Establish body proportion standard (5.5 heads for humanoids, 6.5 for Terminator)
- [x] `0104` Document "FX never baked into sprites" constraint
- [x] `0105` Document frame size standard (128×128 px per frame)

#### Step 0.1.2 — Document Creation

- [x] `0106` Write `00-strategy/vision-and-constraints.md`
- [x] `0107` Write `00-strategy/art-style-guide.md`
- [x] `0108` Write `00-strategy/toolchain-decisions.md`
- [x] `0109` Write `00-strategy/pipeline-architecture.md`
- [x] `0110` Write `README.md` master index

---

### Phase 0.2 — Toolchain Decisions

#### Step 0.2.1 — Evaluate 3D Model Sources

- [x] `0201` Research Meshy.ai capabilities and free tier limits
- [x] `0202` Research Tripo3D as fallback option
- [x] `0203` Document preferred tool and fallback in `toolchain-decisions.md`

#### Step 0.2.2 — Evaluate Animation Sources

- [x] `0204` Confirm Mixamo free tier covers all required animations
- [x] `0205` Document all Mixamo search terms for 24 Jane animations
- [x] `0206` Document "in-place" animation preference for locomotion

#### Step 0.2.3 — Atlas Tooling

- [x] `0207` Select FreeTexturePacker as atlas tool (free Phaser-compatible)
- [x] `0208` Confirm Phaser JSON Hash format requirements
- [x] `0209` Define `pfg` extension metadata schema for auto-catalog-generation

---

## Stage 1 — Foundation

> One real Jane sprite rendered and visible in the running game.
> Ref: [`01-foundation/stage-overview.md`](01-foundation/stage-overview.md)

> **Meshy.ai Source Files**: 155 pre-rigged animation GLB files are available in
> `FusionGirl_3DAnim/` as zip archives. Mixamo is NOT required — Meshy provides
> the character model + animation in each zip. Pipeline is now:
> Meshy GLB → Blender (silhouette material) → render frames → assemble atlas.
> See animation-to-file mapping below in Phase 1.1.

### Meshy.ai Animation File Map

> Best-pick mapping from `FusionGirl_3DAnim/Meshy_AI_biped-*.zip` to game animation keys.
> Multiple options listed where available — pick the smoothest loop or crispest hit frame.

| Game Key | Best Pick | Alternatives |
|----------|-----------|--------------|
| `jane_idle` | `biped-idle` | `idle-1` through `idle-15` (16 variants!) |
| `jane_walk` | `biped-quick-walk` | `stylish-walk`, `thoughtful-walk`, `walking-2`, `red-carpet-walk` |
| `jane_run` | `biped-run-fast` | `run-fast-3`, `run-fast-6`, `run-fast-7`, `run-fast-8`, `run-fast-10`, `run-2`, `run-3` |
| `jane_stand` | `biped-stand-and-chat` | `stand-and-drink`, `mirror-viewing` |
| `jane_combat_idle` | `biped-relax-arms-then-strike-battle-pose` | `sword-and-shield-alert-turn-right` |
| `jane_attack_1` | `biped-left-jab-from-guard` | `left-hook-from-guard`, `left-short-hook-from-guard`, `left-uppercut-from-guard` |
| `jane_attack_2` | `biped-right-uppercut-from-guard` | `right-upper-hook-from-guard`, `double-kick-forward`, `step-in-high-kick` |
| `jane_combo` | `biped-punch-combo` | `punch-combo-1`, `punch-combo-5`, `backflip-and-hooks` |
| `jane_dash` | `biped-standard-forward-charge` | `touch-and-run`, `jump-to-run` |
| `jane_skid` | `biped-stand-dodge` | `shield-push-left` |
| `jane_leap_start` | `biped-regular-jump` | — |
| `jane_retreat` | `biped-walk-backward` | `walk-backward-with-grenade`, `backleft-run`, `backright-run` |
| `jane_jump_start` | `biped-regular-jump` (early frames) | — |
| `jane_jump_apex` | `biped-swim-idle` | — |
| `jane_fall` | `biped-fall-1` | `fall-2` |
| `jane_land_hard` | `biped-dive-down-and-land-1` | `dive-down-and-land-2` |
| `jane_land_mid` | `biped-dive-down-and-land-2` | — |
| `jane_land_light` | `biped-regular-jump` (final frames) | `stand-up-1` |
| `jane_death` | `biped-dead` | — |
| `jane_bored` | `biped-long-breathe-and-look-around` | `look-around-dumbfounded`, `idle-to-pushup` |
| `jane_refusing` | `biped-shouting-angrily` | `shrug`, `stand-talking-angry` |
| `jane_ul_gesture` | `biped-charged-spell-cast` | `mage-spell-cast` through `mage-spell-cast-8` (9 variants!) |
| `jane_celebrate` | `biped-victory-cheer` | `victory-fist-pump`, `motivational-cheer`, `ymca-dance` |

**Bonus animations** (beyond the core 23 — add as time allows):

| Potential Key | Source File | Use Case |
|---------------|-------------|----------|
| `jane_backflip` | `biped-backflip` | Special dodge/acrobatic move |
| `jane_ul_gesture_2` | `biped-mage-spell-cast-3` | Secondary UL cast variant |
| `jane_bored_dance` | `biped-shake-it-off-dance` | Extra bored state |
| `jane_talk` | `biped-talk-passionately` | Dialogue state |
| `jane_wave` | `biped-wave-for-help` | Distress / summoning state |
| `jane_slam` | `biped-charged-ground-slam` | Heavy combat move |
| `jane_call` | `biped-call-gesture` | Companion summoning |

### Phase 1.1 — Generate Jane 3D Model (Meshy.ai)

#### Step 1.1.1 — Account & Setup

- [x] `1101` Create Meshy.ai account (free tier)
- [x] `1102` 155 Meshy.ai animation GLBs available in `FusionGirl_3DAnim/` — see file map above

#### Step 1.1.2 — Generate Model

- [x] `1103` Run Image to 3D generation with Jane prompt
- [x] `1104` Assess quality: humanoid proportions, 5.5 heads, separate limbs, arms not fused
- [x] `1105` Unzip selected GLBs from `FusionGirl_3DAnim/` per animation key mapping
- [x] `1106` Save best result as `assets-src/jane/jane_base.glb`

#### Step 1.1.3 — Pre-Mixamo Prep (Skipped — Mixamo not needed)

- [—] `1107` Open `jane_base.glb` in Blender, verify character faces −Y axis
- [—] `1108` Verify feet at Z=0; adjust if needed
- [—] `1109` Export as `assets-src/jane/jane_for_mixamo.fbx` (tris ON, scale 1.0, no armature)

#### Step 1.1.3 — Meshy GLB to Blender (Revised Pipeline)

> **Automated**: `npm run sprites:prep-blend` runs all steps below in sequence.
> Calls `scripts/setup-blender-scene.py` (first GLB) + `scripts/import-animation.py` (remaining 22).

- [ ] `1110` Run `npm run sprites:prep-blend` (or manually: unzip idle GLB, run setup-blender-scene.py)
- [x] `1111` `scripts/setup-blender-scene.py` applies `PFG_Silhouette` emission material automatically
- [x] `1112` `scripts/setup-blender-scene.py` sets Orthographic camera (Scale=2.2, X=0 Y=-5 Z=0.9 rot X=90°)
- [x] `1113` `scripts/setup-blender-scene.py` sets World Background white, Freestyle 2px contour
- [x] `1114` `scripts/setup-blender-scene.py` sets render settings (128×128, RGBA PNG, compression 15%)
- [ ] `1115` Verify test render: open `jane_master.blend` in Blender → F12 → confirm silhouette
- [ ] `1116` `jane_master.blend` saved by setup script; verify all 23 actions in Action Editor

---

### Phase 1.2 — Auto-Rig & Idle Animation (Mixamo)

#### Step 1.2.1 — Upload & Rig (Skipped — Mixamo not needed)

- [—] `1201` Sign in to mixamo.com with Adobe account
- [—] `1202` Upload `jane_for_mixamo.fbx`
- [—] `1203` Place rig markers: chin, left wrist, left elbow, left knee, groin
- [—] `1204` Preview rig with any animation — verify no skin tearing or clipping
- [—] `1205` Re-upload with adjusted markers if rig looks wrong

#### Step 1.2.2 — Download T-Pose & Idle (Skipped — Mixamo not needed)

- [—] `1206` Search "T-pose" → download as `assets-src/jane/jane_rigged.fbx` (FBX, With Skin)
- [—] `1207` Search "breathing idle" → preview on Jane model → select best
- [—] `1208` Download as `assets-src/jane/jane_idle.fbx` (FBX, With Skin, 30fps, No Keyframe Reduction)

---

### Phase 1.3 — Blender Scene Setup

> **Automated by `setup-blender-scene.py`** — steps below are performed by the script.
> Manual verification (1306, 1315) still required after running `npm run sprites:prep-blend`.

#### Step 1.3.1 — Scene Initialization

- [x] `1301` Script clears default scene (bpy.ops.object.select_all + delete)
- [x] `1302` Script imports GLB via bpy.ops.import_scene.gltf (replaces FBX import)
- [x] `1303` Script positions armature: finds min Z of all mesh verts, shifts to Z=0

#### Step 1.3.2 — Camera

- [x] `1304` Script adds camera at X=0, Y=−5, Z=0.9, rotation X=90°
- [x] `1305` Script sets camera Orthographic, Ortho Scale=2.2
- [ ] `1306` Verify manually: open blend, confirm Jane fills ~80% of frame height (adjust --ortho-scale if needed)

#### Step 1.3.3 — Silhouette Material

- [x] `1307` Script creates `PFG_Silhouette` with Emission node (black, strength 1.0)
- [x] `1308` Script applies to all mesh objects
- [x] `1309` Script sets View Transform = Standard (not Filmic)

#### Step 1.3.4 — Scene Settings

- [x] `1310` Script sets World Background to pure white
- [x] `1311` Script enables Freestyle: 2px thickness, contour/silhouette/border only
- [x] `1312` Script sets render: 128×128, RGBA PNG, compression 15%
- [x] `1313` Script sets output path `//temp/frame_`

#### Step 1.3.5 — Save

- [x] `1314` Script saves as `assets-src/jane/jane_master.blend`
- [ ] `1315` Verify manually: open blend → F12 → white background, black silhouette, crisp outline

---

### Phase 1.4 — Manual Render: Jane Idle

#### Step 1.4.1 — Render Frames

- [ ] `1401` Set timeline: Start=1, End=8 (one idle cycle)
- [ ] `1402` Render each frame with Render → Render Animation
- [ ] `1403` Confirm 8 PNG files in `temp/` directory

#### Step 1.4.2 — Assemble Sprite Sheet

- [ ] `1404` Assemble 8 frames into single row: 1024×128 px
- [ ] `1405` Save as `public/assets/sprites/jane/jane_idle.png`
- [ ] `1406` Write `jane_atlas.json` by hand (8-frame idle atlas, see stage-overview.md)
- [ ] `1407` Save `jane_atlas.json` alongside sprite sheet

---

### Phase 1.5 — Wire Into GameScene

#### Step 1.5.1 — Feature Flag

- [x] `1501` Create `src/data/spriteConstants.ts` with `REAL_SPRITES_ENABLED` env flag
- [x] `1502` Add `VITE_REAL_SPRITES=true` to `.env.local`

#### Step 1.5.2 — Preload & Animate

- [x] `1503` Update `GameScene.preload()`: load `jane_atlas.png` + `jane_atlas.json` when flag set
- [x] `1504` Update `GameScene.create()`: register `jane_idle` animation (8 frames, 8fps, loop)
- [x] `1505` Call `janeSprite.play('jane_idle')` after creation

---

### Phase 1.6 — Visual Validation

- [ ] `1601` Run game with `VITE_REAL_SPRITES=true`
- [ ] `1602` Confirm Jane appears as pure black silhouette (not placeholder shapes)
- [ ] `1603` Confirm idle animation loops smoothly without popping
- [ ] `1604` Confirm no white/grey fringing on silhouette edges
- [ ] `1605` Confirm character scale looks correct relative to terrain
- [ ] `1606` Confirm no console errors about missing texture frames

---

## Stage 2 — Jane Pilot

> All 24 Jane animations rendered and wired to JaneAI states.
> Ref: [`02-jane-pilot/stage-overview.md`](02-jane-pilot/stage-overview.md)

### Phase 2.1 — Complete Blender Animation Library

#### Step 2.1.1 — Download All 24 Animations from Mixamo (Skipped — using Meshy GLBs)

- [—] `2101` Download `jane_walk.fbx` — "walking", in-place
- [—] `2102` Download `jane_run.fbx` — "running", in-place
- [—] `2103` Download `jane_dash.fbx` — "quick dash forward"
- [—] `2104` Download `jane_skid.fbx` — "skidding stop"
- [—] `2105` Download `jane_stand.fbx` — "standing idle"
- [—] `2106` Download `jane_combat_idle.fbx` — "fighting idle"
- [—] `2107` Download `jane_attack_1.fbx` — "right straight punch"
- [—] `2108` Download `jane_attack_2.fbx` — "left kick"
- [—] `2109` Download `jane_combo.fbx` — "sword and shield combo"
- [—] `2110` Download `jane_jump_start.fbx` — "jump"
- [—] `2111` Download `jane_jump_apex.fbx` — "jump float"
- [—] `2112` Download `jane_fall.fbx` — "falling idle"
- [—] `2113` Download `jane_land_hard.fbx` — "hard landing"
- [—] `2114` Download `jane_land_mid.fbx` — "landing"
- [—] `2115` Download `jane_land_light.fbx` — "light landing"
- [—] `2116` Download `jane_leap_start.fbx` — "long jump"
- [—] `2117` Download `jane_retreat.fbx` — "running backward"
- [—] `2118` Download `jane_death.fbx` — "dying" or "back death"
- [—] `2119` Download `jane_bored.fbx` — "looking around"
- [—] `2120` Download `jane_refusing.fbx` — "disagreeing"
- [—] `2121` Download `jane_ul_gesture.fbx` — "pointing gesture"
- [—] `2122` Download `jane_celebrate.fbx` — "jump celebration"

#### Step 2.1.2 — Import All Into `jane.blend` (Skipped — using Meshy GLBs directly)

- [—] `2123` Import each `.fbx` into `jane.blend` (File → Import → FBX)
- [—] `2124` Transfer each action to main armature via NLA Editor
- [—] `2125` Rename each action to match key (e.g. `jane_walk`)
- [—] `2126` Delete extra imported armatures after each transfer
- [—] `2127` Verify all 24 actions visible in Action Editor
- [—] `2128` Play each action, confirm no gross deformation errors
- [—] `2129` Fix foot sliding / arm clipping on any problem animations

---

### Phase 2.2 — Render All 24 Animations

> Render manually (automation comes in Stage 3).
> Ref: [`02-jane-pilot/render-spec.md`](02-jane-pilot/render-spec.md)

#### Step 2.2.1 — Priority 1: Core Locomotion

- [ ] `2201` Render `jane_walk` — 12 frames, 3-frame step from 30fps source
- [ ] `2202` Render `jane_run` — 16 frames, 2-frame step
- [ ] `2203` Render `jane_combat_idle` — 8 frames, 4-frame step

#### Step 2.2.2 — Priority 2: Combat

- [ ] `2204` Render `jane_attack_1` — 8 frames
- [ ] `2205` Render `jane_retreat` — 12 frames

#### Step 2.2.3 — Priority 3: Air States

- [ ] `2206` Render `jane_jump_start` — 6 frames
- [ ] `2207` Render `jane_fall` — 6 frames
- [ ] `2208` Render `jane_land_mid` — 6 frames

#### Step 2.2.4 — Priority 4: Death / Bored / Refusing

- [ ] `2209` Render `jane_death` — 16 frames
- [ ] `2210` Render `jane_bored` — 20 frames
- [ ] `2211` Render `jane_refusing` — 12 frames

#### Step 2.2.5 — Remaining Animations

- [ ] `2212` Render `jane_stand` — 4 frames
- [ ] `2213` Render `jane_dash` — 6 frames
- [ ] `2214` Render `jane_skid` — 8 frames
- [ ] `2215` Render `jane_leap_start` — 6 frames
- [ ] `2216` Render `jane_jump_apex` — 4 frames
- [ ] `2217` Render `jane_land_hard` — 8 frames
- [ ] `2218` Render `jane_land_light` — 4 frames
- [ ] `2219` Render `jane_attack_2` — 8 frames
- [ ] `2220` Render `jane_combo` — 16 frames
- [ ] `2221` Render `jane_ul_gesture` — 16 frames
- [ ] `2222` Render `jane_celebrate` — 20 frames

#### Step 2.2.6 — Assemble All Sprite Sheets

- [ ] `2223` Assemble each animation into its grid sprite sheet (8 frames/row)
- [ ] `2224` Save each as `public/assets/sprites/jane/jane_<animation>.png`
- [ ] `2225` Verify all 232 total frames assembled correctly

---

### Phase 2.3 — Build Complete Atlas JSON

- [ ] `2301` Import all `jane_*.png` sprite sheets into FreeTexturePacker
- [ ] `2302` Set output to 2048×2048, Phaser 3 JSON Hash format
- [ ] `2303` Set frame naming pattern: `jane_<animation>_000`
- [ ] `2304` Export `jane_atlas.png` + `jane_atlas.json`
- [ ] `2305` Verify atlas: all 232 frames packed, no overflow
- [ ] `2306` Confirm JSON keys match expected pattern in Phaser

---

### Phase 2.4 — Animation State Machine Wiring

#### Step 2.4.1 — Animation Catalog

- [x] `2401` Create `src/data/animationCatalog.ts`
- [x] `2402` Define `JANE_ANIMATION_KEYS` const object (all 24 keys)
- [x] `2403` Define `JANE_STATE_TO_ANIMATION` record mapping all 7 JaneAI states
- [x] `2404` Define `LOOPING_ANIMATIONS` set (Idle, Navigate, Combat, Retreat)

#### Step 2.4.2 — JaneAI Event Emission

- [x] `2405` Add `JANE_ANIMATION_CHANGED` event type to `EventTypes.ts`
- [x] `2406` Add animation emit to `JaneAI.transitionTo()` using catalog map
- [x] `2407` Verify event fires for all 7 state transitions

#### Step 2.4.3 — GameScene Wiring

- [x] `2408` Update `GameScene.preload()` to load full `jane_atlas.png`
- [x] `2409` Register all 24 Phaser animations in `GameScene.create()`
- [x] `2410` Add `JANE_ANIMATION_CHANGED` listener → `sprite.play()`

---

### Phase 2.5 — Transition Polish

- [ ] `2501` Verify walk/run loop seamlessly (last frame connects to first)
- [ ] `2502` Verify combat_idle loops seamlessly
- [ ] `2503` Implement hold-last-frame for attack, land, death animations
- [ ] `2504` Wire walk animation speed scale to movement speed (slow→walk, fast→run threshold 200px/s)
- [ ] `2505` Confirm no visible pop at idle→walk→run transitions
- [ ] `2506` Confirm attack returns to combat_idle after completion

---

## Stage 3 — Pipeline Tool

> Automate everything. `npm run sprites` builds all atlases.
> Ref: [`03-pipeline-tool/stage-overview.md`](03-pipeline-tool/stage-overview.md)

### Phase 3.1 — Blender Headless Render Script

> Ref: [`03-pipeline-tool/render-sprite-sheet-spec.md`](03-pipeline-tool/render-sprite-sheet-spec.md)

#### Step 3.1.1 — Script Implementation

- [x] `3101` Create `scripts/render-sprites.py`
- [x] `3102` Implement `parse_args()` — handle `--action`, `--output-dir`, `--frame-step`
- [x] `3103` Implement `find_armature()` — locate armature by name in blend file
- [x] `3104` Implement `set_active_action()` — set armature animation action
- [x] `3105` Implement `render_frames()` — iterate frame range with step, render each
- [x] `3106` Implement exit codes (0=success, 1=action not found, 2=armature not found)

#### Step 3.1.2 — Test Headless Render

- [ ] `3107` Test: `blender --background jane.blend --python render-sprites.py -- --action jane_idle --output-dir /tmp/test --frame-step 4`
- [ ] `3108` Verify 8 PNG files written to output dir
- [ ] `3109` Verify file naming: `frame_0000.png` through `frame_0007.png`
- [ ] `3110` Test error case: invalid action name → exit code 1

---

### Phase 3.2 — Atlas Assembler Script

> Ref: [`03-pipeline-tool/render-sprite-sheet-spec.md`](03-pipeline-tool/render-sprite-sheet-spec.md)

- [x] `3201` Install Pillow: `pip3 install Pillow`
- [x] `3202` Create `scripts/assemble-atlas.py`
- [x] `3203` Implement frame glob + sort from input directory
- [x] `3204` Implement grid layout (8 cols × N rows)
- [x] `3205` Implement JSON frame coordinate output
- [ ] `3206` Test: assemble `jane_idle` frames → `jane_idle.png` + JSON fragment

---

### Phase 3.3 — Sprite Catalog Config

- [x] `3301` Create `scripts/sprite-catalog.json`
- [x] `3302` Add all 24 Jane animations with correct `frame_step` and `fps` values
- [x] `3303` Add `meshy_zip` + `blender_action` fields for all 23 animations pointing to actual `FusionGirl_3DAnim/` zip files
- [x] `3304` Confirm metadata fields match the atlas JSON schema

---

### Phase 3.4 — Orchestrator Script

- [x] `3401` Create `scripts/build-sprites.sh`
- [x] `3402` Implement character loop: read catalog, iterate animations
- [x] `3403` For each animation: call Blender render → call atlas assembler
- [x] `3404` After all animations: call FreeTexturePacker CLI to pack final atlas
- [x] `3405` Add `--dry-run` flag (validate tools exist, print plan, exit 0)
- [x] `3406` Add `npm run sprites` + `sprites:prep-blend` + `sprites:prep-blend-dry` to `package.json`
- [x] `3408` Create `scripts/setup-blender-scene.py` — automates tasks 1110–1116 + 1301–1315 from one GLB
- [x] `3409` Create `scripts/import-animation.py` — imports each remaining GLB action into master blend
- [x] `3410` Create `scripts/prep-jane-blend.sh` — orchestrates full setup: setup + 22 imports in sequence
- [x] `3411` Update `run-build-loop.py` to use `blender_action` field from catalog (not `key`) for `--action` flag
- [ ] `3407` Test end-to-end: `npm run sprites:prep-blend` then `npm run sprites` produces `jane_atlas.png`

---

### Phase 3.5 — Atlas Validation

- [x] `3501` Create `scripts/validate-atlas.js`
- [x] `3502` Implement: load catalog + atlas, compare expected vs actual frame keys
- [x] `3503` Implement: bounds check (frame coordinates within atlas dimensions)
- [x] `3504` Implement: duplicate key detection
- [x] `3505` Add `npm run sprites:validate` to `package.json`
- [ ] `3506` Test: corrupt atlas JSON → validator exits non-zero

---

### Phase 3.6 — Incremental Render Support

- [x] `3601` Implement `.blend` file modification time hash cache
- [x] `3602` Skip render if cache hit; log "cached: jane_walk"
- [x] `3603` Add `--force` flag to bypass cache
- [x] `3604` Add `--animation` flag for single-animation rebuild
- [ ] `3605` Test: run `npm run sprites` twice — second run is <2 seconds (all cached)

---

## Stage 4 — Full Roster

> All characters animated through the automated pipeline.
> Ref: [`04-full-roster/stage-overview.md`](04-full-roster/stage-overview.md)

### Phase 4.1 — Terra

> Ref: [`04-full-roster/characters/terra.md`](04-full-roster/characters/terra.md)

#### Step 4.1.1 — Model & Rig

- [ ] `4101` Generate `terra_base.glb` with Meshy.ai (sleek bodysuit, long hair, no armor)
- [ ] `4102` Export `terra_for_mixamo.fbx`, upload and rig in Mixamo
- [ ] `4103` Download T-pose as `terra_rigged.fbx`
- [ ] `4104` Download all 12 Terra animations as `.fbx`

#### Step 4.1.2 — Blender & Render

- [ ] `4105` Create `assets-src/terra/terra.blend` (same camera/material as jane.blend)
- [ ] `4106` Import all 12 actions into terra.blend
- [ ] `4107` Render all 12 animations (same pipeline as Stage 2)
- [ ] `4108` Assemble `terra_atlas.png` + `terra_atlas.json`

#### Step 4.1.3 — Catalog & Wire

- [ ] `4109` Add Terra to `sprite-catalog.json`
- [ ] `4110` Run `npm run sprites -- --character terra` successfully
- [ ] `4111` Wire Terra atlas in `GameScene.preload()` and `create()`
- [ ] `4112` Verify Terra appears in-game with correct animations

---

### Phase 4.2 — Aqua

> Ref: [`04-full-roster/characters/aqua.md`](04-full-roster/characters/aqua.md)

- [ ] `4201` Generate `aqua_base.glb` (aquatic suit, bob haircut, flared boots)
- [ ] `4202` Auto-rig in Mixamo, download T-pose + 12 animations
- [ ] `4203` Create `assets-src/aqua/aqua.blend`, import all actions
- [ ] `4204` Render all 12 Aqua animations (note: lower FPS values for floatier feel)
- [ ] `4205` Add to `sprite-catalog.json` and run pipeline
- [ ] `4206` Wire Aqua atlas in GameScene; verify in-game

---

### Phase 4.3 — Terminator Enemy

> Ref: [`04-full-roster/characters/enemies.md`](04-full-roster/characters/enemies.md)

- [ ] `4301` Generate `terminator_base.glb` (6.5 heads tall, heavy exosuit, dome head)
- [ ] `4302` Auto-rig in Mixamo (heavier animation choices), download 8 animations
- [ ] `4303` Create `assets-src/enemies/terminator.blend` (ortho scale 2.5 for taller model)
- [ ] `4304` Render all 8 Terminator animations
- [ ] `4305` Add to `sprite-catalog.json` and run pipeline
- [ ] `4306` Wire in GameScene; verify in-game appearance (should read as larger/heavier than Jane)

---

### Phase 4.4 — SleeperDrone (Non-Humanoid)

> Ref: [`04-full-roster/characters/enemies.md`](04-full-roster/characters/enemies.md)

#### Step 4.4.1 — Model in Blender (No Mixamo)

- [ ] `4401` Create `assets-src/enemies/drone.blend`
- [ ] `4402` Model drone core: UV sphere, scale 0.3
- [ ] `4403` Add 4 fins: extruded planes, rotated 90° each, parented to sphere
- [ ] `4404` Apply `PFG_Silhouette` material to all mesh objects

#### Step 4.4.2 — Hand-Key 4 Animations

- [ ] `4405` Keyframe `drone_hover`: Z position 0.5→0.6→0.5, gentle rotation loop (8 frames)
- [ ] `4406` Keyframe `drone_move`: forward tilt 10°, faster bob (8 frames)
- [ ] `4407` Keyframe `drone_attack`: Z drop + scale pulse (12 frames)
- [ ] `4408` Keyframe `drone_explode`: scale 1→0 over 16 frames

#### Step 4.4.3 — Render & Wire

- [ ] `4409` Render all 4 drone animations
- [ ] `4410` Assemble `drone_atlas.png` + `drone_atlas.json`
- [ ] `4411` Add to `sprite-catalog.json`; wire in GameScene

---

### Phase 4.5 — Jono Hologram

> Ref: [`04-full-roster/characters/jono-hologram.md`](04-full-roster/characters/jono-hologram.md)

- [ ] `4501` Generate `jono_base.glb` (casual jumpsuit, short tousled hair, no armor)
- [ ] `4502` Auto-rig in Mixamo, download 5 animations (idle, talk, point, wave, think)
- [ ] `4503` Create `assets-src/jono/jono.blend`, import actions
- [ ] `4504` Render 5 animations (50 total frames — smallest character atlas)
- [ ] `4505` Add to `sprite-catalog.json`; run pipeline
- [ ] `4506` Wire in GameScene with `setAlpha(0.6)` and `setTint(0x00e5ff)`

---

### Phase 4.6 — Wire All Characters in GameScene

- [ ] `4601` Verify `npm run sprites` builds all 5 character atlases in sequence
- [ ] `4602` Load all atlases in `GameScene.preload()`
- [ ] `4603` Register all character animations in `GameScene.create()`
- [ ] `4604` Verify each character AI emits `*_ANIMATION_CHANGED` events
- [ ] `4605` Verify GameScene listeners respond for all characters
- [ ] `4606` Run full game: confirm no placeholder shapes visible for any character

---

## Stage 5 — World Art

> Tileset and background layers rendered through pipeline.
> Ref: [`05-world-art/stage-overview.md`](05-world-art/stage-overview.md)

### Phase 5.1 — Tile Design

> Ref: [`05-world-art/tileset-spec.md`](05-world-art/tileset-spec.md)

- [ ] `5101` Finalize 16-tile minimum viable set (as defined in tileset-spec.md)
- [ ] `5102` Finalize full 32-tile vocabulary (all categories: ground, platform, structure, hazard, UL, leyline)
- [ ] `5103` Confirm tile naming convention matches TileRegistry expectations

---

### Phase 5.2 — Tile 3D Modeling

#### Step 5.2.1 — Ground Tiles

- [ ] `5201` Model `tile_ground_flat` — flat cube platform
- [ ] `5202` Model `tile_ground_slope_l` — ramp rising left-to-right
- [ ] `5203` Model `tile_ground_slope_r` — ramp rising right-to-left
- [ ] `5204` Model `tile_ground_edge_l` — left edge cap
- [ ] `5205` Model `tile_ground_edge_r` — right edge cap
- [ ] `5206` Model `tile_ground_inner` — solid interior fill

#### Step 5.2.2 — Platform & Structure Tiles

- [ ] `5207` Model `tile_platform_solid` — floating platform, ~40% height
- [ ] `5208` Model `tile_platform_half` — half-thickness platform
- [ ] `5209` Model `tile_wall_vert` — vertical wall
- [ ] `5210` Model `tile_column_base` + `tile_column_mid` — column sections
- [ ] `5211` Model `tile_arch` — arch segment

#### Step 5.2.3 — Hazard & Special Tiles

- [ ] `5212` Model `tile_hazard_spike` — upward spikes
- [ ] `5213` Model `tile_ul_node` + `tile_ul_node_off` — UL puzzle node states
- [ ] `5214` Model `tile_leyline_h` + `tile_leyline_v` + `tile_leyline_cross` — leyline channels
- [ ] `5215` Create `assets-src/world/tiles.blend` with all objects organized in collections

---

### Phase 5.3 — Automated Tile Render

- [ ] `5301` Extend `render-sprites.py` with `--single-frame` mode (object isolation)
- [ ] `5302` Add `tilesets` section to `sprite-catalog.json`
- [ ] `5303` Add all 16+ tiles to catalog with `object` and `frame` fields
- [ ] `5304` Test: `npm run sprites -- --tileset world` generates `tiles_atlas.png`
- [ ] `5305` Validate tile atlas JSON: all keys present, coordinates correct

---

### Phase 5.4 — Background Layers

> Ref: [`05-world-art/backgrounds.md`](05-world-art/backgrounds.md)

#### Step 5.4.1 — Blender Scene Setup

- [ ] `5401` Create `assets-src/world/background.blend`
- [ ] `5402` Set camera: Ortho Scale=8.0, resolution 512×288
- [ ] `5403` Apply same white world background + silhouette material

#### Step 5.4.2 — Model & Render Layers

- [ ] `5404` Model and render `bg_far.png` — distant hills, towers, mountains (512×288)
- [ ] `5405` Model and render `bg_mid.png` — ruins, leyline pillars, broken columns (512×288)
- [ ] `5406` Model and render `bg_near.png` — foreground rocks, debris, alien flora (256×144)
- [ ] `5407` Test seamless tiling: offset each image by 50% — verify no visible seam

---

### Phase 5.5 — TilemapManager Wiring

- [ ] `5501` Update `GameScene.preload()` to load tile atlas + background images
- [ ] `5502` Register tile textures in `TileRegistry` using atlas frame keys
- [ ] `5503` Add parallax `tileSprite` layers to `GameScene.create()` (far/mid/near)
- [ ] `5504` Set scroll factors (far=0.1, mid=0.3, near=0.6)
- [ ] `5505` Verify full visual cohesion: silhouette tiles + silhouette characters on white

---

## Stage 6 — FX Layer

> Runtime particle effects and UL glyph animations.
> Ref: [`06-fx-layer/stage-overview.md`](06-fx-layer/stage-overview.md)

### Phase 6.1 — Shared Particle Texture

- [x] `6101` Create 4×4 white particle dot texture programmatically in preload
- [x] `6102` Confirm texture available as `'particle_dot'` key in Phaser texture cache

---

### Phase 6.2 — Leyline Particle System

> Ref: [`06-fx-layer/particle-systems.md`](06-fx-layer/particle-systems.md)

- [x] `6201` Create `src/world/fx/LeylineParticles.ts`
- [x] `6202` Implement cyan (0x00e5ff) emitter along corridor spline
- [x] `6203` Wire to `LeyLineManager`: create emitters when corridors activate
- [x] `6204` Verify flow direction matches corridor direction
- [x] `6205` Verify 30 particles/sec at ~0.5ms GPU cost

---

### Phase 6.3 — UL Glyph FX

> Ref: [`06-fx-layer/ul-glyph-fx.md`](06-fx-layer/ul-glyph-fx.md)

- [x] `6301` Create `src/world/fx/ULGlyphFX.ts`
- [x] `6302` Implement `reveal()` — fade in + cyan burst
- [x] `6303` Implement `startSolving()` — amber tint + pulsing scale tween
- [x] `6304` Implement `solve()` — cyan lock + sparkle burst + gentle pulse
- [x] `6305` Implement `fail()` — magenta flash + shake tween
- [x] `6306` Wire to `ULPuzzleManager` events in `GameScene`
- [ ] `6307` Test all 4 glyph state transitions visually

---

### Phase 6.4 — Combat Impact FX

- [x] `6401` Create `src/world/fx/CombatImpactFX.ts`
- [x] `6402` Implement `burst()` — 10 amber particles + 4 white core particles
- [x] `6403` Add screen shake: amplitude 4px, duration 200ms
- [x] `6404` Wire to `COMBAT_HIT` event in `GameScene`

---

### Phase 6.5 — Rift Zone Ambient FX

- [x] `6501` Create `src/world/fx/RiftAmbientFX.ts`
- [x] `6502` Implement magenta wisp emitter orbiting rift center
- [x] `6503` Implement `setInstabilityLevel()` — scale density with instability 0–100
- [x] `6504` Wire to `RiftManager`: create emitter on rift spawn, update on stability events
- [x] `6505` Destroy emitter when rift sealed

---

### Phase 6.6 — Jono Hologram FX

- [x] `6601` Create `src/world/fx/HologramFX.ts`
- [x] `6602` Implement scanline overlay: tileSprite with 1×4 scanline tile, alpha 0.3
- [x] `6603` Implement flicker tween: alpha 0.3→0.5→0.3 over 2s, repeat
- [x] `6604` Implement disappear: rapid glitch flicker, then alpha tween 0.6→0
- [x] `6605` Wire to `JONO_APPEAR` / `JONO_DISAPPEAR` events

---

### Phase 6.7 — Speed Trail FX

- [x] `6701` Create `src/world/fx/SpeedTrailFX.ts`
- [x] `6702` Implement 5 ghost sprites, captured every 3 frames
- [x] `6703` Apply cyan tint + decreasing alpha to ghost chain
- [x] `6704` Wire to speed system: activate at Supersonic tier, deactivate below

---

## Stage 7 — Integration

> Fully wired game — every event triggers correct visual response.
> Ref: [`07-integration/stage-overview.md`](07-integration/stage-overview.md)

### Phase 7.1 — Animation State Machine

> Ref: [`07-integration/phaser-animation-state-machine.md`](07-integration/phaser-animation-state-machine.md)

#### Step 7.1.1 — Priority System

- [x] `7101` Create `src/animation/AnimationPriority.ts`
- [x] `7102` Assign priority levels to all 24 Jane animations
- [x] `7103` Implement `canInterrupt(current, incoming)` function
- [x] `7104` Extend priority map for all other characters

#### Step 7.1.2 — AnimationController

- [x] `7105` Create `src/animation/AnimationController.ts`
- [x] `7106` Implement `registerSprite(key, sprite)`
- [x] `7107` Implement `play(spriteKey, animKey)` — priority-gated, deduped
- [x] `7108` Implement `playOnce(spriteKey, animKey, onComplete?)`
- [x] `7109` Subscribe to all `*_ANIMATION_CHANGED` events from EventBus
- [x] `7110` Register all character sprites in `GameScene.create()`
- [x] `7111` Remove all direct `sprite.play()` calls from `GameScene` — route through controller

---

### Phase 7.2 — Speed-Scaled Locomotion

- [ ] `7201` Read `janeBody.speed` each frame in update loop
- [ ] `7202` Emit walk vs run animation based on speed threshold (200px/s)
- [ ] `7203` Scale `msPerFrame` proportionally to actual movement speed
- [ ] `7204` Confirm walk/run switch has no visible pop

---

### Phase 7.3 — Jump/Air State Sequencing

- [ ] `7301` Wire `JUMP_STARTED` event → play `jane_jump_start` (once)
- [ ] `7302` On jump_start complete: check velocity → play `jane_jump_apex` or `jane_fall`
- [ ] `7303` In update: if playing apex and velocity.y > 20 → switch to `jane_fall`
- [ ] `7304` Wire `JANE_LANDED` event → select land_hard/mid/light by velocity
- [ ] `7305` On land animation complete → return to ground state
- [ ] `7306` Verify full air sequence: jump_start → apex → fall → land → idle

---

### Phase 7.4 — Combat Animation Sequencing

- [ ] `7401` Wire attack input → play attack animation (once)
- [ ] `7402` On attack complete → resume `jane_combat_idle`
- [ ] `7403` Guard: block state changes while attack animation is playing
- [ ] `7404` Test combo: attack_1 → attack_2 (priority allows attack→attack)

---

### Phase 7.5 — Death and Rewind Transition

- [ ] `7501` Wire `JANE_DIED` event → play `jane_death` (once, hold last frame)
- [ ] `7502` On death animation complete: 500ms pause → fade Jane alpha to 0
- [ ] `7503` Trigger `RewindSystem` after fade
- [ ] `7504` On `REWIND_COMPLETE`: restore Jane alpha to 1, play `jane_idle`
- [ ] `7505` Confirm death cannot be interrupted by any other animation

---

### Phase 7.6 — Performance Validation

> Ref: [`07-integration/performance-budget.md`](07-integration/performance-budget.md)

- [ ] `7601` Run full stress scenario: all characters + all FX active simultaneously
- [ ] `7602` Confirm 60fps average, minimum above 45fps
- [ ] `7603` Profile draw calls — confirm under 20 per frame
- [ ] `7604` Profile GPU texture memory — confirm under 50MB
- [ ] `7605` Test on low-end target (or CPU-only mode): confirm 30fps minimum
- [ ] `7606` Implement LOD: pause animations for off-screen characters
- [ ] `7607` Implement FX density reduction if fps < 55

---

## Stage 8 — Sprite Factory (Developer Tool)

> Optional: GUI tool for previewing and editing animations.
> Ref: [`08-sprite-factory/stage-overview.md`](08-sprite-factory/stage-overview.md)

### Phase 8.1 — Scope A: Web Viewer

> Ref: [`08-sprite-factory/tool-spec.md`](08-sprite-factory/tool-spec.md)

#### Step 8.1.1 — Project Setup

- [x] `8101` Create `tools/sprite-factory/` directory structure
- [x] `8102` Create `tools/sprite-factory/vite.config.ts` (port 4567, proxy to project root)
- [x] `8103` Create `tools/sprite-factory/index.html` with sidebar + canvas layout
- [x] `8104` Add `npm run sprite-factory` script to root `package.json`

#### Step 8.1.2 — Catalog Loader

- [x] `8105` Implement `CatalogLoader.ts` — fetch catalog JSON + all atlas JSONs
- [x] `8106` Handle missing atlases gracefully (skip unrendered characters)
- [x] `8107` Extract animation list from `meta.pfg.animations` block

#### Step 8.1.3 — Phaser Preview

- [x] `8108` Implement `SpriteFactoryScene.ts` — centered preview sprite, 2× scale
- [x] `8109` Implement checkerboard background (shows alpha correctly)
- [x] `8110` Implement `playAnimation()` — register Phaser anim on demand, play
- [x] `8111` Implement frame counter and FPS display overlay

#### Step 8.1.4 — Sidebar UI

- [x] `8112` Implement `SidebarUI.ts` — character tabs + animation list
- [x] `8113` Emit `pfg:select-animation` custom events on click
- [x] `8114` Highlight active animation row
- [x] `8115` Display fps, frame count, loop/hold metadata per animation

---

### Phase 8.2 — Scope B: Web Editor (Optional Enhancement)

- [ ] `8201` Add FPS slider per animation entry in sidebar
- [ ] `8202` Write FPS change back to `sprite-catalog.json` via local dev API
- [ ] `8203` Add loop/hold toggle that updates catalog
- [ ] `8204` Add "Re-render" button that triggers `npm run sprites -- --animation {key}`
- [ ] `8205` Show render progress / status in sidebar

---

### Phase 8.3 — Scope C: Full Factory (Optional Enhancement)

- [ ] `8301` Integrate live Blender background render triggered from factory UI
- [ ] `8302` Implement timeline scrubber: drag to preview specific frames
- [ ] `8303` Implement character comparison: side-by-side two-character view
- [ ] `8304` Implement new animation wizard: name + Mixamo file → pipeline auto-runs
- [ ] `8305` Package as standalone Electron app for distribution

---

## Summary

| Stage | Phase Count | Task Count | [x] Done | [—] Skip | [ ] Pending |
|-------|-------------|------------|----------|----------|-------------|
| 0 — Strategy | 2 | 15 | 15 | 0 | 0 — **Complete** |
| 1 — Foundation | 6 | 57 | 19 | 11 | 27 — Run `sprites:prep-blend` then manual verify |
| 2 — Jane Pilot | 5 | 66 | 10 | 29 | 27 — Render work required |
| 3 — Pipeline Tool | 6 | 42 | 34 | 0 | 8 — Needs blend file to test end-to-end |
| 4 — Full Roster | 6 | 44 | 0 | 0 | 44 — After Stage 1-3 complete |
| 5 — World Art | 5 | 31 | 0 | 0 | 31 — After Stage 3 complete |
| 6 — FX Layer | 7 | 32 | 31 | 0 | 1 — Visual test only |
| 7 — Integration | 6 | 37 | 11 | 0 | 26 — After sprites rendered |
| 8 — Sprite Factory | 3 | 25 | 15 | 0 | 10 — Optional enhancements |
| **Total** | **46** | **349** | **135 [x]** | **40 [—]** | **174 [ ]** |

> **Next action for user**: `npm run sprites:prep-blend-dry` (preview) → `npm run sprites:prep-blend` (execute) → open `jane_master.blend` → F12 verify → `npm run sprites`.
> IDs `1107`–`1109`, `1201`–`1208`, `2101`–`2129` skipped — Mixamo not needed (Meshy GLBs are pre-rigged + pre-animated).
> IDs `3408`–`3411` added for new Meshy→Blender automation scripts.
