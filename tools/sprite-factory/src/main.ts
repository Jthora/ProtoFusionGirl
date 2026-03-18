// main.ts — Sprite Factory entry point.
// Loads catalog, creates Phaser preview + HTML sidebar.
import Phaser from 'phaser';
import { CatalogLoader } from './CatalogLoader';
import { SpriteFactoryScene } from './SpriteFactoryScene';
import { SidebarUI } from './SidebarUI';

async function init() {
  const loader = new CatalogLoader();
  const catalog = await loader.load();

  if (catalog.length === 0) {
    document.getElementById('info-overlay')!.textContent =
      'No rendered atlases found. Run: npm run sprites';
    return;
  }

  const scene = new SpriteFactoryScene(catalog);

  new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#0d0d1a',
    parent: 'phaser-container',
    scene: [scene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });

  new SidebarUI(catalog);
}

init().catch(console.error);
