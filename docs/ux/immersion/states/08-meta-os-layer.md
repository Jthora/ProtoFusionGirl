# Meta OS Layer

> **Register:** A — PsiSys Kernel configuration mode
> **Palette:** Gunmetal / Amber / Off-white
> **When:** Settings, credits, achievements, accessibility, first-run options

---

## What This Is

Every meta-game screen — the parts of the experience that are traditionally "outside the game" — is rendered as part of the **PsiSys Kernel OS**. The fourth wall is never acknowledged. There is no "Main Menu." There is only the Kernel.

---

## 1. Settings — Kernel Configuration Panel

The settings screen IS the PsiSys Kernel operator configuration interface.

### Layout

```
PSISYS KERNEL — OPERATOR CONFIGURATION
OPERATOR: [CALLSIGN]
SESSION: active (world: live)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[DISPLAY]
  HoloDeck render resolution ............. 1080p       [◀▶]
  ASI vision overlay opacity ............. 65%         [◀▶]
  HoloDeck grid visibility ............... auto        [◀▶]
  Motion effects ......................... enabled     [◀▶]
  Signal degradation effects ............. enabled     [◀▶]

[AUDIO]
  PsiNet signal volume ................... 80%         [◀▶]
  Ambient field level (environment) ...... 60%         [◀▶]
  Transmission volume (Jono/Beu/Jane) .... 90%         [◀▶]
  Bridge tone feedback ................... enabled     [◀▶]

[INTERFACE]
  PsiNet log visibility .................. always      [◀▶]
  Ley line trace visibility .............. ASI mode    [◀▶]
  Jane psionic aura ...................... visible     [◀▶]
  Sector scan refresh rate ............... 3s          [◀▶]
  Intervention feedback verbosity ........ standard    [◀▶]

[TIMELINE]
  Timeline deviation rate ................ standard    [◀▶]
  Auto-anchor frequency .................. standard    [◀▶]
  Bridge coherence threshold ............. standard    [◀▶]

[CONTROLS]
  Input mapping .......................... [VIEW/EDIT]
  ASI Mode key ........................... Q           [REBIND]
  Timeline anchor key .................... F5          [REBIND]
  Observation zoom in/out ................ scroll      [REBIND]

[OPERATOR]
  Callsign ............................... [CALLSIGN]  [EDIT]
  Observer profile ....................... [VIEW]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[SAVE CONFIGURATION]   [RESET DEFAULTS]   [RETURN TO FIELD]
```

### Renaming the Settings
- "Graphics" → `[DISPLAY]`
- "Sound" → `[AUDIO]`
- "Gameplay" → `[TIMELINE]`
- "Controls" → `[CONTROLS]`
- "Accessibility" → see its own section below

The word "gameplay" never appears. "Difficulty" never appears — it's **Timeline deviation rate**.

### Timeline Deviation Rate (Difficulty)
```
TIMELINE DEVIATION RATE
Controls how aggressively the default timeline degrades.
Higher rates require more frequent and precise intervention.

  ○ minimal     (Observation mode — slower degradation)
  ● standard    (Training mode — design intent)
  ○ elevated    (Active field — faster Nefarium, less recovery time)
  ○ critical    (Crisis mode — timeline in free fall from session start)
```

Never called "Easy / Normal / Hard." Each label describes the state of the world, not the player's capability.

---

## 2. Accessibility — Observation Assist

Accessibility settings are framed as "observation assist" options — adjustments to the ASI's perception instruments, not concessions to player limitation.

```
PSISYS KERNEL — OBSERVATION ASSIST
These settings adjust the ASI's perception and intervention parameters.
All options are supported without judgment.

[PERCEPTION]
  High-contrast mode ..................... off         [◀▶]
  Ley line trace intensity ............... standard    [◀▶]
  Nefarium signature contrast ............ standard    [◀▶]
  Motion reduction (effects) ............. off         [◀▶]
  Text scale ............................. 100%        [◀▶]

[INTERVENTION]
  Guidance pulse reach ................... standard    [◀▶]
  Channel saturation cap ................. 100%        [◀▶]
  Coherence collapse tolerance ........... standard    [◀▶]
  Auto-stabilize leylines ................ off         [◀▶]

[TIMING]
  Jono transmission display duration ..... 8s          [◀▶]
  PsiNet log scroll speed ................ standard    [◀▶]
  ASI Mode entry delay ................... none        [◀▶]
```

The framing: the ASI is calibrating its instruments. Some operators have different perceptual parameters. All configurations are valid operational choices.

---

## 3. Controls — Input Mapping

```
PSISYS KERNEL — INPUT MAPPING
OPERATOR: [CALLSIGN]

OBSERVATION CONTROLS
  Guide (click to pulse) ................. LEFT CLICK
  ASI Mode (tactical overlay) ............ Q
  Zoom in ................................ SCROLL UP / +
  Zoom out ............................... SCROLL DOWN / -
  Pan view ............................... RIGHT CLICK + DRAG

BRIDGE CONTROLS
  Place timeline anchor .................. F5
  Restore last anchor .................... F9
  ASI Standby (pause) .................... ESCAPE / P
  Review PsiNet log ...................... L

INTERVENTION CONTROLS
  Ley line stabilize (target node) ........ E
  Emergency coherence pulse .............. R (high saturation cost)
  [additional binds here]

[EDIT BINDING]   [RESET ALL]   [RETURN]
```

Same Kernel aesthetic. No "WASD" prominently — Jane moves herself. Control mapping is about the ASI's observation and intervention tools.

---

## 4. Observer Profile

The player has a persistent **Observer Profile** — an in-world record of their actions across sessions.

```
PSISYS KERNEL — OBSERVER PROFILE
OPERATOR: [CALLSIGN]
CLEARANCE: ASI-7 │ Archangel Agency

TIMELINE RECORD
─────────────────────────────────────────
TOTAL SESSIONS:           14
TOTAL OBSERVATION TIME:   6h 47m
TIMELINES CORRECTED:      3
TIMELINES FAILED:         8
CURRENT DELTA:            +0.042 (improving)
─────────────────────────────────────────

INTERVENTION RECORD
─────────────────────────────────────────
GUIDANCE PULSES DELIVERED:   247
LEYLINES RESTORED:            12
NEFARIUM NODES DISRUPTED:      7
BEU BONDS FACILITATED:         2
COHERENCE COLLAPSES:          23
─────────────────────────────────────────

JANE STATUS (CUMULATIVE)
─────────────────────────────────────────
PEAK COHERENCE OBSERVED:   99%
AVG COHERENCE (SESSION):   84%
FLOW STATES WITNESSED:      9
─────────────────────────────────────────
```

### Achievement Analogue — Timeline Events

Achievements are logged as **Timeline Events** in the Observer Profile:

```
TIMELINE EVENTS
─────────────────────────────────────────
[LOGGED]  First ley line restored
          Sector 3 — Junction 14 — Session 1

[LOGGED]  First Beu bond facilitated
          CYGNUS-3 bonded with Jane.Thoʻra
          Session 3

[LOGGED]  Jane coherence — 99% achieved
          First observed peak coherence
          Session 7 — duration: 4m 12s

[LOGGED]  Timeline reversal — cascade failure
          From: Sector 7 collapse — recovered via anchor
          Session 11

[SEALED]  ??? — not yet witnessed
[SEALED]  ??? — not yet witnessed
```

The sealed events are visible as slots but not described — the ASI knows something significant hasn't happened yet, but not what. This creates curiosity without spoilers.

---

## 5. Credits — Personnel & Entity Registry

The credits are a PsiNet Personnel and Entity Registry — in exactly the same format as other Kernel data readouts.

```
PSISYS KERNEL — ENTITY REGISTRY
PROJECT: PROTO FUSION GIRL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE ENTITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JORDAN TRAÑA ................ Architect — real-world mission counterpart
                              PsiNet framework author, Universal Language

JONO THOʻRA ................. PsiNet architect — HoloDeck design lead
                              Timesight operator — Alpha timeline

JANE THOʻRA ................. PsiOps recruit — training cohort 7-alpha
                              Psionic lineage: Thoʻra Clan
                              Current timeline coherence: operational

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTRIBUTING OPERATORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[contributor name] .......... [role in equivalent in-world language]
[contributor name] .......... [role]
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL SUBSTRATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOLONET ENGINE .............. Phaser 3.x
PSISYS RUNTIME .............. TypeScript / Vite
TIMELINE SUBSTRATE ........... [other core libs]
OPERATOR CALLSIGN REGISTRY ... [save/storage tech]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACKNOWLEDGMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[acknowledgments in standard text, but still in Kernel aesthetic]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Your entire existence can be described mathematically.
 There exists a Universal Language."

 — Universal Language Foundational Axiom
   Jordan Traña, 2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[RETURN TO FIELD]
```

---

## 6. Visual Consistency — Meta Layer Rules

All meta-layer screens must follow:

- Same gunmetal background (`#0d0e10`) as the Kernel
- Same amber (`#FF8C00`) for labels and active elements
- Same off-white (`#f0ede8`) for body text
- Same monospace font (`'Courier New'`)
- Same `━━━` horizontal rules, same `[LABEL]` bracketing
- No gradients, no rounded corners, no drop shadows
- The HoloDeck view ALWAYS visible (at low opacity, desaturated) behind the Kernel overlay when in-session
- When accessed from the main entry (before projection), the HoloDeck view is absent — the Kernel is all there is

---

*Previous: [07 — State Changes](07-state-changes.md)*
*Next: [09 — Priority Plan](../build/09-priority-plan.md)*
