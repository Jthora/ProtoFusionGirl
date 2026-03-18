// CheckpointManager.ts
// Manages Jane's death → respawn checkpoint system for P2.
// See: docs/rebuild/02-prototype/build-sequence.md

import { EventBus } from '../core/EventBus';

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
}

export class CheckpointManager {
  private eventBus: EventBus;
  private activeCheckpoint: Checkpoint;
  private unsubscribers: (() => void)[] = [];
  private respawnCallback?: (x: number, y: number) => void;

  constructor(
    eventBus: EventBus,
    defaultCheckpoint: Checkpoint,
    respawnCallback?: (x: number, y: number) => void
  ) {
    this.eventBus = eventBus;
    this.activeCheckpoint = { ...defaultCheckpoint };
    this.respawnCallback = respawnCallback;

    this.unsubscribers.push(
      this.eventBus.on('JANE_DEFEATED', () => {
        this.onDeath();
      })
    );
  }

  setCheckpoint(checkpoint: Checkpoint): void {
    this.activeCheckpoint = { ...checkpoint };
    this.eventBus.emit({
      type: 'CHECKPOINT_SET',
      data: { checkpointId: checkpoint.id, x: checkpoint.x, y: checkpoint.y }
    });
  }

  getActiveCheckpoint(): Checkpoint {
    return { ...this.activeCheckpoint };
  }

  private onDeath(): void {
    const cp = this.activeCheckpoint;
    this.eventBus.emit({
      type: 'JANE_RESPAWN',
      data: { x: cp.x, y: cp.y, checkpointId: cp.id }
    });
    if (this.respawnCallback) {
      this.respawnCallback(cp.x, cp.y);
    }
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
  }
}
