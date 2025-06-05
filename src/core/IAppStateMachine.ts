// IAppStateMachine.ts
// Shared types and interface for the app state machine system

export enum AppState {
  PREPARATION = 'PREPARATION',
  ENGAGEMENT = 'ENGAGEMENT',
  PROGRESSION = 'PROGRESSION',
  REFLECTION = 'REFLECTION',
  PAUSED = 'PAUSED',
  CUTSCENE = 'CUTSCENE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  // Add more as needed
}

export interface AppStateTransition {
  from: AppState;
  to: AppState;
  trigger: string;
  payload?: any;
}

export interface IAppStateMachine {
  currentState: AppState;
  transition(trigger: string, payload?: any): void;
  onStateChange(callback: (state: AppState, transition: AppStateTransition) => void): void;
  serialize(): any;
  deserialize(data: any): void;
}
