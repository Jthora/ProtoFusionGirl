// ModularGameLoop.ts
// Artifact-driven: Implements modular, event-driven core game loop for ProtoFusionGirl
// Reference: artifacts/modular_game_loop_2025-06-05.artifact

import { EventBus } from './EventBus';

export interface GameLoopSystem {
  id: string;
  priority?: number; // Lower runs first
  update(dt: number, context: GameLoopContext): void;
}

export interface GameLoopContext {
  eventBus: EventBus;
  [key: string]: any;
}

export class ModularGameLoop {
  private systems: GameLoopSystem[] = [];
  private eventBus: EventBus;
  private context: GameLoopContext;

  constructor(eventBus: EventBus, context?: Partial<GameLoopContext>) {
    this.eventBus = eventBus;
    this.context = { eventBus, ...(context || {}) };
  }

  registerSystem(system: GameLoopSystem) {
    this.systems.push(system);
    this.systems.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  }

  update(dt: number) {
    for (const system of this.systems) {
      system.update(dt, this.context);
    }
    // Emit a post-update event for hooks
    this.eventBus.emit({ type: 'GAMELOOP_POST_UPDATE', data: { dt } });
  }

  getEventBus() {
    return this.eventBus;
  }

  getContext() {
    return this.context;
  }
}
