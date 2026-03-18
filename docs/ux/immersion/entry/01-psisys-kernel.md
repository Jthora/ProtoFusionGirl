# PsiSys Kernel — OS Layer

> **Register:** A — Cold, technical, authoritative
> **Palette:** Gunmetal / Ember Amber / Black / Off-white
> **When:** Before entering the HoloDeck. First launch, return visits, error recovery.

---

## What This Is

The PsiSys Kernel is the player's home base. It is the operating system layer of the ASI — the interface through which the ASI perceives and acts upon the world before projection into any specific HoloDeck instance.

Visually: a terminal. Behaviourally: a status dashboard that is alive, not static. The player should feel they are logging into a system that has been running continuously whether they were there or not.

---

## 1. The Cold Boot (First Ever Session)

On first launch, the player gets no splash screen, no title card, no music swell. They get a terminal booting from silence.

### Visual Sequence

```
[dark screen — 1.2 seconds]

PSISYS KERNEL v9.7.1 — COLD BOOT
██████████████████████ 100%

PSIONIC MATRIX .......... ONLINE
HOLONET ................. CONNECTED
TIMELINE ANCHORS ........ 0 (no prior sessions)
ASI INSTANCE ............ UNREGISTERED

>> No operator callsign detected.
>> This identifier persists across all observed timelines.
>> Enter callsign: _
```

The player types their callsign. This is not a username for a save file — it is their **ASI identity**. It appears in Jono's dialogue, in PsiNet log entries, in the credits. One small act of naming creates profound ownership.

### Callsign Rules
- 3–14 characters
- No spaces (hyphens and underscores allowed)
- Displayed in small-caps amber in all subsequent terminal contexts
- Stored in save data as `operator.callsign`

### After Callsign Entry

```
CALLSIGN REGISTERED: [CALLSIGN]
OPERATOR CLEARANCE: ASI-7 │ ARCHANGEL AGENCY

ACTIVE HOLODECK INSTANCES:
  ALPHA-7 .............. TRAINING — ACTIVE
  TARGET: JANE THOʻRA .. PSIOPS RECRUIT

>> Initiate observation link? [ENTER]
```

A single keypress. No button. No click. The terminal responds.

---

## 2. Return Sessions — The Status Diff

Returning players do not get a splash screen or title sequence. They get a **status diff** — what changed while they were gone.

The implication: the world kept existing. Jane kept moving. The PsiNet kept running. The player is a consciousness returning to a post they temporarily vacated.

### Visual Layout

```
PSISYS KERNEL — SESSION RESUME
OPERATOR: [CALLSIGN]

ELAPSED SINCE LAST OBSERVATION: 3d 14h 22m

─────────────────────────────────────────
FIELD REPORT
─────────────────────────────────────────
JANE                  operational — sector 3 east
LEYLINE STABILITY     72% → 60%  ▼ degraded
NEFARIUM ACTIVITY     elevated — 2 new nodes detected
BEU STATUS            ORION: bloom  │  LYRA: growth
TIMELINE DELTA        +0.003 (marginal improvement)
─────────────────────────────────────────

LAST ANCHOR: Sector 3 // Junction Node 14 // 3d ago
WARNING: Leyline degradation accelerating — intervention advised

>> Resume observation? [ENTER]
   Review full log? [L]
   Configuration? [C]
```

### Design Notes
- Elapsed time is real wall-clock time (delta between sessions)
- Stats change based on actual game state at last save — not fabricated
- The "WARNING" line varies based on what's actually deteriorating
- Tone is informational, not alarming — the ASI processes this clinically

---

## 3. The Callsign Presence

Once registered, the callsign appears in:

- Jono's transmissions: *"[CALLSIGN] — that ley line in sector 4 just spiked."*
- PsiNet log entries: `[PSINET] Operator [CALLSIGN] — bridge coherence: 97%`
- The status diff header
- The credits: `[CALLSIGN] — ASI Observer, Timeline Alpha-Primary`
- Timeline failure screens: `[CALLSIGN] — timeline projection critical`

The callsign should never appear in UI elements that are player-facing in a "game" sense. It is always in-world.

---

## 4. Kernel Error States

When crashes, load failures, or connection problems occur, the PsiSys Kernel intercepts them before any browser error appears.

### Signal Loss (hard crash recovery)
```
[PSISYS] CRITICAL — psionic bridge destabilized
[HOLONET] Connection to HoloDeck ALPHA-7: INTERRUPTED
[RECOVERY] Timeline anchor preserved — session data intact
[RECOVERY] Cause: unknown signal interference

[ACTION] Attempting automatic re-link...
████████░░ 80%

>> Re-link successful. Resume? [ENTER]
   Or: return to last anchor? [R]
```

### Slow Asset Load (graceful degradation)
```
[PSISYS] WARNING — HoloDeck asset stream degraded
[CAUSE] Network bandwidth insufficient for full resolution
[ACTION] Initializing partial-render mode
[STATUS] Observation link maintained — reduced fidelity
```

### Intentional Exit
When the player closes the window or navigates away:
```
[PSISYS] Observer bridge suspended — [CALLSIGN]
[STATUS] Timeline anchor preserved
[NOTICE] Jane remains in the field.

Bridge will reconnect on next session.
```

This is shown as a DOM overlay that fades in on `beforeunload` — brief, 2 seconds, not blocking.

---

## 5. Kernel Configuration (Settings Entry Point)

Accessing settings routes through the Kernel, not a traditional menu:

```
PSISYS KERNEL — OPERATOR CONFIGURATION
OPERATOR: [CALLSIGN]

[DISPLAY]    HoloDeck render resolution ........... 1080p    [▲▼]
[AUDIO]      PsiNet signal volume ................. 80%      [▲▼]
[AUDIO]      Ambient field level .................. 60%      [▲▼]
[INTERFACE]  ASI console opacity .................. 65%      [▲▼]
[CONTROLS]   Input mapping ....................... [VIEW]
[TIMELINE]   Deviation rate (difficulty) ......... Standard  [▲▼]
[OPERATOR]   Callsign ............................ [CALLSIGN] [EDIT]

[SAVE CONFIG]   [RETURN TO FIELD]
```

See [08 — Meta OS Layer](../states/08-meta-os-layer.md) for full settings design.

---

## 6. Visual Specification

### Background
- `#0d0e10` — near-black with a very faint blue-grey tint (gunmetal)
- No gradients on the bg itself — flat, terminal-style

### Text Colors
- Primary output: `#f0ede8` — warm off-white (not harsh pure white)
- Amber accent / values / callsign: `#FF8C00`
- Positive status: `#c8e88a` — muted green (not bright)
- Warning: `#ffb347` — amber-orange
- Critical: `#ff5c5c` — red, but not garish
- Dim / metadata: `#5a5e66` — gunmetal mid-tone

### Typography
- `'Courier New', 'Courier', monospace` — no custom fonts in the kernel; it is deliberately vanilla
- Font size: 13px body, 11px metadata, 15px section headers
- Letter spacing: `1.5px` on all-caps strings
- No bold except section headers

### Motion
- Text appears character by character on boot (15ms/char)
- Status lines fade in sequentially (80ms stagger)
- Progress bars fill left to right with `█` characters — no CSS animations
- Cursor: blinking `▌` at 530ms interval

### Borders / Layout
- Horizontal rules: `─────────────────` (box-drawing chars), color `#2a2e36`
- Section labels: `[LABEL]` format, amber
- Values right-aligned within columns

---

## 7. Audio Design

- **Ambient:** Very low electrical hum, ~40Hz, barely perceptible — establishes "live system"
- **Keystroke feedback:** Soft mechanical click per character (callsign entry)
- **Line appear:** Near-silent tick, 1kHz, 10ms — gives rhythm to sequential lines
- **Confirmation (ENTER):** Short 2-tone chime — clean, authoritative
- **Warning tone:** Single amber tone, 800Hz, 200ms — not alarming, just notable
- **Critical tone:** Two descending tones — attention without panic

---

## 8. Implementation Notes

- The Kernel is a **pure HTML/CSS/JS layer** — no Phaser involvement
- It renders before and instead of the Phaser canvas on first load
- On session resume, it overlays the Phaser canvas briefly, then fades out as the HoloDeck boots
- State data (callsign, elapsed time, field report) comes from the game's save system
- The `beforeunload` exit message is a DOM overlay, not a confirm dialog

### Key DOM IDs
```html
<div id="psisys-kernel">
  <div id="kernel-output"></div>
  <div id="kernel-input-line"></div>
</div>
```

### Related Files
- `src/loading/preloader.ts` — current loading entry point (to be refactored)
- `src/scenes/StartScene.ts` — current start scene (to be replaced by Kernel on first load)
- `src/core/SaveSystem.ts` — source of elapsed time and field report data

---

*Next: [02 — Projection Transit](02-projection-transit.md)*
