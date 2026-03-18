# First-Run UX Plan: Maximizing ASI Immersion

> **Status**: In implementation
> **Sprint**: 4-day window
> **Doctrine**: The player IS the ASI. The player is NOT Jane.
> **Ref**: [`docs/rebuild/00-doctrine/player-as-asi.md`](../rebuild/00-doctrine/player-as-asi.md)

---

## The Design Principle

Every element of the first 90 seconds must answer one question in the player's mind:
**"What am I supposed to be doing?"**

The answer must be *felt*, not explained. The player discovers their role through the
experience, not a tutorial popup. The doctrine says it best:

> *"You can literally let it run and watch like a movie. The movie will be fascinating.
> It will also be tragic."*

That sentence is the emotional state of the first 90 seconds.

---

## Target: First 90 Seconds

```
[0:00] Preloader — PsiNet boot terminal (~2s, messages readable)
[0:02] StartScene — Console idle. Jane's name. An ominous line.
         "ENTER SIMULATION" button (mirrors fusiongirl.app action)
[0:08] Click. "CONNECTING TO HOLO DECK..." flicker overlay (~800ms)
[0:10] GameScene fades in. Camera elevated. Jane is already MOVING.
         She's autonomous — checking something. Slime visible at screen edge.
[0:12] Jono hologram materializes. Particle burst. Cyan scanlines.
[0:14] Beat 1: "Welcome, Operator. I am Jono — or what remains of me in the PsiNet."
[0:18] Beat 2: "That's Jane. She thinks this is a solo training run.
                She doesn't know you've connected."
         [Camera drifts briefly toward Jane doing her thing]
[0:23] Beat 3: "She'll survive without you. The timeline won't."
         [Rift Zone stability UI pulses: ⚠ 30%]
[0:28] Beat 4: "Click anywhere to leave her a waypoint.
                She'll follow it — when she chooses to."
         [Jono goes quiet. World becomes interactive. Hint overlay pulses.]
[0:35] Player clicks somewhere.
         → Waypoint appears
         → Jane turns, navigates
         → UI: "WAYPOINT SET — Jane navigating"
[0:42] Jono: "She trusts the signal. That's the relationship —
              guidance, not control."
[0:50] Jane arrives at waypoint. Returns to autonomous wander.
         Slime has been approaching. Now close. Jane still unaware.
         [Silence. Player feels the tension themselves.]
[0:90] Player has felt:
         ✓ I am the ASI — watching, not playing
         ✓ Jane has her own agency
         ✓ I guide through waypoints
         ✓ There are stakes (nodes degrading, enemy approaching)
         ✓ She is not mine to control
```

---

## Layer 0 — Preloader (The Boot Sequence)

**File**: `src/loading/preloader.ts`

**Problem**: Steps are 50ms each — messages flash past unread.
**Fix**: Increase step duration from 50ms → 150ms per step (~1.5s total).

Messages already say the right things. They just need time to land:

```
"Initializing ASI Control Interface..."
"Calibrating ley line network..."
"Activating ASI systems..."
"Establishing trust protocols..."
"Locating Jane Tho'ra... FOUND"     ← new
"Connection established."            ← replace final "ready" message
```

**Also**: `main.ts` calls `loadingCoordinator.developmentStart()` in production.
Comment literally says "Always use development mode for testing."
Fix: detect production environment, use `startFullLoadingSequence()` with proper timing.

---

## Layer 1 — StartScene (The Console Idle State)

**File**: `src/scenes/StartScene.ts`

**Problem**: "A Sci-Fi Platformer Adventure" + "Start Game" dismantles the ASI
framing the player arrived with from fusiongirl.app.

**Target visual state**:
```
[dim ley line grid pulsing in background — SVG or canvas, very subtle cyan]

              ProtoFusionGirl

       Jane Tho'ra is in the field.
    She doesn't know you're watching.

          [ ENTER SIMULATION ]

  PSINET // HOLO DECK v2032.1 // OPERATOR AUTHENTICATED  ▌
```

**Changes**:
- Remove "A Sci-Fi Platformer Adventure" entirely
- Add two hook lines below title:
  - `"Jane Tho'ra is in the field."` — small, white
  - `"She doesn't know you're watching."` — smaller, cyan
- "Start Game" → **"ENTER SIMULATION"** — mirrors the button on fusiongirl.app,
  creates narrative continuity between sites
- Tiny footer text: `PSINET // HOLO DECK v2032.1 // OPERATOR AUTHENTICATED`
- Blinking cursor `▌` — terminal/console aesthetic
- Background: dim pulsing ley line grid (3 diagonal cyan lines, very low opacity, slow pulse)

---

## Layer 2 — Transition (Connecting to the Simulation)

**Files**: `src/scenes/StartScene.ts` (trigger), CSS overlay

**Problem**: Clicking "Start Game" cuts instantly to GameScene — no sense of
*entering* anything. You're supposed to be connecting to a simulation.

**Fix**: Full-screen CSS overlay triggered before `this.scene.start('GameScene')`:

```
CONNECTING TO HOLO DECK ALPHA-7...
▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 68%
[flicker effect]
CONNECTION ESTABLISHED
```

Duration: ~800ms. Fade out, then GameScene begins.
Costs almost nothing. Feels enormous.

---

## Layer 3 — GameScene Cold Open (The ASI Perspective)

**Files**: `src/scenes/GameScene.ts`, `src/ai/JaneAI.ts`

**Jane's initial state**:
- Currently: `Idle` — standing still, waiting for input
- Target: `Bored` or `Navigate` — already doing something autonomous
- This communicates the entire ASI concept before a word of dialogue:
  *she's not waiting for you. She has her own life.*

**Camera**:
- Pull back slightly from default follow distance
- More god-view feel — the ASI is observing, not riding with Jane

**Enemy placement**:
- Move slime spawn to position visible to player but **behind Jane** (she's facing away)
- Player can see it approaching. Jane cannot.
- This is the emotional engine of the game — set up silently, before Jono speaks.

---

## Layer 4 — Jono's First Contact (The Briefing)

**Files**: `src/ai/JonoHologram.ts`, `src/scenes/GameScene.ts`

**Problem**: Jono has perfect first-contact dialogue but only fires when Jane
walks within 150px of him. He never speaks on arrival.

**Fix**: Add `triggerFirstContact(context)` method — fires automatically 2 seconds
after `GameScene.create()` completes.

**Dialogue sequence** (4 beats, tap/click to advance):

| Beat | Line | Behavior |
|------|------|----------|
| 1 | *"Welcome, Operator. I am Jono — or what remains of me in the PsiNet."* | Auto. Hold 3s minimum, then player can advance. |
| 2 | *"That's Jane. She thinks this is a solo training run. She doesn't know you've connected."* | Tap/click to advance. Camera briefly pans to Jane. |
| 3 | *"She'll survive without you. The timeline won't."* | Tap/click. Node stability UI pulses. |
| 4 | *"Click anywhere to leave her a waypoint. She'll follow it — when she chooses to."* | Game becomes interactive. Jono waits silently. |

After first waypoint is placed:
- UI message: `WAYPOINT SET — Jane navigating`
- Jono, one final beat: *"She trusts the signal. That's the relationship — guidance, not control."*

**This line is the most important line in the game.** It defines the player role in 8 words.

**Jono materialization**: Apply `HologramFX.appear()` (already coded in Stage 6) —
particle burst, scanlines, flicker. His arrival is an EVENT.

---

## Layer 5 — The Information Asymmetry Moment

**No code required** — this emerges from Layers 3 + 4 working together.

After the waypoint tutorial, the slime (approaching from behind Jane) becomes
the first real test:

| Player action | Outcome | What they felt |
|---------------|---------|----------------|
| Waypoint away from slime | Jane navigates safely | *I protected her* |
| Nothing | Jane detects slime, fights autonomously | *She can handle herself* |
| Nothing + Jane gets hit | Health drops, Jane retreats | *I should have helped* |

All three teach the core loop. The player chose. The world responded.
No tutorial required.

---

## Layer 6 — UI Reframe (The ASI Dashboard)

**File**: `src/core/UIManager.ts` or wherever status text is generated

Small text changes, large conceptual impact:

| Current | Target |
|---------|--------|
| `"Player Controlled"` | `"AUTONOMOUS — Jane unguided"` |
| Trust: 50% (buried) | **`TRUST 50% ▲`** (prominent) |
| *(nothing)* | `● TIMELINE RECORDING` (subtle corner) |
| *(nothing)* | Node stability panel: `THOƦA BASE 80% / LEY NEXUS 60% / RIFT ZONE 30% ⚠` |

The **node stability panel** is the ticking clock the player feels before they
understand why it matters. Always visible. Always degrading.

---

## Layer 7 — First-Run Detection

**File**: `src/core/GameBootstrap.ts` or `src/scenes/GameScene.ts`

```typescript
const isFirstVisit = !localStorage.getItem('pfg_operator_id');
if (isFirstVisit) {
  localStorage.setItem('pfg_operator_id', Date.now().toString());
  // run full Jono first-contact sequence
} else {
  // Jono shorter greeting: "Operator reconnected. The timeline still needs attention."
}
```

**fusiongirl.app referrer detection**:
```typescript
const fromMainSite = document.referrer.includes('fusiongirl.app');
if (fromMainSite) {
  // Beat 1 variant: "Your connection from the Earth Alliance network is authenticated, Operator."
}
```

---

## Layer 8 — What NOT to Do

1. Don't make Jono's intro fully skippable from beat 1 — at least beats 1-2 should be forced-read
2. Don't add a traditional tutorial screen with bullet points — kills immersion instantly
3. Don't explain combat mechanics in the intro — not the focus
4. Don't use game-language ("quest", "level", "health points") — use lore-language
   ("mission", "node stability", "trust rating")
5. Don't add too much text — felt understanding > explained understanding
6. Don't lock the player out during Jono's dialogue — world should be alive and interactive

---

## Implementation Phases

| Phase | Work | Files | Est. | Status |
|-------|------|-------|------|--------|
| **1** | StartScene text + button; production loading fix | `StartScene.ts`, `main.ts`, `preloader.ts` | 1h | `[ ]` |
| **2** | "CONNECTING" transition overlay | `StartScene.ts`, CSS | 1h | `[ ]` |
| **3** | Jono auto-trigger + 4-beat dialogue; first-run detection | `JonoHologram.ts`, `GameScene.ts` | 2h | `[ ]` |
| **4** | Jane starts in Bored state; enemy repositioned | `GameScene.ts`, `JaneAI.ts` | 1h | `[ ]` |
| **5** | UI reframe (AUTONOMOUS, TRUST, node panel, TIMELINE RECORDING) | `UIManager.ts`, layout files | 2h | `[ ]` |
| **6** | HologramFX on Jono materialization | `GameScene.ts`, `HologramFX.ts` | 30m | `[ ]` |
| **7** | fusiongirl.app referrer detection | `GameScene.ts` | 30m | `[ ]` |

**Total: ~8 hours. Parallelizable with Meshy.ai asset work.**

---

## The One Sentence Test

After the first 90 seconds, if a player can complete this sentence correctly,
the experience has worked:

> *"I am _______, watching _______ who doesn't know I'm here. My job is to _______ — not _______."*

Expected answer: *"I am the ASI, watching Jane who doesn't know I'm here. My job is to guide her — not control her."*
