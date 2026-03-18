# ProtoFusionGirl — Sound Design System Architecture
## Overview

The audio system is built in three distinct layers that stack on top of each other.
Each layer is independently functional but designed to cooperate:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: HarmonicEngine          (emotional / lore-driven)     │
│  Tones that shift as emotional state changes. Beu lifecycle.    │
│  UL casting sequences. Trust milestone stingers.                │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: CombinatorialPool       (stochastic layering)         │
│  Multi-prompt layering. RMS volume. Pitch jitter. Stereo spread.│
│  Attack stagger. Infinite perceptual variance from small sets.  │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: AudioManager            (spatial / reactive)          │
│  Spatial ambient zones (X-position crossfade). Tension heartbeat│
│  driven by node stability. Rift contamination by proximity.     │
│  Positional stereo for world-space SFX. EventBus wiring.        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: AudioManager (`src/audio/AudioManager.ts`)

**Status: ACTIVE — fully wired into GameScene**

### What it does

**Spatial Ambient Zones** — Three looping music tracks whose volumes are driven by
Jane's X position. As she moves left or right, tracks crossfade using a trapezoid
volume curve (linear ramp in, flat plateau, linear ramp out). All three run
simultaneously at their position-appropriate volumes.

```
← Jane moves left ────────────────────────────────── Jane moves right →

[PsiNet Cosmos]    [Holodeck Training]    [Training Loop]
  fades in here      full at center         fades in here
```

**Tension Heartbeat** — Driven by lowest node stability across all nodes.
At 0% tension: silent. At 100% tension: fires every 1 second. Alternates
between threat-detected and collapse SFX at extreme tension. Volume scales
0.08–0.30 with tension. Acts as a passive urgency layer the player notices
subconsciously before they notice they're losing.

**Rift Contamination** — As Jane approaches a rift, corruption sounds fire with
increasing frequency and volume. Full contamination inside 150px, none beyond 600px.
Uses trust-weighted variant selection (high trust → cleaner sounds, low trust →
harsher).

**Positional Stereo** — SFX played at world-space coordinates are panned
proportionally: `pan = clamp((sourceX - janeX) / 500, -1, 1)`. A hit coming
from 250px to Jane's right plays at 0.5 pan right.

**SoundPool** — Simple variant selection with four modes:
- `single` — always same file (UI confirmations, boot sequences)
- `sequential` — predictable cycle (footsteps)
- `random-no-repeat` — random but never same twice in a row (combat)
- `trust-weighted` — high trust = cleaner variants, low trust = harsher

**EventBus subscriptions** — 20+ game events wired to specific SFX:
`JONO_FIRST_CONTACT`, `NODE_COLLAPSED`, `RIFT_SEALED`, `JANE_ATTACK`,
`ENEMY_DEFEATED`, `UL_PUZZLE_SUCCESS`, `BOOST_ACTIVATED`, etc.

### Files
- `src/audio/AudioManager.ts` — full implementation
- Called from `src/scenes/GameScene.ts` (create, update)
- Called from `src/scenes/StartScene.ts` (main menu music)

---

## Layer 2: CombinatorialPool (`src/audio/CombinatorialPool.ts`)

**Status: BUILT — not yet wired into AudioManager or GameScene**

### What it does

Each "sound case" was generated from multiple ElevenLabs prompts (each describing
a different physical instrument/source for the same emotional intent). Each prompt
produced 4 variants. CombinatorialPool picks one variant from each prompt group
and plays all selected layers simultaneously.

### The Math

**RMS volume scaling** — `volume per layer = 1 / √N` where N = active layers.
Maintains perceived loudness equal to a single full-volume sound.
- 2 layers: 0.707 each
- 3 layers: 0.577 each
- Linear (1/N) also available — safer for percussive sounds, slightly quieter

**Pitch jitter** — Each layer gets an independent random playback rate:
`rate = 1.0 ± (random × jitter_amount)`. Applied per layer independently.
On short sounds (< 3s), ±3% rate is effectively pitch-only — tempo difference
is imperceptible.

**Stereo micro-spread** — Each layer has a `panOffset` (-1 to +1). Layers are
spread across the field. Combined with world-position pan from AudioManager.
Creates width that the brain perceives as spatial richness.

**Attack stagger** — Layers have independent `attackDelayMs` (0–40ms). Eliminates
phase cancellation risk for similar-source sounds. Creates natural room-reflection
quality — like a note arriving from two slightly different distances.

### Combination count (perceptual)

For a sound case with 3 prompt groups, 4 variants each, maxLayers=2:
- Pick 2 of 3 groups: C(3,2) = 3 combinations
- Pick 1 of 4 from each group: 4 × 4 = 16
- Total base: 3 × 16 = **48 unique combinations**
- Plus continuous pitch jitter per layer = **effectively infinite**

### File naming convention

```
audio/<category>/<stem>_p<prompt>_v<variant>.mp3

Examples:
  audio/harmonic/tone_0_p1_v1.mp3   ← tone 0, prompt 1 (Tibetan bowl), variant 1
  audio/harmonic/tone_0_p1_v2.mp3   ← same prompt, next variant
  audio/harmonic/tone_0_p2_v1.mp3   ← tone 0, prompt 2 (tuning fork), variant 1
  audio/trust/trust_100_p3_v4.mp3   ← trust 100 milestone, prompt 3, variant 4
```

### Pre-built POOLS

30+ pre-configured `CombinatorialPool` instances covering every 2ndPass sound case.
Layer counts and jitter ranges are tuned per category:

| Category | Layers | Pitch jitter | Rationale |
|---|---|---|---|
| Harmonic tones 0–11 | 2 | ±1.5% | Rich timbral blend, minimal detuning |
| Beu stingers | 2 | ±2% | Alive but not off-key |
| Trust milestone 25 | 1 | ±1% | Intimate, personal |
| Trust milestone 100 | 3 | ±0.8% | Transcendent, peak emotional moment |
| Impact (hurt/attack) | 2 | ±4% | Punchy and varied |
| Rift warning | 2 of 4 | ±5% | Corruption = instability |
| Node collapse | 2 | ±3% | Dramatic but grounded |
| PsiNet | 2 | ±2% | Digital-meets-organic |

### Files
- `src/audio/CombinatorialPool.ts` — CombinatorialPool class + POOLS + preloadCombinatorialAudio
- `scripts/copy_2ndpass_audio.sh` — copies all 4 variants per prompt group to public/audio/
- `public/audio/harmonic/` — 144 tone files (12 × 3 prompts × 4 variants)
- `public/audio/beu/`, `nodes/`, `trust/`, `rift/`, `ul/`, `jane/`, `speeder/`, `leylines/`, `psinet/`

---

## Layer 3: HarmonicEngine (`src/audio/HarmonicEngine.ts`)

**Status: BUILT — not yet wired into anything**

### What it does

Driven by lore: in FusionGirl's Universal Language, Emotions ARE Angles on a
Base-12 circle (12 positions × 30° = 360°). 12 emotional states = 12 chromatic
pitches. HarmonicEngine translates game state into which emotional angle is
"active" and plays the corresponding harmonic tone.

**Three simultaneous layers:**
- **Harmonic Root** — current emotional tone, updates every 4 seconds when state changes
- **Beu Voice** — Beu's lifecycle stage ambient texture (loops underneath)
- **Event Stingers** — instant one-shots triggered by game events

**Emotional angle → tone mapping (UL_ANGLE_TO_TONE):**

| Angle | Tone index | Emotional quality |
|---|---|---|
| 0° | 0 | Stillness / Root |
| 30° | 1 | Tension / Dissonance |
| 60° | 2 | Curiosity / Movement |
| 90° | 3 | Melancholy / Empathy |
| 120° | 4 | Hope / Warmth |
| 150° | 5 | Balance / Structure |
| 180° | 6 | Chaos / Transformation |
| 210° | 7 | Power / Clarity |
| 240° | 8 | Mystery / Wonder |
| 270° | 9 | Connection / Belonging |
| 300° | 10 | Longing / Unresolved |
| 330° | 11 | Anticipation / Threshold |

**Beu lifecycle stages:**
- `seed` — barely audible, dormant
- `sprout` — sparse, tentative pings
- `growth` — active rhythmic pattern
- `bloom` — rich harmonic cluster
- `bond` — two interwoven voices unified

**Trust-weighted variant selection** — high trust → pick from cleaner variants
(lower index), low trust → pick from harsher variants (higher index).

**Trust milestone system** — Stingers fire when trust crosses 25/50/75/100%.
Hysteresis: milestone only re-triggers after trust drops 5% below the threshold.

### Files
- `src/audio/HarmonicEngine.ts`

---

## Audio File Structure

```
public/audio/
├── music_main_menu.mp3              (1st pass — StartScene)
├── music_gameplay_loop.mp3          (1st pass — GameScene main)
├── music_holodeck_ambient.mp3       (1st pass — ambient zone center)
├── music_psinet_ambient.mp3         (1st pass — ambient zone left)
├── music_psisys_awakening.mp3       (1st pass — cutscene)
├── music_training_loop.mp3          (1st pass — ambient zone right)
├── sfx_*.mp3                        (1st pass — 10 pooled × 4 variants each)
├── harmonic/
│   └── tone_{0-11}_p{1-3}_v{1-4}.mp3    (144 files — 2nd pass)
├── beu/
│   └── beu_{stage}_p{1-2}_v{1-4}.mp3   (40 files — 2nd pass stingers)
│   NOTE: stage ambients NOT YET GENERATED (need loop mode)
├── ul/
│   └── ul_{init|charge|release|fail}_p{N}_v{1-4}.mp3   (36 files)
├── nodes/
│   └── node_{distress|collapse|restore}_p{N}_v{1-4}.mp3  (40 files)
├── trust/
│   └── trust_{25|50|75|100}_p{N}_v{1-4}.mp3   (44 files)
├── rift/
│   └── rift_{warning|seal}_p{N}_v{1-4}.mp3    (28 files)
├── jane/
│   └── jane_{hurt|attack}_p{1-3}_v{1-4}.mp3  (24 files)
├── speeder/
│   └── speeder_boost_p{1-2}_v{1-4}.mp3        (8 files)
│   NOTE: engine idle loop NOT YET GENERATED
├── leylines/
│   └── leyline_activate_p{1-2}_v{1-4}.mp3     (8 files)
│   NOTE: leyline ambient loops NOT YET GENERATED
└── psinet/
    └── psinet_{connect|alert}_p{1-2}_v{1-4}.mp3  (16 files)
```

**Total: 372 files (2nd pass) + ~70 (1st pass) = ~440 files, ~18MB**

---

## EventBus Signal Flow

```
GameScene / EnemyManager / NodeManager / etc.
    │
    ▼ emits events
EventBus
    │
    ├─► AudioManager          (ACTIVE — handles most game SFX)
    │     NODE_COLLAPSED, JANE_ATTACK, RIFT_SEALED, TRUST_CHANGED, etc.
    │
    ├─► HarmonicEngine        (NOT YET WIRED)
    │     NODE_COLLAPSED → onNodeCollapse()
    │     NODE_STABILITY_CHANGED → setState({ lowestNodeStability })
    │     TRUST_CHANGED → setState({ trustLevel })
    │     UL_PUZZLE_DEPLOYED → onULCastInitiate()
    │     UL_PUZZLE_SUCCESS → onULCastRelease(true)
    │     BEU_STAGE_CHANGED → setState({ beuStage })   ← event doesn't exist yet
    │
    └─► (future) CombinatorialPool via AudioManager
          AudioManager will delegate SFX plays to POOLS
          instead of its own SoundPool instances
```

---

## Lore Connection

Everything in the harmonic audio system is grounded in in-game lore:

| Lore Concept | Audio Implementation |
|---|---|
| Universal Language: Emotions = Angles | 12 tones at 30° intervals = 12 emotional states |
| Base-12 Harmonic Tonality | 12 chromatic pitches mapped to chromatic scale |
| Beu's 5 lifecycle stages | 5 distinct ambient timbres (seed → bond) |
| Psi Music (Jane/Jono bond) | trust milestone stingers; bond_ambient = two intertwined voices |
| Harmonic Nuclear Fusion at 43Hz | leyline ambient uses sub-bass frequencies (future: literal 43Hz pulse) |
| EPM (Emotional Permutation Mathematics) | CombinatorialPool's random combination = a different emotional permutation each time |

---

## Source Files Quick Reference

| File | Purpose | Status |
|---|---|---|
| `src/audio/AudioManager.ts` | Layer 1 — spatial/reactive | Active |
| `src/audio/CombinatorialPool.ts` | Layer 2 — stochastic layering | Built, unwired |
| `src/audio/HarmonicEngine.ts` | Layer 3 — emotional/lore | Built, unwired |
| `scripts/copy_2ndpass_audio.sh` | Copies 2ndPass assets to public/audio/ | Working |
| `docs/sound-design/elevenlabs-sfx/refined_prompts.md` | ElevenLabs prompt roster | Complete |
| `docs/sound-design/implementation/work-plan.md` | What's done, what's next | This repo |
