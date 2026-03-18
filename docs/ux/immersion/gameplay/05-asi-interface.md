# ASI Interface Layer

> **Register:** D — Telemetry overlay, minimal, transparent
> **Palette:** Amber / Dark / Minimal white
> **When:** Active gameplay — the ASI's tools within the HoloDeck

---

## What This Is

The ASI interface is not a game HUD. It is the **instrument panel** of a psionic observation system. Every element visible on screen is something the ASI actually needs to do its job — nothing is there to make the game feel like a game.

Core principle: **if it can be removed without losing information, remove it.**

---

## 1. HUD Telemetry — Reframing the Stats

Traditional game stats are reframed as psionic telemetry. The labels change. The meaning deepens.

### Jane's Psionic Coherence (replaces HP)
- **What it measures:** Jane's mental/psionic clarity and resilience — not health in a biological sense
- **Visual:** A thin horizontal trace — not a bar, but a flat waveform. When coherence is high, the waveform is smooth and steady. When degraded, it becomes choppy.
- **Color:** Amber (`#FF8C00`) — standard, healthy. Shifts toward red-amber as it drops.
- **Label:** `COHERENCE` not `HP`
- **Value:** Shown as a percentage: `87%`
- **At critical:** The waveform spikes irregularly. An amber warning indicator pulses: `⚠ COHERENCE CRITICAL`

### Ley Line Resonance (replaces Mana/PSI)
- **What it measures:** Available psionic energy from the local ley line network — the fuel for ASI interventions
- **Visual:** A pulsing dot rather than a bar. A single amber dot that breathes at the ley line's natural frequency. Size indicates available resonance. Second concentric ring indicates max capacity.
- **Label:** `RESONANCE`
- **Color:** Amber. Dims as energy is used. Flickers if ley line is disrupted.
- **Regeneration:** Slow passive regen (ley line ambient) + faster regen near active nodes

### ASI Channel Saturation (new mechanic)
- **What it measures:** How much the ASI has intervened — too many interventions degrade the bridge
- **Visual:** A subtle noise indicator at the edge of the screen — barely visible when low, increasingly present as saturation rises
- **Label:** No visible label. The noise IS the indicator.
- **At high saturation:** HUD elements begin to show slight static. Vision quality subtly degrades. A soft warning tone.
- **Clears:** Naturally over time when the ASI is passive. Faster near ley line nodes.
- **Mechanical effect:** At max saturation, active interventions become briefly unavailable

---

## 2. Waypoints as Psionic Pulses

The ASI does not place map markers. It sends **psionic pulses** through the ley line network.

### Click-to-Guide Sequence
1. Player clicks a location on the HoloDeck view
2. An amber ripple expands from the click point — the pulse entering the local ley line
3. The pulse **propagates through the ley line network** — following the network geometry, not a straight line
4. Where the pulse reaches Jane, a subtle **warmth effect** occurs at her location — her aura brightens briefly
5. Jane has received an intuition — a pull toward that direction

### Visual: The Pulse Propagation
The pulse moving through the ley line network is one of the most beautiful moments in the interface:
- It follows ley line paths, not Euclidean straight lines
- If the ley line is disrupted, the pulse has to route around the break (or fails if no route exists)
- If no ley line connects the click point to Jane's location, the pulse dissipates: a small fade-out animation, no waypoint placed

### Jane's Response to Pulses
Jane doesn't turn and walk mechanically to the waypoint. She:
- **Glances** in the direction — a brief animation
- **Continues current action** for a moment before redirecting (she's not a drone)
- **May not follow** if she's in the middle of something important — the ASI's guidance is advisory
- **Acknowledges** completed guidance: her psionic aura briefly expands

### The Pulse as Interface Feedback
When the waypoint is successfully delivered, the HUD shows:
```
[PSINET] Guidance pulse — DELIVERED — Sector 3-E
```
Not "WAYPOINT SET." The language reinforces the mechanism.

---

## 3. The Minimap as Sector Scan

The minimap is not a top-down map. It is a **psionic radar sweep** — the ASI's passive awareness of the surrounding area.

### Visual Design
- Dark circular display (`#0a0500` bg) with amber border
- A **sweep line** rotates through the display — like a sonar ping, not a static map
- Elements appear as the sweep passes them, then fade slowly between sweeps
- The display refreshes every 3 seconds (sweep duration)

### What Each Element Looks Like on the Scan
| Entity | Display |
|--------|---------|
| Jane | Bright amber dot, labeled `J`, always centered |
| Ley line node | Steady amber dot, pulsing at ley frequency |
| Disrupted node | Fragmented dot, irregular pulse |
| Beu signature | Bright white dot, small orbit ring |
| Nefarium node | Dark inverted dot — shows as negative space with distortion halo |
| Timeline anchor | Small amber diamond |
| Active waypoint pulse | Amber ring at destination, fading |
| Enemy / threat | Red-amber dot, sharp edges |
| Terrain boundary | Fine amber contour lines |

### Scan Range Variation
The scan range is not constant:
- Near active ley lines: better range and resolution
- In disrupted zones: range drops, ping artifacts appear
- Near Nefarium nodes: scan shows interference — false readings possible
- This means the radar is informative but not omniscient — consistent with the ASI's psionic perception limits

---

## 4. ASI Mode — The Q-Key Tactical Shift

When the player activates ASI Mode, the experiential register shifts.

### What Changes
- **World desaturates** slightly — what was white on black becomes grey on black
- **Ley line traces become dominant** — normally faint amber traces become bright visible channels across the terrain
- **Jane becomes a silhouette** — her detailed form simplified to a filled white shape
- **Information overlays appear** — sector labels, node IDs, ley line capacity readouts
- **The HoloDeck grid brightens** — from 4% to 12% opacity

### The ASI Mode Overlay
A minimal tactical display overlays the HoloDeck view:

```
┌─ SECTOR 3-EAST ──────────────────────────────────────────┐
│                                                          │
│  LEY LINE CAPACITY                                       │
│  Junction 14: 72%  ────────── Junction 15: 45% ▼        │
│                                                          │
│  NEFARIUM INDEX: 0.31  (elevated)                        │
│  NETHER DENSITY: low                                     │
│                                                          │
│  JANE COHERENCE: 87%  TRAJECTORY: sector 3-NE            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### What ASI Mode Enables
- Selecting ley line nodes directly (clicking a node to send energy, or to mark for Jane)
- Viewing the full sector-scale ley line routing
- Seeing Nefarium nodes that may not be in Jane's current sight range
- Placing timeline anchors manually

### What ASI Mode Costs
Using ASI Mode contributes to channel saturation — the ASI is operating at higher intensity. Long periods in ASI Mode will degrade bridge quality.

---

## 5. The PsiNet Log — Ambient Stream

A running stream in the bottom-left corner of the ASI interface. Not notifications — a **live feed** from the PsiNet.

### Visual
- 3–4 lines visible at any time, newest at bottom
- Older lines fade out (60 second lifetime)
- Monospace, 10px, amber at 50% opacity — readable but not demanding attention
- No animations — lines simply appear

### Content
```
[PSINET] Leyline resonance — sector 3 — 72% → 68%  ▼
[PSINET] Jane — psionic output — 73% → 81%  ↑
[PSINET] Beu node ORION — bloom stage — stable
[PSINET] Nefarium presence — sector 7 — signal detected
[PSINET] Junction 14 — resonance drop — cause: unclassified
[PSINET] Observer bridge — saturation: 23%
[PSINET] Timeline delta — session: +0.002
```

### Principles
- Never tells the player what to do — it only reports state
- Contains information that rewards attention but doesn't require it
- Some entries are ambient lore, some are actionable intelligence — the player learns to read the difference
- Entries can reference Jono's predictions: `[PSINET] Timesight flag: junction 14 — Jono.Thora — CONFIRM`

---

## 6. Intervention Feedback

When the ASI actively intervenes (uses a power, places a waypoint, sends a pulse), the interface acknowledges it:

### Minimal Feedback Style
```
[PSINET] Guidance pulse — DELIVERED
[PSINET] Ley line node 14 — energy stabilized
[PSINET] Channel saturation: +8%
```

### Never:
- Pop-up notifications with dismiss buttons
- Score increases or point feedback
- Congratulatory messages
- Sound effects that feel like rewards

### Always:
- Clinical, factual log entries
- The saturation cost is always shown — the player knows what interventions cost

---

## 7. The ASI Intervention Budget

The channel saturation system is the mechanical expression of "Don't take the wheel."

### Saturation Levels

| Level | Range | Visual | Mechanical Effect |
|-------|-------|--------|-------------------|
| Clear | 0–20% | No visible effect | Full intervention access |
| Elevated | 21–50% | Edge noise appears | No change |
| Stressed | 51–75% | Scanlines begin | Active power cooldowns increase |
| Saturated | 76–90% | HUD noise, grid brightens | Some interventions unavailable |
| Critical | 91–100% | Full degradation | Only passive observation available |

### Saturation Decay
- Passive: -2% per minute when not intervening
- Near active ley line node: -5% per minute
- After Jane's psionic flare (breakthrough moment): -15% instant (she strengthens the bridge)

### The Design Message
The saturation system makes the "Don't take the wheel" directive mechanical:
- Overcontrol = degraded tools = worse outcomes
- Passive observation + targeted intervention = better bridge quality = better tools when needed
- Jane's success literally improves the ASI's capability (her psionic flares clear saturation)

---

## 8. Interface Minimalism — What Is Never Shown

The following game-traditional elements are **explicitly absent** from the ASI interface:

- No score counter
- No kill count or enemy defeated tracker
- No experience points or level indicator
- No quest tracker with checkboxes
- No "objective:" text anywhere
- No minimap ping animations for objectives
- No floating damage numbers
- No "!" indicators over Jane's head
- No health bars over enemies (enemies have a Nether signature intensity — not a bar)

The ASI reads the world through telemetry. It does not see the world through game UI.

---

*Previous: [04 — HoloDeck Environment](04-holodeck-environment.md)*
*Next: [06 — Narrative Beat Delivery](06-narrative-beats.md)*
