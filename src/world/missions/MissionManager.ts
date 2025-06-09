// MissionManager for ProtoFusionGirl
// Handles loading, saving, updating, and querying missions
// See copilot_mission_system_design_2025-06-04.artifact for details

import { Mission, MissionStatus, ObjectiveStatus, MissionTriggerType } from './types';

export class MissionManager {
  private missions: Map<string, Mission> = new Map();

  constructor() {}

  loadMissions(missionList: Mission[]) {
    for (const mission of missionList) {
      this.missions.set(mission.id, mission);
    }
  }

  getMission(id: string): Mission | undefined {
    return this.missions.get(id);
  }

  getAllMissions(): Mission[] {
    return Array.from(this.missions.values());
  }

  updateMissionStatus(id: string, status: MissionStatus) {
    const mission = this.missions.get(id);
    if (mission) {
      mission.status = status;
    }
  }

  // Add or update an objective's status and progress
  updateObjective(missionId: string, objectiveId: string, status: ObjectiveStatus, progress?: number) {
    const mission = this.missions.get(missionId);
    if (!mission) return;
    const obj = mission.objectives.find(o => o.id === objectiveId);
    if (!obj) return;
    obj.status = status;
    if (progress !== undefined) obj.progress = progress;
    // Optionally, check if all objectives are complete
    if (mission.objectives.every(o => o.status === 'complete')) {
      mission.status = 'completed';
      // Call reward handler if provided
      if (this.onMissionCompleted) {
        this.onMissionCompleted(mission.id);
      }
      // TODO: Trigger onComplete events, etc.
    }
  }

  // Evaluate triggers for a mission (stub)
  triggerEvent(missionId: string, triggerType: MissionTriggerType, params: object = {}) {
    const mission = this.missions.get(missionId);
    if (!mission) return;
    for (const trig of mission.triggers) {
      if (trig.type === triggerType) {
        // TODO: Call event handler, e.g., via event bus or callback registry
        // Example: this.eventBus.emit(trig.event, { missionId, ...params, ...trig.params });
      }
    }
  }

  // Trigger an event for all missions (for multiplayer/global events)
  triggerEventForAllMissions(eventType: string, params: object = {}) {
    for (const mission of this.missions.values()) {
      for (const trig of mission.triggers || []) {
        if (trig.type === eventType) {
          // TODO: Call event handler, e.g., via event bus or callback registry
          // Example: this.eventBus.emit(trig.event, { missionId: mission.id, ...params, ...trig.params });
        }
      }
    }
  }

  // Serialize all mission states for saving
  serializeMissions(): object {
    return Array.from(this.missions.values()).map(m => ({
      id: m.id,
      status: m.status,
      objectives: m.objectives.map(o => ({ id: o.id, status: o.status, progress: o.progress }))
    }));
  }

  // Restore mission states from save data
  restoreMissions(saveData: any) {
    if (!Array.isArray(saveData)) return;
    for (const saved of saveData) {
      const mission = this.missions.get(saved.id);
      if (!mission) continue;
      mission.status = saved.status;
      for (const savedObj of saved.objectives) {
        const obj = mission.objectives.find(o => o.id === savedObj.id);
        if (obj) {
          obj.status = savedObj.status;
          if (savedObj.progress !== undefined) obj.progress = savedObj.progress;
        }
      }
    }
  }

  // Add this method for ModularGameLoop integration
  update(dt: number, context?: any) {
    // TODO: Implement mission state progression, timers, or triggers as needed
  }

  // Optional: set a callback for mission completion
  onMissionCompleted?: (missionId: string) => void;

  // TODO: Integrate with global event bus for mission triggers and completion events.
  // TODO: Add support for mission prerequisites and branching objectives.
  // TODO: Expose modding hooks for custom mission types and rewards.
  // TODO: Add support for mission progress notifications and UI integration.
  // TODO: Implement multiplayer mission sync and co-op objectives.
  // TODO: Add analytics hooks for mission completion and player choices.

  // Add more methods for objectives, triggers, etc. as needed
}
