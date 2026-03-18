# Sound Design — Full Work Plan
## ProtoFusionGirl Audio System

All phases listed in dependency order. Items marked **[HUMAN]** require
manual effort (listening, generating, design decisions). Items marked **[CODE]**
are pure engineering. Items marked **[DESIGN]** require game design decisions
before code can be written.

---

## Phase 0 — Foundation ✅ COMPLETE

**What was built:**
- `AudioManager` with SoundPool, spatial ambient zones, tension heartbeat, rift contamination
- Positional stereo for world-space SFX
- EventBus wiring for 20+ game events
- 1st-pass audio files (6 music tracks, 10 pooled SFX × 4 variants each)
- Fully wired into `GameScene` and `StartScene`

**Result:** Working audio system. Music plays, SFX fire on events, ambients crossfade
with position, tension and contamination systems are live.

---

## Phase 1 — 2nd Pass Asset Generation ✅ COMPLETE

**What was built:**
- ElevenLabs prompt engineering (why the model works, what language it responds to)
- Refined prompt roster: 112 prompts across 10 sound categories
- Duration and loop-mode specifications per prompt
- 372 audio files generated and organized
- `copy_2ndpass_audio.sh` — copies all p×v variants with clean names
- `AUDIO_KEYS` registry updated in AudioManager

**Files:**
- `docs/sound-design/elevenlabs-sfx/refined_prompts.md`
- `scripts/copy_2ndpass_audio.sh`
- `public/audio/harmonic/`, `beu/`, `ul/`, `nodes/`, `trust/`, `rift/`, `jane/`, `speeder/`, `leylines/`, `psinet/`

**Still missing from this phase:**
- Beu stage AMBIENTS (5 stages × 2 variants = 10 loop files) — not generated yet;
  needed loop mode + longer duration tokens
- Rift pulse LOOPS (4 variants) — same reason
- Speeder engine IDLE loop (2 variants)
- Ley line AMBIENT loops (3 variants)

---

## Phase 2 — Stochastic Engine ✅ COMPLETE (built, not wired)

**What was built:**
- `CombinatorialPool` class — multi-layer simultaneous playback with RMS volume,
  pitch jitter, stereo micro-spread, attack stagger, cooldown jitter
- `POOLS` — 30+ pre-configured pool instances for every 2ndPass sound category
- `preloadCombinatorialAudio()` — loads all p×v variant files into Phaser cache
- `promptGroup()` factory helper

**Files:**
- `src/audio/CombinatorialPool.ts`

**Status: LIVE** — wired in Phase 4 (2026-03-17). `POOLS` called from `AudioManager.wireEvents()`.

---

## Phase 3 — Harmonic Engine ✅ COMPLETE (built, not wired)

**What was built:**
- `HarmonicEngine` class — 3-layer lore-grounded emotional audio system
- UL_ANGLE_TO_TONE mapping (12 emotional angles → 12 tones)
- Beu lifecycle stage tracking with ambient crossfade
- Trust milestone stinger system with hysteresis
- UL cast sequence (initiate → charge loop → release/fail)
- Node event handlers (distress, collapse → snap angle to Chaos, restore)
- Trust-weighted variant selection

**Files:**
- `src/audio/HarmonicEngine.ts`

**Status: LIVE** — wired in Phase 4 (2026-03-17). Instantiated in `GameScene.create()`, ticked in `update()`, EventBus-connected.

---

## Phase 4 — Integration ✅ COMPLETE [2026-03-17]

**All sub-tasks implemented.** HarmonicEngine and CombinatorialPool are now live in-game.

### 4a. Wire preloadCombinatorialAudio into scenes

**File:** `src/scenes/GameScene.ts` and/or `src/scenes/StartScene.ts`

```typescript
// In preload():
import { preloadCombinatorialAudio } from '../audio/CombinatorialPool';
preloadCombinatorialAudio(this.load);
```

If StartScene preloads everything (current pattern), add it there.
If scenes load their own audio, add to GameScene.preload().

**Note:** GameScene already guards against double-loading with cache checks.
`preloadCombinatorialAudio` should do the same (check `scene.cache.audio.has(key)`
before calling `loader.audio()`). This is already implemented in the function.

---

### 4b. Wire HarmonicEngine into GameScene

**File:** `src/scenes/GameScene.ts`

Add to GameScene private fields:
```typescript
private harmonicEngine!: HarmonicEngine;
```

In `create()`, after AudioManager is set up:
```typescript
import { HarmonicEngine } from '../audio/HarmonicEngine';

this.harmonicEngine = new HarmonicEngine(this);

// Seed initial state from session persistence
const session = SessionPersistence.load();
this.harmonicEngine.setState({
  trustLevel: session?.trustLevel ?? 50,
  beuStage: 'seed',       // Beu always starts at seed on session open
  emotionalAngle: 0,       // Stillness — operator just connected
  lowestNodeStability: 100,
  riftProximity: 0,
});
```

In `update(delta)`:
```typescript
this.harmonicEngine?.update(delta);
```

In `shutdown()`:
```typescript
this.harmonicEngine?.destroy();
```

---

### 4c. Hook game events to HarmonicEngine

**File:** `src/scenes/GameScene.ts` — add to the EventBus wiring section

```typescript
// Node events
this.eventBus.on('NODE_COLLAPSED', (e: any) => {
  this.harmonicEngine?.onNodeCollapse(e.data?.nodeId ?? '');
});
this.eventBus.on('NODE_STABILITY_CHANGED', (e: any) => {
  const nodes = this.nodeManager.getAllNodes();
  const lowest = Math.min(...nodes.map(n => n.stability));
  this.harmonicEngine?.setState({ lowestNodeStability: lowest });
});

// Trust changes
this.eventBus.on('TRUST_CHANGED', (e: any) => {
  this.harmonicEngine?.setState({ trustLevel: e.data?.trustPercent ?? 50 });
});

// Rift proximity (update in AudioManager.update() → propagate to HarmonicEngine)
// OR: expose a method on AudioManager to get current rift proximity and call
// harmonicEngine.setState({ riftProximity: ... }) in GameScene.update()

// UL events
this.eventBus.on('UL_PUZZLE_DEPLOYED', () => {
  this.harmonicEngine?.onULCastInitiate();
});
this.eventBus.on('UL_PUZZLE_SUCCESS', () => {
  this.harmonicEngine?.onULCastRelease(true);
});
this.eventBus.on('UL_PUZZLE_FAILURE', () => {
  this.harmonicEngine?.onULCastRelease(false);
});
```

---

### 4d. Replace AudioManager SoundPool calls with CombinatorialPool

**File:** `src/audio/AudioManager.ts`

AudioManager currently uses `SoundPool` for all SFX. The 2nd-pass sounds live
in CombinatorialPool's POOLS object. Integration options:

**Option A (minimal disruption):** AudioManager keeps its own event handlers
but delegates specific plays to POOLS when available:

```typescript
import { POOLS } from './CombinatorialPool';

// In the JANE_ATTACK handler (was: this.playSfxAt(AUDIO_KEYS.SFX_ATTACK, x)):
POOLS.jane_attack.play(this.scene, 0.85, pan);

// In the NODE_COLLAPSED handler:
POOLS.node_collapse.play(this.scene, 0.9);

// etc. for each 2nd-pass category
```

**Option B (full replacement):** Remove `SoundPool` and `SOUND_POOLS` entirely,
use CombinatorialPool for everything. More work but cleaner long-term.

**Recommended: Option A** — swap in POOLS calls for the specific 2ndPass categories,
keep old SoundPool for 1st-pass sounds that haven't been redone.

**Mapping of old → new:**

| Old AudioManager call | New CombinatorialPool call |
|---|---|
| `SFX_ATTACK` pool | `POOLS.jane_attack` |
| `SFX_NODE_COLLAPSED` pool | `POOLS.node_collapse` |
| `SFX_RIFT_CONTAMINATION` pool | `POOLS.rift_warning` |
| `SFX_SHIELD_BREAK` pool | *(keep old — no 2ndPass version)* |
| `SFX_SPEEDER_BOOST` pool | `POOLS.speeder_boost` |

---

### 4e. Wire rift proximity to HarmonicEngine

**File:** `src/audio/AudioManager.ts` — expose current rift proximity value,
OR pass it to HarmonicEngine in GameScene's update loop.

Simplest approach in GameScene.update():
```typescript
// AudioManager already tracks riftProximity internally
// Add a getter:
//   getRiftProximity(): number { return this.riftProximity; }
// Then in GameScene.update():
this.harmonicEngine?.setState({
  riftProximity: this.audioManager.getRiftProximity()
});
```

---

### 4f. Map Jane's AI state to emotional angle

**File:** `src/scenes/GameScene.ts`

Jane's current AI state (`JaneAIState`) should drive the emotional angle.
Define the mapping (tweak as gameplay feels right):

```typescript
const JANE_STATE_TO_ANGLE: Record<JaneAIState, number> = {
  [JaneAIState.Bored]:      0,   // Stillness
  [JaneAIState.Curious]:    60,  // Curiosity
  [JaneAIState.Suspicious]: 30,  // Tension
  [JaneAIState.Threatened]: 180, // Chaos
  [JaneAIState.Fleeing]:    330, // Anticipation
  [JaneAIState.Combat]:     210, // Power
  [JaneAIState.Satisfied]:  270, // Connection
  [JaneAIState.Sad]:        90,  // Melancholy
  // Add remaining states...
};

// In update(), when Jane's state changes:
this.harmonicEngine?.setEmotionalAngle(JANE_STATE_TO_ANGLE[currentJaneState]);
```

---

## Phase 5 — Missing Ambient Loops 🟡 PENDING [HUMAN + CODE]

These sound categories were not generated in the 2ndPass because they require
Loop mode enabled in ElevenLabs and longer durations (more tokens).

### 5a. Generate ambient loops [HUMAN]

Use `docs/sound-design/elevenlabs-sfx/refined_prompts.md` section B and F.
Settings: Loop ON, Duration 15–22s, Prompt influence 0.9–1.0.

Files needed:

**Beu stage ambients** (10 files):
```
beu_seed_a_p1_v1.mp3  through  beu_bond_a_p2_v4.mp3
Prompts: refined_prompts.md section B, the *_ambient entries
```

**Rift pulse loops** (16 files):
```
rift_pulse_p1_v1.mp3  through  rift_pulse_p4_v4.mp3
Prompts: refined_prompts.md section F, rift_pulse entries
```

**Speeder engine idle** (8 files):
```
speeder_idle_p1_v1.mp3  through  speeder_idle_p2_v4.mp3
Prompts: refined_prompts.md section H, engine_idle entries
```

**Ley line ambients** (12 files):
```
leyline_ambient_p1_v1.mp3  through  leyline_ambient_p3_v4.mp3
Prompts: refined_prompts.md section I, leyline_ambient entries
```

### 5b. Add ambient loop CombinatorialPools [CODE]

After generating, extend `POOLS` in CombinatorialPool.ts and extend
`preloadCombinatorialAudio` to load the new files.

For Beu stage ambients, update HarmonicEngine's `_crossfadeBeuAmbient()` to
use CombinatorialPool instead of picking a single key.

### 5c. Wire rift pulse to AudioManager contamination system [CODE]

AudioManager currently fires `SFX_RIFT_CONTAMINATION` from 1st-pass assets.
Replace with `POOLS.rift_pulse` (looping layer) or `POOLS.rift_warning` (one-shots).
Consider architecture: rift pulse loop should start/stop as Jane enters/leaves
proximity range, with volume scaling — different from one-shot contamination pings.

---

## Phase 6 — Auditioning and Curation 🟡 PENDING [HUMAN]

With 372 files generated, systematic auditioning is needed to:

1. **Identify failed generations** — sounds that don't match the prompt intent
2. **Pick canonical variants** — decide which v1/v2/v3/v4 is "best" for primary use
3. **Flag for regeneration** — prompts where all 4 variants missed
4. **Adjust volume balance** — some categories may be too loud or too quiet
   relative to others after layering

**Suggested workflow:**
- Create a simple HTML test page that plays CombinatorialPool instances on click
  for each sound case (see Phase 9 — Dev Tools)
- Note which tones, Beu stingers, trust milestones, etc. need regeneration
- Refine prompts and regenerate in batches (ElevenLabs batch mode)

---

## Phase 7 — Beu Lifecycle System 🔴 PENDING [DESIGN + CODE]

HarmonicEngine knows about Beu's lifecycle stages, but **no Beu object exists
in the game runtime**. The audio can't react to Beu's evolution without one.

### 7a. Design decision [DESIGN]

Decide: Is Beu's lifecycle stage:
- A. Driven by trust level (trust 0–25 = seed, 25–50 = sprout, etc.)?
- B. Driven by number of successful UL casts?
- C. A standalone progression system with its own currency?
- D. Time-based within a session?

This is a gameplay design question. The audio system is ready to respond
to `BEU_STAGE_CHANGED` events the moment someone decides and emits them.

### 7b. Implement BeuStageManager [CODE]

Once design is decided, implement a class that:
- Tracks current stage
- Emits `BEU_STAGE_CHANGED` on the EventBus when stage advances
- Exposes current stage for HarmonicEngine consumption

### 7c. Wire BEU_STAGE_CHANGED to HarmonicEngine [CODE]

```typescript
this.eventBus.on('BEU_STAGE_CHANGED', (e: any) => {
  this.harmonicEngine?.setState({ beuStage: e.data.stage });
});
```

---

## Phase 8 — Advanced Audio Features 🔵 FUTURE [CODE]

These are enhancements beyond the current design. Implement after Phase 4 is
working and stable.

### 8a. Per-layer EQ filtering

Use Web Audio `BiquadFilterNode` to give each layer of a CombinatorialPool
a different frequency character. One layer gets a high-pass (airier, brighter),
one gets a low-pass (warmer, rounder). Makes layers complement each other
instead of competing.

**Complexity:** Medium. Requires wrapping Phaser's sound output in a custom
Web Audio graph. Phaser 3.60+ exposes `WebAudioSound.source.connect()`.

### 8b. Adaptive layer count by trust/tension

Low trust → AudioManager plays 1 layer (sparse, uncertain).
High trust → plays 3 layers (rich, confident).
Add a `layerCount` parameter to `CombinatorialPool.play()` that overrides `maxLayers`.

```typescript
// In AudioManager, when firing node_collapse:
const layerCount = this.trustLevel > 70 ? 3 : this.trustLevel > 40 ? 2 : 1;
POOLS.node_collapse.play(this.scene, 0.9, pan, layerCount);
```

### 8c. Reverse tail for milestone events

For trust_100 and bond stingers: play one layer forward, add a very quiet
reversed version of the same clip as a pre-impact "swell" 500ms before.
Creates a cinematic "reverse crash" quality.

**Complexity:** High. Requires offline audio buffer reversal via Web Audio API.
Worth the effort for the game's most important moments.

### 8d. Beat quantization

If there's ever a rhythmic element to music (even subtle), sync stingers to
the nearest musical beat. Stinger fires within Nms of a beat onset rather than
exactly when the event fires. Removes the jarring "off-beat hit" effect.

**Complexity:** High. Requires a beat clock tied to music playback.

### 8e. True pitch shifting (not rate)

Phaser's `rate` changes pitch AND tempo together (like tape). A 3% rate change
is only barely perceptible, but for longer sounds it's audible. True pitch
shifting (tempo-invariant) requires a Web Audio Worklet implementing a
phase vocoder or pitch-correction algorithm.

**Complexity:** Very high. Likely not worth it for short sounds (< 4s). Reserve
for future ambient loop pitch transposition.

---

## Phase 9 — Dev Tools 🔵 FUTURE [CODE]

### 9a. Audio test panel

A dev-mode HTML panel (or Phaser overlay) that:
- Lists all CombinatorialPool instances
- Has a "play" button for each
- Shows which keys were selected in the last play
- Shows current trust, tension, rift proximity values live

### 9b. Volume mixer UI

In dev mode: sliders for each audio category's base volume.
Values persist to localStorage. Speeds up balancing work enormously.

### 9c. Variant audition tool

For Phase 6 (curation): a page that plays each p×v file individually with
a pass/fail/flag control, writing results to a JSON file for batch decisions.

---

## Phase 10 — Performance + Cross-Platform 🔵 FUTURE [CODE]

### 10a. Tiered loading

Current: all 372+ files preloaded at scene start.
Proposed:
- **Tier 1 (immediate):** v1 of each canonical set — loaded synchronously in preload()
- **Tier 2 (background):** v2/v3/v4 variants — loaded asynchronously after game starts
- `CombinatorialPool._pickAvailable()` already handles this — will play from
  cached files only, silently skipping uncached variants

Implementation: use Phaser's `this.load.start()` in `create()` for Tier 2.

### 10b. Mobile audio budget

Mobile browsers typically limit simultaneous audio nodes to 4–8.
Add a `SimultaneousAudioBudget` manager that:
- Tracks active sound instances across all systems
- Prioritizes by category (music > ambients > SFX)
- Drops lowest-priority sounds when budget exceeded

### 10c. Audio context resume on mobile

Mobile browsers suspend the Web Audio context until user interaction.
Phaser handles this via `this.sound.unlock()`, but verify it's called
correctly on the title screen's button interaction.

---

## Summary Table

| Phase | Description | Status | Type | Effort |
|---|---|---|---|---|
| 0 | AudioManager foundation | ✅ DONE | — | — |
| 1 | 2nd pass asset generation | ✅ DONE | — | — |
| 1b | Missing ambient loops | 🟡 PENDING | HUMAN | Medium |
| 2 | CombinatorialPool engine | ✅ DONE | — | — |
| 3 | HarmonicEngine | ✅ DONE | — | — |
| 4a | Wire preload into scenes | 🔴 NEXT | CODE | 30 min |
| 4b | Instantiate HarmonicEngine in GameScene | 🔴 NEXT | CODE | 1 hr |
| 4c | Hook game events → HarmonicEngine | 🔴 NEXT | CODE | 2 hr |
| 4d | Replace SoundPool calls with POOLS | 🔴 NEXT | CODE | 2 hr |
| 4e | Wire rift proximity to HarmonicEngine | 🔴 NEXT | CODE | 1 hr |
| 4f | Jane AI state → emotional angle | 🔴 NEXT | CODE | 1 hr |
| 5 | Generate missing ambient loops | 🟡 PENDING | HUMAN | 1 session |
| 5b | Wire loops into pool system | 🟡 PENDING | CODE | 2 hr |
| 6 | Audition + curation of 372 files | 🟡 PENDING | HUMAN | 2–4 hr |
| 7a | Beu lifecycle design decision | 🟡 PENDING | DESIGN | — |
| 7b | BeuStageManager implementation | 🟡 PENDING | CODE | 3 hr |
| 7c | Wire BEU_STAGE_CHANGED event | 🟡 PENDING | CODE | 30 min |
| 8a | Per-layer EQ filtering | 🔵 FUTURE | CODE | 4 hr |
| 8b | Adaptive layer count | 🔵 FUTURE | CODE | 2 hr |
| 8c | Reverse tail for milestones | 🔵 FUTURE | CODE | 4 hr |
| 8d | Beat quantization | 🔵 FUTURE | CODE | 8 hr |
| 8e | True pitch shifting worklet | 🔵 FUTURE | CODE | 16 hr |
| 9a | Audio test panel (dev tool) | 🔵 FUTURE | CODE | 3 hr |
| 9b | Volume mixer UI (dev tool) | 🔵 FUTURE | CODE | 2 hr |
| 9c | Variant audition tool | 🔵 FUTURE | CODE | 3 hr |
| 10a | Tiered loading | 🔵 FUTURE | CODE | 2 hr |
| 10b | Mobile audio budget manager | 🔵 FUTURE | CODE | 4 hr |
| 10c | Audio context resume (mobile) | 🔵 FUTURE | CODE | 1 hr |

**Legend:**
- ✅ DONE — complete and working
- 🔴 NEXT — immediate next work, all prerequisites met, just needs code
- 🟡 PENDING — needs human work or design decision first
- 🔵 FUTURE — polish/enhancement, not blocking playability

---

## ✅ Phase 4 — COMPLETED [2026-03-17]

All 6 sub-tasks implemented in a single session:

- `4a` — `preloadCombinatorialAudio` added to `GameScene.preload()` with sentinel guard
- `4b` — `HarmonicEngine` instantiated in `GameScene.create()`, seeded from `SessionPersistence.load()`
- `4c` — EventBus wired: `NODE_COLLAPSED`, `NODE_STABILITY_CHANGED`, `TRUST_CHANGED`, `UL_PUZZLE_DEPLOYED/SUCCESS/FAILURE` → HarmonicEngine
- `4d` — AudioManager delegates to `POOLS`: `node_collapse`, `rift_seal`, `jane_attack`, `jane_hurt`, `speeder_boost`, `ul_init/release/fail`
- `4e` — `AudioManager.getRiftProximity()` added; propagated to HarmonicEngine every frame
- `4f` — `JANE_STATE_TO_ANGLE` map covers all 7 `JaneAIState` values; drives `setEmotionalAngle()` every frame

**HarmonicEngine and CombinatorialPool are now live.** The ambient emotional
audio responds to game state. Stochastic layering runs on all 2nd-pass SFX.

## Next Recommended Work

**Phase 5** (missing ambient loops — human generation required) — see above.
**Phase 6** (audio curation) — audition all 372 files, flag failures.

For the broader game experience, see:
`docs/ux/first-experience-plan.md` — the higher-priority UX work identified
in the first-experience audit.
