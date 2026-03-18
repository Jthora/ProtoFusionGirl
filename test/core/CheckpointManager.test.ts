import { CheckpointManager } from '../../src/core/CheckpointManager';
import { EventBus } from '../../src/core/EventBus';

describe('CheckpointManager', () => {
  let eventBus: EventBus;
  let checkpointManager: CheckpointManager;
  let respawnCalls: { x: number; y: number }[];

  beforeEach(() => {
    eventBus = new EventBus();
    respawnCalls = [];
    checkpointManager = new CheckpointManager(
      eventBus,
      { id: 'spawn', x: 100, y: 200 },
      (x, y) => respawnCalls.push({ x, y })
    );
  });

  afterEach(() => {
    checkpointManager.destroy();
  });

  it('initializes with default checkpoint', () => {
    const cp = checkpointManager.getActiveCheckpoint();
    expect(cp).toEqual({ id: 'spawn', x: 100, y: 200 });
  });

  it('updates checkpoint on setCheckpoint', () => {
    checkpointManager.setCheckpoint({ id: 'base', x: 400, y: 300 });
    expect(checkpointManager.getActiveCheckpoint()).toEqual({ id: 'base', x: 400, y: 300 });
  });

  it('emits CHECKPOINT_SET on setCheckpoint', () => {
    const events: any[] = [];
    eventBus.on('CHECKPOINT_SET', (e) => events.push(e.data));

    checkpointManager.setCheckpoint({ id: 'node2', x: 500, y: 100 });
    expect(events).toEqual([{ checkpointId: 'node2', x: 500, y: 100 }]);
  });

  it('respawns at checkpoint on JANE_DEFEATED', () => {
    const respawns: any[] = [];
    eventBus.on('JANE_RESPAWN', (e) => respawns.push(e.data));

    eventBus.emit({ type: 'JANE_DEFEATED', data: {} });

    expect(respawns).toEqual([{ x: 100, y: 200, checkpointId: 'spawn' }]);
    expect(respawnCalls).toEqual([{ x: 100, y: 200 }]);
  });

  it('respawns at updated checkpoint after change', () => {
    checkpointManager.setCheckpoint({ id: 'safe', x: 999, y: 888 });
    eventBus.emit({ type: 'JANE_DEFEATED', data: {} });

    expect(respawnCalls).toEqual([{ x: 999, y: 888 }]);
  });

  it('does not respond to JANE_DEFEATED after destroy', () => {
    checkpointManager.destroy();
    eventBus.emit({ type: 'JANE_DEFEATED', data: {} });
    expect(respawnCalls).toEqual([]);
  });
});
