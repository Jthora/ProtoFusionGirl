# ProtoFusionGirl — Immersion System Progress Tracker

**Spec:** [00-overview.md](00-overview.md) · [Build plan](build/09-priority-plan.md)
**Numbering:** Stage . Phase . Step . Task

---

## Summary

| Stage | Name | Status | Key files |
|-------|------|--------|-----------|
| 1 | Vocabulary | ✅ Complete | `PsiSysKernel`, `SaveSystem`, `CoherenceCollapseOverlay`, `ASIStandbyOverlay`, `SessionEndOverlay` |
| 2.1 | Projection Transit | ✅ Complete | `ProjectionTransit`, `LoadingCoordinator` |
| 2.2 | World Materialization | ✅ Complete | `WorldMaterialization`, GameScene wiring |
| 2.3 | HoloDeck Grid | ✅ Complete | `HoloDeckGrid`, GameScene wiring |
| 3.1 | HUD Telemetry | ✅ Complete | `UIBarSystem` (COHERENCE waveform + RESONANCE dot) |
| 3.2 | PsiNet Log | ✅ Complete | `PsiNetLog`, GameScene event wiring |
| 3.3 | Waypoint Pulses | ✅ Complete | `spawnWaypointPulse()` in GameScene |
| 3.4 | Jono Transmissions | ✅ Complete | `JonoTransmission`, `showJonoLine()` replaced |
| 4.1.3 | Jane Aura | ✅ Complete | `janeAura` graphics in GameScene |
| 4.2 | Vision Degradation | ✅ Complete | `VisionDegradation`, CSS filter + canvas overlay |
| 4.3 | Channel Saturation | ✅ Complete | `ChannelSaturation`, GameScene wiring |
| 4.4 | Mission Complete | ✅ Complete | Event wiring in `wireStage4Events()` |
| 5.1 | Kernel Config | ✅ Complete | `KernelConfig`, button in `ASIStandbyOverlay` |
| 5.2 | Observer Profile | ✅ Complete | `ObserverProfile`, `incrementStat()` in SaveSystem |
| 5.3 | Entity Registry | ✅ Complete | `EntityRegistry`, button in `ASIStandbyOverlay` |
| 6.1 | Ley Line Dive | ✅ Complete | `LeyLineDive`, alternate mode in `LoadingCoordinator` |
| 6.2 | Beu Data Signatures | ✅ Complete | `BeuSignatureRenderer`, `BeuDataPanel`, `BeuTransmission` |
| 6.3 | Sector Scan Radar | ✅ Complete | `SectorScanRadar`, GameScene update wiring |

---

## Stage 1 — Vocabulary
> Establish the ASI/Kernel/HoloDeck language at every entry point.
> The game should feel different the moment this stage is complete.

### Phase 1.1 — ASI Callsign Registration

#### Step 1.1.1 — Save System Groundwork
- [x] 1.1.1.1 — Define `operator` data structure in save schema (`callsign`, `registeredAt`, `sessionCount`)
- [x] 1.1.1.2 — `registerCallsign()`, `startSession()`, `endSession()` added to `SessionPersistence`
- [x] 1.1.1.3 — Add `isFirstBoot()` check (no callsign in save = first boot)

#### Step 1.1.2 — Kernel Cold Boot Screen
- [x] 1.1.2.1 — `PsiSysKernel` DOM class created at `src/ui/PsiSysKernel.ts`
- [x] 1.1.2.2 — Sequential line-reveal animation (character-by-character typewrite)
- [x] 1.1.2.3 — Cold boot sequence: PSISYS header → matrix checks → `UNREGISTERED` state
- [x] 1.1.2.4 — Gunmetal/amber palette and monospace typography applied
- [x] 1.1.2.5 — Blinking cursor (`▌` at 530ms interval) on ENTER prompts

#### Step 1.1.3 — Callsign Input
- [x] 1.1.3.1 — Inline text input (3–14 chars, uppercase, no spaces)
- [x] 1.1.3.2 — Validation on ENTER (length + charset)
- [x] 1.1.3.3 — Confirmation sequence post-entry (`CALLSIGN REGISTERED`, clearance lines)
- [x] 1.1.3.4 — `SessionPersistence.registerCallsign()` persists to localStorage
- [x] 1.1.3.5 — `>> Initiate observation link?` ENTER prompt after confirmation

#### Step 1.1.4 — Callsign Propagation
- [x] 1.1.4.1 — Callsign injected into coherence collapse screen
- [x] 1.1.4.2 — Callsign injected into session end screen
- [ ] 1.1.4.3 — Inject callsign into Jono transmission templates *(Stage 3)*
- [ ] 1.1.4.4 — Inject callsign into PsiNet log bridge-connect entry *(Stage 3)*

---

### Phase 1.2 — Return Session Status Diff

#### Step 1.2.1 — Session Data Collection
- [x] 1.2.1.1 — `lastSessionStart` / `lastSessionEnd` timestamps in `SessionState`
- [x] 1.2.1.2 — `lastJaneCoherence`, `lastLeylineStability`, `lastNefariumActivity` persisted via `endSession()`
- [ ] 1.2.1.3 — Record Beu lifecycle states at session end *(Stage 3 — Beu system first)*
- [x] 1.2.1.4 — `lastTimelineDelta` recorded at session end
- [x] 1.2.1.5 — `lastAnchorDescription` stored and shown in diff

#### Step 1.2.2 — Status Diff Renderer
- [x] 1.2.2.1 — `statusDiff()` method in `PsiSysKernel` renders field report
- [x] 1.2.2.2 — `formatElapsed()` calculates wall-clock delta between sessions
- [x] 1.2.2.3 — `ELAPSED SINCE LAST OBSERVATION` line with real delta
- [x] 1.2.2.4 — Field report table: Jane, leyline stability, Nefarium activity, timeline delta
- [x] 1.2.2.5 — `▼ degraded` arrows on dropped values
- [x] 1.2.2.6 — Last anchor line + WARNING if leyline stability < 55%
- [ ] 1.2.2.7 — `[L]` log review and `[C]` config shortcuts *(Phase 5.1)*

#### Step 1.2.3 — Routing Logic
- [x] 1.2.3.1 — `isFirstBoot()` check routes cold boot vs. status diff in `PsiSysKernel.run()`
- [x] 1.2.3.2 — `LoadingCoordinator` runs `PsiSysKernel` after preloader; `StartScene` auto-skips if callsign exists
- [x] 1.2.3.3 — Kernel renders as a DOM overlay before Phaser canvas is initialized

---

### Phase 1.3 — Coherence Collapse (Death Replacement)

#### Step 1.3.1 — Collapse Visual Sequence
- [ ] 1.3.1.1 — Intensify HUD scanlines on collapse *(Stage 4 — vision degradation system)*
- [ ] 1.3.1.2 — Flash grid to 25% opacity *(Stage 2 — grid reactivity)*
- [ ] 1.3.1.3 — Bleed static from screen edges *(Stage 4)*
- [ ] 1.3.1.4 — Brief inversion on signal loss *(Stage 4)*
- [ ] 1.3.1.5 — Collapse view to static field *(Stage 4)*

#### Step 1.3.2 — Kernel Bridge Loss Screen
- [x] 1.3.2.1 — `CoherenceCollapseOverlay` created at `src/ui/CoherenceCollapseOverlay.ts`
- [x] 1.3.2.2 — Shows collapse sector and cause (from `CollapseContext`)
- [x] 1.3.2.3 — Anchor recovery target with time delta shown
- [x] 1.3.2.4 — Animated rollback progress bar (`█░` fill)
- [x] 1.3.2.5 — `Jane is unaware of the discontinuity.` — always shown
- [x] 1.3.2.6 — ENTER resumes; `CheckpointManager.onDeath()` awaits overlay before respawning

#### Step 1.3.3 — HoloDeck Re-Materialization
- [ ] 1.3.3.1 — World re-materialization at 0.8s speed after collapse *(Stage 2)*
- [ ] 1.3.3.2 — Remove old game-over/respawn screen *(verify no remnants)*

---

### Phase 1.4 — Pause as ASI Standby

#### Step 1.4.1 — Standby Visual
- [x] 1.4.1.1 — `PauseMenuScene` desaturates canvas: `saturate(0.15) brightness(0.45)` on pause
- [x] 1.4.1.2 — Canvas kept visible (desaturated) behind overlay — world: live
- [x] 1.4.1.3 — `ASIStandbyOverlay` DOM class at `src/ui/ASIStandbyOverlay.ts`
- [x] 1.4.1.4 — Session stats block: duration, delta, interventions, saturation, coherence, leyline

#### Step 1.4.2 — Standby Menu Options
- [x] 1.4.2.1 — `[RESUME]`, `[ANCHOR]`, `[END SESSION]` buttons rendered
- [x] 1.4.2.2 — RESUME: overlay fades, canvas filter removed (250ms), GameScene resumed
- [x] 1.4.2.3 — ANCHOR: calls `onAnchor()` callback from GameScene if available
- [ ] 1.4.2.4 — `[CONFIGURATION]` button *(Phase 5.1)*
- [ ] 1.4.2.5 — `[REVIEW LOG]` button *(Phase 3.2)*
- [x] 1.4.2.6 — END SESSION: triggers `SessionEndOverlay` then routes to StartScene

---

### Phase 1.5 — Session End / Intentional Logout

#### Step 1.5.1 — Logout Screen
- [x] 1.5.1.1 — `SessionEndOverlay` at `src/ui/SessionEndOverlay.ts` — session summary block
- [x] 1.5.1.2 — Final anchor description from `SessionPersistence.load()`
- [x] 1.5.1.3 — Animated bridge suspension: `─` chars fill over ~3.2s
- [x] 1.5.1.4 — `Observer link suspended. Jane remains in the field.`
- [x] 1.5.1.5 — `The work continues.` as italic closing line
- [x] 1.5.1.6 — Auto-close after 6s or ENTER/click/anywhere

#### Step 1.5.2 — Exit Hook
- [ ] 1.5.2.1 — `beforeunload` overlay: `Observer bridge suspended — [callsign]`
- [ ] 1.5.2.2 — Auto-fade 2s, non-blocking

---

## Stage 2 — Arrival
> The journey from Kernel to HoloDeck becomes intentional and physical.

### Phase 2.1 — Projection Transit

#### Step 2.1.1 — Frequency Lock (Concept A)
- [x] 2.1.1.1 — Create `ProjectionTransit` DOM/Canvas component
- [x] 2.1.1.2 — Render three amber oscilloscope traces on gunmetal background
- [x] 2.1.1.3 — Animate traces: initial chaos → frequency convergence → lock
- [x] 2.1.1.4 — Render `PSIONIC_CARRIER` / `HOLOFIELD_SYNC` / `NEURAL_ANCHOR` labels
- [x] 2.1.1.5 — Render `SYNCHRONIZING... XX%` numerical progress (no bar)
- [ ] 2.1.1.6 — Play lock tone on frequency convergence (880Hz sine, 80ms) *(Stage 6 — audio pass)*
- [x] 2.1.1.7 — Execute hard-cut to white on lock confirmation
- [x] 2.1.1.8 — Hold white for 150ms, then begin HoloDeck fade-up

#### Step 2.1.2 — Temporal Fragments
- [x] 2.1.2.1 — Create pool of 20+ temporal fragment strings (ambient lore + state-reactive)
- [x] 2.1.2.2 — Select one fragment per transit (some weighted by game state)
- [x] 2.1.2.3 — Render as centered amber monospace text during oscilloscope phase
- [x] 2.1.2.4 — Fade in at 1 second, fade out before lock

#### Step 2.1.3 — Transit Audio
- [ ] 2.1.3.1 — Carrier tone: 200Hz sine, fades in at transit start *(Stage 6 — audio pass)*
- [ ] 2.1.3.2 — Interference noise: white noise low volume, decreasing to zero at lock *(Stage 6)*
- [ ] 2.1.3.3 — 400ms silence gap before arrival tone *(Stage 6)*
- [ ] 2.1.3.4 — Arrival tone: two ascending soft notes *(Stage 6)*

#### Step 2.1.4 — Return Session Variant
- [ ] 2.1.4.1 — First session: ley line grid breaks through static, Jane appears last *(Stage 6)*
- [ ] 2.1.4.2 — Return sessions: Jane silhouette appears first (ASI already knows her frequency) *(Stage 6)*
- [ ] 2.1.4.3 — Memory bleed variant: ghost image of last visited area during oscilloscope phase *(Stage 6)*

---

### Phase 2.2 — World Materialization

#### Step 2.2.1 — Materialization Sequence
- [x] 2.2.1.1 — Canvas overlay (`WorldMaterialization`) covers the game canvas on `create()`
- [x] 2.2.1.2 — Phase 0 (0–150ms): white flash; Phase 1 (150–500ms): dark overlay fades in; grid visible through the reveal hole at T=500ms
- [x] 2.2.1.3 — Phase 2 (500–1700ms): expanding circle (destination-out) punch-through from Jane's screen focal point; terrain nearest Jane revealed first
- [x] 2.2.1.4 — Amber radial gradient ring at expanding edge = wireframe read; world fills in as ring passes (200ms visual per band)
- [x] 2.2.1.5 — Jane alpha=0 at scene create; set to alpha=1 at T=1.0s (mid-reveal, ring at ~42%); overlay fades T=1.7–2.1s — Jane visible while world still completing

#### Step 2.2.2 — Wireframe Transition
- [x] 2.2.2.1 — Amber ring at expanding edge creates wireframe read before terrain fills in
- [x] 2.2.2.2 — Ring has 28px thickness with radial gradient; terrain fades in over ~100–200ms as ring passes
- [x] 2.2.2.3 — Radial expand from Jane focal point: nearest terrain first, far edges last (ease in-out quad)

#### Step 2.2.3 — Jane Arrives Already Moving
- [x] 2.2.3.1 — Jane spawns at anchor/platform position; facing default direction set by AI init
- [x] 2.2.3.2 — `JaneAI.setInitialState(Bored)` → wander intent; drop-pod scan (T=3.0s) is after first-visit overlay ends; return-visits: Jane wanders per AI state immediately
- [x] 2.2.3.3 — Verified: `JaneAIState.Bored` sets wandering destination on spawn; `runDropInSequence` adds head-scan at T=3.0s

---

### Phase 2.3 — HoloDeck Grid

#### Step 2.3.1 — Grid Overlay
- [x] 2.3.1.1 — Create screen-space canvas overlay for the grid (not world-space, doesn't scroll)
- [x] 2.3.1.2 — Render 1px amber lines (`#FF8C00`) aligned to tile boundaries
- [x] 2.3.1.3 — Default opacity: 4%

#### Step 2.3.2 — Grid Reactivity
- [x] 2.3.2.1 — Connect grid opacity to game state enum (stable / disrupted / Nefarium / critical)
- [x] 2.3.2.2 — Smooth opacity transitions (500ms ease) between states — lerped at `dt * 2` rate
- [x] 2.3.2.3 — Add slight horizontal distortion at Nefarium-active opacity level
- [x] 2.3.2.4 — Add scan-line flicker at critical state (25% opacity + sine flicker)
- [x] 2.3.2.5 — Wire game events (LEYLINE_DISRUPTION, RIFT_FORMED, JANE_DEFEATED, etc.) → `holoDeckGrid.setState()`
- [x] 2.3.2.6 — Destroy grid canvas on scene shutdown (`this.events.on('shutdown'/'destroy')`)

---

## Stage 3 — The Living Console
> The in-game HUD becomes the ASI's actual instrument panel.

### Phase 3.1 — HUD Telemetry Reframe

#### Step 3.1.1 — Coherence Display (replaces HP)
- [x] 3.1.1.1 — Replace HP bar with horizontal waveform trace
- [x] 3.1.1.2 — Waveform smooth at high coherence, choppy at low (amplitude + freq scale with 1−pct)
- [x] 3.1.1.3 — Label: `COHERENCE` with percentage value
- [x] 3.1.1.4 — Color shift: amber → red-amber as coherence drops (g-channel lerp)
- [x] 3.1.1.5 — Critical state: waveform spikes irregularly + `⚠ COHERENCE` prefix in label

#### Step 3.1.2 — Resonance Display (replaces PSI/mana)
- [x] 3.1.2.1 — Replace PSI bar with pulsing dot (size = available resonance)
- [x] 3.1.2.2 — Secondary concentric ring = max capacity
- [x] 3.1.2.3 — Label: `RESONANCE` with percentage value
- [x] 3.1.2.4 — Dot flickers if local ley line is disrupted (`setLeylineDisrupted()` wired to events)
- [x] 3.1.2.5 — Dot dims as energy spent, brightens on regen (alpha scales with pct × pulse)

#### Step 3.1.3 — Language Audit
- [x] 3.1.3.1 — "HP" → "COHERENCE", "PSI" → "RESONANCE" in `UIBarSystem` labels
- [ ] 3.1.3.2 — Remove all instances of "XP", "Level", "Score" from visible UI *(Stage 5)*
- [ ] 3.1.3.3 — Remove floating damage numbers *(Stage 5)*
- [ ] 3.1.3.4 — Remove "!" objective indicators from Jane's head *(Stage 5)*

---

### Phase 3.2 — PsiNet Log

#### Step 3.2.1 — Log Infrastructure
- [x] 3.2.1.1 — Create `PsiNetLog` class at `src/ui/PsiNetLog.ts`: queue with TTL (60s)
- [x] 3.2.1.2 — Categories: PSINET / JANE / BEU / NEFARIUM / TIMELINE / BRIDGE / ANCHOR
- [x] 3.2.1.3 — `add(category, message, priority?)` — timestamps, queues, priority flag

#### Step 3.2.2 — Log Renderer
- [x] 3.2.2.1 — DOM canvas overlay, renders up to 4 lines bottom-left, newest at bottom
- [x] 3.2.2.2 — 10px Courier New, per-category amber tint at 50% base opacity
- [x] 3.2.2.3 — Entries vanish silently after 60s TTL (fade in final 5s)
- [x] 3.2.2.4 — Priority entries (Jono, Beu) render at 90% opacity for 8s

#### Step 3.2.3 — Log Wiring
- [x] 3.2.3.1 — `LEYLINE_DISRUPTION` / `LEYLINE_INSTABILITY` / `LEYLINE_SURGE` → `[PSINET]`
- [x] 3.2.3.2 — `JANE_DAMAGED` (< 30 hp) / `JANE_DEFEATED` / `JANE_HEALED` → `[JANE]`
- [x] 3.2.3.3 — `BEU_SEED_APPEAR` / `BEU_STAGE_CHANGED` → `[BEU]` (priority)
- [x] 3.2.3.4 — `RIFT_FORMED` / `RIFT_SPAWNED` → `[NEFARIUM]`
- [x] 3.2.3.5 — `TIMELINE_SCORE_UPDATED` → `[TIMELINE]`
- [x] 3.2.3.6 — `CHECKPOINT_SET` / `UL_RIFT_SEALED` → `[ANCHOR]`
- [x] 3.2.3.7 — `JONO_FIRST_CONTACT` / `JONO_DIALOGUE_TRIGGERED` → `[BRIDGE]` (priority)
- [x] 3.2.3.8 — Session start → `[BRIDGE] Observer bridge — ESTABLISHED — [CALLSIGN]` (priority)

---

### Phase 3.3 — Waypoints as Psionic Pulses

#### Step 3.3.1 — Pulse Propagation System
- [ ] 3.3.1.1 — Ley line reachability check *(Stage 6 — requires stable ley line graph API)*
- [ ] 3.3.1.2 — Ley line path traversal *(Stage 6)*
- [ ] 3.3.1.3 — Pulse dissipation on no-route *(Stage 6)*
- [x] 3.3.1.4 — Pulse travels from Jane → destination (direct path; ley line routing deferred)

#### Step 3.3.2 — Pulse Visuals
- [x] 3.3.2.1 — Amber ripple expands at click point (scale 0.1→2.5, alpha 0.9→0, 320ms)
- [x] 3.3.2.2 — Travelling dot animates from Jane to destination (420ms, `Sine.easeIn`)
- [x] 3.3.2.3 — Small impact ripple at destination on dot arrival
- [x] 3.3.2.4 — Persistent pulsing ring at destination (alpha 0.7↔0.2, 900ms yoyo)
- [ ] 3.3.2.5 — Route-around-breaks visual *(Stage 6)*

#### Step 3.3.3 — Jane's Response
- [ ] 3.3.3.1 — Jane glances toward pulse *(Stage 4 — animation system)*
- [ ] 3.3.3.2 — Jane continues briefly before redirecting *(Stage 4)*
- [x] 3.3.3.3 — On `JANE_ARRIVED_AT_WAYPOINT`: psionic aura expands at Jane's position

#### Step 3.3.4 — Log Entry
- [x] 3.3.4.1 — On pulse placed: `[PSINET] Guidance pulse — DELIVERED`
- [x] 3.3.4.2 — On waypoint cleared: `[PSINET] Guidance pulse — waypoint resolved`
- [ ] 3.3.4.3 — Sector tag in log entry *(Stage 6 — requires sector map)*

---

### Phase 3.4 — Jono Transmissions as Packets

#### Step 3.4.1 — Transmission Display
- [x] 3.4.1.1 — `JonoTransmission` static class at `src/ui/JonoTransmission.ts` (bordered amber panel)
- [x] 3.4.1.2 — Canvas oscilloscope waveform caller-ID converges to flat line over 800ms
- [x] 3.4.1.3 — Full-viewport amber border pulse on channel open (fades 350ms)
- [x] 3.4.1.4 — Transmission text renders character-by-character (12ms/char)
- [x] 3.4.1.5 — Panel displays 8s total then fades; PsiNet log entry added on fade
- [x] 3.4.1.6 — `showJonoLine()` replaced in GameScene to use `JonoTransmission.show()`
- [x] 3.4.1.7 — Session cap: max 4 transmissions, min 90s gap enforced statically

#### Step 3.4.2 — Transmission Content
- [x] 3.4.2.1 — Existing Jono lines (first-contact beats + node surge line + UL debut line) carried forward
- [ ] 3.4.2.2 — Audit: remove any lines telling player what to do explicitly *(Stage 5 — content pass)*
- [ ] 3.4.2.3 — Map additional transmissions to event triggers *(Stage 5)*
- [ ] 3.4.2.4 — Expand to 12+ transmission strings *(Stage 5 — content pass)*

---

## Stage 4 — The World Responds
> The world communicates without text. Jane's state becomes readable.

### Phase 4.1 — Jane Emotional Bleed-Through

#### Step 4.1.1 — Jane State System
- [ ] 4.1.1.1 — Jane emotional state enum *(Stage 6 — needs JaneAI expansion)*
- [ ] 4.1.1.2 — Transition triggers per state *(Stage 6)*
- [ ] 4.1.1.3 — Hysteresis state machine *(Stage 6)*

#### Step 4.1.2 — Environmental Bleed Mapping
- [ ] 4.1.2.1–6 — Full bleed mapping *(Stage 6 — depends on 4.1.1)*

#### Step 4.1.3 — Psionic Aura Visualization
- [x] 4.1.3.1 — Two-ring white aura around Jane's sprite, always-on at 22% alpha
- [ ] 4.1.3.2 — Aura expands with flow state *(Stage 6 — depends on 4.1.1)*
- [x] 4.1.3.3 — Aura radius contracts with high channel saturation (scales with sat%)
- [ ] 4.1.3.4 — Aura flickers with interference *(Stage 6)*
- [x] 4.1.3.5 — Psionic flare: brief bloom on `UL_PUZZLE_SUCCESS` (alpha tween 0.22→0.75→0.22)

---

### Phase 4.2 — Vision Degradation System

#### Step 4.2.1 — Degradation Overlay
- [x] 4.2.1.1 — `VisionDegradation` class at `src/ui/VisionDegradation.ts` (fixed canvas + CSS filter)
- [x] 4.2.1.2 — Scanlines: 2px horizontal lines at variable opacity, smooth lerp transitions
- [x] 4.2.1.3 — Edge noise: per-frame amber pixel noise weighted to screen edges
- [x] 4.2.1.4 — Inversion: `triggerInversion(ms)` applies CSS `invert(1)` to Phaser canvas briefly
- [ ] 4.2.1.5 — Rolling interference bands (ion storm) *(Stage 6)*

#### Step 4.2.2 — State Mapping
- [x] 4.2.2.1 — `RIFT_FORMED` / `RIFT_SPAWNED` → `'nefarium'` state (faint scanlines)
- [x] 4.2.2.2 — `LEYLINE_DISRUPTION` / `LEYLINE_INSTABILITY` → `'disrupted'` (scanlines + edge noise)
- [x] 4.2.2.3 — `JANE_DEFEATED` → `'critical'` + `triggerInversion(120)`
- [x] 4.2.2.4 — Channel saturation 76%+ → `'saturated'` (edge noise), 91%+ → `'critical'`
- [x] 4.2.2.5 — `RIFT_SEALED` / respawn / mission complete → `'clear'`

---

### Phase 4.3 — ASI Channel Saturation

#### Step 4.3.1 — Saturation System
- [x] 4.3.1.1 — `ChannelSaturation` class at `src/ui/ChannelSaturation.ts` (0–100 float)
- [x] 4.3.1.2 — Costs: guidance pulse +4%, stabilize +10%, emergency +25%
- [x] 4.3.1.3 — Passive decay: −2%/min per tick
- [x] 4.3.1.4 — Near ley node: −5%/min (toggled by `LEYLINE_ENTERED` / `LEYLINE_EXITED`)
- [x] 4.3.1.5 — Jane psionic flare: −15% instant on `UL_PUZZLE_SUCCESS`

#### Step 4.3.2 — Mechanical Effects
- [x] 4.3.2.1 — 51–75%: `cooldownMultiplier` returns 1.5 (consumer systems check this)
- [x] 4.3.2.2 — 76–90%: `isImpaired` flag; `[BRIDGE]` log entry at tier change
- [x] 4.3.2.3 — 91–100%: `isLocked` flag + `chargeX()` returns false; log entry
- [x] 4.3.2.4 — `on()` listener emits `SaturationEvent` on tier change → log entries

#### Step 4.3.3 — Visual Integration
- [x] 4.3.3.1 — Saturation 76%+ tier change → vision `'saturated'` state (edge noise)
- [x] 4.3.3.2 — Saturation 91%+ → vision `'critical'` state
- [x] 4.3.3.3 — Aura radius contracts proportionally with saturation value

---

### Phase 4.4 — Mission Complete as Resonance Restored

#### Step 4.4.1 — Environmental Response
- [ ] 4.4.1.1 — Ley line pulse wave on objective complete *(Stage 6 — ley line rendering)*
- [x] 4.4.1.2 — `MISSION_COMPLETED` → `holoDeckGrid.setState('stable')`
- [ ] 4.4.1.3 — Jane aura bloom on mission complete *(Stage 6 — depends on 4.1.1)*
- [ ] 4.4.1.4 — Ambient hum resolves *(Stage 6 — audio pass)*

#### Step 4.4.2 — Kernel Acknowledgment
- [x] 4.4.2.1 — `[TIMELINE] Sector resonance — RESTORED` priority log entry on `MISSION_COMPLETED`
- [x] 4.4.2.2 — `[TIMELINE] Mission complete — [id]` log entry
- [x] 4.4.2.3 — `[TIMELINE] Objective resolved — timeline delta improving` on each objective
- [ ] 4.4.2.4 — Remove score/points display *(Stage 5 — language audit)*

---

## Stage 5 — Polish
> Settings, credits, and observer profile maintain the register end-to-end.

### Phase 5.1 — Settings as Kernel Configuration

#### Step 5.1.1 — Kernel Config Panel
- [x] 5.1.1.1 — `KernelConfig` static class at `src/ui/KernelConfig.ts` (pure DOM, Kernel aesthetic)
- [x] 5.1.1.2 — Three sections: AUDIO / DISPLAY / INTERFACE (TIMELINE / CONTROLS deferred to Stage 6)
- [x] 5.1.1.3 — All labels renamed to in-world language (signal amplitude, HoloDeck ambient level, etc.)
- [ ] 5.1.1.4 — "Timeline deviation rate" difficulty setting *(Stage 6 — needs difficulty system)*
- [ ] 5.1.1.5 — Difficulty option labels *(Stage 6)*
- [x] 5.1.1.6 — Wired to `SettingsService.get/set` — draft model, APPLY commits

#### Step 5.1.2 — Accessibility as Observation Assist
- [ ] 5.1.2.1–3 — Observation Assist subsection *(Stage 6 — needs accessibility system)*

#### Step 5.1.3 — Integration
- [x] 5.1.3.1 — `[CONFIGURATION]` button added to `ASIStandbyOverlay` (opens `KernelConfig`)
- [x] 5.1.3.2 — Standby overlay dims to 20% opacity while config is open, restores on close

---

### Phase 5.2 — Observer Profile & Timeline Events

#### Step 5.2.1 — Observer Profile Data
- [x] 5.2.1.1 — `SessionStats` already tracks: totalSessions, totalObservationMs, timelines corrected/failed
- [x] 5.2.1.2 — Tracks: guidancePulsesDelivered, leyLinesRestored, nefariumNodesDisrupted
- [x] 5.2.1.3 — Tracks: beuBondsFacilitated, coherenceCollapses, peakCoherenceObserved
- [x] 5.2.1.4 — Tracks: timelineDeltaCumulative, lastTimelineDelta per-session

#### Step 5.2.2 — Timeline Events (Achievement System)
- [ ] 5.2.2.1–4 — Timeline Events achievement system *(Stage 6 — new system needed)*

#### Step 5.2.3 — Profile Render
- [x] 5.2.3.1 — `ObserverProfile` static class at `src/ui/ObserverProfile.ts` (Kernel aesthetic)
- [x] 5.2.3.2 — Three sections: TIMELINE RECORD / INTERVENTION RECORD / JANE STATUS
- [x] 5.2.3.3 — Wired to `SessionPersistence.load()` — reads live stats + field state
- [x] 5.2.3.4 — `[REVIEW RECORD]` button added to `ASIStandbyOverlay`

---

### Phase 5.3 — Credits as Entity Registry

#### Step 5.3.1 — Registry Render
- [x] 5.3.1.1 — Create `EntityRegistry` component (Kernel aesthetic) → `src/ui/EntityRegistry.ts`
- [x] 5.3.1.2 — CORE ENTITIES section: Jordan Traña, Jono Thoʻra, Jane Thoʻra (with dot-leader rows)
- [x] 5.3.1.3 — CONTRIBUTING OPERATORS section (placeholder: `[REGISTRY PENDING]` until real contributors added)
- [x] 5.3.1.4 — TECHNICAL SUBSTRATE section: Phaser 3.90 / TypeScript 5.8 / Vite 7 / Web Audio / localStorage
- [x] 5.3.1.5 — Closing axiom: UL Foundational Axiom — Jordan Traña, 2025
- [x] 5.3.1.6 — `[ENTITY REGISTRY]` button wired into `ASIStandbyOverlay` (fade-behind pattern, same as Profile/Config)

---

## Stage 6 — Cinematic
> The most visually spectacular immersion elements. Build last.

### Phase 6.1 — Ley Line Dive (Projection Concept C)

#### Step 6.1.1 — Network Render
- [x] 6.1.1.1 — Canvas 2D: Earth as circle outline + 20 ley lines (polar-coord chords) + 13 intersection nodes, black bg, amber lines
- [x] 6.1.1.2 — ALPHA-7 node pulses brighter at T=1200ms; "HOLOZONE ALPHA-7" amber label appears
- [x] 6.1.1.3 — Zoom: exponential scale 1→19× over 1800ms, camera pans so ALPHA-7 stays centred (ease in-out quad)
- [x] 6.1.1.4 — Streak effect: multiple offset copies of each ley line at `speed * 8px` offsets, fading alpha = motion blur

#### Step 6.1.2 — Node Entry
- [x] 6.1.2.1 — Radial gradient expanding ring with amber-to-white colour stops; bright white centre flash as ring grows
- [x] 6.1.2.2 — Hard white fill after tear phase ends (T=4000ms)
- [x] 6.1.2.3 — `onComplete` fires at T=4200ms → `LoadingCoordinator` proceeds to Phaser launch → `WorldMaterialization` handles HoloDeck arrival
- [x] 6.1.2.4 — Registered as alternate mode via `localStorage.setItem('pfg_transit_mode', 'leyline')`; default remains Frequency Lock

---

### Phase 6.2 — Beu Data Signatures (Full)

#### Step 6.2.1 — Signature Visualization
- [x] 6.2.1.1 — `BeuSignatureRenderer` Phaser Graphics (depth 65) renders bright white point at Beu world position
- [x] 6.2.1.2 — Per-stage orbit rings: seed=none, sprout=faint slow ring, growth=steady ring, bloom=bright fast ring, bond=resonant dashed double ring with phase offset
- [x] 6.2.1.3 — 14-point sine waveform to the right of Beu, frequency unique per instance (`waveSeed`), phase-animated over time

#### Step 6.2.2 — Data Readout on Focus
- [x] 6.2.2.1 — `BeuDataPanel.show()` triggered on `bloom`/`bond` stage transitions (auto-8s dismiss, click-to-dismiss)
- [x] 6.2.2.2 — Panel shows: STAGE, BOND STATUS, ASSOCIATED, ACTIVITY, SIGNAL (label + colour), RESONANCE (█ bar + %)

#### Step 6.2.3 — Direct Beu Transmission
- [x] 6.2.3.1 — `BeuTransmission.show()` triggered alongside data panel on significant stage changes
- [x] 6.2.3.2 — `BEU.[NAME] // DIRECT // PRIORITY-[1|2]` header, amber left-border accent, 6s auto-dismiss with depleting progress strip
- [x] 6.2.3.3 — Rows: COORD [worldX, worldY], CONF [0.xx — HIGH/MODERATE/LOW], JANE [AWARE/UNAWARE]

---

### Phase 6.3 — Full Sector Scan Minimap

#### Step 6.3.1 — Radar Sweep
- [x] 6.3.1.1 — `SectorScanRadar` DOM canvas overlay (bottom-right, 160px, circular) — coexists with existing rectangular Minimap
- [x] 6.3.1.2 — Sweep line rotates via RAF, 3000ms period; trailing gradient sector behind sweep
- [x] 6.3.1.3 — `revealTime` per entity; alpha decays over 2600ms between sweeps (entities fade between pings)
- [x] 6.3.1.4 — Dark `#0a0500` fill, amber `rgba(255,140,0,0.55)` border ring + subtle outer glow

#### Step 6.3.2 — Entity Display Rules
- [x] 6.3.2.1 — Jane: bright amber dot, `J` label, always centered (bypasses reveal mechanic)
- [x] 6.3.2.2 — Ley nodes: amber dot pulsing at ley frequency via `Math.sin(now/900)`
- [x] 6.3.2.3 — Disrupted nodes: 4-spoke fragmented stroke rotating over time
- [x] 6.3.2.4 — Beu: bright white dot with orbit ring
- [x] 6.3.2.5 — Nefarium nodes: dark inverted dot + 6-point distortion halo rotating
- [x] 6.3.2.6 — Timeline anchors: small amber diamond (4-point fill)
- [x] 6.3.2.7 — Active waypoints: fading amber ring (pushed by GameScene)
  - Enemy nodes: red square dot
  - GameScene pushes: ley nodes, rifts, enemies, anchors per update frame

#### Step 6.3.3 — Scan Range Degradation
- [x] 6.3.3.1 — `setScanQuality('normal')`: full 800-world-unit range, no artifacts
- [x] 6.3.3.2 — `setScanQuality('disrupted')`: 70% range + jitter artifacts on entity positions
- [x] 6.3.3.3 — `setScanQuality('nefarium')`: 60% range + random alpha flicker on entities + "INTERFERENCE" label; triggered when ≥2 active rifts

---

## Tracker Meta

| Stage | Status | Phase Count | Task Count |
|-------|--------|-------------|------------|
| Stage 1 — Vocabulary | **In progress** | 5 | 46 |
| Stage 2 — Arrival | Not started | 3 | 27 |
| Stage 3 — Living Console | Not started | 4 | 40 |
| Stage 4 — World Responds | Not started | 4 | 35 |
| Stage 5 — Polish | Not started | 3 | 21 |
| Stage 6 — Cinematic | Not started | 3 | 25 |
| **Total** | | **22 phases** | **194 tasks** |

### Stage 1 Summary
| Phase | Status | Notes |
|-------|--------|-------|
| 1.1 ASI Callsign | ✅ Complete | `PsiSysKernel.ts`, `SaveSystem.ts` extended |
| 1.2 Return Status Diff | ✅ Complete | `PsiSysKernel.statusDiff()`, `SessionPersistence.endSession()` |
| 1.3 Coherence Collapse | ✅ Core complete | `CoherenceCollapseOverlay.ts`, wired to `CheckpointManager` |
| 1.4 ASI Standby Pause | ✅ Complete | `ASIStandbyOverlay.ts`, `PauseMenuScene` rewritten |
| 1.5 Session End | ✅ Complete | `SessionEndOverlay.ts`, "The work continues." |

**Deferred to later stages:** visual pre-collapse effects (scanlines, grid flash, inversion) → Stage 4; `[L]`/`[C]` shortcuts in status diff → Stage 5; `beforeunload` hook → Stage 1.5.2.

---

*Spec documents:* [00-overview.md](00-overview.md) · [entry/](entry/) · [gameplay/](gameplay/) · [states/](states/) · [build/09-priority-plan.md](build/09-priority-plan.md)
