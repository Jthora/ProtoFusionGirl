// MissionHandlers.ts
// Extracted mission-related logic from GameScene for maintainability and modularity.
import { MissionManager } from '../world/missions/MissionManager';
import { PlayerStats } from '../world/player/PlayerStats';
import { TilemapManager } from '../world/tilemap/TilemapManager';

export class MissionHandlers {
  static onEnemyDefeated(missionManager: MissionManager, enemies: any[], respawnEnemies: () => void) {
    const missions = missionManager.getAllMissions();
    for (const mission of missions) {
      if (mission.status !== 'active') continue;
      for (const obj of mission.objectives) {
        if (obj.type === 'defeat' && obj.status === 'incomplete') {
          missionManager.updateObjective(mission.id, obj.id, 'complete');
          missionManager.triggerEvent(mission.id, 'onObjectiveComplete', { objectiveId: obj.id });
        }
      }
    }
    const allDefeated = enemies.every(enemy => !enemy.isAlive);
    if (allDefeated) respawnEnemies();
  }

  static onPlayerReachLocation(missionManager: MissionManager, locationId: string) {
    const missions = missionManager.getAllMissions();
    for (const mission of missions) {
      if (mission.status !== 'active') continue;
      for (const obj of mission.objectives) {
        if (obj.type === 'location' && obj.status === 'incomplete' && obj.target === locationId) {
          missionManager.updateObjective(mission.id, obj.id, 'complete');
          missionManager.triggerEvent(mission.id, 'onObjectiveComplete', { objectiveId: obj.id });
        }
      }
    }
  }

  static onPlayerCollectItem(missionManager: MissionManager, itemId: string, amount: number = 1) {
    const missions = missionManager.getAllMissions();
    for (const mission of missions) {
      if (mission.status !== 'active') continue;
      for (const obj of mission.objectives) {
        if (obj.type === 'collect' && obj.status === 'incomplete' && obj.target === itemId) {
          const newProgress = (obj.progress || 0) + amount;
          if (newProgress >= 1) {
            missionManager.updateObjective(mission.id, obj.id, 'complete', newProgress);
            missionManager.triggerEvent(mission.id, 'onObjectiveComplete', { objectiveId: obj.id });
          } else {
            missionManager.updateObjective(mission.id, obj.id, 'incomplete', newProgress);
          }
        }
      }
    }
  }

  static onPlayerInteract(missionManager: MissionManager, targetId: string) {
    const missions = missionManager.getAllMissions();
    for (const mission of missions) {
      if (mission.status !== 'active') continue;
      for (const obj of mission.objectives) {
        if (obj.type === 'interact' && obj.status === 'incomplete' && obj.target === targetId) {
          missionManager.updateObjective(mission.id, obj.id, 'complete');
          missionManager.triggerEvent(mission.id, 'onObjectiveComplete', { objectiveId: obj.id });
        }
      }
    }
  }

  static grantMissionRewards(missionManager: MissionManager, missionId: string, getPlayerStats: () => PlayerStats, tilemapManager: TilemapManager) {
    const mission = missionManager.getMission(missionId);
    if (!mission || !mission.rewards) return;
    for (const reward of mission.rewards) {
      switch (reward.type) {
        case 'xp':
          if (typeof reward.value === 'number') {
            getPlayerStats().addXP?.(reward.value);
          }
          break;
        case 'item':
          if (typeof reward.value === 'string') {
            tilemapManager.inventoryPanel?.addItem?.(reward.value, 1);
          }
          break;
        case 'currency':
          if (typeof reward.value === 'number') {
            getPlayerStats().addCurrency?.(reward.value);
          }
          break;
        case 'unlock':
          break;
        case 'faction':
          break;
        case 'custom':
          break;
      }
    }
  }
}
