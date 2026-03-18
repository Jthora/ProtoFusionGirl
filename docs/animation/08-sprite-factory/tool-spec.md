# Sprite Factory Tool Specification

Technical specification for the Sprite Factory developer tool.

---

## Architecture

```
tools/sprite-factory/
  index.html               Entry point
  src/
    main.ts                Entry — initializes Phaser + sidebar
    SpriteFactoryScene.ts  Phaser preview scene
    CatalogLoader.ts       Loads sprite-catalog.json + atlas JSONs
    SidebarUI.ts           HTML sidebar controller
    AnimationInspector.ts  Frame-by-frame inspection view
  vite.config.ts           Port 4567, proxies /public → main game assets
```

---

## CatalogLoader

```typescript
// src/CatalogLoader.ts

export interface AnimationEntry {
  key: string;
  fps: number;
  frames: number;
  loop: boolean;
  hold_last: boolean;
}

export interface CharacterEntry {
  id: string;
  atlasKey: string;
  atlasUrl: string;
  atlasJsonUrl: string;
  animations: AnimationEntry[];
}

export class CatalogLoader {
  async load(): Promise<CharacterEntry[]> {
    const catalog = await fetch('/scripts/sprite-catalog.json').then(r => r.json());
    const entries: CharacterEntry[] = [];

    for (const [charId, config] of Object.entries(catalog.characters)) {
      const atlasJsonUrl = `/${config.output_dir}/${config.atlas_name}.json`;

      try {
        const atlasJson = await fetch(atlasJsonUrl).then(r => r.json());
        const pfgAnims = atlasJson.meta?.pfg?.animations ?? {};

        entries.push({
          id: charId,
          atlasKey: charId,
          atlasUrl: `/${config.output_dir}/${config.atlas_name}.png`,
          atlasJsonUrl,
          animations: config.animations.map(anim => ({
            key: anim.key,
            fps: anim.fps,
            frames: Object.keys(pfgAnims[anim.key]?.frames ?? {}).length,
            loop: anim.loop,
            hold_last: anim.hold_last,
          }))
        });
      } catch {
        console.warn(`Skipping ${charId} — atlas not yet rendered`);
      }
    }

    return entries;
  }
}
```

---

## SpriteFactoryScene

```typescript
// src/SpriteFactoryScene.ts

export class SpriteFactoryScene extends Phaser.Scene {
  private previewSprite!: Phaser.GameObjects.Sprite;
  private currentCharacter = 'jane';
  private frameCounter!: Phaser.GameObjects.Text;
  private fpsDisplay!: Phaser.GameObjects.Text;

  constructor(private catalog: CharacterEntry[]) {
    super('SpriteFactory');
  }

  preload() {
    for (const char of this.catalog) {
      this.load.atlas(char.atlasKey, char.atlasUrl, char.atlasJsonUrl);
    }
  }

  create() {
    // Checkerboard background (shows alpha clearly)
    this.add.grid(400, 300, 800, 600, 16, 16, 0xdddddd, 1, 0xffffff, 1);

    // Preview sprite, centered, scaled up for visibility
    this.previewSprite = this.add.sprite(400, 300, 'jane')
      .setScale(2);

    // Info overlay
    this.frameCounter = this.add.text(10, 10, '', {
      font: '14px monospace', color: '#000000'
    });
    this.fpsDisplay = this.add.text(10, 30, '', {
      font: '14px monospace', color: '#000000'
    });

    // Listen for selection events from sidebar
    window.addEventListener('pfg:select-animation', (e: CustomEvent) => {
      this.playAnimation(e.detail.character, e.detail.animKey, e.detail.fps);
    });
  }

  playAnimation(charId: string, animKey: string, fps: number) {
    if (this.currentCharacter !== charId) {
      this.previewSprite.setTexture(charId);
      this.currentCharacter = charId;
    }

    // Register animation if not already registered
    if (!this.anims.exists(animKey)) {
      const atlasJson = this.cache.json.get(charId);
      const frameKeys = Object.keys(atlasJson.frames)
        .filter(k => k.startsWith(animKey + '_'))
        .sort();

      this.anims.create({
        key: animKey,
        frames: frameKeys.map(key => ({ key: charId, frame: key })),
        frameRate: fps,
        repeat: -1,
      });
    }

    this.previewSprite.play(animKey, true);
  }

  update() {
    const anim = this.previewSprite.anims;
    if (anim.isPlaying) {
      this.frameCounter.setText(
        `Frame: ${anim.currentFrame?.index ?? 0} / ${anim.currentAnim?.frames.length ?? 0}`
      );
      this.fpsDisplay.setText(`FPS: ${anim.currentAnim?.frameRate ?? 0}`);
    }
  }
}
```

---

## SidebarUI

```typescript
// src/SidebarUI.ts

export class SidebarUI {
  constructor(private catalog: CharacterEntry[]) {
    this.render();
  }

  private render() {
    const sidebar = document.getElementById('sidebar')!;

    // Character tabs
    const tabs = document.createElement('div');
    tabs.className = 'char-tabs';
    for (const char of this.catalog) {
      const tab = document.createElement('button');
      tab.textContent = char.id;
      tab.onclick = () => this.showCharacter(char.id);
      tabs.appendChild(tab);
    }
    sidebar.appendChild(tabs);

    // Animation list (updated per character)
    const animList = document.createElement('div');
    animList.id = 'anim-list';
    sidebar.appendChild(animList);

    // Show first character by default
    if (this.catalog.length > 0) {
      this.showCharacter(this.catalog[0].id);
    }
  }

  private showCharacter(charId: string) {
    const char = this.catalog.find(c => c.id === charId);
    if (!char) return;

    const animList = document.getElementById('anim-list')!;
    animList.innerHTML = '';

    for (const anim of char.animations) {
      const row = document.createElement('div');
      row.className = 'anim-row';
      row.innerHTML = `
        <span class="anim-key">${anim.key}</span>
        <span class="anim-meta">${anim.fps}fps · ${anim.frames}fr · ${anim.loop ? '↻' : '→'}</span>
      `;
      row.onclick = () => {
        window.dispatchEvent(new CustomEvent('pfg:select-animation', {
          detail: { character: charId, animKey: anim.key, fps: anim.fps }
        }));
        document.querySelectorAll('.anim-row').forEach(r => r.classList.remove('active'));
        row.classList.add('active');
      };
      animList.appendChild(row);
    }
  }
}
```

---

## vite.config.ts

```typescript
// tools/sprite-factory/vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4567,
    proxy: {
      // Proxy /public and /scripts to main project
      '/public': {
        target: 'http://localhost:5173',
        changeOrigin: true
      },
      '/scripts': {
        target: 'http://localhost:5173',
        changeOrigin: true
      }
    }
  }
});
```

**Alternative**: Point the root directly at the parent project:
```typescript
root: '../../',  // repo root
```
Then serve from `localhost:4567/tools/sprite-factory/index.html`.
This avoids the proxy and directly serves all project files.

---

## npm Script

Add to root `package.json`:
```json
{
  "scripts": {
    "sprite-factory": "vite --config tools/sprite-factory/vite.config.ts"
  }
}
```

Usage:
```bash
npm run sprite-factory
# Open http://localhost:4567
```
