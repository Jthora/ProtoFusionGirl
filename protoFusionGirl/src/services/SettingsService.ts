// Centralized, future-proof settings system for protoFusionGirl
// Expandable, supports persistence and eventing

export type SettingKey = 'audioVolume' | 'musicVolume' | 'sfxVolume' | 'showDebug' | 'language' | 'touchControls' | string;

export interface GameSettings {
  audioVolume: number; // 0-1
  musicVolume: number; // 0-1
  sfxVolume: number;   // 0-1
  showDebug: boolean;
  language: string;
  touchControls: boolean;
  // [future]: add more keys as needed
  [key: string]: any;
}

const DEFAULT_SETTINGS: GameSettings = {
  audioVolume: 1,
  musicVolume: 1,
  sfxVolume: 1,
  showDebug: false,
  language: 'en',
  touchControls: true,
};

export class SettingsService {
  private static instance: SettingsService;
  private settings: GameSettings;
  private listeners: Array<(settings: GameSettings) => void> = [];

  private constructor() {
    this.settings = { ...DEFAULT_SETTINGS, ...this.loadFromStorage() };
  }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  get(key: SettingKey): any {
    return this.settings[key];
  }

  set(key: SettingKey, value: any): void {
    this.settings[key] = value;
    this.saveToStorage();
    this.notify();
  }

  getAll(): GameSettings {
    return { ...this.settings };
  }

  onChange(listener: (settings: GameSettings) => void): void {
    this.listeners.push(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.getAll());
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('pfg_settings', JSON.stringify(this.settings));
    } catch {}
  }

  private loadFromStorage(): Partial<GameSettings> {
    try {
      const raw = localStorage.getItem('pfg_settings');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  }

  reset() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveToStorage();
    this.notify();
  }
}
