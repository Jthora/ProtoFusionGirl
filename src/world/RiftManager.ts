// RiftManager.ts
// Manages dimensional rifts: spawn at critical node stability, enemy waves, sealing, expansion.
// See: progress-tracker tasks 5311-5314

import { EventBus } from '../core/EventBus';

export interface Rift {
  id: string;
  nodeId: string;
  x: number;
  y: number;
  radius: number;
  enemiesSpawned: number;
  sealed: boolean;
  enemiesCleared: boolean;
  waveTimer: number; // ms until next wave
}

export interface RiftConfig {
  criticalStability: number; // node stability threshold to spawn rift (default 10)
  waveIntervalMs: number;   // ms between enemy waves
  waveSize: number;          // enemies per wave
  expansionRate: number;     // radius increase per second
  maxRadius: number;
}

export const DEFAULT_RIFT_CONFIG: RiftConfig = {
  criticalStability: 10,
  waveIntervalMs: 5000,
  waveSize: 3,
  expansionRate: 2,
  maxRadius: 200,
};

export class RiftManager {
  private eventBus: EventBus;
  private config: RiftConfig;
  private rifts: Map<string, Rift> = new Map();
  private nextRiftId: number = 1;

  constructor(eventBus: EventBus, config?: Partial<RiftConfig>) {
    this.eventBus = eventBus;
    this.config = { ...DEFAULT_RIFT_CONFIG, ...config };
  }

  /** Check if a rift should spawn at a node (called when stability changes) */
  checkNodeStability(nodeId: string, stability: number, x: number, y: number): Rift | null {
    // Don't spawn if already has rift
    for (const rift of this.rifts.values()) {
      if (rift.nodeId === nodeId && !rift.sealed) return null;
    }
    if (stability > this.config.criticalStability) return null;

    return this.spawnRift(nodeId, x, y);
  }

  /** Spawn a rift at a node */
  spawnRift(nodeId: string, x: number, y: number): Rift {
    const id = `rift_${this.nextRiftId++}`;
    const rift: Rift = {
      id, nodeId, x, y,
      radius: 30,
      enemiesSpawned: 0,
      sealed: false,
      enemiesCleared: false,
      waveTimer: this.config.waveIntervalMs,
    };
    this.rifts.set(id, rift);
    this.eventBus.emit({
      type: 'RIFT_SPAWNED',
      data: { riftId: id, nodeId, x, y }
    });
    return rift;
  }

  /** Update all rifts: enemy waves, expansion */
  update(dtMs: number): void {
    for (const rift of this.rifts.values()) {
      if (rift.sealed) continue;

      // Expansion
      if (rift.radius < this.config.maxRadius) {
        rift.radius = Math.min(this.config.maxRadius, rift.radius + (this.config.expansionRate * dtMs) / 1000);
        if (Math.floor(rift.radius) % 20 === 0) {
          this.eventBus.emit({
            type: 'RIFT_EXPANDED',
            data: { riftId: rift.id, newRadius: Math.round(rift.radius) }
          });
        }
      }

      // Enemy wave timer
      rift.waveTimer -= dtMs;
      if (rift.waveTimer <= 0) {
        rift.waveTimer = this.config.waveIntervalMs;
        rift.enemiesSpawned += this.config.waveSize;
        this.eventBus.emit({
          type: 'RIFT_ENEMY_WAVE',
          data: { riftId: rift.id, enemyType: 'nefarium_phantom', count: this.config.waveSize }
        });
      }
    }
  }

  /** Mark that all enemies from a rift have been cleared */
  markEnemiesCleared(riftId: string): void {
    const rift = this.rifts.get(riftId);
    if (rift) rift.enemiesCleared = true;
  }

  /** Attempt to seal a rift (requires enemies cleared + correct UL symbol) */
  sealRift(riftId: string, sealedBy: string): boolean {
    const rift = this.rifts.get(riftId);
    if (!rift || rift.sealed) return false;
    if (!rift.enemiesCleared) return false;

    rift.sealed = true;
    this.eventBus.emit({
      type: 'RIFT_SEALED',
      data: { riftId: rift.id, nodeId: rift.nodeId, sealedBy }
    });
    return true;
  }

  /** Force-seal a rift (e.g., for UL puzzle override when enemies cleared) */
  forceSeal(riftId: string, sealedBy: string): boolean {
    const rift = this.rifts.get(riftId);
    if (!rift || rift.sealed) return false;
    rift.sealed = true;
    rift.enemiesCleared = true;
    this.eventBus.emit({
      type: 'RIFT_SEALED',
      data: { riftId: rift.id, nodeId: rift.nodeId, sealedBy }
    });
    return true;
  }

  getRift(id: string): Rift | undefined {
    return this.rifts.get(id);
  }

  getActiveRifts(): Rift[] {
    return Array.from(this.rifts.values()).filter(r => !r.sealed);
  }

  getRiftAtNode(nodeId: string): Rift | undefined {
    return Array.from(this.rifts.values()).find(r => r.nodeId === nodeId && !r.sealed);
  }

  destroy(): void {
    this.rifts.clear();
  }
}
