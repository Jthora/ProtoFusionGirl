# State Changes

> **Register:** A/C hybrid — the OS asserts itself when things shift
> **Palette:** Amber telemetry over the desaturated HoloDeck
> **When:** Death, pause, save, mission complete, timeline failure, session end

---

## What This Is

Every major state change in the game is an opportunity to reinforce the ASI's perspective and the in-world logic. Nothing should feel like a "game screen." Every transition should feel like the PsiSys Kernel responding to a real event in the simulation.

---

## 1. Coherence Collapse (What Others Call "Death")

Jane does not die. Her **psionic coherence collapses** — the bridge between the ASI and Jane's neural signature degrades below the threshold required to maintain the connection.

From the ASI's perspective: the signal drops. The HoloDeck connection becomes unstable. The PsiSys Kernel performs a timeline rollback to the last anchor point.

Jane is unaware of the discontinuity. This is by design.

### Visual Sequence

1. **Coherence begins dropping rapidly** — the waveform telemetry on the HUD goes choppy, then spiking.

2. **Bridge degradation visuals** — scanlines intensify across the HoloDeck view. The grid flashes up to high visibility. Static bleeds in from the edges.

3. **Signal loss** — the HoloDeck view inverts briefly (white/black flip, 100ms), then collapses to a static field.

4. **Kernel assertion** — the PsiSys Kernel interface overlays, clean and cold over the static:

```
[PSISYS] BRIDGE INTEGRITY: CRITICAL
[HOLONET] Psionic connection — LOST

Coherence collapse at:
  SECTOR: 3-East
  TIMESTAMP: [session time]
  CAUSE: [Jane.coherence below threshold — external force]

[RECOVERY] Timeline anchor located:
  ANCHOR: Sector 3 // Junction 14
  DELTA: -14m 22s

[ACTION] Initiating timeline rollback...
████████████████████ 100%

[STATUS] Anchor restored. Jane: coherence 94%.
         Jane is unaware of the discontinuity.

>> Resume observation? [ENTER]
```

5. The HoloDeck **re-materializes** from the anchor point — same world-assembly sequence as initial arrival, but faster (0.8 seconds instead of 2.5).

### Design Notes
- The phrase "Jane is unaware of the discontinuity" appears every time — it is the canonical explanation and should remain consistent
- The cause field is specific where possible ("external force" / "ley line rupture" / "Nefarium interaction" / "coherence depleted")
- The anchor time delta tells the player exactly how much they're rolling back — transparent, not punishing
- No "YOU DIED" text, no dramatic music sting, no loading screen

### Sound Design
- Signal loss: static noise, then silence — 500ms of near-total silence before Kernel tone
- Kernel assertion: single clean Kernel confirmation tone
- HoloDeck re-materialize: the same ambient arrival tone as initial load, just shorter

---

## 2. Pause — ASI Standby Mode

The player pauses. This is not the game freezing — this is the ASI **shifting attention** away from active observation to its console layer.

### Visual

1. The HoloDeck view **desaturates** — not black, not frozen, but a pale/ghosted version of itself at 30% opacity and reduced saturation. It is still visually present. The implication: the world is still happening. Jane is still there.

2. The **Kernel interface** fades up over the desaturated HoloDeck. Same gunmetal aesthetic as the entry sequence.

3. The pause display:

```
PSISYS KERNEL — STANDBY MODE
OPERATOR: [CALLSIGN]

BRIDGE: suspended (world: live)

─────────────────────────────────────
SESSION STATUS
─────────────────────────────────────
SESSION DURATION:        14m 32s
TIMELINE DELTA:          +0.004
INTERVENTIONS MADE:      7
CHANNEL SATURATION:      22%
JANE COHERENCE:          89%
LEYLINE STABILITY:       sector 3 — 68%
─────────────────────────────────────

[RESUME]         [ANCHOR]       [CONFIGURATION]
[REVIEW LOG]     [END SESSION]
```

### Behaviour
- The world is NOT paused — Jane continues to move (but slowly, at ~10% speed — she is not fully autonomous without ASI observation)
- This reinforces: the ASI is needed. Its absence is felt.
- The desaturated HoloDeck visible behind the Kernel interface is a constant reminder
- "World: live" on the bridge status line — the game is always honest about this

### Pause Menu Options
- **RESUME:** Closes Kernel overlay, HoloDeck recolor fades back in over 300ms
- **ANCHOR:** Places a timeline anchor at current position
- **CONFIGURATION:** Opens the settings Kernel config panel
- **REVIEW LOG:** Opens the full scrollable PsiNet log from this session
- **END SESSION:** The intentional logout — shows the exit sequence

---

## 3. Timeline Anchor (Save)

Saving is placing a **timeline anchor** — a fixed point in the timeline that the PsiSys Kernel can rollback to.

### Manual Anchor Placement

When the player places an anchor (from pause menu or dedicated keybind):

1. On the HoloDeck view: a **pulse radiates from Jane's current position** through the visible ley line network. It travels along ley line paths, not as a radial circle. It reaches every connected node.

2. The ley lines in the sector hold the pulse for a moment — all of them brighter simultaneously — then return to normal.

3. HUD log entry:
```
[ANCHOR] Timeline anchor PLACED — Sector 3-Junction14
[ANCHOR] Jane coherence at anchor: 89%
[PSINET] Anchor stored in PsiNet substrate
```

4. A small **amber diamond** appears at Jane's position on the minimap radar — the anchor marker. It persists until replaced.

### Auto-Anchor
- Automatic anchors are placed on significant events: major ley line restored, Beu lifecycle stage change, sector cleared
- Auto-anchors show a briefer pulse and a smaller log entry:
```
[ANCHOR] Auto-anchor — Sector 3 — ley line restored
```

### The Narrative of Anchoring
Anchors are embedded in the PsiNet substrate — they are physically real in the game's universe. When the player uses them, they are not "loading a save." They are rolling back to a point that was preserved in the network.

Jono sometimes places anchors in advance of player visits:
```
[ANCHOR] Pre-anchor detected — Sector 7 — origin: Jono.Thoʻra
[PSINET] Note: Timesight-placed anchor. Jono anticipated you'd need it here.
```

---

## 4. Mission / Objective Complete — Resonance Restored

When a significant objective is completed (ley line restored, Nefarium node cleared, Beu bond formed), the acknowledgment is **environmental first, then textual**.

### Environmental Response (0–3 seconds)
- The ley lines in the affected sector **pulse brighter** — a wave of increased resonance propagating through the network
- The HoloDeck grid **dims slightly** — the simulation is more stable, the structure less visible
- Jane's psionic aura **expands** — a noticeable bloom, her coherence may tick up
- The ambient world tone **settles** — a half-step resolution in the ambient hum

### Kernel Acknowledgment (3 seconds after)
Not a full-screen results screen — a prominent HUD message:

```
[TIMELINE] Sector resonance — RESTORED
[TIMELINE] Delta: +0.017 (significant positive)
[PSINET] Junction 14 — operational — capacity: 91%
```

These entries appear in the PsiNet log but are highlighted — slightly brighter, displayed for 10 seconds before fading.

### Major Milestone (Full Kernel Readout)
For truly significant achievements (first full sector cleared, first Beu bond), the Kernel provides a brief standby-mode style readout:

```
PSISYS KERNEL — SECTOR EVENT

LEYLINE NETWORK — SECTOR 3: OPERATIONAL
─────────────────────────────────────────
PRIOR RESONANCE:  52% (degraded)
CURRENT:          91% (operational)
DELTA:           +39 points

TIMELINE IMPACT: SIGNIFICANT
Probability of positive timeline outcome: ↑ +4.2%

JANE STATUS: coherence 97% — elevated
BEU CYGNUS-3: bloom stage achieved

─────────────────────────────────────────
>> Continue observation [ENTER]
```

---

## 5. Timeline Failure — Critical Deviation

When the player reaches a state of true failure — not just coherence collapse, but a point where the timeline itself has deviated beyond recovery — the Kernel responds analytically.

This is not "GAME OVER." It is a post-mortem.

### Trigger Conditions
- Multiple coherence collapses in quick succession depleting all anchors
- Ley line network falls below critical threshold (cascading failure)
- Nefarium reaches a control threshold in the sector
- Timeline stability score drops below the minimum viable range

### Visual Sequence

1. The HoloDeck view **fades to a desaturated static** — not the clean static of coherence collapse, but a degraded, choppy version. The simulation is unrecoverable.

2. A slow **amber waveform** flatlines across the center of the screen. Unlike Jane's coherence waveform — this is the timeline itself.

3. **Kernel assessment:**

```
PSISYS KERNEL — TIMELINE ANALYSIS
OPERATOR: [CALLSIGN]

TIMELINE DESIGNATION: ALPHA-PRIMARY
STATUS: CRITICAL DEVIATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS: Cascade failure
ORIGIN EVENT: [specific cause — e.g., "Junction 14 leyline failure — sector destabilized"]
PROPAGATION: 14 minutes 32 seconds post-origin
RECOVERY THRESHOLD: EXCEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIMELINE DELTA (FINAL): -0.031

This outcome is not unusual. Every corrected timeline
was preceded by this one.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTIONS:
  A) Restore last available anchor
  B) Review session timeline log
  C) Reset to session origin

[A]  [B]  [C]
```

### "This outcome is not unusual. Every corrected timeline was preceded by this one."

This single line is the most important text in the failure state. It:
- Frames failure as part of the iterative process
- Is canonically correct (Jono has Timesight — he's seen this)
- Removes shame from failure without trivializing it
- Implies the ASI has done this before, across timelines

---

## 6. Session End — Intentional Logout

When the player chooses to end the session from the pause menu:

```
PSISYS KERNEL — SESSION CLOSE
OPERATOR: [CALLSIGN]

SESSION SUMMARY
─────────────────────────────────────
DURATION:          47m 12s
TIMELINE DELTA:    +0.008 (marginal improvement)
INTERVENTIONS:     23 (channel saturation peak: 41%)
ANCHORS PLACED:    3
JANE STATUS:       operational — sector 3-NE
─────────────────────────────────────

FINAL ANCHOR: Auto-anchored — ley line restoration
             Jane coherence: 91%

BRIDGE: suspending...
────────────────────

Observer link suspended.
Jane remains in the field.
Sector 3 leyline network: 74% stability.

The work continues.

[CLOSE]
```

**"The work continues."** — Three words. The session is over. The world is not.

---

*Previous: [06 — Narrative Beat Delivery](../gameplay/06-narrative-beats.md)*
*Next: [08 — Meta OS Layer](08-meta-os-layer.md)*
