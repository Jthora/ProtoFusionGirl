import Phaser from 'phaser';
import { runRegisteredPlugins } from '../mods/mod_loader';

// PluginManager.ts
// Handles mod/plugin integration and automation extension points
// Artifact reference: automation_integration_2025-06-04.artifact

export class PluginManager {
  private scene: Phaser.Scene;
  private eventBus: any;
  private modularGameLoop: any;

  constructor(scene: Phaser.Scene, eventBus: any, modularGameLoop: any) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.modularGameLoop = modularGameLoop;
    this.runPlugins();
  }

  private runPlugins() {
    runRegisteredPlugins({
      eventBus: this.eventBus,
      modularGameLoop: this.modularGameLoop,
      scene: this.scene
    });
  }
}
