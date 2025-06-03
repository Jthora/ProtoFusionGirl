// TileInspector: UI and logic for inspecting and editing tile properties
import { TileRegistry, TileDefinition } from './TileRegistry';

export class TileInspector {
  private registry: TileRegistry;
  private inspectedTileId: string = '';

  constructor(registry: TileRegistry) {
    this.registry = registry;
  }

  inspect(tileId: string) {
    this.inspectedTileId = tileId;
  }

  getTileDefinition(): TileDefinition | undefined {
    return this.registry.getTile(this.inspectedTileId);
  }

  render(scene: Phaser.Scene) {
    const tile = this.getTileDefinition();
    const style = { font: '14px monospace', color: '#fff', backgroundColor: '#222', padding: { x: 6, y: 4 } };
    let y = 8;
    if (!tile) {
      scene.add.text(scene.scale.width - 220, y, 'No tile selected', style).setDepth(1000);
      return;
    }
    scene.add.text(scene.scale.width - 220, y, `Tile: ${tile.name} (${tile.id})`, style).setDepth(1000);
    y += 22;
    scene.add.text(scene.scale.width - 220, y, `Texture: ${tile.texture}`, style).setDepth(1000);
    y += 18;
    scene.add.text(scene.scale.width - 220, y, `Solid: ${tile.solid ? 'Yes' : 'No'}`, style).setDepth(1000);
    y += 18;
    scene.add.text(scene.scale.width - 220, y, `Destructible: ${tile.destructible ? 'Yes' : 'No'}`, style).setDepth(1000);
    // ...add more properties as needed
  }
}
