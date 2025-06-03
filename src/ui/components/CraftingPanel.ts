// CraftingPanel: Simple UI for crafting (shows available recipes, allows crafting if player has ingredients)
import type { CraftingRegistry } from '../../world/crafting/CraftingRegistry';
import type { CraftingService } from '../../world/crafting/CraftingService';

export class CraftingPanel {
  private registry: CraftingRegistry;
  private service: CraftingService;
  private onCraft: (recipeId: string) => void;

  constructor(registry: CraftingRegistry, service: CraftingService, onCraft: (recipeId: string) => void) {
    this.registry = registry;
    this.service = service;
    this.onCraft = onCraft;
  }

  render(scene: Phaser.Scene) {
    const recipes = this.registry.getAllRecipes();
    let y = 60;
    for (const recipe of recipes) {
      const canCraft = this.service.canCraft(recipe.id);
      const txt = `${recipe.id}: ${recipe.inputs.map(i => `${i.quantity}x ${i.item}`).join(' + ')} → ${recipe.output.quantity}x ${recipe.output.item}`;
      const color = canCraft ? '#fff' : '#888';
      const textObj = scene.add.text(20, y, txt, { font: '16px monospace', color }).setDepth(1000);
      if (canCraft) {
        textObj.setInteractive().on('pointerdown', () => this.onCraft(recipe.id));
      }
      y += 28;
    }
  }
}
