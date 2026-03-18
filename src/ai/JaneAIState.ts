// JaneAIState.ts
// Extracted to break the circular dependency between JaneAI.ts and animationCatalog.ts.

export enum JaneAIState {
  Idle = 'Idle',
  Navigate = 'Navigate',
  FollowGuidance = 'FollowGuidance',
  Combat = 'Combat',
  Retreat = 'Retreat',
  Bored = 'Bored',
  Refusing = 'Refusing',
}
