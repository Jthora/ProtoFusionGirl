// ISubStateMachine.ts
// Interface for sub-state machines (economy, combat, etc.)
// Use AppState from IAppStateMachine for consistency
import { AppState } from './IAppStateMachine';

export interface ISubStateMachine {
  update(appState: AppState, payload?: any): void;
  serialize?(): any;
  deserialize?(data: any): void;
  canHandle?(trigger: string): boolean;
  transition?(trigger: string, payload?: any): void;
  onEnter?(context: any): void;
  handleEvent?(event: string, payload?: any): void;

  /**
   * Optional data for parameterized, data-driven sub-state machines.
   */
  data?: Record<string, any>;

  /**
   * Optional scripting hooks for modding or advanced logic.
   */
  scriptHooks?: {
    onEnter?: (context: any) => void | string;
    onExit?: (context: any) => void | string;
    onEvent?: (event: string, payload?: any) => void | string;
  };
}
