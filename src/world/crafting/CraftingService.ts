// CraftingService: Handles crafting actions, inventory checks, and recipe validation
import type { CraftingRegistry, CraftingRecipe } from './CraftingRegistry';

export class CraftingService {
  private registry: CraftingRegistry;
  private getPlayerInventory: () => Record<string, number>;
  private updatePlayerInventory: (changes: Record<string, number>) => void;

  constructor(registry: CraftingRegistry, getPlayerInventory: () => Record<string, number>, updatePlayerInventory: (changes: Record<string, number>) => void) {
    this.registry = registry;
    this.getPlayerInventory = getPlayerInventory;
    this.updatePlayerInventory = updatePlayerInventory;
  }

  canCraft(recipeId: string): boolean {
    const recipe = this.registry.getRecipe(recipeId);
    if (!recipe) return false;
    const inv = this.getPlayerInventory();
    for (const input of recipe.inputs) {
      if ((inv[input.item] || 0) < input.quantity) return false;
    }
    return true;
  }

  craft(recipeId: string): boolean {
    if (!this.canCraft(recipeId)) return false;
    const recipe = this.registry.getRecipe(recipeId);
    if (!recipe) return false;
    // Remove inputs
    const changes: Record<string, number> = {};
    for (const input of recipe.inputs) {
      changes[input.item] = (changes[input.item] || 0) - input.quantity;
    }
    // Add output
    changes[recipe.output.item] = (changes[recipe.output.item] || 0) + recipe.output.quantity;
    this.updatePlayerInventory(changes);
    return true;
  }
}
