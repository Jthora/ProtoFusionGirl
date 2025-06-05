// EnemyInstance: Runtime state for an enemy in the world
import { EnemyDefinition } from './EnemyDefinition';

export class EnemyInstance {
  definition: EnemyDefinition;
  health: number;
  x: number;
  y: number;
  isAlive: boolean = true;

  constructor(def: EnemyDefinition, x: number, y: number) {
    this.definition = def;
    this.health = def.maxHealth;
    this.x = x;
    this.y = y;
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
    }
  }

  setPosition(x: number, y: number) {
    // Wrap x for seamless world torus
    this.x = require('../tilemap/TilemapManager').TilemapManager.wrapX(x);
    this.y = y;
  }

  getToroidalDistanceX(otherX: number): number {
    return require('../tilemap/TilemapManager').TilemapManager.toroidalDistanceX(this.x, otherX);
  }
}
