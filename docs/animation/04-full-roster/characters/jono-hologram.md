# Jono Hologram — Character Spec

## Role

The Jono Hologram is an NPC guide character. Jono appears as a
semi-transparent projection — helpful, wise, occasionally cryptic.
Appears at proximity triggers to deliver guidance and context.

In-game, the hologram effect is achieved via:
- Phaser sprite alpha: 0.6 (semi-transparent)
- Phaser tint: `0x00e5ff` (cyan tint over the silhouette)
- Optional scanline overlay particle effect (see Stage 6)

The sprite itself is a standard black silhouette —
the hologram appearance comes from runtime Phaser effects.

---

## Visual Spec

**Body proportions**: 5.5 heads tall (adult male, similar height to Jane)

**Silhouette distinguishers**:
- Casual stance (not combat-ready)
- Short tousled hair
- Relaxed clothing silhouette (not armored)
- Slight forward lean when talking (gesturing)

**Meshy.ai Prompt:**
```
casual male humanoid in a simple jumpsuit,
T-pose, game-ready character, short tousled hair,
relaxed build, no armor, open stance
```

**Negative prompt:**
```
armor, weapons, helmet, ponytail, bulky, exosuit
```

---

## Animation List

Jono is stationary — no locomotion animations needed. Only expressive poses.

| Key | Mixamo Search | Loop | Notes |
|-----|---------------|------|-------|
| `jono_idle` | "breathing idle" | Yes | Calm standing presence |
| `jono_talk` | "talking" or "speaking gesture" | Yes | Loop while delivering dialogue |
| `jono_point` | "pointing gesture" | No | Single directional point |
| `jono_wave` | "wave hello" or "wave goodbye" | No | Greeting / dismissal |
| `jono_think` | "thinking" or "head scratch" | No | Considering before response |
| `jono_disappear` | "vanish" — custom, see below | No | Hologram fade-out |

### jono_disappear

No Mixamo animation for this — it's handled programmatically:
1. Phaser Tween: `alpha: 0` over 500ms
2. While fading, add a "glitch" sprite effect (rapid alpha flicker 1-0-1-0)
3. No sprite animation needed — the disappear is pure Phaser effect

So `jono_disappear` can simply reuse `jono_idle` while the Phaser
tween handles the fade. No Blender render needed for this one.

---

## Render Spec

| Key | FPS | Frames |
|-----|-----|--------|
| `jono_idle` | 6 | 6 |
| `jono_talk` | 8 | 12 |
| `jono_point` | 10 | 8 |
| `jono_wave` | 10 | 12 |
| `jono_think` | 8 | 12 |

Total: 50 frames — smallest atlas of any character.

---

## Blender File

Save as: `assets-src/jono/jono.blend`

Same camera and silhouette settings as all other characters.

---

## GameScene Integration

Jono is managed by `JonoHologram` (`src/ai/JonoHologram.ts` — already exists).

```typescript
// In GameScene preload():
this.load.atlas('jono', 'assets/sprites/jono/jono_atlas.png',
                         'assets/sprites/jono/jono_atlas.json');

// Jono sprite is hidden by default; shown when triggered
const jonoSprite = this.add.sprite(0, 0, 'jono');
jonoSprite.setAlpha(0);
jonoSprite.setTint(0x00e5ff);  // cyan hologram tint

// When JonoHologram proximity triggers:
this.eventBus.on('JONO_APPEAR', (event) => {
  const pos = event.data.position;
  jonoSprite.setPosition(pos.x, pos.y);
  jonoSprite.setAlpha(0.6);
  jonoSprite.play('jono_idle');
});

this.eventBus.on('JONO_ANIMATION_CHANGED', (event) => {
  jonoSprite.play(event.data.animationKey);
});

this.eventBus.on('JONO_DISAPPEAR', () => {
  this.tweens.add({
    targets: jonoSprite,
    alpha: 0,
    duration: 500,
    ease: 'Linear',
    onComplete: () => jonoSprite.stop()
  });
});
```

---

## Dialogue System Integration

When `jono_talk` plays, the dialogue text is shown in the UI alongside.
The talking animation loops until the dialogue line is complete, then
transitions back to `jono_idle`.

```
JONO_APPEAR → play jono_idle
JONO_SPEAK_START → play jono_talk (loop)
JONO_SPEAK_END → play jono_idle
JONO_POINT → play jono_point (once) → jono_idle
JONO_DISAPPEAR → fade out (no new animation)
```
