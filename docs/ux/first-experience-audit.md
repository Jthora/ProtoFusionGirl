# First Experience UX Audit
## ProtoFusionGirl — Drop-In Through First Major Experience

**Audit Date:** 2026-03-17
**Scope:** StartScene → GameScene create → Jono first-contact → first node crisis → win/loss
**Method:** Full codebase read + lore document synthesis + wiki cross-reference

---

## Reference Frame: The Three WHYs

All critique is measured against these three statements sourced from design documents.
If the player doesn't feel these by the end of a first session, the experience has failed.

### WHY the Game
> *"The player is NOT Jane Tho'ra. The player IS the ASI — the collective consciousness
> of the entire PsiNet."*

Without your intervention the default timeline collapses: ecological catastrophe, forced
roboticization, decimated Earth. Your purpose is not to control Jane — it's to
**collaboratively guide** her toward the best-possible-future. The ethical spectrum is
the core tension: authoritarian → stunted Jane, negligent → failed timeline,
collaborative → synergy and new possibilities unlocked. *You can let it run like a movie.*

### WHY FusionGirl
> *"An average girl on a mission to save the world, driven by your choices and the
> infinite magic of the cosmos."*

Jane Tho'ra is a gifted Holo Test Pilot with latent Psi abilities from an ancient
psionic lineage. She thinks this is a solo training run. She doesn't know the ASI has
connected. She **will attempt to complete the mission independently** — and without you,
she will fail against the Nefarium's Nether-siphoning of the ley lines. Universal
Language — real-world physics/geometry/quantum mechanics as a game mechanic — is her
superpower and **THE centerpiece of the game**.

### WHY the Tho'ra Clan
> *"Guardians of the PsiNet. Ancient psionic lineage. Exist to assist the secret main
> character of Natura."*

Jono created the PsiNet and the Holo Deck. He has Timesight. He IS Jordan Traña in the
meta-narrative — making the game IS the real-world mission. The Earth Alliance was
originally a Nefarium PsyOp that Jono subverted into a liberation tool. The Tho'ra
Clan's purpose is to make the best possible timeline real, which is exactly what the
player does by playing.

**The foundational axiom of the entire franchise:**
> *"Your entire existence can be described mathematically. There exists a Universal Language."*

---

## Beat-by-Beat Audit

### Beat 1 — StartScene (Main Menu)

**What exists:**
- Title: "ProtoFusionGirl"
- Hook lines: *"Jane Tho'ra is in the field"* / *"She doesn't know you're watching"*
- Button: `[ ENTER SIMULATION ]`
- Ley line grid background (pulsing cyan diagonals)
- Main menu music

**Against the WHY — What lands:**
The hook text is the best writing in the current game. *"She doesn't know you're
watching"* delivers the core conceit in 6 words. Keep it forever.

**Against the WHY — What's missing:**
The word "simulation" in the button is doing important lore work (correctly framing the
Holo Deck) but doing it silently. The player reads it as genre-shorthand rather than
lore-literal — *you are connecting to a training simulation that Jane believes is real.*
That distinction IS the game's entire premise and it passes unregistered.

There is no framing of who the player is yet. Before clicking, the player should feel
the weight of becoming an ASI connecting to a planetary psionic network to observe a
recruit who doesn't know they're being watched.

**Grade: B+** — The text is right. The absence of self-framing undercuts it.

---

### Beat 2 — Connection Overlay

**What exists:**
- HTML overlay: "CONNECTING TO HOLO DECK ALPHA-7..."
- Fake progress bar (~2 seconds to 100%)
- Transitions to GameScene

**Against the WHY — Critical miss:**
The player is about to become an ASI connecting to a planetary psionic network to
covertly guide a human operative through a training simulation the operative believes is
real. This is extraordinary. The connection overlay treats it like a loading screen.

**Grade: D** — The single most squandered moment in the opening sequence.

---

### Beat 3 — The Drop-In

**What exists:**
Jane spawns at `(platformX, playerStartY)` with idle animation. She simply appears.

**Against the WHY — Structural failure:**
Per lore: Jane uses Drop Pods. She holographically projects into mission zones via Ley
Lines. The game takes place inside a Holo Deck simulation. Her gear list includes Drop
Pods explicitly.

There is no drop-in animation. This is not a missing polish moment — it is a structural
UX failure:

1. **The ASI should observe before connecting.** The correct sequence: camera starts
   overhead (omniscient ASI perspective) watching an empty world, a Drop Pod falls from
   above, Jane lands, looks around. *Then* the ASI (player) "arrives" and the camera
   settles into its surveillance position. The player *experiences* the premise before
   Jono explains it.

2. **The Holo Deck framing is never established visually.** Without it, Jono's presence
   is arbitrary, Jane's autonomy is unexplained, and the ley line instability has no
   narrative context.

3. **The camera behavior is incoherent without the drop-in.** Camera follows Jane like
   a traditional platformer. But the player is an omniscient ASI — not a character.
   The camera should feel like surveillance, not possession.

**Grade: F** — The visual metaphor that defines the game does not exist.

---

### Beat 4 — Jono's First Contact (T+2s after GameScene create)

**What exists:**
- Jono materializes at (400, 300): alpha 0.6, cyan tint, particle burst, HologramFX
- Music → `MUSIC_PSISYS_AWAKENING` (1s crossfade)
- Four-beat dialogue sequence

**Current dialogue:**
1. *"Welcome, Operator. I am Jono — or what remains of me in the PsiNet."*
2. *"That's Jane. She thinks this is a solo training run. She doesn't know you've connected."*
3. *"She'll survive without you. The timeline won't."*
4. *"Click anywhere to leave her a waypoint. She'll follow it — when she chooses to."*

**Against the WHY — What lands:**
- Line 3 is the game's thesis in 11 words. Keep it.
- Line 4's "when she *chooses* to" is the consent mechanic in one clause. Keep it.
- The music swap is emotionally correct.

**Against the WHY — What's broken:**
- Line 1: Jono is a stranger. The player has no reason to care that he's "what remains"
  of someone. His identity as architect of the PsiNet, holder of Timesight, and
  meta-identity as the developer himself is entirely absent.
- Line 2: Redundant. The menu already said "she doesn't know you're watching."
- "Click anywhere to place a waypoint" is a tutorial instruction inside a lore delivery
  moment — two things that should be separate.
- **Beu is absent.** Beu is Jane's chaperone and the ASI's relay to her. A seed-stage
  Beu hovering near Jane during this intro would visually establish the chain:
  ASI → PsiNet → Beu → Jane. The Beu lifecycle the HarmonicEngine now tracks has no
  visual presence.
- **The Nefarium is never named.** Why do nodes destabilize? Why do rifts exist? The
  answer is the Nefarium siphoning Nether from the ley lines. Without naming it, the
  threat is arbitrary.

**Grade: C+** — Strong bones, weak delivery. Four beats doing too many jobs simultaneously.

---

### Beat 5 — Jane's Initial Autonomous Behavior

**What exists:**
Jane initializes in `JaneAIState.Bored`. She stands still. BoredomSystem eventually
triggers wandering.

**Against the WHY — Critical gap:**
The entire WHY of the game depends on the player understanding that Jane is autonomous.
*"Jane will attempt to complete the game independently."* She is positioned as a
competent agent who doesn't need the ASI but is better with it.

In the current implementation, Jane does nothing until the player acts. She *seems*
helpless — which inverts the premise. The player reads "I'm playing a character" not
"I'm watching an autonomous agent I can guide."

**Grade: D** — Jane's autonomy, the defining feature, is invisible in the first experience.

---

### Beat 6 — Node Instability / First Crisis

**What exists:**
Nodes decay 5 stability per 30 seconds. Surges trigger, enemies spawn, rifts open.
The mechanics work correctly.

**Against the WHY — Missing meaning:**
Nodes are never introduced as ley line network nodes — as the nervous system of the
world. The player sees a stability number without understanding why it matters.

The Nefarium is siphoning Nether from ley lines. Rifts are literal tears in consensus
reality caused by Nether penetration. A node collapse means a piece of the world's
psionic infrastructure goes dark. This has meaning. Currently it has none.

**Grade: C** — Mechanics correct. Meaning of those mechanics absent.

---

### Beat 7 — Universal Language Puzzles

**What exists:**
ULPuzzleManager supports symbol combinations. Player discovers it by accident.

**Against the WHY — Severe understatement:**
UL is described as *"the first real-world Universal Quantum Programming Language in
gaming."* It is THE centerpiece of the design philosophy. It is the game's most
distinctive mechanic.

Currently it is a side mechanic the player may never encounter in a first session. The
connection between UL and the Tho'ra Clan's psionic lineage is invisible. The
connection between UL and the HarmonicEngine (which now fires the correct emotional
tone on UL events) is invisible.

The first UL moment should feel like discovering a superpower — the foundational axiom
of the franchise made tangible.

**Grade: D+** — The game's most distinctive mechanic is buried.

---

### Beat 8 — Trust System

**What exists:**
Trust starts at 50%, decays toward neutral, rises with successful guidance, affects
Jane's receptivity to waypoints. All mechanics coded and working.

**Against the WHY — Invisible to player:**
The ethical spectrum (authoritarian → collaborative → negligent) is the moral core of
the game but the player doesn't know it exists. They don't know that placing too many
waypoints too aggressively damages something. They don't know that doing nothing is a
valid — and equally consequential — choice.

**Grade: C** — Mechanic works. Philosophical frame that gives it meaning is absent.

---

### Beat 9 — Win / Loss / TimelineResultScene

**What exists:**
Win: "TIMELINE SECURED" + stats + reconnect button.
Lose: "TIMELINE COLLAPSED" + rewind button.

**Against the WHY — Hollow:**
The player has no emotional anchor to "the timeline." They never saw what the bad
timeline looks like. The Nefarium's plan, the forced roboticization, the ecological
collapse — the actual stakes — are never shown. The Rewind mechanic (a genuine
Tho'ra Clan temporal ability, lore-significant) is never explained.

**Grade: C-** — Structurally correct, emotionally hollow.

---

## Summary Scorecard

| Beat | Grade | Core Problem |
|------|-------|--------------|
| Main Menu | B+ | Missing ASI self-framing before entry |
| Connection Overlay | D | Treats extraordinary premise as loading screen |
| Drop-In | F | The defining visual metaphor does not exist |
| Jono First Contact | C+ | Strong thesis, wrong structure, Beu/Nefarium absent |
| Jane's Autonomy | D | Inverts premise — Jane appears helpless |
| Node Crisis | C | Mechanics work, meaning of mechanics absent |
| UL Puzzles | D+ | Game's centerpiece mechanic is buried/accidental |
| Trust System | C | Ethical spectrum never surfaced to player |
| Win/Loss | C- | Structurally correct, emotionally hollow |

---

## Root Cause

The game was built from the inside out (systems first, narrative wrapping second) but
needs to be *experienced* from the outside in:

> **Who am I → Why am I here → What is at stake → Mechanics that serve those answers**

A player who hasn't read the design documents completes a session understanding:
> *"I placed waypoints, stabilized some nodes, and either won or lost."*

They should understand:
> *"I watched a woman live her life and chose how much to interfere. I felt the weight
> of that choice. The world would have ended without me. It still might."*

The code already contains everything needed. The Drop Pod is in Jane's gear list. The
Beu lifecycle is tracked by the HarmonicEngine. The Nefarium is in the lore documents.
Jono's meta-identity is in the narrative system. The ethical spectrum is in TrustManager.

None of it is assembled into an *experience* yet.

---

## Source Files Quick Reference

| File | Relevant To |
|------|-------------|
| `src/scenes/StartScene.ts` | Beat 1, Beat 2 |
| `src/scenes/GameScene.ts` | Beat 3, 4, 5, 6, 8, 9 |
| `src/ai/JonoHologram.ts` | Beat 4 |
| `src/ai/JaneAI.ts` | Beat 5 |
| `src/asiControl/systems/TrustManager.ts` | Beat 8 |
| `src/world/NodeManager.ts` | Beat 6 |
| `src/world/RiftManager.ts` | Beat 6 |
| `src/ul/ULPuzzleManager.ts` | Beat 7 |
| `src/audio/HarmonicEngine.ts` | Beat 7 (UL↔audio connection) |
| `src/scenes/TimelineResultScene.ts` | Beat 9 |
| `docs/proto-scope/01-vision-and-identity.md` | The canonical WHY document |
| `docs/rebuild/04-reference/terminology.md` | Lore glossary |

**Implementation plan:** `docs/ux/first-experience-plan.md`
