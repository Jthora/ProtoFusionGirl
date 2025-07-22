/**
 * ProtoFusionGirl - Scene Validation and Error Detection Utility
 * 
 * This utility helps detect and diagnose scene-related issues that can cause
 * grey screens and other scene transition problems.
 */

import { errorLogger, ErrorCategory, ErrorSeverity } from './ErrorLogger';

export class SceneValidator {
  private static instance: SceneValidator;
  
  private constructor() {}
  
  public static getInstance(): SceneValidator {
    if (!SceneValidator.instance) {
      SceneValidator.instance = new SceneValidator();
    }
    return SceneValidator.instance;
  }

  public validateSceneTransition(fromScene: string, toScene: string, game: Phaser.Game): boolean {
    console.group(`🎬 Validating Scene Transition: ${fromScene} → ${toScene}`);
    
    let isValid = true;
    
    // Check if target scene exists in game configuration
    const sceneManager = game.scene;
    const sceneKeys = Object.keys(sceneManager.scenes);
    const sceneExists = sceneKeys.includes(toScene);
    
    if (!sceneExists) {
      errorLogger.logError({
        id: 'SCENE_NOT_FOUND',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.CRITICAL,
        message: `Scene "${toScene}" Not Found`,
        details: `Attempted to transition to scene "${toScene}" which is not registered in the game configuration`,
        solution: `Add ${toScene} to the scenes array in main.ts or use a valid scene key`,
        timestamp: Date.now(),
        context: {
          fromScene,
          toScene,
          availableScenes: sceneKeys,
          registeredScenes: Object.keys(game.scene.scenes)
        }
      });
      isValid = false;
    }
    
    // Check if scene is already running
    const targetScene = sceneManager.getScene(toScene);
    if (targetScene && targetScene.scene.isActive()) {
      errorLogger.logError({
        id: 'SCENE_ALREADY_ACTIVE',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.MEDIUM,
        message: `Scene "${toScene}" Already Active`,
        details: `Cannot start scene "${toScene}" because it is already running`,
        solution: `Check scene state before starting or use scene.restart() instead`,
        timestamp: Date.now(),
        context: { fromScene, toScene, sceneState: targetScene.scene.settings }
      });
      isValid = false;
    }
    
    // Check if current scene can be stopped
    const currentScene = sceneManager.getScene(fromScene);
    if (currentScene && !currentScene.scene.settings.active) {
      errorLogger.logError({
        id: 'SOURCE_SCENE_INACTIVE',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.MEDIUM,
        message: `Source Scene "${fromScene}" Not Active`,
        details: `Cannot transition from inactive scene "${fromScene}"`,
        solution: `Ensure source scene is properly initialized and active`,
        timestamp: Date.now(),
        context: { fromScene, toScene }
      });
    }
    
    console.log(`Scene transition validation: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    console.groupEnd();
    
    return isValid;
  }

  public checkSceneConfiguration(game: Phaser.Game): void {
    console.group('🔍 Scene Configuration Check');
    
    const sceneManager = game.scene;
    const registeredScenes = sceneManager.keys;
    const expectedScenes = ['StartScene', 'GameScene', 'MinimalGameScene', 'PauseMenuScene', 'SettingsScene'];
    
    console.log('📋 Registered Scenes:', registeredScenes);
    console.log('📋 Expected Scenes:', expectedScenes);
    
    // Check for missing expected scenes
    const missingScenes = expectedScenes.filter(scene => !registeredScenes.includes(scene));
    if (missingScenes.length > 0) {
      errorLogger.logError({
        id: 'MISSING_EXPECTED_SCENES',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.HIGH,
        message: 'Missing Expected Scenes',
        details: `The following expected scenes are not registered: ${missingScenes.join(', ')}`,
        solution: 'Add missing scenes to the game configuration in main.ts',
        timestamp: Date.now(),
        context: { missingScenes, registeredScenes, expectedScenes }
      });
    }
    
    // Check for scene name mismatches
    const sceneNameIssues = this.detectSceneNameIssues();
    if (sceneNameIssues.length > 0) {
      errorLogger.logError({
        id: 'SCENE_NAME_MISMATCHES',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.HIGH,
        message: 'Scene Name Mismatches Detected',
        details: sceneNameIssues.join('; '),
        solution: 'Fix scene key mismatches between code references and scene definitions',
        timestamp: Date.now(),
        context: { issues: sceneNameIssues }
      });
    }
    
    console.groupEnd();
  }

  private detectSceneNameIssues(): string[] {
    const issues: string[] = [];
    
    // Known issues from code analysis
    issues.push('StartScene.ts line 51: calls this.scene.start("GameScene") - ensure GameScene is registered');
    issues.push('Check that all scene.start() calls use correct scene keys');
    
    return issues;
  }

  public monitorSceneTransitions(game: Phaser.Game): void {
    console.log('🔍 Setting up scene transition monitoring...');
    
    const sceneManager = game.scene;
    
    // Monitor scene starts
    sceneManager.events.on('start', (scene: Phaser.Scene) => {
      console.log(`🎬 Scene Started: ${scene.scene.key}`);
      this.logSceneMetrics(scene);
    });
    
    // Monitor scene shutdowns
    sceneManager.events.on('shutdown', (scene: Phaser.Scene) => {
      console.log(`🛑 Scene Shutdown: ${scene.scene.key}`);
    });
    
    // Monitor scene pauses
    sceneManager.events.on('pause', (scene: Phaser.Scene) => {
      console.log(`⏸️ Scene Paused: ${scene.scene.key}`);
    });
    
    // Monitor scene resumes
    sceneManager.events.on('resume', (scene: Phaser.Scene) => {
      console.log(`▶️ Scene Resumed: ${scene.scene.key}`);
    });
    
    // Monitor scene errors
    sceneManager.events.on('error', (scene: Phaser.Scene, error: Error) => {
      errorLogger.logError({
        id: 'SCENE_RUNTIME_ERROR',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.HIGH,
        message: `Scene Runtime Error in ${scene.scene.key}`,
        details: `Error: ${error.message}`,
        solution: 'Check scene code for runtime errors and fix the underlying issue',
        timestamp: Date.now(),
        context: { sceneKey: scene.scene.key, error }
      });
    });
  }

  private logSceneMetrics(scene: Phaser.Scene): void {
    const metrics = {
      key: scene.scene.key,
      active: scene.scene.isActive(),
      visible: scene.scene.isVisible(),
      paused: scene.scene.isPaused(),
      sleeping: scene.scene.isSleeping(),
      settings: scene.scene.settings,
      children: scene.children.length,
      cameras: scene.cameras.cameras.length,
      input: scene.input ? 'enabled' : 'disabled'
    };
    
    console.log('📊 Scene Metrics:', metrics);
    
    // Check for potential issues
    if (!scene.scene.isVisible()) {
      console.warn(`⚠️ Scene ${scene.scene.key} started but is not visible`);
    }
    
    if (scene.scene.isPaused()) {
      console.warn(`⚠️ Scene ${scene.scene.key} started but is paused`);
    }
  }

  public diagnoseGreyScreen(game: Phaser.Game): void {
    console.group('🔍 Grey Screen Diagnostics');
    
    const sceneManager = game.scene;
    const activeScenes = sceneManager.getScenes(true); // Get active scenes
    const visibleScenes = sceneManager.getScenes().filter(scene => scene.scene.isVisible());
    
    console.log('🎬 Active Scenes:', activeScenes.map(s => s.scene.key));
    console.log('👁️ Visible Scenes:', visibleScenes.map(s => s.scene.key));
    
    if (activeScenes.length === 0) {
      errorLogger.logError({
        id: 'NO_ACTIVE_SCENES',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.CRITICAL,
        message: 'No Active Scenes Detected',
        details: 'Game has no active scenes which would result in a blank/grey screen',
        solution: 'Ensure at least one scene is properly started and active',
        timestamp: Date.now(),
        context: { 
          registeredScenes: sceneManager.keys,
          allScenes: sceneManager.getScenes().map(s => ({
            key: s.scene.key,
            active: s.scene.isActive(),
            visible: s.scene.isVisible()
          }))
        }
      });
    }
    
    if (visibleScenes.length === 0 && activeScenes.length > 0) {
      errorLogger.logError({
        id: 'NO_VISIBLE_SCENES',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.HIGH,
        message: 'No Visible Scenes Despite Active Scenes',
        details: 'Game has active scenes but none are visible, causing grey screen',
        solution: 'Check scene visibility settings and ensure scenes render content',
        timestamp: Date.now(),
        context: { 
          activeScenes: activeScenes.map(s => s.scene.key),
          sceneVisibility: activeScenes.map(s => ({
            key: s.scene.key,
            visible: s.scene.isVisible(),
            alpha: s.alpha,
            active: s.active
          }))
        }
      });
    }
    
    // Check each active scene for content
    activeScenes.forEach(scene => {
      const childCount = scene.children.length;
      const hasVisibleChildren = scene.children.list.some(child => child.visible);
      
      if (childCount === 0) {
        errorLogger.logError({
          id: 'SCENE_NO_CONTENT',
          category: ErrorCategory.SCENE,
          severity: ErrorSeverity.HIGH,
          message: `Scene "${scene.scene.key}" Has No Content`,
          details: 'Scene is active but contains no game objects',
          solution: 'Add game objects to the scene in its create() method',
          timestamp: Date.now(),
          context: { sceneKey: scene.scene.key }
        });
      } else if (!hasVisibleChildren) {
        errorLogger.logError({
          id: 'SCENE_NO_VISIBLE_CONTENT',
          category: ErrorCategory.SCENE,
          severity: ErrorSeverity.MEDIUM,
          message: `Scene "${scene.scene.key}" Has No Visible Content`,
          details: `Scene has ${childCount} objects but none are visible`,
          solution: 'Check object visibility settings and positioning',
          timestamp: Date.now(),
          context: { 
            sceneKey: scene.scene.key,
            childCount,
            children: scene.children.list.map(child => ({
              type: child.type,
              visible: child.visible,
              alpha: child.alpha,
              x: child.x,
              y: child.y
            }))
          }
        });
      }
    });
    
    console.groupEnd();
  }

  public validateSceneCode(sceneKey: string, sceneClass: any): void {
    console.group(`🔍 Validating Scene Code: ${sceneKey}`);
    
    // Check if scene has required methods
    const requiredMethods = ['preload', 'create', 'update'];
    const availableMethods = Object.getOwnPropertyNames(sceneClass.prototype);
    
    requiredMethods.forEach(method => {
      if (!availableMethods.includes(method)) {
        console.warn(`⚠️ Scene ${sceneKey} missing recommended method: ${method}`);
      } else {
        console.log(`✅ Scene ${sceneKey} has method: ${method}`);
      }
    });
    
    // Check scene key consistency
    const scene = new sceneClass();
    if (scene.scene && scene.scene.settings && scene.scene.settings.key !== sceneKey) {
      errorLogger.logError({
        id: 'SCENE_KEY_MISMATCH',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.HIGH,
        message: `Scene Key Mismatch in ${sceneKey}`,
        details: `Scene constructor key "${scene.scene.settings.key}" doesn't match expected "${sceneKey}"`,
        solution: 'Fix scene constructor to use correct key',
        timestamp: Date.now(),
        context: { 
          expectedKey: sceneKey,
          actualKey: scene.scene.settings.key
        }
      });
    }
    
    console.groupEnd();
  }
}

// Create singleton instance
export const sceneValidator = SceneValidator.getInstance();
