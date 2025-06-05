import { AppState, AppStateTransition, IAppStateMachine } from './IAppStateMachine';
import { IState } from './IState';
import { StateContext } from './StateContext';
import { StateRegistry } from './StateRegistry';
import { ISubStateMachine } from './ISubStateMachine';

// AppStateMachine.ts
// Global app state machine for ProtoFusionGirl
// Inspired by core loop and economy loop docs

export class AppStateMachine implements IAppStateMachine {
  public currentState: AppState = AppState.PREPARATION;
  private history: AppStateTransition[] = [];
  private listeners: Array<(state: AppState, transition: AppStateTransition) => void> = [];
  private subStateMachines: Record<string, ISubStateMachine> = {};
  private stateRegistry: StateRegistry = new StateRegistry();
  private context: StateContext = {};
  private currentStateObj?: IState;
  // --- Hierarchical State Support ---
  private nestedStateMachines: Record<AppState, ISubStateMachine> = {};

  constructor(context?: StateContext) {
    if (context) this.context = context;
    // Register default states (can be extended)
    this.registerDefaultStates();
    this.currentStateObj = this.stateRegistry.get(this.currentState);
    // Initialize nested state machine if defined for initial state
    this.initNestedStateMachine(this.currentState);
    this.currentStateObj?.onEnter?.(this.context);
  }

  // --- Modular State Registration ---
  registerState(state: IState) {
    this.stateRegistry.register(state);
    // If the state defines a sub-state machine, register it for hierarchy
    if ((state as any).createSubStateMachine) {
      this.nestedStateMachines[state.name] = (state as any).createSubStateMachine();
    }
  }
  registerDefaultStates() {
    // Example: register built-in states (can be replaced/extended)
    this.registerState({
      name: AppState.PREPARATION,
      onEnter: (_ctx) => {/* ... */},
      onExit: (_ctx) => {/* ... */},
      canTransitionTo: (to, _trigger, _ctx) => [AppState.ENGAGEMENT].includes(to),
    });
    this.registerState({
      name: AppState.ENGAGEMENT,
      onEnter: (_ctx) => {/* ... */},
      onExit: (_ctx) => {/* ... */},
      canTransitionTo: (to, _trigger, _ctx) => [AppState.PROGRESSION, AppState.PAUSED, AppState.CUTSCENE, AppState.GAME_OVER, AppState.VICTORY].includes(to),
    });
    // ...register other states similarly...
  }

  // --- Sub-State Machine Registration ---
  registerSubStateMachine(key: string, machine: ISubStateMachine) {
    this.subStateMachines[key] = machine;
    this.context[key] = machine;
  }

  // --- Script Hook Execution Utility ---
  private runScriptHook(hook: any, ...args: any[]) {
    if (typeof hook === 'function') {
      return hook(...args);
    } else if (typeof hook === 'string') {
      // Optionally: evaluate script string (sandboxed in production)
      // eslint-disable-next-line no-eval
      return eval(hook);
    }
  }

  // --- State Transition Logic ---
  transition(trigger: string, payload?: any) {
    // --- Hierarchical/Nested State Delegation ---
    const nestedMachine = this.nestedStateMachines[this.currentState];
    if (nestedMachine) {
      // If the nested machine can handle the trigger, delegate to it
      if (nestedMachine.canHandle && nestedMachine.canHandle(trigger)) {
        nestedMachine.transition && nestedMachine.transition(trigger, payload);
        this.emit('nestedTransition', { trigger, payload });
        return;
      }
    }
    // ...existing code for main state transition...
    const nextState = this.getNextState(this.currentState, trigger, this.context);
    if (nextState && nextState !== this.currentState) {
      const prevStateObj = this.currentStateObj;
      const nextStateObj = this.stateRegistry.get(nextState);
      const transition: AppStateTransition = {
        from: this.currentState,
        to: nextState,
        trigger,
        payload,
      };
      prevStateObj?.onExit?.(this.context, transition);
      if (prevStateObj?.scriptHooks?.onExit) this.runScriptHook(prevStateObj.scriptHooks.onExit, this.context, transition);
      this.currentState = nextState;
      this.currentStateObj = nextStateObj;
      this.history.push(transition);
      // Notify sub-state machines
      Object.values(this.subStateMachines).forEach(machine => {
        machine.update(this.currentState, payload);
      });
      // Initialize nested state machine for new state if present
      this.initNestedStateMachine(this.currentState);
      nextStateObj?.onEnter?.(this.context, transition);
      if (nextStateObj?.scriptHooks?.onEnter) this.runScriptHook(nextStateObj.scriptHooks.onEnter, this.context, transition);
      this.listeners.forEach(cb => cb(this.currentState, transition));
      this.emit('stateTransition', transition);
    }
  }

  // --- Hierarchical State Machine Helpers ---
  private initNestedStateMachine(state: AppState) {
    const nested = this.nestedStateMachines[state];
    if (nested && typeof nested.onEnter === 'function') {
      nested.onEnter(this.context);
    }
  }

  onStateChange(callback: (state: AppState, transition: AppStateTransition) => void) {
    this.listeners.push(callback);
  }

  getHistory() {
    return this.history;
  }

  serialize(): any {
    const subStates: Record<string, any> = {};
    for (const [key, machine] of Object.entries(this.subStateMachines)) {
      if (machine.serialize) subStates[key] = machine.serialize();
    }
    // --- Serialize nested state machines ---
    const nestedStates: Record<string, any> = {};
    for (const [state, machine] of Object.entries(this.nestedStateMachines)) {
      if (machine.serialize) nestedStates[state] = machine.serialize();
    }
    return {
      currentState: this.currentState,
      history: this.history,
      subStates,
      nestedStates,
    };
  }

  deserialize(data: any) {
    if (!data) return;
    this.currentState = data.currentState ?? this.currentState;
    this.history = data.history ?? [];
    if (data.subStates) {
      for (const [key, subData] of Object.entries(data.subStates)) {
        if (this.subStateMachines[key] && this.subStateMachines[key].deserialize) {
          this.subStateMachines[key].deserialize!(subData);
        }
      }
    }
    // --- Deserialize nested state machines ---
    if (data.nestedStates) {
      for (const [state, nestedData] of Object.entries(data.nestedStates)) {
        if (this.nestedStateMachines[state] && this.nestedStateMachines[state].deserialize) {
          this.nestedStateMachines[state].deserialize!(nestedData);
        }
      }
    }
    this.currentStateObj = this.stateRegistry.get(this.currentState);
  }

  // --- Highly Extensible Transition Logic ---
  private getNextState(current: AppState, trigger: string, context: StateContext): AppState | undefined {
    const currentStateObj = this.stateRegistry.get(current);
    // Allow state to control its own transitions
    for (const state of this.stateRegistry.getAll()) {
      if (state.name !== current) {
        if (currentStateObj?.canTransitionTo?.(state.name, trigger, context)) {
          return state.name;
        }
      }
    }
    // Fallback to legacy logic if needed
    switch (current) {
      case AppState.PREPARATION:
        if (trigger === 'start_mission') return AppState.ENGAGEMENT;
        break;
      case AppState.ENGAGEMENT:
        if (trigger === 'mission_complete') return AppState.PROGRESSION;
        if (trigger === 'pause') return AppState.PAUSED;
        if (trigger === 'cutscene') return AppState.CUTSCENE;
        break;
      case AppState.PROGRESSION:
        if (trigger === 'reflect') return AppState.REFLECTION;
        break;
      case AppState.REFLECTION:
        if (trigger === 'prepare') return AppState.PREPARATION;
        break;
      case AppState.PAUSED:
        if (trigger === 'resume') return this.history.length > 0 ? this.history[this.history.length - 1].to : AppState.PREPARATION;
        break;
      case AppState.CUTSCENE:
        if (trigger === 'end_cutscene') return this.history.length > 0 ? this.history[this.history.length - 1].from : AppState.PREPARATION;
        break;
      case AppState.ENGAGEMENT:
      case AppState.PROGRESSION:
      case AppState.REFLECTION:
        if (trigger === 'game_over') return AppState.GAME_OVER;
        if (trigger === 'victory') return AppState.VICTORY;
        break;
      case AppState.GAME_OVER:
      case AppState.VICTORY:
        if (trigger === 'restart') return AppState.PREPARATION;
        break;
    }
    return undefined;
  }

  // --- Event Bus for State Machine ---
  private eventListeners: Record<string, Array<(payload?: any) => void>> = {};

  on(event: string, handler: (payload?: any) => void) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(handler);
  }

  off(event: string, handler: (payload?: any) => void) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
  }

  emit(event: string, payload?: any) {
    if (this.eventListeners[event]) {
      for (const handler of this.eventListeners[event]) {
        handler(payload);
      }
    }
    // Delegate to current state if it can handle events
    if (this.currentStateObj && typeof this.currentStateObj.handleEvent === 'function') {
      this.currentStateObj.handleEvent(event, payload);
    }
    // Propagate to nested state machine if present
    const nestedMachine = this.nestedStateMachines[this.currentState];
    if (nestedMachine && typeof (nestedMachine as any).emit === 'function') {
      (nestedMachine as any).emit(event, payload);
    } else if (nestedMachine && typeof nestedMachine.handleEvent === 'function') {
      nestedMachine.handleEvent(event, payload);
    }
    if (this.currentStateObj?.scriptHooks?.onEvent) this.runScriptHook(this.currentStateObj.scriptHooks.onEvent, event, payload);
  }

  /**
   * Call this when a player or entity enters a tile. If the tile is a warp zone, triggers a timeline/multiverse transition.
   * @param tile The tile definition (should include warpZone metadata if present)
   * @param position The world position {x, y}
   * @param context Optional extra context (player, etc.)
   */
  handleTileEntry(tile: any, position: { x: number, y: number }, context?: any) {
    if (tile && tile.warpZone) {
      // Emit event for listeners (e.g., timeline/multiverse logic)
      this.emit('warpZoneEntered', {
        tile,
        position,
        context,
        warpZone: tile.warpZone
      });
    }
  }
}

// --- Extension Points ---
// - Each IState can now define a createSubStateMachine() for nested/hierarchical logic
// - Nested state machines can be used for mission, timeline, or multiverse logic
// - Future: Integrate event bus, timeline branching, scripting hooks, etc.
