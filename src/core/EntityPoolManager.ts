// EntityPoolManager.ts
// Caps active game entities and recycles deactivated ones via a simple pool.
// Task 7432 — Performance & Polish (P5.7)

import { EventBus } from './EventBus';

export interface PoolableEntity {
  id: string;
  active: boolean;
  /** Reset entity to a fresh reusable state */
  reset(): void;
}

export interface EntityPoolConfig {
  /** Hard cap on simultaneously active entities (default 30) */
  maxActive?: number;
  /** Maximum idle entities kept in pool (default 50) */
  maxPoolSize?: number;
}

const DEFAULT_CONFIG: Required<EntityPoolConfig> = {
  maxActive: 30,
  maxPoolSize: 50,
};

export class EntityPoolManager<T extends PoolableEntity = PoolableEntity> {
  private active: Map<string, T> = new Map();
  private pool: T[] = [];
  private config: Required<EntityPoolConfig>;
  private eventBus?: EventBus;

  constructor(config?: EntityPoolConfig, eventBus?: EventBus) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.eventBus = eventBus;
  }

  /** Try to activate an entity. Returns false if cap reached. */
  activate(entity: T): boolean {
    if (this.active.size >= this.config.maxActive) {
      return false;
    }
    entity.active = true;
    this.active.set(entity.id, entity);
    return true;
  }

  /** Deactivate entity and return it to the pool for reuse. */
  deactivate(id: string): void {
    const entity = this.active.get(id);
    if (!entity) return;
    entity.active = false;
    entity.reset();
    this.active.delete(id);
    if (this.pool.length < this.config.maxPoolSize) {
      this.pool.push(entity);
    }
  }

  /** Acquire a recycled entity from the pool, or null if empty. */
  acquire(): T | null {
    if (this.pool.length === 0) return null;
    return this.pool.pop()!;
  }

  /** Get a snapshot count of active entities. */
  getActiveCount(): number {
    return this.active.size;
  }

  /** Get number of entities waiting in the pool. */
  getPoolSize(): number {
    return this.pool.length;
  }

  getMaxActive(): number {
    return this.config.maxActive;
  }

  /** Perform a batch cull: deactivate entities that match the predicate. */
  cullWhere(predicate: (entity: T) => boolean): number {
    let culled = 0;
    for (const [id, entity] of this.active) {
      if (predicate(entity)) {
        this.deactivate(id);
        culled++;
      }
    }
    if (culled > 0 && this.eventBus) {
      this.eventBus.emit({ type: 'ENTITY_POOL_CULL' as any, data: { culled } });
    }
    return culled;
  }

  /** Iterate active entities (read-only snapshot). */
  forEachActive(fn: (entity: T) => void): void {
    for (const entity of this.active.values()) {
      fn(entity);
    }
  }

  clear(): void {
    this.active.clear();
    this.pool.length = 0;
  }
}
