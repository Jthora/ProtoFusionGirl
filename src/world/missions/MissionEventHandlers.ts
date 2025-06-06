import { MissionManager } from './MissionManager';
import { EnemyInstance } from '../../world/enemies/EnemyInstance';
import { PlayerStats } from '../../world/player/PlayerStats';
import { TilemapManager } from '../../world/tilemap/TilemapManager';

export class MissionEventHandlers {
  static onEnemyDefeated(
    missionManager: MissionManager,
    enemies: EnemyInstance[],
    respawnEnemies: () => void
  ) {
    // Example: update mission progress, respawn enemies if needed
    // (Implement your mission progress logic here)
    missionManager.updateMissionProgress('enemyDefeated');
    respawnEnemies();
  }

  static grantMissionRewards(
    missionManager: MissionManager,
    missionId: string,
    getPlayerStats: () => PlayerStats,
    tilemapManager: TilemapManager
  ) {
    // Example: grant rewards to player for completing a mission
    const mission = missionManager.getMission(missionId);
    if (mission && mission.rewards) {
      // Apply rewards (e.g., items, experience, unlocks)
      // This is a placeholder; implement your reward logic here
      const playerStats = getPlayerStats();
      if (mission.rewards.items) {
        mission.rewards.items.forEach(item => {
          tilemapManager.inventoryPanel.addItem(item);
        });
      }
      if (mission.rewards.experience) {
        playerStats.addExperience(mission.rewards.experience);
      }
      // ...other reward types
    }
  }

  // Add onMissionCompleted to MissionEventHandlers
  static onMissionCompleted(
    scene: Phaser.Scene,
    missionManager: MissionManager,
    missionId: string,
    getPlayerStats: () => PlayerStats,
    tilemapManager: TilemapManager,
    saveMissionState: () => void,
    playerSprite: Phaser.GameObjects.Sprite
  ) {
    MissionEventHandlers.grantMissionRewards(
      missionManager,
      missionId,
      getPlayerStats,
      tilemapManager
    );
    saveMissionState();
    // UI feedback: show mission complete notification
    const mission = missionManager.getMission(missionId);
    if (mission) {
      const text = scene.add.text(
        playerSprite.x,
        playerSprite.y - 100,
        `Mission Complete: ${mission.title}`,
        { color: '#00ff88', fontSize: '20px', backgroundColor: '#222244', padding: { x: 12, y: 6 } }
      )
      .setOrigin(0.5, 1)
      .setDepth(2000)
      .setScrollFactor(0)
      .setAlpha(1);
      // Fade out and destroy after 2 seconds
      scene.tweens.add({
        targets: text,
        alpha: 0,
        duration: 2000,
        onComplete: () => text.destroy()
      });
    }
  }
}
