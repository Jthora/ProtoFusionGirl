// StateRegistry.ts
// Registry for dynamic/modular state management
import { AppState } from './AppStateMachine';
import { IState } from './IState';

export class StateRegistry {
  private states: Map<AppState, IState> = new Map();
  register(state: IState) {
    this.states.set(state.name, state);
  }
  get(state: AppState): IState | undefined {
    return this.states.get(state);
  }
  getAll(): IState[] {
    return Array.from(this.states.values());
  }
}
