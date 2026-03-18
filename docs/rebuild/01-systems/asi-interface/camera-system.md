# System: Camera System

> Dual-mode camera supporting god-view (strategic) and shoulder-cam (experiential).

## Full Vision

### God-View (Default)
- Strategic overhead perspective — the natural state of the ASI
- Shows terrain, enemies, allies, ley line overlays, threat indicators
- Camera height adjusts with speed gear (already implemented in speed tier system)
- ASI information overlays visible: threat halos, waypoint markers, faction indicators
- Can zoom in/out independently of speed gear for inspection

### Shoulder-Cam (Toggle)
- Third-person camera locked behind Jane
- Experiential perspective — feel what Jane feels
- ASI overlays reduced to minimal HUD (trust meter, active guidance)
- Information asymmetry becomes FELT: player loses omniscient view, gains Jane's limited awareness
- Useful for: understanding Jane's decisions, experiencing combat viscerally, emotional moments

### Transition
- Single keypress or gesture toggles between modes
- Smooth zoom animation: god-view → pull in → settle behind Jane (and reverse)
- Camera state persists through scene transitions (if in shoulder-cam, stays there)

## Existing Code

- `src/navigation/`: Camera zoom already coupled to speed tiers
- `SpeederController.ts`: Camera follow behavior exists
- Speed system already handles extreme zoom ranges (0.02 at hypersonic)

## Prototype Slice

- **God-view only** for initial implementation
- Camera zoom follows existing speed tier system
- **Shoulder-cam toggle**: Add as P3 or P4 feature once Jane AI is functional
- Rationale: Shoulder-cam requires Jane's autonomous behavior to be interesting. Without autonomy, it's just a different camera angle with no gameplay value.

## Technical Notes

- Phaser camera can lerp between zoom levels and follow targets smoothly
- God-view is current default behavior with speed-reactive zoom
- Shoulder-cam: Set camera zoom to ~1.0, lock follow to Jane sprite with offset
- UI overlay visibility can be toggled via a flag in UIManager
