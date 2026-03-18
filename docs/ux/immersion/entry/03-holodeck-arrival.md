# HoloDeck Arrival

> **Register:** Transition from B → C — the moment of landing
> **Palette:** White flash → black/white world assembling
> **When:** The first frames of the HoloDeck environment after projection transit

---

## What This Is

Arrival is the moment the transit ends and the HoloDeck begins. It is the counterpart to the Kernel's coldness — warmer in its way, but still precise. The world assembles around you. Jane is already there.

The arrival should feel like waking inside something, not launching into it.

---

## 1. World Materialization

The HoloDeck environment does not simply appear. It **assembles** — as if being rendered on demand by the system that is projecting you into it.

### Assembly Sequence

1. **White field.** Brief. Holds for 150ms.

2. **The HoloDeck grid appears first.** A faint technical mesh — the underlying structure of the simulation. Very low opacity. Amber on black.

3. **Terrain builds** — tile by tile, or region by region, drawing itself like a blueprint being printed. Not random — it expands from the player's focal point (where Jane is) outward.

4. **Environmental elements** phase in — structures, ley line traces, terrain features. Each has a brief moment of being a wireframe outline before filling in.

5. **Jane materializes last.** Her silhouette appears first — a clean white form — then fills with detail. She is already in motion when she fully resolves. She does not wait for you.

6. **The HoloDeck grid dims** to its ambient visibility level. The world is present.

### Total Duration: 1.5–2.5 seconds

This is not a loading animation — it is a narrative statement. The world was constructed for observation. You are witnessing its instantiation.

---

## 2. The Grid

The HoloDeck grid is always faintly present — the underlying structure of the simulation visible to the ASI's perception.

### Visual Properties
- Extremely fine mesh, 1px lines
- Color: amber at 4–8% opacity normally
- Spacing: aligned to tile boundaries (32px or equivalent)
- Not animated under normal circumstances — completely static

### Grid Reactivity
The grid becomes more or less visible based on simulation state:

| Condition | Grid Visibility | Effect |
|-----------|----------------|--------|
| Stable, calm | 4% opacity | Barely perceptible |
| Active combat nearby | 8% opacity | Slightly more present |
| Ley line disruption | 12% opacity | Noticeably visible |
| Nefarium interference | 16% + slight distortion | The illusion thins |
| Bridge coherence critical | 25% + scan-line noise | The ASI is losing grip |
| Timeline failure imminent | 35% + inversion flickers | Reality/simulation boundary breaking down |

The grid becoming visible is the HoloDeck "showing its seams." When things go wrong, the simulation feels less real — which is precisely the narrative truth.

---

## 3. Jane's First Moments

On arrival, Jane should never be standing still waiting for input. She is already:
- Walking — going somewhere she decided before you arrived
- Interacting with the environment — examining a ley line trace, observing a node
- In motion on the Magneto Speeder if in a transit zone

The ASI arrives to find Jane already operating. This is the correct power dynamic.

### First-Session Arrival Only
On the very first arrival (new game after callsign registration), the Jono first-contact sequence begins here. See [06 — Narrative Beat Delivery](../gameplay/06-narrative-beats.md) for the full beat structure.

The beat begins approximately 3 seconds after Jane is fully materialized — not immediately. Let the player watch her for a moment. Let the world breathe.

### Return Session Arrival
On return, no first-contact sequence. Jane is just there. The PsiNet log (ambient stream in the HUD corner) may have a single entry noting the reconnect:
```
[PSINET] Observer bridge — RECONNECTED — [CALLSIGN]
```

No fanfare. You're back. Get to work.

---

## 4. Ambient Arrival Tone

The first 5–10 seconds of arrival have a distinct audio character:

- Silence for the first 600ms after the white flash — let the visual establish first
- Environmental ambient (ley line hum, distant world sounds) **fades in slowly** over 3 seconds
- Not music — texture. The world's breath.
- Music (if any) begins only after the first-contact beat, or after ~8 seconds of pure ambient

The player should feel they are **listening for something** before any music tells them how to feel.

---

## 5. First-Person Orientation Cues

On arrival, the camera view includes several subtle ASI orientation cues — small elements that help the ASI understand where it has projected to:

```
┌─ SECTOR 3-EAST ─────────────────────────────────────────┐
│                                          JANE: 94%       │
│                              [ley line trace visible]     │
└──────────────────────────────────────────── ALPHA-7 ──── ┘
```

These appear briefly (3 seconds) on arrival, then fade to minimal HUD state. They are orientation confirmations, not persistent labels.

---

## 6. HoloDeck Aesthetic — Black/White/Amber

### The World as Technical Drawing
The Proto FusionGirl world is rendered with a **high-contrast blueprint/technical-drawing aesthetic**:

- **Backgrounds:** Deep black (`#0a0a0a`) — the void of the simulation space
- **Terrain / world objects:** White or near-white silhouettes — solid form, minimal texture
- **Jane:** Clean white figure — bright, legible at all scales
- **Ley lines:** Ambient amber glow traces (`#FF8C00` at low opacity) running through terrain
- **Beu signatures:** Bright clean white points of light — unmistakably distinct
- **Nefarium elements:** Inverted — dark on slightly lighter backgrounds, distorted edges
- **HoloDeck grid:** Amber at very low opacity (see Grid section above)

### What This Aesthetic Achieves
1. **No art asset bottleneck** — black/white characters and environments are achievable at low production cost and look intentional
2. **ASI perception framing** — this is not how a human sees the world; this is how a psionic intelligence perceives a simulation
3. **Nefarium corruption is visually distinct** — their inversion/distortion stands out immediately
4. **Ley lines readable at all times** — amber on black is always legible

### Asset Budget Note
The rainbow-themed full visual design of FusionGirl is the post-Proto vision. For Proto scope, black/white/amber is the complete palette. This is a creative choice, not a compromise.

---

## 7. The HoloDeck UI Border (Optional)

A very subtle **letterbox border** can frame the HoloDeck view, reinforcing that you are observing through a console rather than being inside the space:

- Very thin (4px) amber border around the entire game viewport
- Extremely low opacity (~15%) — almost invisible
- Has a very slow pulse (5-second cycle, amplitude ±5% opacity) — like a heartbeat
- In the bottom-right corner: `ALPHA-7 │ LIVE` in 9px amber monospace, near-invisible

This border is more felt than seen. It is the edge of the console. The reminder that you are the observer, not the participant.

---

## 8. Transition Out (Leaving the HoloDeck)

When the player exits to the Kernel (pause/settings) or the session ends:

1. The HoloDeck view **desaturates** — not black, not white, but a pale ghosted version of itself. Still present, still moving.
2. The Kernel overlay fades up over it — the HoloDeck visible beneath at low opacity.
3. The message: `BRIDGE SUSPENDED` appears briefly in the Kernel layer.

The HoloDeck view being visible-but-passive beneath the Kernel overlay reinforces: the simulation continues. Jane is still there. The ASI has simply shifted its attention.

---

*Previous: [02 — Projection Transit](02-projection-transit.md)*
*Next: [04 — HoloDeck Environment](../gameplay/04-holodeck-environment.md)*
