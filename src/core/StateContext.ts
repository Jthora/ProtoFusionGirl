// StateContext.ts
// Context object for dependency injection into states

/**
 * StateContext: Rich dependency/context injection for states and state machines.
 * Extend this interface as new systems are added (eventBus, timeline, player, world, etc).
 */
export interface StateContext {
  /**
   * Event bus for global/local events (timeline, warp, etc)
   */
  eventBus?: {
    emit: (event: string, payload?: any) => void;
    on: (event: string, handler: (payload?: any) => void) => void;
    off: (event: string, handler: (payload?: any) => void) => void;
  };
  /**
   * Reference to the main AppStateMachine (for advanced transitions, queries)
   */
  appStateMachine?: any;
  /**
   * Reference to the player entity or player state (if available)
   */
  player?: any;
  /**
   * Reference to the world/tilemap manager (for tile, chunk, and world queries)
   */
  world?: any;
  /**
   * Timeline/multiverse info (current timeline, available branches, etc)
   */
  timeline?: {
    currentTimelineId?: string;
    availableTimelines?: string[];
    [key: string]: any;
  };
  /**
   * Any additional injected services, managers, or data
   */
  [key: string]: any;
}

// Export StateContext as an interface (TypeScript supports both type and interface imports for interfaces)
