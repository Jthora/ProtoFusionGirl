// EnemyRegistry: Central registry for all enemy types, mod support
import { EnemyDefinition } from './EnemyDefinition';
import { EnemyInstance } from './EnemyInstance';

export class EnemyRegistry {
  private enemies: Map<string, EnemyDefinition> = new Map();
  private modEnemySources: Record<string, string[]> = {};

  registerEnemy(enemy: EnemyDefinition, modId?: string) {
    this.enemies.set(enemy.id, enemy);
    if (modId) {
      if (!this.modEnemySources[modId]) this.modEnemySources[modId] = [];
      this.modEnemySources[modId].push(enemy.id);
    }
  }

  createEnemy(type: string, x: number, y: number): EnemyInstance | null {
    const definition = this.enemies.get(type);
    if (!definition) {
      console.warn(`Enemy type "${type}" not found in registry`);
      return null;
    }
    return new EnemyInstance(definition, x, y);
  }

  registerEnemiesFromMod(mod: { id: string, enemies: EnemyDefinition[] }) {
    if (!mod.enemies) return;
    for (const enemy of mod.enemies) {
      this.registerEnemy(enemy, mod.id);
    }
  }

  getEnemy(id: string): EnemyDefinition | undefined {
    return this.enemies.get(id);
  }

  getAllEnemies(): EnemyDefinition[] {
    return Array.from(this.enemies.values());
  }

  toJSON(): any {
    return {
      enemies: Array.from(this.enemies.values()),
      modEnemySources: this.modEnemySources
    };
  }

  fromJSON(data: any) {
    if (data?.enemies) {
      this.enemies = new Map(data.enemies.map((e: EnemyDefinition) => [e.id, e]));
    }
    if (data?.modEnemySources) {
      this.modEnemySources = data.modEnemySources;
    }
  }
}
