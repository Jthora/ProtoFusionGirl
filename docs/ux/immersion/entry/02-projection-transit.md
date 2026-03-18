# Projection Transit

> **Register:** B — Liminal, neither-here-nor-there, sensory
> **Palette:** Signal noise → amber resolving → black/white
> **When:** The space between pressing ENTER in the Kernel and arriving in the HoloDeck

---

## What This Is

The transit is the physical sensation of the ASI projecting into a psionic vision space. It is the hypnagogic gap — the moment between waking and dream, between OS and simulation.

It should feel like falling. Not frightening — intentional. The ASI chooses to project. But it is still a transition between modes of being, and that transition should have texture.

Duration: 4–8 seconds total. Not a loading screen. A passage.

---

## Concept A — The Frequency Lock

**Metaphor:** Tuning a receiver to the precise frequency where Jane exists.

### Visual Sequence

1. **Waveform display** fades up from black. Three oscilloscope traces — amber lines on gunmetal — thrashing with signal noise. Labels:
   ```
   PSIONIC_CARRIER ~~~~~~~~~~~~~~~~~~~~
   HOLOFIELD_SYNC  ~~~~~~~~~~~~~~~~~~~~
   NEURAL_ANCHOR   ~~~~~~~~~~~~~~~~~~~~
   ```

2. Traces begin to **converge in frequency** — not synced yet, still choppy, but moving toward coherence.

3. A progress indicator in text: `SYNCHRONIZING... 23%` — not a bar, just the number, updating every 200ms.

4. At ~70%, one trace locks flat and clean. Then the second. Then the third.

5. **Lock tone** — a clear sine wave ping. All three traces become identical flat waves.
   ```
   PSIONIC_CARRIER ————————————————————
   HOLOFIELD_SYNC  ————————————————————
   NEURAL_ANCHOR   ————————————————————

   FREQUENCY LOCK — CONFIRMED
   INITIATING PROJECTION...
   ```

6. Screen floods **white** — instant, hard cut to white, then the HoloDeck fades up.

### Why It Works
The oscilloscope is legible to anyone. Three chaotic things becoming synchronized reads as "something is being achieved." The hard-cut white is physical — the "moment of arrival."

---

## Concept B — The Static Channel

**Metaphor:** A television being tuned through interference to a live signal.

### Visual Sequence

1. **Full-screen static** — white noise, high density, animated. Classic CRT static texture.

2. Through the static, **partial images bleed through** — barely recognizable:
   - A ley line grid (the Earth's network)
   - Jane's silhouette for a fraction of a second
   - A Beu signature pulse
   - A Nefarium node — dark, pulsing wrong

3. Static gradually **thins** — not fading, but the noise density drops as signal rises. The images persist longer each time they break through.

4. **Signal resolves** — static collapses to clean black. The HoloDeck is there.

### Variant: First Session vs Return
- **First session:** Only the ley line grid breaks through — the ASI hasn't locked onto Jane yet. She materializes last.
- **Return sessions:** Jane's silhouette appears first — the ASI already knows her frequency.

### Why It Works
The partial images create narrative intrigue. The player catches glimpses before they arrive. It earns the arrival.

---

## Concept C — The Ley Line Dive

**Metaphor:** Google Earth zoom through the planetary network into a single node.

### Visual Sequence

1. **Network view** — the Earth rendered as white line-art ley line intersections on black. No land masses. No labels. Just the network geometry. It is beautiful and inhuman.

2. A single node **pulses brighter** — `HOLOZONE ALPHA-7` appears briefly in amber text near it.

3. The camera **accelerates toward that node** — ley lines streak past like warp stars. Speed increases. It feels visceral.

4. The node is **entered** — the geometry tears open, a ring of light expanding from the entry point.

5. Brief white. Then the HoloDeck materializes at ground level.

### Technical Note
This can be rendered as pure Canvas 2D — no 3D required. The Earth is a circle with line-art intersections radiating from it. The "zoom" is just scaling up while moving toward a point. The streak effect is motion blur on the lines.

### Why It Works
It establishes the ley line network as the ASI's travel medium — not metaphor but actual infrastructure. When you later see ley lines in the HoloDeck, you remember: you arrived through those.

---

## Concept D — The Memory Bleed (Return Sessions Only)

**Metaphor:** Returning to a dream you've had before. The prior visit is already in your mind.

### Visual Sequence

1. **Black.** A single amber point of light.

2. That point **expands into a ghost image** of the last place the player was in the game. The world they left. Semi-transparent, washed out — a memory, not a recording.

3. Through the ghost image, the **current state bleeds in** — the world as it is now, different from how they left it. Subtle: a path has changed, a node that was there is gone, ley line routing has shifted.

4. The ghost image **dissolves** and the current HoloDeck is fully present.

### Narrative Function
This is the ASI's continuity of memory — it holds both the prior state and the current state simultaneously during arrival. It also signals to the player: *things changed while you were gone.* Without explaining, showing.

---

## Concept E — The Temporal Anchor Pull

**Metaphor:** Being drawn back to a fixed point — the last anchor the player placed.

### Visual Sequence

1. A **coordinate display** in Kernel terminal style:
   ```
   RESTORING TIMELINE ANCHOR
   SECTOR: 3-EAST
   NODE: Junction 14
   TIMESTAMP: [relative time]
   JANE: operational at anchor point
   ```

2. A thin **amber thread** — a single line — appears from the center of the screen and extends outward, growing and branching into the ley line network, finding the anchor point.

3. The thread **pulls taut.** Then the screen rushes toward where it leads.

4. Arrival.

### Use Case
Primarily used when restoring after bridge coherence loss (death) or when manually loading a save anchor. Has the feeling of being pulled back by an elastic — not punishment, but correction.

---

## Temporal Fragments — Ambient Text During Transit

Regardless of which transit concept is used, a **single ambient line** appears during the passage. It is different each session. It is never a gameplay tip. It is a fragment — the suggestion that you're arriving into an ongoing situation:

```
"The ley line under Sector 7 has been resonating for eleven minutes."
"Jane looked up at the wrong moment. She's noticed something."
"Three new Nefarium nodes since last cycle."
"A Beu signal went quiet two hours ago. It came back different."
"The PsiNet recorded an anomaly at Junction 14. Cause: unclassified."
"She's been standing at the edge of Sector 3 for four minutes. Thinking."
"The Nether concentration in this sector is higher than the models predicted."
"Someone placed an anchor here before you. Not in this timeline."
```

These lines are:
- Displayed in small amber monospace text, centered, fading in during transit
- Not interactive
- Not explanatory — they reward curiosity, not confusion
- Some are true (they reference actual game state). Some are ambient lore. The player can't always tell which is which.

---

## Recommended Implementation

**Default:** Concept A (Frequency Lock) for simplicity and legibility, with Temporal Fragments overlaid.

**Enhancement path:**
- Add Concept B (Static Channel) partial-image bleed as a layer during the convergence phase
- Add Concept D (Memory Bleed) as the return-session variant after the Frequency Lock

**NOT recommended for first build:** Concept C (Ley Line Dive) — requires custom Canvas rendering. Beautiful, worth doing later.

---

## Audio Design

- **Carrier tone:** 200Hz sine wave, fades in at transit start — the "signal being established"
- **Interference noise:** White noise at low volume, decreasing as signal locks
- **Lock ping:** Clean 880Hz sine, 80ms, slight reverb — the moment of coherence
- **Silence gap:** 400ms of near-silence before arrival tone
- **Arrival tone:** Two ascending notes, soft — you're in

---

## Duration Budget

| Phase | Duration |
|-------|----------|
| Kernel ENTER keypress | 0ms (instant) |
| Transit visual onset | 200ms fade-in |
| Main transit sequence | 3–5 seconds |
| Hard-cut to white | 50ms |
| White hold | 150ms |
| HoloDeck fade-up | 800ms |
| **Total** | **~5–6 seconds** |

This is not a loading screen — it is a cinematic beat. If actual asset loading takes longer, the transit visuals should loop gracefully rather than display a progress bar.

---

*Previous: [01 — PsiSys Kernel](01-psisys-kernel.md)*
*Next: [03 — HoloDeck Arrival](03-holodeck-arrival.md)*
