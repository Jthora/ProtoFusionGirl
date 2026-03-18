// CheckpointManager.ts
// Manages Jane's coherence collapse → timeline rollback system.
// Death is reframed as psionic bridge coherence collapse; respawn is a timeline
// rollback to the last placed anchor point.

import { EventBus } from '../core/EventBus';
import { CoherenceCollapseOverlay } from '../ui/CoherenceCollapseOverlay';

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
    // Show coherence collapse overlay, then perform the timeline rollback.
    CoherenceCollapseOverlay.show({
      anchorDescription: cp.id,
    }).then(() => {
      this.eventBus.emit({
        type: 'JANE_RESPAWN',
        data: { x: cp.x, y: cp.y, checkpointId: cp.id }
      });
      if (this.respawnCallback) {
        this.respawnCallback(cp.x, cp.y);
      }
    });
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
  }
}
