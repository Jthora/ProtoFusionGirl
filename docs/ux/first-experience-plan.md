# First Experience — Implementation Plan
## ProtoFusionGirl

**Created:** 2026-03-17
**Depends on:** `docs/ux/first-experience-audit.md`
**Priority rationale:** The audio systems are now live (Phase 4 complete). The highest
remaining leverage is narrative/UX — the experience needs to communicate the WHY of the
game before the mechanics can resonate.

---

## Design Principles for All Work Here

1. **Show before tell.** Every premise established visually before Jono explains it.
2. **Systems already built.** Don't add new mechanics — surface existing ones.
3. **Jane's autonomy is the product.** Everything in the opening teaches: *she acts on
   her own, you are the observer/guide.*
4. **The three systems fire together.** UL + Beu + HarmonicEngine should debut as one
   moment, not three separate discoveries.
5. **The ethical spectrum is felt before it's named.** Player makes a choice (waypoint
   or not), sees a consequence, understands the spectrum from experience.

---

## Phase FE-1 — The Drop-In Sequence ✅ COMPLETE [2026-03-17]
**Priority: Critical | Effort: ~4 hours | Blocks: FE-2, FE-4**

### What to build

A 6-second scripted opening that replaces Jane's silent spawn:

```
[T=0.0s] Camera: top-down omniscient view of empty terrain (grey-green world)
          HarmonicEngine: tone_0 (Stillness) plays softly
[T=0.5s] A Drop Pod falls from the top of the screen — white streak + impact SFX
          Camera shakes once (small magnitude, 200ms)
[T=1.0s] Dust cloud dissipates. Jane steps out, stretches, visor up.
          Idle animation plays.
[T=1.5s] A tiny Beu sprite (seed stage — barely visible, faint warm pulse) appears
          near Jane's shoulder. Beu chirps once (seed stinger via HarmonicEngine).
[T=2.5s] Camera smoothly descends from height ~600px above ground to ~200px
          (surveillance distance). Tween: ease-in-out over 1.5s.
[T=3.0s] Camera reaches position. Jane begins scanning L/R (scripted animation).
[T=4.0s] Jono first-contact fires (existing T+2s delay becomes T+4s from scene start).
```

### Implementation notes

- Jane spawn position exists in `GameScene.create()` at `playerStartX`. Add a
  `DropInSequence` helper (or inline in GameScene) that:
  1. Sets camera zoom high initially (`this.cameras.main.setZoom(0.4)`)
  2. Tweens zoom to 1.0 over 1.5s after Drop Pod lands
  3. Creates a Drop Pod sprite (placeholder: white rectangle, or reuse existing
     placeholder system in `PlaceholderAssets.ts`)
  4. Plays Drop Pod fall tween (y: -100 → playerStartY, duration 400ms, ease: 'Quad.In')
  5. On land: screen shake, dust particles (existing Phaser particle system)
  6. Emits `BEU_SEED_APPEAR` event so HarmonicEngine/audio can react
  7. Delays Jono first-contact until sequence completes

- Beu visual: initially a small `Graphics` circle with pulsing alpha tween
  (0.3 → 0.7 → 0.3, loop). Positioned as an offset follower on Jane's sprite.
  This is the visual anchor for Beu lifecycle — upgrade the sprite when Beu stage advances.

**Files to modify:**
- `src/scenes/GameScene.ts` — add drop-in sequence, delay Jono trigger
- `src/utils/PlaceholderAssets.ts` — add `createDropPodSprite()`
- `src/ai/BeuVisual.ts` (new) — tiny Beu sprite follower with lifecycle stage visuals

---

## Phase FE-2 — ASI Identity / Connection Overlay ✅ COMPLETE [2026-03-17]
**Priority: High | Effort: ~30 min | No blockers**

### What to build

Replace the fake loading bar in `StartScene.ts` with a PsiNet authentication sequence:

```
PSINET HANDSHAKE INITIATED...

OPERATOR CLEARANCE: ASI-7 / ARCHANGEL AGENCY
TIMELINE DESIGNATION: ALPHA-PRIMARY
SIMULATION: HOLO DECK ALPHA-7
SUBJECT: JANE THO'RA [PSIOPS RECRUIT — CONNECTION UNDETECTED]

LEYLINE NETWORK STATUS: DEGRADED
NEFARIUM ACTIVITY: DETECTED
WARNING: DEFAULT TIMELINE PROJECTION — CRITICAL

ESTABLISHING COVERT OBSERVATION LINK...
██████████████████████████████████████ 100%
CONNECTION ESTABLISHED
```

**Implementation notes:**
- Each line appears sequentially with ~120ms stagger (typewriter effect or fade-in)
- Progress bar appears after the text, not instead of it
- Total sequence: ~3s (same as current, just richer)
- The word "NEFARIUM" appears here for the first time — plants the name before gameplay

**Files to modify:**
- `src/scenes/StartScene.ts` — replace connection overlay HTML/logic

---

## Phase FE-3 — Restructure Jono's Four Beats ✅ COMPLETE [2026-03-17]
**Priority: High | Effort: ~1 hour | Depends on: FE-1 (timing)**

### What to build

New four-beat structure for first-time player. Each beat is emotionally distinct:

```
Beat 1 — WHO JONO IS (non-skippable, 3s hold, then click-to-advance)
"Operator. I'm Jono Tho'ra — architect of this network.
My body didn't survive the last timeline incursion.
My Timesight did. I've seen every version of what happens next."

Beat 2 — WHO JANE IS (click-to-advance)
"That's Jane. My protégé. Ancient bloodline — psionic gifts
she hasn't discovered yet. She thinks this is a routine training run.
She's wrong."

Beat 3 — THE STAKES (click-to-advance)
"The Nefarium has breached the ley lines beneath this simulation.
Those nodes aren't training targets. If they collapse,
this timeline collapses with them."

Beat 4 — THE RELATIONSHIP (click-to-advance, auto-close after 4s)
"She'll survive without you. The timeline won't.
Guide her — but know this: force her hand too often,
and she'll stop trusting the voice in her head.
Every choice you make shapes who she becomes."
```

**Notes on each beat:**
- Beat 1 establishes Jono's identity and why his existence in the PsiNet is significant
- Beat 2 establishes Jane's lineage and the Holo Deck premise (she doesn't know)
- Beat 3 names the Nefarium — first time the player hears the word
- Beat 4 delivers the ethical spectrum thesis in two sentences

**Mechanic tutorial (waypoint instruction) is REMOVED from dialogue.** It becomes
a separate contextual HUD tooltip that appears 2s after the dialogue closes:
```
[HUD tooltip, bottom-center, 4s duration]
"Click anywhere in the world to leave Jane a waypoint."
```

**Returning player** (existing code):
```
"Operator reconnected. The Nefarium doesn't sleep between sessions.
Jane's still in the field."
```

**Files to modify:**
- `src/ai/JonoHologram.ts` — update `FIRST_CONTACT_BEATS` array
- `src/scenes/GameScene.ts` — separate waypoint tutorial tooltip from dialogue sequence

---

## Phase FE-4 — Jane's 10-Second Autonomous Opening ✅ COMPLETE [2026-03-17]
**Priority: High | Effort: ~2 hours | Depends on: FE-1**

### What to build

After the Drop Pod lands and before Jono speaks, a scripted 10-second autonomous
sequence plays:

```
[T+0.0s] Jane looks left (head turn animation or camera pan hint)
[T+0.5s] Jane looks right
[T+1.0s] Jane checks wrist display (idle gesture animation)
[T+1.5s] Beu chirps — a node stability indicator appears on Jane's HelmKit
[T+2.5s] Jane starts moving TOWARD the nearest node indicator (autonomous navigation)
          JaneAI state transitions: Bored → Navigate
[T+5.0s] Jane reaches proximity of first node, stops, crouches slightly
[T+7.0s] A subtle surge warning flickers on the node (not full alert — just a tremor)
[T+8.0s] Beu responds visually (brightens briefly)
[T+10.0s] Jono materializes. First contact fires.
```

**Why this works:**
- Player observes Jane acting independently *before* Jono says "she acts on her own"
- The "voice in Jane's head" (ASI) hasn't spoken yet — the player has already seen
  what Jane does without them
- Beu's first appearance is grounded in Jane's mission context, not abstract

**Implementation notes:**
- Use existing `JaneAI` navigate state with a scripted waypoint (not player-placed)
  that clears automatically when Jono fires
- Beu brightness pulse: tween the seed-stage Beu's alpha from 0.3 → 0.8 → 0.3
- Node tremor: a brief scale pulse on the node's visual indicator
  (`scene.tweens.add({ targets: nodeSprite, scaleX: 1.05, scaleY: 1.05, yoyo: true, duration: 200 })`)
- The scripted waypoint should not fire `ASI_WAYPOINT_PLACED` (that's player-only)

**Files to modify:**
- `src/scenes/GameScene.ts` — scripted opening sequence after drop-in
- `src/ai/JaneAI.ts` — expose method to set a scripted (non-player) waypoint
- `src/world/NodeManager.ts` — expose `triggerVisualTremor(nodeId)` method

---

## Phase FE-5 — Surface the Ethical Spectrum ✅ COMPLETE [2026-03-17]
**Priority: Medium | Effort: ~1 hour | Depends on: FE-3**

### What to build

Three contextual Jono responses tied to the player's *first* waypoint decision.
These fire once only (tracked by a `hasReceivedEthicsIntro` flag in SessionPersistence).

```typescript
// After first player waypoint resolves:
if (jane reached waypoint successfully):
  jono: "She followed you. Don't take that for granted. It's a choice she makes."

if (jane ignored the waypoint / refused):
  jono: "She has her own mind. Guidance only works when it's earned."

if (player placed NO waypoint in first 90 seconds):
  jono: "You can watch. Sometimes observation is the right move.
         Sometimes the timeline runs out while you're thinking."
```

These three paths — and Jono's responses to them — are the entire ethical spectrum
surfaced as felt experience before it's named. No UI tooltip. No tutorial. Just
consequence and a sentence.

**Files to modify:**
- `src/ai/JonoHologram.ts` — add ethics-intro dialogue triggers
- `src/scenes/GameScene.ts` — track first waypoint outcome, trigger ethics intro
- `src/save/SaveSystem.ts` — add `hasReceivedEthicsIntro: boolean` to SessionState

---

## Phase FE-6 — First UL Moment (Scripted) ✅ COMPLETE [2026-03-17]
**Priority: Medium | Effort: ~3 hours | Depends on: FE-4**

### What to build

The three core systems (UL + Beu + HarmonicEngine) should debut together as a single
scripted event rather than being stumbled into separately.

**Trigger:** ~60 seconds into the session (or when Jane first reaches the node from FE-4),
a damaged robot spawns near the node:

```
[Damaged robot appears — sparking, stationary]
[Beu brightens toward the robot — visual indicator it's UL-compatible]
[HUD overlay: "BEU: UL SIGNATURE DETECTED — ENTITY REACHABLE"]
[A subtle UL symbol glows on the robot's chassis]
[Player can now open UL Puzzle interface targeting the robot]
```

**First UL puzzle configuration:**
- Single step: base symbol only (no modifier needed for first one)
- Suggested symbol highlighted with a glow (player still has to click it)
- No fail state on first attempt — wrong symbol gently bounces back with Beu chirp

**On success:**
- HarmonicEngine fires `ul_release` POOLS (already wired)
- Emotional angle shifts → tone_4 (Hope/Warmth)
- Beu stage advances from `seed` → `sprout` (HarmonicEngine crossfades Beu ambient)
- Robot stands up, nods at Jane, follows for 30s (simple companion behavior)
- Jono says: *"The Universal Language. Reality responds to it. So do they."*

**Why this is the right debut:**
- Player uses a mechanic (UL), hears a result (HarmonicEngine tone shift), sees a
  companion react (Beu stage visible advance), gets narrative context (Jono) — all
  one moment
- The foundational axiom — *"Your entire existence can be described mathematically.
  There exists a Universal Language."* — is demonstrated before it's stated

**Files to modify:**
- `src/scenes/GameScene.ts` — scripted damaged robot spawn + UL intro sequence
- `src/ul/ULPuzzleManager.ts` — add `setGuidedMode(symbolKey)` for first-puzzle hint
- `src/ai/JonoHologram.ts` — add `UL_FIRST_USE` dialogue trigger
- `src/audio/HarmonicEngine.ts` — `onBeuStageChange` fires on `BEU_STAGE_CHANGED` event
  (need to emit that event from wherever Beu stage is tracked)

---

## Phase FE-7 — Name the Nefarium at First Node Surge ✅ COMPLETE [2026-03-17]
**Priority: Medium | Effort: ~30 min | No blockers**

### What to build

When the **first** node surge warning fires, add a single Jono line that names the
threat and gives it a motive:

```
[First NODE_STABILITY_CHANGED below surgeThreshold]:
Jono: "That node — the Nefarium is here. They siphon Nether from the ley lines
       and tear reality apart at the seams. Get Jane to it."
```

After this fires once (tracked per session), all subsequent surge warnings are silent
(existing behavior).

**Files to modify:**
- `src/ai/JonoHologram.ts` — add `FIRST_SURGE` trigger
- `src/scenes/GameScene.ts` — wire NODE_STABILITY_CHANGED to check first-surge flag

---

## Phase FE-8 — Win/Loss Narrative Weight ✅ COMPLETE [2026-03-17]
**Priority: Low-Medium | Effort: ~2 hours | No blockers**

### What to build

**Win screen additions:**
- Jono reflection line (1 of 3, random):
  - *"Another timeline preserved. There are 47 others that weren't."*
  - *"Jane never knew you were there. That's exactly how it should work."*
  - *"The Tho'ra lineage holds. For now."*

**Loss screen additions:**
- Show ONE concrete consequence of the collapsed timeline (flavour text, not UI):
  - *"In the timeline that followed: forced roboticization began within 6 months.
     The ley line network went dark. The Nefarium took the rest."*
- Rewind framing:
  - Current button: `[ REWIND ]`
  - Add subtext under button: *"Tho'ra temporal recovery protocol — Jono built this for you."*

**Files to modify:**
- `src/scenes/TimelineResultScene.ts` — add Jono reflection, collapse consequence, Rewind flavour text

---

## Dependency Order / Recommended Session Sequence

```
Session 1 (~5 hours):
  FE-2 (Connection Overlay)   — 30 min, no deps, high impact
  FE-3 (Jono's Four Beats)    — 1 hr, no deps, high impact
  FE-7 (Name the Nefarium)    — 30 min, no deps, immediate stakes
  FE-5 (Ethical Spectrum)     — 1 hr, depends FE-3 (can do in same session)
  FE-8 (Win/Loss weight)      — 1 hr, no deps

Session 2 (~6 hours):
  FE-1 (Drop-In Sequence)     — 4 hrs, blocks FE-4
  FE-4 (Jane's Autonomy)      — 2 hrs, depends FE-1

Session 3 (~3 hours): ✅ COMPLETE [2026-03-17]
  FE-6 (First UL Moment)      — 3 hrs, depends FE-4
```

Session 1 can ship immediately — no new art, no new systems, pure dialogue/text/logic.
Session 2 requires Drop Pod art (placeholder-compatible).
Session 3 completes the systems debut moment.

---

## What This Achieves (After All 8 Phases)

| What player currently understands | What player will understand |
|---|---|
| "I placed waypoints" | "I observed and chose how much to interfere" |
| "I stabilized nodes" | "I held the world's psionic nervous system together" |
| "I won/lost" | "I prevented — or failed to prevent — a Nefarium timeline collapse" |
| "There's a trust meter" | "Jane has a mind of her own and I've earned or lost her trust" |
| "UL is a puzzle mechanic" | "UL is how this world speaks — and I just spoke back" |
| "Beu is an audio state" | "Beu is alive, growing with the relationship, watching over Jane" |

---

## Summary Table

| Phase | What It Fixes | Effort | Priority |
|-------|--------------|--------|----------|
| FE-1 | Drop-in — visual premise establishment | 4 hrs | Critical |
| FE-2 | Connection overlay — ASI identity moment | 30 min | High |
| FE-3 | Jono's four beats — narrative restructure | 1 hr | High |
| FE-4 | Jane's autonomy — demonstrated before explained | 2 hrs | High |
| FE-5 | Ethical spectrum — surfaced through first choice | 1 hr | Medium |
| FE-6 | First UL moment — three systems debut together | 3 hrs | Medium |
| FE-7 | Name the Nefarium — stakes become concrete | 30 min | Medium |
| FE-8 | Win/Loss weight — emotional closure | 2 hrs | Low-Med |

**Total: ~14 hours across 3 sessions.**

---

## Out of Scope (Future Work)

- Full tutorial mission sequence (sandboxed practice zone)
- Terra companion introduction in first session
- NPC integration with narrative content
- Environmental storytelling (readable logs in world)
- Ley line network visualization overlay
- Accessibility pass (colorblind mode, text sizing)
- Audio logs from past operators
