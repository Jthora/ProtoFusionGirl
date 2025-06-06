import Phaser from 'phaser';
import { MissionManager } from '../world/missions/MissionManager';
import { sampleMissions } from '../world/missions/sampleMissions';
import { MissionEventHandlers } from '../world/missions/MissionEventHandlers';

// NarrativeManager.ts
// Handles mission, narrative, and feedback event logic
// Artifact reference: copilot_mission_system_design_2025-06-04.artifact

export class NarrativeManager {
  private scene: Phaser.Scene;
  private missionManager: MissionManager;
  private eventBus: any;
  private tilemapManager: any;
  private playerController: any;
  private saveMissionState: () => void;

  constructor(scene: Phaser.Scene, missionManager: MissionManager, eventBus: any, tilemapManager: any, playerController: any, saveMissionState: () => void) {
    this.scene = scene;
    this.missionManager = missionManager;
    this.eventBus = eventBus;
    this.tilemapManager = tilemapManager;
    this.playerController = playerController;
    this.saveMissionState = saveMissionState;
    this.setupMissions();
    this.setupNarrativeFeedback();
  }

  private setupMissions() {
    this.missionManager.loadMissions(sampleMissions);
    this.loadMissionState();
    this.missionManager.onMissionCompleted = (missionId: string) => {
      MissionEventHandlers.onMissionCompleted(
        this.scene,
        this.missionManager,
        missionId,
        undefined, // getPlayerStats
        this.tilemapManager,
        this.saveMissionState,
        this.playerController.sprite
      );
    };
  }

  private loadMissionState() {
    const raw = localStorage.getItem('missionState');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        this.missionManager.restoreMissions(data);
      } catch (e) {
        console.warn('Failed to load mission state:', e);
      }
    }
  }

  private setupNarrativeFeedback() {
    this.eventBus.on('NARRATIVE_FEEDBACK', (event: any) => {
      const { message } = event.data;
      // Optionally, show feedback modal or toast here
      this.scene.add.text(this.scene.scale.width / 2, 100, message, {
        fontSize: '20px', color: '#ff0', backgroundColor: '#222', padding: { x: 12, y: 6 }
      }).setOrigin(0.5).setDepth(1002).setScrollFactor(0);
    });
  }
}
