// Mission system types for ProtoFusionGirl
// Generated from copilot_mission_system_design_2025-06-04.artifact

export type MissionType = 'main' | 'side' | 'dynamic';
export type MissionStatus = 'inactive' | 'active' | 'completed' | 'failed';
export type ObjectiveType = 'location' | 'collect' | 'defeat' | 'interact' | 'escort' | 'activate' | 'survive' | 'custom';
export type ObjectiveStatus = 'incomplete' | 'complete' | 'failed';
export type RewardType = 'xp' | 'item' | 'currency' | 'unlock' | 'faction' | 'custom';
export type MissionTriggerType = 'onStart' | 'onComplete' | 'onFail' | 'onObjectiveComplete' | 'onTimeElapsed' | 'custom';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  status: MissionStatus;
  objectives: Objective[];
  rewards: Reward[];
  triggers: MissionTrigger[];
  dependencies: string[];
  version: number;
}

export interface Objective {
  id: string;
  description: string;
  type: ObjectiveType;
  target: string | number | object;
  status: ObjectiveStatus;
  progress?: number;
}

export interface Reward {
  type: RewardType;
  value: number | string | object;
}

export interface MissionTrigger {
  type: MissionTriggerType;
  event: string;
  params: object;
}
