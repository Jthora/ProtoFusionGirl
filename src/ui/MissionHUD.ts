// MissionHUD.ts
// Displays the active mission title and current objective in a corner overlay.
// Updates automatically on MISSION_OBJECTIVE_COMPLETED and MISSION_COMPLETED events.

import { EventBus } from '../core/EventBus';
import { MissionManager } from '../world/missions/MissionManager';
import { UIDepths } from './UIDepths';

export class MissionHUD {
  private scene: Phaser.Scene;
  private missionManager: MissionManager;
  private eventBus: EventBus;

  private bg!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;

  private readonly PANEL_W = 260;
  private readonly PANEL_H = 54;
  private readonly PAD = 8;
  private readonly PANEL_X = 8;
  private readonly PANEL_Y = 126;

  constructor(scene: Phaser.Scene, missionManager: MissionManager, eventBus: EventBus) {
    this.scene = scene;
    this.missionManager = missionManager;
    this.eventBus = eventBus;
    this.build();
    this.refresh();

    // Refresh on any mission progress event
    this.eventBus.on('MISSION_OBJECTIVE_COMPLETED', () => this.refresh());
    this.eventBus.on('MISSION_COMPLETED', () => this.refresh());
    this.eventBus.on('MISSION_STARTED', () => this.refresh());
  }

  private build(): void {
    this.bg = this.scene.add.graphics();
    this.drawBg(false);

    this.titleText = this.scene.add.text(this.PANEL_X + this.PAD, this.PANEL_Y + this.PAD, '', {
      fontSize: '11px',
      color: '#FF8C00',
      fontStyle: 'bold',
      fontFamily: 'monospace',
    }).setScrollFactor(0).setDepth(UIDepths.HUD_OVERLAY);

    this.objectiveText = this.scene.add.text(this.PANEL_X + this.PAD, this.PANEL_Y + this.PAD + 17, '', {
      fontSize: '10px',
      color: '#cccccc',
      fontFamily: 'monospace',
      wordWrap: { width: this.PANEL_W - this.PAD * 2 },
    }).setScrollFactor(0).setDepth(UIDepths.HUD_OVERLAY);

    this.bg.setScrollFactor(0).setDepth(UIDepths.HUD_OVERLAY - 1);
  }

  private drawBg(completed: boolean): void {
    this.bg.clear();
    const alpha = completed ? 0.4 : 0.6;
    const borderColor = completed ? 0xFFD700 : 0xFF8C00;
    this.bg.fillStyle(0x0a0500, alpha);
    this.bg.fillRoundedRect(this.PANEL_X, this.PANEL_Y, this.PANEL_W, this.PANEL_H, 4);
    this.bg.lineStyle(1, borderColor, 0.6);
    this.bg.strokeRoundedRect(this.PANEL_X, this.PANEL_Y, this.PANEL_W, this.PANEL_H, 4);
  }

  refresh(): void {
    const activeMission = this.missionManager.getAllMissions()
      .find(m => m.status === 'active');

    if (!activeMission) {
      // Check if any mission just completed — show brief completion notice
      const completed = this.missionManager.getAllMissions()
        .find(m => m.status === 'completed');
      if (completed) {
        this.drawBg(true);
        this.titleText.setText('✓ ' + completed.title);
        this.objectiveText.setText('Mission complete!');
      } else {
        this.setVisible(false);
      }
      return;
    }

    this.setVisible(true);
    this.drawBg(false);
    this.titleText.setText('▸ ' + activeMission.title);

    const nextObj = activeMission.objectives.find(o => o.status === 'incomplete');
    if (nextObj) {
      this.objectiveText.setText('○ ' + nextObj.description);
    } else {
      this.objectiveText.setText('All objectives complete');
    }
  }

  private setVisible(visible: boolean): void {
    this.bg.setVisible(visible);
    this.titleText.setVisible(visible);
    this.objectiveText.setVisible(visible);
  }

  destroy(): void {
    this.bg.destroy();
    this.titleText.destroy();
    this.objectiveText.destroy();
  }
}
