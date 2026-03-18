// SpeedControlSystem.ts
// Enhanced speed control system enabling hypersonic speeds (Mach 1000)
// Integrates with NavigationManager and SpeedCategories for smooth acceleration

import { EventBus } from '../../core/EventBus';
import { SpeedCategory, SpeedClassifier } from '../core/SpeedCategories';

export interface SpeedControlConfig {
  accelerationProfile: 'gradual' | 'progressive' | 'instant';
  maxSpeedKmh: number;
  enableHypersonic: boolean;
  keyBindings: {
    speedUp: string[];
    speedDown: string[];
    speedMode: string[];
    hypersonicToggle: string[];
  };
}

export interface SpeedState {
  currentSpeedKmh: number;
  targetSpeedKmh: number;
  accelerationRate: number;
  isAccelerating: boolean;
  speedMode: 'normal' | 'boost' | 'hypersonic';
  category: SpeedCategory;
}

export class SpeedControlSystem {
  private eventBus: EventBus;
  private scene: Phaser.Scene;
  private config: SpeedControlConfig;
  private speedState: SpeedState;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private keys: { [key: string]: Phaser.Input.Keyboard.Key } = {};
  
  // Speed increment tables for different acceleration profiles
  private readonly SPEED_INCREMENTS = {
    gradual: [5, 10, 20, 50, 100, 250, 500, 1000, 2000, 5000], // km/h increments
    progressive: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
    instant: [50, 100, 500, 1000, 5000, 10000, 25000, 50000, 100000, 200000]
  };

  constructor(eventBus: EventBus, scene: Phaser.Scene, config?: Partial<SpeedControlConfig>) {
    this.eventBus = eventBus;
    this.scene = scene;
    
    this.config = {
      accelerationProfile: 'progressive',
      maxSpeedKmh: 343000, // Mach 1000
      enableHypersonic: true,
      keyBindings: {
        speedUp: ['SHIFT'],
        speedDown: ['CTRL'],
        speedMode: ['M'],
        hypersonicToggle: ['H']
      },
      ...config
    };

    this.speedState = {
      currentSpeedKmh: 0,
      targetSpeedKmh: 0,
      accelerationRate: 100, // km/h per second
      isAccelerating: false,
      speedMode: 'normal',
      category: SpeedCategory.WALKING
    };

    this.setupInputHandlers();
  }

  private setupInputHandlers(): void {
    if (!this.scene.input || !this.scene.input.keyboard) {
      console.warn('⚠️ Keyboard input not available for SpeedControlSystem');
      return;
    }

    // Set up cursor keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // Set up custom key bindings
    try {
      this.keys.speedUp = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.keys.speedDown = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
      this.keys.speedMode = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
      this.keys.hypersonicToggle = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
      
      // Number keys for quick speed selection
      this.keys.speed1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
      this.keys.speed2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
      this.keys.speed3 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
      this.keys.speed4 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
      this.keys.speed5 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
      this.keys.speed6 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX);
      this.keys.speed7 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN);
      this.keys.speed8 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT);
      this.keys.speed9 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NINE);
      this.keys.speed0 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);

      console.log('🎮 SpeedControlSystem input handlers initialized');
    } catch (error) {
      console.error('❌ Failed to set up SpeedControlSystem input handlers:', error);
    }
  }

  public update(deltaTime: number): void {
    this.handleInput();
    this.updateSpeed(deltaTime);
    this.emitSpeedEvents();
  }

  private handleInput(): void {
    if (!this.cursors || !this.keys) return;

    // Speed mode toggle
    if (Phaser.Input.Keyboard.JustDown(this.keys.speedMode)) {
      this.toggleSpeedMode();
    }

    // Hypersonic toggle
    if (Phaser.Input.Keyboard.JustDown(this.keys.hypersonicToggle) && this.config.enableHypersonic) {
      this.toggleHypersonicMode();
    }

    // Quick speed selection (number keys)
    for (let i = 0; i <= 9; i++) {
      const keyName = i === 0 ? 'speed0' : `speed${i}`;
      if (Phaser.Input.Keyboard.JustDown(this.keys[keyName])) {
        this.setQuickSpeed(i);
      }
    }

    // Continuous acceleration/deceleration
    if (this.keys.speedUp.isDown) {
      this.accelerate();
    } else if (this.keys.speedDown.isDown) {
      this.decelerate();
    }

    // Arrow key fine control
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.incrementSpeed();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.decrementSpeed();
    }
  }

  private toggleSpeedMode(): void {
    const modes: SpeedState['speedMode'][] = ['normal', 'boost', 'hypersonic'];
    const currentIndex = modes.indexOf(this.speedState.speedMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    
    if (modes[nextIndex] === 'hypersonic' && !this.config.enableHypersonic) {
      this.speedState.speedMode = 'normal';
    } else {
      this.speedState.speedMode = modes[nextIndex];
    }

    this.eventBus.emit({
      type: 'SPEED_MODE_CHANGED',
      data: { mode: this.speedState.speedMode }
    });

    console.log(`🚀 Speed mode changed to: ${this.speedState.speedMode}`);
  }

  private toggleHypersonicMode(): void {
    if (this.speedState.speedMode === 'hypersonic') {
      this.speedState.speedMode = 'normal';
      this.speedState.targetSpeedKmh = Math.min(this.speedState.targetSpeedKmh, 1200);
    } else {
      this.speedState.speedMode = 'hypersonic';
    }

    this.eventBus.emit({
      type: 'HYPERSONIC_MODE_TOGGLED',
      data: { enabled: this.speedState.speedMode === 'hypersonic' }
    });

    console.log(`⚡ Hypersonic mode: ${this.speedState.speedMode === 'hypersonic' ? 'ENABLED' : 'DISABLED'}`);
  }

  private setQuickSpeed(level: number): void {
    const speedLevels = [
      0,      // 0 - Stop
      50,     // 1 - Walking
      200,    // 2 - Ground vehicle
      600,    // 3 - Fast ground
      1200,   // 4 - Aircraft
      3000,   // 5 - Fast aircraft
      12000,  // 6 - Supersonic (Mach 10)
      50000,  // 7 - High hypersonic
      150000, // 8 - Extreme hypersonic
      343000  // 9 - Mach 1000
    ];

    const targetSpeed = speedLevels[level];
    if (targetSpeed <= 1200 || this.config.enableHypersonic) {
      this.speedState.targetSpeedKmh = targetSpeed;
      
      this.eventBus.emit({
        type: 'QUICK_SPEED_SET',
        data: { level, speedKmh: targetSpeed }
      });

      console.log(`🎯 Quick speed set: Level ${level} (${targetSpeed} km/h)`);
    }
  }

  private accelerate(): void {
    const increment = this.getSpeedIncrement();
    this.speedState.targetSpeedKmh = Math.min(
      this.speedState.targetSpeedKmh + increment,
      this.getMaxAllowedSpeed()
    );
    this.speedState.isAccelerating = true;
  }

  private decelerate(): void {
    const increment = this.getSpeedIncrement();
    this.speedState.targetSpeedKmh = Math.max(0, this.speedState.targetSpeedKmh - increment);
    this.speedState.isAccelerating = false;
  }

  private incrementSpeed(): void {
    const increment = this.getSmallSpeedIncrement();
    this.speedState.targetSpeedKmh = Math.min(
      this.speedState.targetSpeedKmh + increment,
      this.getMaxAllowedSpeed()
    );
  }

  private decrementSpeed(): void {
    const increment = this.getSmallSpeedIncrement();
    this.speedState.targetSpeedKmh = Math.max(0, this.speedState.targetSpeedKmh - increment);
  }

  private getSpeedIncrement(): number {
    const profile = this.config.accelerationProfile;
    const increments = this.SPEED_INCREMENTS[profile];
    const speedIndex = Math.min(
      Math.floor(this.speedState.currentSpeedKmh / 10000),
      increments.length - 1
    );
    return increments[speedIndex];
  }

  private getSmallSpeedIncrement(): number {
    const baseIncrement = this.getSpeedIncrement();
    return Math.max(1, Math.floor(baseIncrement / 10));
  }

  private getMaxAllowedSpeed(): number {
    if (this.speedState.speedMode === 'hypersonic' && this.config.enableHypersonic) {
      return this.config.maxSpeedKmh;
    } else if (this.speedState.speedMode === 'boost') {
      return 12000; // Supersonic limit
    } else {
      return 1200; // Aircraft limit
    }
  }

  private updateSpeed(deltaTime: number): void {
    if (Math.abs(this.speedState.currentSpeedKmh - this.speedState.targetSpeedKmh) < 1) {
      this.speedState.currentSpeedKmh = this.speedState.targetSpeedKmh;
      return;
    }

    // Calculate acceleration rate based on speed mode
    let accelerationRate = this.speedState.accelerationRate;
    if (this.speedState.speedMode === 'boost') {
      accelerationRate *= 5;
    } else if (this.speedState.speedMode === 'hypersonic') {
      accelerationRate *= 20;
    }

    // Apply acceleration
    const speedDiff = this.speedState.targetSpeedKmh - this.speedState.currentSpeedKmh;
    const maxChange = accelerationRate * (deltaTime / 1000);
    const actualChange = Math.sign(speedDiff) * Math.min(Math.abs(speedDiff), maxChange);
    
    this.speedState.currentSpeedKmh += actualChange;
    
    // Update speed category
    const newCategory = SpeedClassifier.classifySpeed(this.speedState.currentSpeedKmh).category;
    if (newCategory !== this.speedState.category) {
      const oldCategory = this.speedState.category;
      this.speedState.category = newCategory;
      
      this.eventBus.emit({
        type: 'SPEED_CATEGORY_CHANGED',
        data: {
          from: oldCategory,
          to: newCategory,
          previousCategory: oldCategory,
          newCategory: newCategory,
          speedKmh: this.speedState.currentSpeedKmh,
          mach: this.speedState.currentSpeedKmh / 1235,
          timestamp: Date.now()
        }
      });
    }
  }

  private emitSpeedEvents(): void {
    this.eventBus.emit({
      type: 'SPEED_UPDATE',
      data: {
  speedKmh: this.speedState.currentSpeedKmh,
  currentSpeedKmh: this.speedState.currentSpeedKmh,
  targetSpeedKmh: this.speedState.targetSpeedKmh,
  speedMode: this.speedState.speedMode,
  category: this.speedState.category,
  mach: this.speedState.currentSpeedKmh / 1235,
  isAccelerating: this.speedState.isAccelerating
      }
    });
  }

  // Public API
  public getCurrentSpeed(): number {
    return this.speedState.currentSpeedKmh;
  }

  public getTargetSpeed(): number {
    return this.speedState.targetSpeedKmh;
  }

  public getSpeedState(): Readonly<SpeedState> {
    return { ...this.speedState };
  }

  public setTargetSpeed(speedKmh: number): void {
    this.speedState.targetSpeedKmh = Math.min(speedKmh, this.getMaxAllowedSpeed());
  }

  public setSpeedMode(mode: SpeedState['speedMode']): void {
    if (mode === 'hypersonic' && !this.config.enableHypersonic) return;
    this.speedState.speedMode = mode;
  }

  public emergencyStop(): void {
    this.speedState.targetSpeedKmh = 0;
    this.speedState.currentSpeedKmh = 0;
    
    this.eventBus.emit({
      type: 'EMERGENCY_STOP',
      data: { timestamp: Date.now() }
    });
    
    console.log('🛑 Emergency stop activated');
  }

  public getSpeedModeHelp(): string {
    return `
🎮 Speed Control Help:
━━━━━━━━━━━━━━━━━━━━━━

🔧 Speed Modes:
• M - Toggle speed mode (Normal → Boost → Hypersonic)
• H - Toggle hypersonic mode directly

🚀 Quick Speed Selection:
• 0 - Stop (0 km/h)
• 1 - Walking (50 km/h)  
• 2 - Ground vehicle (200 km/h)
• 3 - Fast ground (600 km/h)
• 4 - Aircraft (1,200 km/h)
• 5 - Fast aircraft (3,000 km/h)
• 6 - Supersonic (12,000 km/h - Mach 10)
• 7 - High hypersonic (50,000 km/h)
• 8 - Extreme hypersonic (150,000 km/h)
• 9 - Maximum (343,000 km/h - Mach 1000)

⚡ Fine Control:
• SHIFT - Hold to accelerate
• CTRL - Hold to decelerate  
• ↑ - Small speed increase
• ↓ - Small speed decrease

🌍 Current Mode: ${this.speedState.speedMode.toUpperCase()}
🚀 Current Speed: ${Math.round(this.speedState.currentSpeedKmh).toLocaleString()} km/h
`;
  }
}
