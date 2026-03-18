// SidebarUI.ts — sidebar character tabs + animation list.
import type { CharacterEntry } from './CatalogLoader';

export class SidebarUI {
  private activeCharId = '';

  constructor(private catalog: CharacterEntry[]) {
    this.render();
  }

  private render(): void {
    const tabsEl = document.getElementById('char-tabs')!;

    for (const char of this.catalog) {
      const tab = document.createElement('button');
      tab.textContent = char.id;
      tab.dataset.charId = char.id;
      tab.addEventListener('click', () => this.showCharacter(char.id));
      tabsEl.appendChild(tab);
    }

    if (this.catalog.length > 0) {
      this.showCharacter(this.catalog[0].id);
    }
  }

  private showCharacter(charId: string): void {
    this.activeCharId = charId;

    // Update tab highlights
    document.querySelectorAll<HTMLButtonElement>('#char-tabs button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.charId === charId);
    });

    const char = this.catalog.find(c => c.id === charId);
    if (!char) return;

    const animList = document.getElementById('anim-list')!;
    animList.innerHTML = '';

    for (const anim of char.animations) {
      const row = document.createElement('div');
      row.className = 'anim-row';
      const loopIcon = anim.loop ? '↻' : (anim.hold_last ? '⏸' : '→');
      row.innerHTML = `
        <span class="anim-key">${anim.key}</span>
        <span class="anim-meta">${anim.fps}fps · ${anim.frames}fr · ${loopIcon}</span>
      `;
      row.addEventListener('click', () => {
        document.querySelectorAll('.anim-row').forEach(r => r.classList.remove('active'));
        row.classList.add('active');
        window.dispatchEvent(new CustomEvent('pfg:select-animation', {
          detail: { character: charId, animKey: anim.key, fps: anim.fps },
        }));
      });
      animList.appendChild(row);
    }
  }
}
