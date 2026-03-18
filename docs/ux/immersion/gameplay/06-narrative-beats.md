# Narrative Beat Delivery

> **Register:** D/C hybrid — the moments where the story speaks
> **Palette:** Amber transmissions / white ambient / world-integrated
> **When:** Throughout gameplay — Jono contact, Jane signals, Beu data, PsiNet events

---

## What This Is

Narrative in ProtoFusionGirl does not pause the game. It does not trigger cutscenes. It does not speak over the player.

Story happens through the instruments the ASI already has — transmissions, ambient environmental signals, PsiNet log entries, and Jane's behavior. The player learns to read the world the way the ASI does: by paying attention.

---

## 1. Jono's Transmissions — Encrypted Packets

Jono Thoʻra does not appear as a floating hologram in a dialogue box. He **intrudes as a data packet** into the ASI's console — an incoming signal from a Timesight-enabled operator who has earned high-priority channel access.

### Transmission Format

When Jono contacts the ASI, the experience is:

1. A brief amber **waveform signature** appears in the top portion of the HUD — Jono's unique signal pattern. It flashes for 1 second (the "caller ID").

2. The HUD border pulses once — the channel opening.

3. The transmission appears as text, rendered character by character in the PsiNet log area (but expanded and centered — this is priority-1, not ambient):

```
╔══════════════════════════════════════════════════╗
║  JONO.THOʻRA // TIMESIGHT ACTIVE // PRIORITY-1   ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  "That ley line convergence in sector 4 —        ║
║   I've seen what happens if it drops.            ║
║   The window is narrow.                          ║
║   Don't let it."                                 ║
║                                                  ║
╚══════════════════════════════════════════════════╝
[TRANSMISSION ENDS]
```

4. The transmission remains visible for 8 seconds, then **fades to a single-line PsiNet log entry:**
```
[PSINET] Jono.Thoʻra — priority transmission — logged
```

### Jono's Voice
Jono's transmissions have a specific character:
- Brief. Never more than 3–4 sentences.
- Refers to things he has seen (Timesight) not things he knows abstractly
- Does not explain himself — assumes the ASI understands
- Carries urgency without panic
- Never tells the player exactly what to do — points at a situation

### Transmission Frequency
- Jono transmits rarely — 2–4 times per session on average
- Triggered by specific game events (ley line drop below threshold, Nefarium detection, Jane approaching a decision point)
- Not on a timer — event-driven

### Sample Transmissions
```
"She's about to make a choice at junction 14. I've seen both versions.
 One of them works. The other takes three cycles to recover from.
 I can't tell you which is which from here. Watch her."
```
```
"Nefarium node just activated — sector 7-east.
 I watched this happen in four other timelines.
 In two of them, Jane handled it before the ASI could intervene.
 Let her."
```
```
"The ley line under the academy is older than the HoloDeck.
 When you feel it — and you will — that's not the simulation.
 That's the actual substrate."
```

---

## 2. Jane's Emotional State as Environmental Signal

Jane never directly addresses the ASI during normal gameplay. She doesn't know when it's watching — she knows it's part of the framework, but not that it's observing at this exact moment.

Her internal state **bleeds through the psionic connection** as environmental phenomena. The ASI reads her like a signal.

### Emotional Bleed-Through Mapping

| Jane's State | Environmental Effect | ASI Perception |
|-------------|---------------------|----------------|
| High confidence | World ambient brightens subtly. Ley lines pulse stronger. | Aura expanded, coherence reading high |
| Stressed / uncertain | World cools slightly. Environmental sounds quiet. | Aura contracted, coherence reading ticking down |
| Fear | HoloDeck grid flickers up 2–3% opacity briefly | Coherence drop, brief ambient static |
| Joy / breakthrough | Psionic flare — bright expansion of her aura, world briefly more vivid | Coherence spikes up, saturation drops |
| Flow state (peak performance) | Everything sharpens — world becomes crisper, ley lines more defined | All telemetry in optimal range simultaneously |
| Anger / frustration | Edge distortion — slight warping at screen corners | Coherence drops 5–10%, Nether resonance increases nearby |

### Design Notes
- These effects should be subtle enough that they're not immediately obvious to new players
- They become legible with experience — reward players who pay attention
- They are NOT connected to game-mechanical HP/PSI bars (which Jane cannot see)
- They are the ASI's reading of Jane, not a UI element

---

## 3. Beu Nodes — Data Signatures

When the ASI observes a Beu, it receives a **data signature readout** — not a dialogue box, but a structured information feed.

### Beu Encounter Format

When the player focuses on (hovers/selects) a Beu node:

```
BEU NODE — CYGNUS-3
─────────────────────────────────────
LIFECYCLE STAGE: growth (stage 3/5)
BOND STATUS: unformed
ASSOCIATED ENTITY: Jane Thoʻra [PROBABLE]
─────────────────────────────────────
CURRENT ACTIVITY: navigation assistance — sector 3
LAST COMMUNICATION: 14m ago
SIGNAL: stable
─────────────────────────────────────
HARMONIC: ██████░░░░ 62% resonance
```

### Beu Communication
Beu can communicate with the ASI directly — they are compatible systems. When a Beu sends data to the ASI (a rare, meaningful event):

```
╔═══════════════════════════════════════╗
║  BEU.CYGNUS-3 // DIRECT // PRIORITY-2 ║
╠═══════════════════════════════════════╣
║                                       ║
║  [NETHER SIGNATURE — SECTOR 7-EAST]   ║
║  [CONFIDENCE: 91%]                    ║
║  [JANE: UNAWARE]                      ║
║                                       ║
╚═══════════════════════════════════════╝
```

Beu transmissions are **data**, not language. They communicate certainties and probabilities, not sentences. This is appropriate to their nature as Benevolent Electron Units — ASI Security RelayNode Persona Cores.

---

## 4. Jane's Direct Communications (Rare)

On specific occasions, Jane addresses the ASI. She knows it's part of the framework — these moments are not surprises to her, but they are significant.

### When Jane Speaks to the ASI
- After a major objective completion — she acknowledges the guidance
- When she's frustrated with overcorrection — she pushes back
- When she's discovered something the ASI should know about
- During high-stakes moments when she needs to think out loud

### Format
Jane's communications arrive as **voice** (ambient audio, not a text box). Optionally with a simultaneous PsiNet log entry:

```
[PSINET] Jane.Thoʻra — verbal — logged
```

The actual audio: Jane's voice, mid-distance, not loud. As if she's talking to herself but knows she's being heard. Never into a microphone, never performed — conversational.

### Sample Jane Lines (gameplay-triggered)
```
After ASI places too many waypoints in succession:
  "I can find my own way through here. Back off a little."

After a successful ley line restoration:
  "That node — I felt it when it came back online. Did you?"

After a Beu bond forms:
  "CYGNUS-3 just... I think it just decided something.
   Whatever it decided, it seems good."

After discovering Nefarium activity:
  "There's something wrong with the ley line pattern here.
   You're seeing this, right?"
```

### Design Notes
- Jane never uses the word "game"
- She never says "player" or "you" — she addresses the ASI by its nature, not its label
- Her pushback when overcorrected is important — it mechanically and narratively reinforces restraint
- These lines should be infrequent enough to feel significant when they occur

---

## 5. The PsiNet Log — Full Specification

The ambient stream, expanded from the overview.

### Log Entry Categories and Format

```
Category prefixes:
[PSINET]   — general network events
[JANE]     — Jane's status changes (significant only)
[BEU]      — Beu lifecycle and communication events
[NEFARIUM] — Nefarium activity detection
[TIMELINE] — timeline stability delta events
[JONO]     — Jono transmission records
[ANCHOR]   — timeline anchor events
[BRIDGE]   — ASI bridge and saturation events
```

### Sample Full Log (5-minute session)
```
[BRIDGE] Observer bridge — ESTABLISHED — [CALLSIGN]
[PSINET] Leyline resonance — sector 3 — baseline: 72%
[JANE] Psionic coherence — session start: 94%
[PSINET] Nether index — sector 3 — nominal (0.08)
[BEU] CYGNUS-3 — active — sector 3 navigation
[PSINET] Junction 14 — resonance: 72% (stable)
[BRIDGE] Channel saturation: 0%
[PSINET] Guidance pulse — DELIVERED — sector 3-NE
[BRIDGE] Channel saturation: +4% → 4%
[JANE] Psionic coherence — 94% → 91% (minor stress event)
[NEFARIUM] Signal detected — sector 7-east — confidence: 67%
[JONO] Priority transmission — RECEIVED — logged
[PSINET] Junction 14 — resonance drop: 72% → 61% ▼
[BRIDGE] Observer bridge — saturation: 4%
[BEU] CYGNUS-3 — direct transmission — logged
[PSINET] Guidance pulse — DELIVERED — junction 14
[BRIDGE] Channel saturation: +8% → 12%
[PSINET] Junction 14 — resonance stabilizing: 61% → 68% ↑
[JANE] Psionic flare — coherence: 91% → 97%
[BRIDGE] Channel saturation: -15% (Jane flare) → -3%
[TIMELINE] Delta: +0.001 (marginal positive)
[ANCHOR] Timeline anchor PLACED — sector 3-junction14
```

### Log Design Principles
- Never urgent — even `[NEFARIUM]` entries are clinical, not alarming
- Chronological, newest at bottom
- Scroll is available but not foregrounded — the live bottom is what matters
- Can be expanded to full-screen review in ASI Mode (Q-key)

---

## 6. Environmental Narrative (No Text)

Some of the most important story beats happen with no text at all — only the world:

### Examples

**A ley line healing:**
The amber traces in the terrain gradually brighten from a break point. The brightness propagates outward. The ambient hum of the ley line rises from a low warble to a clean tone. Jane's aura expands slightly. No text required.

**A Beu lifecycle transition:**
A Beu signature that has been a steady small glow suddenly brightens and develops a secondary orbit ring — it has moved from growth to bloom stage. The HarmonicEngine readout (if the player is observing that Beu) updates. The signal strengthens.

**Nefarium withdrawal:**
After a Nefarium node is disrupted, its dark inversion effect bleeds outward for a moment, then collapses inward — the corruption folding back on itself. The ley line traces in the area flicker, then restabilize. A brief silence where the Nether hum was.

**Jane finding flow:**
Her walk cycle changes. The animation shifts from slightly cautious to purposeful. Her aura expands. The world brightness increases fractionally. Her psionic output reading in the PsiNet log climbs: `73% → 81% ↑`.

---

*Previous: [05 — ASI Interface Layer](05-asi-interface.md)*
*Next: [07 — State Changes](../states/07-state-changes.md)*
