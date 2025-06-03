import Phaser from 'phaser';
import { SettingsService } from '../services/SettingsService';
import type { GameSettings } from '../services/SettingsService';
import { MenuButton, Slider, ToggleButton, Dropdown } from '../ui/components';

export class SettingsScene extends Phaser.Scene {
  private settings!: GameSettings;
  private controls: { [key: string]: Phaser.GameObjects.GameObject } = {};

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const settingsService = SettingsService.getInstance();
    this.settings = settingsService.getAll();
    const { width, height } = this.cameras.main;
    let y = height / 2 - 120;
    this.add.rectangle(width / 2, height / 2, 480, 400, 0x222222, 0.98);
    this.add.text(width / 2, y - 60, 'Settings', { fontSize: '36px', color: '#fff' }).setOrigin(0.5);

    // Audio Volume
    this.add.text(width / 2 - 140, y, 'Audio Volume', { fontSize: '20px', color: '#fff' }).setOrigin(0, 0.5);
    this.controls['audioVolume'] = new Slider({
      scene: this,
      x: width / 2 + 40,
      y,
      value: this.settings.audioVolume,
      onChange: (v) => this.updateSetting('audioVolume', v)
    }).create();
    y += 50;

    // Music Volume
    this.add.text(width / 2 - 140, y, 'Music Volume', { fontSize: '20px', color: '#fff' }).setOrigin(0, 0.5);
    this.controls['musicVolume'] = new Slider({
      scene: this,
      x: width / 2 + 40,
      y,
      value: this.settings.musicVolume,
      onChange: (v) => this.updateSetting('musicVolume', v)
    }).create();
    y += 50;

    // SFX Volume
    this.add.text(width / 2 - 140, y, 'SFX Volume', { fontSize: '20px', color: '#fff' }).setOrigin(0, 0.5);
    this.controls['sfxVolume'] = new Slider({
      scene: this,
      x: width / 2 + 40,
      y,
      value: this.settings.sfxVolume,
      onChange: (v) => this.updateSetting('sfxVolume', v)
    }).create();
    y += 50;

    // Debug Toggle
    this.add.text(width / 2 - 140, y, 'Show Debug', { fontSize: '20px', color: '#fff' }).setOrigin(0, 0.5);
    this.controls['showDebug'] = new ToggleButton({
      scene: this,
      x: width / 2 + 40,
      y,
      value: this.settings.showDebug,
      onChange: (v) => this.updateSetting('showDebug', v)
    }).create();
    y += 50;

    // Touch Controls Toggle
    this.add.text(width / 2 - 140, y, 'Touch Controls', { fontSize: '20px', color: '#fff' }).setOrigin(0, 0.5);
    this.controls['touchControls'] = new ToggleButton({
      scene: this,
      x: width / 2 + 40,
      y,
      value: this.settings.touchControls,
      onChange: (v) => this.updateSetting('touchControls', v)
    }).create();
    y += 50;

    // Language Dropdown (modular)
    this.add.text(width / 2 - 140, y, 'Language', { fontSize: '20px', color: '#fff' }).setOrigin(0, 0.5);
    this.controls['language'] = new Dropdown({
      scene: this,
      x: width / 2 + 40,
      y,
      value: this.settings.language,
      options: ['en', 'es', 'fr', 'de', 'zh'],
      onChange: (next) => this.updateSetting('language', next)
    }).create();
    y += 60;

    // Save, Reset, Cancel buttons (modular)
    new MenuButton({
      scene: this,
      x: width / 2 - 100,
      y,
      label: 'Save',
      style: { fontSize: '22px', color: '#fff', backgroundColor: '#0af', padding: { left: 16, right: 16, top: 8, bottom: 8 } },
      onClick: () => {
        this.saveSettings();
        this.scene.stop();
        if (this.scene.isPaused('GameScene')) this.scene.resume('GameScene');
      }
    }).create();
    new MenuButton({
      scene: this,
      x: width / 2,
      y,
      label: 'Reset',
      style: { fontSize: '22px', color: '#fff', backgroundColor: '#333', padding: { left: 16, right: 16, top: 8, bottom: 8 } },
      onClick: () => {
        SettingsService.getInstance().reset();
        this.scene.restart();
      }
    }).create();
    new MenuButton({
      scene: this,
      x: width / 2 + 100,
      y,
      label: 'Cancel',
      style: { fontSize: '22px', color: '#fff', backgroundColor: '#f44', padding: { left: 16, right: 16, top: 8, bottom: 8 } },
      onClick: () => {
        this.scene.stop();
        if (this.scene.isPaused('GameScene')) this.scene.resume('GameScene');
      }
    }).create();
  }

  private updateSetting(key: string, value: any) {
    this.settings[key] = value;
  }

  private saveSettings() {
    const settingsService = SettingsService.getInstance();
    Object.entries(this.settings).forEach(([k, v]) => settingsService.set(k, v));
  }
}
