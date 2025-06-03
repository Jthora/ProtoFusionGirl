// CraftingRegistry: Central registry for all crafting recipes and items (moddable)
export interface CraftingRecipe {
  id: string;
  inputs: { item: string; quantity: number }[];
  output: { item: string; quantity: number };
  modId?: string;
}

export class CraftingRegistry {
  private recipes: Map<string, CraftingRecipe> = new Map();
  private modRecipeSources: Record<string, string[]> = {};

  registerRecipe(recipe: CraftingRecipe, modId?: string) {
    this.recipes.set(recipe.id, recipe);
    if (modId) {
      if (!this.modRecipeSources[modId]) this.modRecipeSources[modId] = [];
      this.modRecipeSources[modId].push(recipe.id);
    }
  }

  registerRecipesFromMod(mod: { id: string, recipes: CraftingRecipe[] }) {
    if (!mod.recipes) return;
    for (const recipe of mod.recipes) {
      this.registerRecipe(recipe, mod.id);
    }
  }

  getRecipe(id: string): CraftingRecipe | undefined {
    return this.recipes.get(id);
  }

  getAllRecipes(): CraftingRecipe[] {
    return Array.from(this.recipes.values());
  }

  toJSON(): any {
    return {
      recipes: Array.from(this.recipes.values()),
      modRecipeSources: this.modRecipeSources
    };
  }

  fromJSON(data: any) {
    if (data?.recipes) {
      this.recipes = new Map(data.recipes.map((r: CraftingRecipe) => [r.id, r]));
    }
    if (data?.modRecipeSources) {
      this.modRecipeSources = data.modRecipeSources;
    }
  }
}
