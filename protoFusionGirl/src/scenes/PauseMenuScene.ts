import Phaser from 'phaser';
import { MenuButton } from '../ui/components';

export class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    // Overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    // Pause text
    this.add.text(width / 2, height / 2 - 80, 'Paused', { fontSize: '44px', color: '#fff', fontStyle: 'bold', stroke: '#0fa', strokeThickness: 3 }).setOrigin(0.5);
    // Resume button (modular)
    new MenuButton({
      scene: this,
      x: width / 2,
      y: height / 2,
      label: 'Resume',
      style: { fontSize: '28px', color: '#0fa', backgroundColor: '#222', padding: { left: 20, right: 20, top: 10, bottom: 10 } },
      onClick: () => {
        this.scene.stop();
        this.scene.resume('GameScene');
      },
      onHover: () => {
        // @ts-ignore
        this.input.manager.activePointer.targetObject.setStyle({ backgroundColor: '#0fc' });
      },
      onOut: () => {
        // @ts-ignore
        this.input.manager.activePointer.targetObject.setStyle({ backgroundColor: '#222' });
      }
    }).create();
    // Settings button (modular)
    new MenuButton({
      scene: this,
      x: width / 2,
      y: height / 2 + 60,
      label: 'Settings',
      style: { fontSize: '24px', color: '#fff', backgroundColor: '#333', padding: { left: 16, right: 16, top: 8, bottom: 8 } },
      onClick: () => {
        this.scene.launch('SettingsScene');
      },
      onHover: () => {
        // @ts-ignore
        this.input.manager.activePointer.targetObject.setStyle({ backgroundColor: '#0af' });
      },
      onOut: () => {
        // @ts-ignore
        this.input.manager.activePointer.targetObject.setStyle({ backgroundColor: '#333' });
      }
    }).create();
    // Quit button (modular)
    new MenuButton({
      scene: this,
      x: width / 2,
      y: height / 2 + 120,
      label: 'Quit to Main Menu',
      style: { fontSize: '22px', color: '#faa', backgroundColor: '#222', padding: { left: 14, right: 14, top: 7, bottom: 7 } },
      onClick: () => {
        this.scene.stop('GameScene');
        this.scene.stop();
        this.scene.start('StartScene');
      },
      onHover: () => {
        // @ts-ignore
        this.input.manager.activePointer.targetObject.setStyle({ backgroundColor: '#f44' });
      },
      onOut: () => {
        // @ts-ignore
        this.input.manager.activePointer.targetObject.setStyle({ backgroundColor: '#222' });
      }
    }).create();
    // Keyboard shortcut: resume on ESC or P
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });
    this.input.keyboard?.on('keydown-P', () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });
  }
}
