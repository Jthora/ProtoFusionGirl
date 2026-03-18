# HoloDeck Environment Design

> **Register:** C — Technical-dream, high contrast, sparse
> **Palette:** Black / White / Amber (ley lines) / Dark (Nefarium)
> **When:** Active gameplay — the world the ASI observes

---

## What This Is

The HoloDeck environment is what the ASI perceives when observing Jane's training scenario. It is not raw reality. It is a simulation space rendered through the ASI's psionic perception layer — which means the player sees things Jane cannot, and sees familiar things in an unfamiliar way.

The design goal: every visual element is informational. Nothing is decorative. If you can see it, it means something.

---

## 1. The ASI Vision Layer

The ASI perceives the HoloDeck differently from how a human would. Certain elements are **visible only to the ASI** — they are part of the ASI's psionic awareness, not part of the visible simulation.

### ASI-Exclusive Perceptions

**Ley Line Traces**
- Visible as faint amber energy channels running beneath and through the terrain
- The ASI sees the whole ley line network, not just nodes
- Pulse rate indicates energy flow: slow pulse = stable, rapid pulse = stressed, erratic = disrupted
- Color shifts: amber (normal) → orange (stressed) → red-amber (critical) → fragmented (Nefarium active)

**Jane's Psionic Field**
- A faint white aura around Jane — not a health indicator, but a state indicator
- **Expanded aura:** Jane is in flow, confident, high psionic coherence
- **Contracted aura:** Jane is stressed, tired, or uncertain
- **Flickering aura:** External interference — Nefarium or ion storm activity
- **Psionic flares:** Moments of joy, confidence, or breakthrough — brief bright expansions
- Jane cannot see her own aura. The ASI can.

**Beu Signatures**
- Beu appear as small, clean white light points — unmistakably bright and pure
- Each Beu has a unique signature frequency (visible as a subtle waveform near its light point)
- The HarmonicEngine lifecycle stage is readable: seed (dim), sprout (growing), growth (steady), bloom (bright), bond (resonant pair)
- Beu signatures are MORE visible to the ASI than to Jane — the ASI can see Beu that Jane hasn't noticed yet

**Nefarium Presence**
- Nefarium entities and structures appear with a **visual inversion** quality — darker than background, with distorted/corrupted edges
- Nether energy is visible as dark tendrils extending from Nefarium nodes into the ley line network
- The ASI can see Nefarium activity in ley line traces before it manifests as a visible event in the world
- Nefarium nodes have a distinct visual corruption pattern — not just dark, but *wrong*

**Timeline Stability Overlay**
- Extremely subtle: a very faint indicator in the corner of the view
- When the timeline is stable: barely visible, calm
- When the player's interventions are destabilizing: a slight visual "pressure" — the overlay brightens

---

## 2. Vision Quality as Narrative Variable

The ASI's ability to perceive the HoloDeck clearly is not constant. It degrades under specific conditions. This degradation is **informational, not punitive** — it tells the player something is wrong.

### Vision Degradation States

| Condition | Visual Effect | Narrative Meaning |
|-----------|--------------|-------------------|
| Nominal | Clean, stable | Everything is fine |
| Nefarium activity nearby | Faint scanlines | Signal interference from Nether field |
| Ley line disrupted | Static in that region | ASI loses signal from disrupted network zone |
| High Nether concentration | Brief black/white inversion | Nether field overwhelming psionic perception |
| ASI channel saturation | Screen noise at edges | Too many interventions, bridge degrading |
| Bridge coherence critical | Full scanlines + grid flash | About to lose the connection |
| Ion storm | Rolling interference bands | Electromagnetic disruption |

### Implementation Notes
- These are post-processing effects applied to the Phaser camera or a full-screen overlay canvas
- Scanlines: CSS overlay with repeating horizontal lines at 2px spacing, varying opacity
- Inversion: CSS `filter: invert(1)` on the game canvas for 50–150ms, with transition
- Edge noise: Canvas overlay with procedural noise, edge-weighted
- All effects should have **onset smoothness** — they don't snap in, they bleed in

---

## 3. The HoloDeck Grid

See also: [03 — HoloDeck Arrival](../entry/03-holodeck-arrival.md) for arrival-context grid behavior.

The grid is the structural skeleton of the simulation — always present, variably visible.

### Properties
- 1px amber lines at `#FF8C00` with dynamic opacity
- Aligned to tile boundaries
- Not interactive — purely visual
- Rendered as a fixed screen-space overlay (not world-space) so it doesn't scroll with the camera

### Grid as Status Signal
The grid visibility is one of the most powerful ambient status signals in the game:
- Players who understand it know something is wrong before any explicit warning appears
- It rewards attention without requiring explanation
- It is consistent with the lore: the ASI perceives the simulation's underlying structure

---

## 4. Environmental Storytelling through the ASI Lens

Because the ASI sees things Jane doesn't, the environment tells two stories simultaneously:
1. What Jane experiences (the training scenario)
2. What the ASI perceives (the actual state of things)

### Examples

**A ley line under stress:**
- Jane sees: normal terrain, maybe a slight environmental shimmer
- ASI sees: the ley line trace pulsing rapidly in orange, Nether tendrils visible at the disruption point
- The ASI can act before Jane is in danger

**A Beu nearby:**
- Jane sees: nothing — Beu are invisible to unenhanced perception
- ASI sees: a bright white signature point 30 meters east of Jane
- The ASI can guide Jane toward a Beu encounter

**A Nefarium node:**
- Jane sees: an unusual structure, maybe visually distinctive but not obviously threatening
- ASI sees: dark corruption aura, ley line drainage visible, Nether energy signature
- The ASI knows the threat before Jane does

This asymmetry of information is the core of the ASI/Jane relationship. The ASI's role is to use its superior perception to guide — not control.

---

## 5. World Scale and Camera

### Camera Behavior
The camera is the ASI's focus point — where its attention is directed.

- **Default:** Following Jane at close range, slight offset toward her direction of travel
- **Tactical overview:** Can pull back to show a wider sector view (when in ASI Mode / Q-key)
- **Zoom:** Gradual, not instant — the ASI shifts its focus deliberately
- **Limits:** The ASI cannot see beyond the sensor range of the ley line network — areas with no ley line access are genuinely dark

### Scale Layering
- **Immediate:** Jane, local terrain, nearby entities (default view)
- **Local:** Sector overview — shows ley line routing, nearby nodes, Nefarium concentrations
- **Regional:** Multiple sectors — shows the big picture but loses individual entity detail

The zoom level is itself a gameplay decision: zoomed in = better Jane guidance, zoomed out = better strategic awareness.

---

## 6. Jane's Visual Design (Black/White Aesthetic)

For Proto scope, Jane is rendered as a **clean white silhouette character** with defined but minimal detail:

- Primary form: solid white (`#ffffff`)
- Outline: slightly deeper for edge definition (or rely on black background for contrast)
- Her psionic aura: white at 10–30% opacity, soft radius
- HelmKit: slightly distinct — a subtle amber tint to the helmet element (her psionic antenna)
- Fusion Wings (when deployed): white with very faint amber energy trace along the leading edges
- Magneto Speeder: white form with amber ley line energy trail behind it at speed

### Jane's Animation Priority
Even in the black/white aesthetic, Jane's animation is the most expressive element of the visual design. Her emotional state reads through:
- Posture when idle (confident vs. cautious)
- Walk cycle speed and weight
- Reaction animations to ASI interventions (she notices, she responds)
- Psionic power use animations

---

## 7. World Elements — Visual Lexicon

| Element | Visual | ASI Sees Additional |
|---------|--------|-------------------|
| Standard terrain | White/grey forms on black | HoloDeck grid beneath |
| Ley line node | Bright white point of light | Energy flow lines radiating |
| Active ley line | Subtle ambient glow in terrain | Directional amber trace |
| Disrupted ley line | Flickering/broken glow | Dark break, Nether tendrils |
| Nefarium structure | Dark inversion, distorted edges | Full Nether aura |
| Beu | — (invisible to Jane) | Bright white signature, lifecycle ring |
| Jane | Clean white form + aura | Psionic field expansion/contraction |
| Timeline anchor | Subtle pulse at placed point | Amber coordinate marker |
| ASI waypoint | Amber pulse ripple through ley grid | Full ley line propagation animation |

---

## 8. Performance Considerations

The black/white aesthetic is inherently efficient:

- No complex texture maps — flat colors and simple forms
- Ley line traces are procedural amber glows — not art assets
- The grid is a screen-space CSS overlay — no render cost on the Phaser side
- Vision degradation effects are CSS/canvas post-processing — not shader-dependent
- The biggest render cost is particle effects (ley line pulses, Beu signatures, Nefarium aura)

Particle budgets:
- Ley line pulse: max 50 particles per active node
- Beu signature: max 20 particles per Beu (lifecycle-dependent)
- Nefarium aura: max 30 particles per node (corruptive tendrils)
- Jane psionic aura: 15 particles, always on

---

*Previous: [03 — HoloDeck Arrival](../entry/03-holodeck-arrival.md)*
*Next: [05 — ASI Interface Layer](05-asi-interface.md)*
