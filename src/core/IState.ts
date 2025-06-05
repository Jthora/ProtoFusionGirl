// IState.ts
// Interface for modular state logic in the app state machine
import { AppState, AppStateTransition } from './IAppStateMachine';
import { StateContext } from './StateContext';

export interface IState {
  name: AppState;
  onEnter?(context: StateContext, transition?: AppStateTransition): void;
  onExit?(context: StateContext, transition?: AppStateTransition): void;
  onUpdate?(context: StateContext): void;
  canTransitionTo?(to: AppState, trigger: string, context: StateContext): boolean;
  handleEvent?(event: string, payload?: any): void;

  /**
   * Optional data for parameterized, data-driven states (e.g., mission, timeline, environment).
   */
  data?: Record<string, any>;

  /**
   * Optional scripting hooks for modding or advanced logic.
   * These can be functions or script strings to be evaluated/interpreted.
   */
  scriptHooks?: {
    onEnter?: (context: StateContext, transition?: AppStateTransition) => void | string;
    onExit?: (context: StateContext, transition?: AppStateTransition) => void | string;
    onEvent?: (event: string, payload?: any) => void | string;
  };
}
