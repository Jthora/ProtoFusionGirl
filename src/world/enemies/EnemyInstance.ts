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
}
