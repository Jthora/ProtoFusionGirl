// UILayoutManager.ts
// Comprehensive UI layout management system for maintaining clear screen center
// Handles responsive positioning of all UI elements based on screen size

import Phaser from 'phaser';

export interface UIZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UILayoutConfig {
  topBar: UIZone;
  bottomBar: UIZone;
  leftPanel: UIZone;
  rightPanel: UIZone;
  centerSafe: UIZone; // Protected gameplay area
  overlays: UIZone; // Full screen overlays
}

export class UILayoutManager {
  private scene: Phaser.Scene;
  private layout: UILayoutConfig;
  private registeredComponents: Map<string, any> = new Map();
  private registeredMeta: Map<string, { zone: keyof UILayoutConfig; priority: 'essential' | 'contextual' | 'debug'; visible: boolean }> = new Map();
  private mode: 'minimal' | 'standard' | 'debug' = 'standard';
  
  // UI Component categories
  private essentialComponents: string[] = []; // Always visible (health, minimap)
  private contextualComponents: string[] = []; // Show on demand (inventory, dialogue)
  private debugComponents: string[] = []; // Dev tools
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.layout = this.calculateLayout();
    
    // Listen for screen resize
    this.scene.scale.on('resize', this.onResize, this);
  }

  private calculateLayout(): UILayoutConfig {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    
    // Define UI zones with proper margins
    const topBarHeight = 60;
    const bottomBarHeight = 80;
    const leftPanelWidth = 200;
    const rightPanelWidth = 200;
    const margin = 10;
    
    return {
      topBar: {
        x: 0,
        y: 0,
        width: width,
        height: topBarHeight
      },
      bottomBar: {
        x: 0,
        y: height - bottomBarHeight,
        width: width,
        height: bottomBarHeight
      },
      leftPanel: {
        x: 0,
        y: topBarHeight + margin,
        width: leftPanelWidth,
        height: height - topBarHeight - bottomBarHeight - (margin * 2)
      },
      rightPanel: {
        x: width - rightPanelWidth,
        y: topBarHeight + margin,
        width: rightPanelWidth,
        height: height - topBarHeight - bottomBarHeight - (margin * 2)
      },
      centerSafe: {
        x: leftPanelWidth + margin,
        y: topBarHeight + margin,
        width: width - leftPanelWidth - rightPanelWidth - (margin * 2),
        height: height - topBarHeight - bottomBarHeight - (margin * 2)
      },
      overlays: {
        x: 0,
        y: 0,
        width: width,
        height: height
      }
    };
  }

  public getLayout(): UILayoutConfig {
    return this.layout;
  }

  public getCenterSafeZone(): UIZone {
    return this.layout.centerSafe;
  }

  public registerComponent(id: string, component: any, zone: keyof UILayoutConfig, priority: 'essential' | 'contextual' | 'debug' = 'contextual') {
  this.registeredComponents.set(id, { component });
  this.registeredMeta.set(id, { zone, priority, visible: true });
    
    // Add to appropriate category
    switch (priority) {
      case 'essential':
        this.essentialComponents.push(id);
        break;
      case 'contextual':
        this.contextualComponents.push(id);
        break;
      case 'debug':
        this.debugComponents.push(id);
        break;
    }
    
  this.positionComponent(id);
  // Apply current mode visibility rules to the newly registered component
  this.applyVisibilityFor(id);
  }

  public positionComponent(id: string) {
  const component = this.registeredComponents.get(id)?.component;
  const zone = this.registeredMeta.get(id)?.zone;
  if (!component || !zone) return;
    const zoneConfig = this.layout[zone];
    
    // Position the component based on its zone
    if (component.setPosition) {
      component.setPosition(zoneConfig.x, zoneConfig.y);
    }
    
    // Set size if component supports it
    if (component.setSize) {
      component.setSize(zoneConfig.width, zoneConfig.height);
    }
    
    // Set scroll factor to 0 for UI components
    if (component.setScrollFactor) {
      component.setScrollFactor(0);
    }
    
    // Set appropriate depth for UI layering
    if (component.setDepth) {
      const depthMap = {
        topBar: 2000,
        bottomBar: 2000,
        leftPanel: 1500,
        rightPanel: 1500,
        centerSafe: 1000,
        overlays: 3000
      };
      component.setDepth(depthMap[zone] || 1000);
    }
  }

  public hideComponent(id: string) {
    const meta = this.registeredMeta.get(id);
    const comp = this.registeredComponents.get(id)?.component;
    if (meta && comp) {
      meta.visible = false;
      comp.setVisible?.(false);
    }
  }

  public showComponent(id: string) {
    const meta = this.registeredMeta.get(id);
    const comp = this.registeredComponents.get(id)?.component;
    if (meta && comp) {
      meta.visible = true;
      comp.setVisible?.(true);
      this.positionComponent(id);
    }
  }

  public toggleComponent(id: string) {
    const isVisible = this.isComponentVisible(id);
    if (isVisible) this.hideComponent(id); else this.showComponent(id);
  }

  public hideContextualUI() {
    this.contextualComponents.forEach(id => {
      this.hideComponent(id);
    });
  }

  public showEssentialUI() {
    this.essentialComponents.forEach(id => {
      this.showComponent(id);
    });
  }

  public hideDebugUI() {
    this.debugComponents.forEach(id => {
      this.hideComponent(id);
    });
  }

  public showDebugUI() {
    this.debugComponents.forEach(id => {
      this.showComponent(id);
    });
  }

  public onResize() {
    this.layout = this.calculateLayout();
    
    // Reposition all registered components
    this.registeredComponents.forEach((_, id) => {
      this.positionComponent(id);
    });
  }

  public isComponentVisible(id: string): boolean {
  const meta = this.registeredMeta.get(id);
  return meta ? meta.visible : false;
  }

  public cleanup() {
    this.scene.scale.off('resize', this.onResize, this);
    this.registeredComponents.clear();
  }

  // Helper methods for specific positioning
  public positionInTopBar(component: any, alignX: 'left' | 'center' | 'right' = 'left', offsetX: number = 10) {
    const zone = this.layout.topBar;
    let x = zone.x + offsetX;
    
    switch (alignX) {
      case 'center':
        x = zone.x + zone.width / 2;
        break;
      case 'right':
        x = zone.x + zone.width - offsetX;
        break;
    }
    
    if (component.setPosition) {
      component.setPosition(x, zone.y + zone.height / 2);
    }
  }

  public positionInBottomBar(component: any, alignX: 'left' | 'center' | 'right' = 'left', offsetX: number = 10) {
    const zone = this.layout.bottomBar;
    let x = zone.x + offsetX;
    
    switch (alignX) {
      case 'center':
        x = zone.x + zone.width / 2;
        break;
      case 'right':
        x = zone.x + zone.width - offsetX;
        break;
    }
    
    if (component.setPosition) {
      component.setPosition(x, zone.y + zone.height / 2);
    }
  }

  // Debug visualization
  public showLayoutDebug() {
    const graphics = this.scene.add.graphics();
    graphics.setDepth(5000);
    graphics.setScrollFactor(0);
    
    // Draw zone boundaries
    Object.entries(this.layout).forEach(([zoneName, zone]) => {
      graphics.lineStyle(2, 0xff0000, 0.5);
      graphics.strokeRect(zone.x, zone.y, zone.width, zone.height);
      
      // Add labels
      this.scene.add.text(zone.x + 5, zone.y + 5, zoneName, {
        fontSize: '12px',
        color: '#ff0000',
        backgroundColor: '#000000'
      }).setDepth(5001).setScrollFactor(0);
    });
    
    // Highlight center safe zone
    const centerZone = this.layout.centerSafe;
    graphics.fillStyle(0x00ff00, 0.1);
    graphics.fillRect(centerZone.x, centerZone.y, centerZone.width, centerZone.height);
  }

  // --- UI Mode Management ---
  public getMode(): 'minimal' | 'standard' | 'debug' {
    return this.mode;
  }

  public setMode(mode: 'minimal' | 'standard' | 'debug') {
    this.mode = mode;
    // Apply visibility rules to all components
    this.registeredComponents.forEach((_, id) => this.applyVisibilityFor(id));
  }

  private applyVisibilityFor(id: string) {
    const meta = this.registeredMeta.get(id);
    const comp = this.registeredComponents.get(id)?.component;
    if (!meta || !comp) return;

    // Decide visibility based on mode and priority
    let shouldShow = false;
    switch (this.mode) {
      case 'minimal':
        shouldShow = meta.priority === 'essential';
        break;
      case 'standard':
        shouldShow = meta.priority === 'essential' || meta.priority === 'contextual';
        break;
      case 'debug':
        shouldShow = true;
        break;
    }
    comp.setVisible?.(shouldShow);
    meta.visible = shouldShow;
    if (shouldShow) this.positionComponent(id);
  }
}
