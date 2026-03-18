// Main Loading Coordinator for ProtoFusionGirl
// Orchestrates preloader, main loading, and splash screen

import { PreloaderManager } from './preloader';
import { SplashScreenManager } from './SplashScreenManager';
import { PsiSysKernel } from '../ui/PsiSysKernel';
import { ProjectionTransit } from '../ui/ProjectionTransit';
import { LeyLineDive } from '../ui/LeyLineDive';
import { SessionPersistence } from '../save/SaveSystem';

export interface LoadingOptions {
  showPreloader: boolean;
  showSplash: boolean;
  skipSplashOnQuickLoad: boolean;
  developmentMode: boolean;
}

export class LoadingCoordinator {
  private static instance: LoadingCoordinator;
  private preloader: PreloaderManager;
  private splashScreen: SplashScreenManager;
  private gameReadyCallback: (() => void) | null = null;

  private constructor() {
    this.preloader = PreloaderManager.getInstance();
    this.splashScreen = SplashScreenManager.getInstance();
  }

  public static getInstance(): LoadingCoordinator {
    if (!LoadingCoordinator.instance) {
      LoadingCoordinator.instance = new LoadingCoordinator();
    }
    return LoadingCoordinator.instance;
  }

  public async startFullLoadingSequence(options: LoadingOptions = {
    showPreloader: true,
    showSplash: true,
    skipSplashOnQuickLoad: false,
    developmentMode: false
  }): Promise<void> {
    console.log('🎮 ProtoFusionGirl - Starting full loading sequence');

    try {
      // Phase 1: Preloader (asset loading simulation)
      if (options.showPreloader) {
        console.log('📊 Phase 1: Preloader');
        await this.preloader.startLoading();
      }

      // Phase 2: Actual game initialization
      console.log('🎯 Phase 2: Game initialization');
      await this.initializeGame();

      // Phase 3: PsiSys Kernel (callsign + return status diff)
      if (options.showSplash && !options.skipSplashOnQuickLoad) {
        console.log('🖥️ Phase 3: PsiSys Kernel');
        const kernel = new PsiSysKernel();
        const callsign = await kernel.run();
        console.log(`🖥️ PsiSys Kernel complete — operator: ${callsign}`);
        SessionPersistence.startSession();

        // Phase 3b: Projection Transit — Frequency Lock (default) or Ley Line Dive (alternate)
        // Toggle via localStorage key 'pfg_transit_mode' = 'leyline' to activate Concept C.
        const transitMode = localStorage.getItem('pfg_transit_mode');
        if (transitMode === 'leyline') {
          console.log('🌐 Phase 3b: Ley Line Dive transit');
          await new Promise<void>(resolve => {
            const dive = new LeyLineDive();
            dive.onComplete = resolve;
            dive.mount();
          });
          console.log('🌐 Ley Line Dive complete — entering HoloDeck');
        } else {
          console.log('📡 Phase 3b: Projection Transit');
          await ProjectionTransit.show();
          console.log('📡 Projection Transit complete — entering HoloDeck');
        }
      }

      // Phase 4: Launch game (Phaser init)
      console.log('🚀 Phase 4: Launching game');
      this.launchGame();

    } catch (error) {
      console.error('❌ Loading sequence error:', error);
      this.handleLoadingError(error);
    }
  }

  private async initializeGame(): Promise<void> {
    // This is where we would initialize game systems
    // Fast initialization for development
    
    return new Promise(resolve => {
      // Simulate game initialization time (fast for development)
      setTimeout(() => {
        console.log('✅ Game systems initialized');
        resolve();
      }, 50);
    });
  }

  private launchGame(): void {
    console.log('🎮 Game launched successfully');
    
    // Trigger game ready callback if set
    if (this.gameReadyCallback) {
      this.gameReadyCallback();
    }

    // Dispatch custom event for other systems
    const event = new CustomEvent('gameReady', {
      detail: { timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  }

  private handleLoadingError(error: any): void {
    console.error('Loading error:', error);
    
    // Show error message to user
    this.showErrorMessage('Failed to load ProtoFusionGirl. Please refresh and try again.');
    
    // Force complete loading after delay
    setTimeout(() => {
      this.preloader.forceComplete();
      this.launchGame();
    }, 2000);
  }

  private showErrorMessage(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.1);
      border: 2px solid #ff4444;
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      z-index: 20000;
      text-align: center;
      font-family: Arial, sans-serif;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    // Remove after delay
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  // Public methods for external control
  public setGameReadyCallback(callback: () => void): void {
    this.gameReadyCallback = callback;
  }

  public async quickStart(): Promise<void> {
    console.log('⚡ Quick start mode');
    await this.startFullLoadingSequence({
      showPreloader: false,
      showSplash: false,
      skipSplashOnQuickLoad: true,
      developmentMode: true
    });
  }

  public async developmentStart(): Promise<void> {
    console.log('🔧 Development mode start');
    await this.startFullLoadingSequence({
      showPreloader: true,
      showSplash: true,
      skipSplashOnQuickLoad: false,
      developmentMode: true
    });
  }

  public getPreloader(): PreloaderManager {
    return this.preloader;
  }

  public getSplashScreen(): SplashScreenManager {
    return this.splashScreen;
  }
}

// Global loading functions for easy access
export async function startGame(options?: LoadingOptions): Promise<void> {
  const coordinator = LoadingCoordinator.getInstance();
  await coordinator.startFullLoadingSequence(options);
}

export async function quickStartGame(): Promise<void> {
  const coordinator = LoadingCoordinator.getInstance();
  await coordinator.quickStart();
}

export async function developmentStartGame(): Promise<void> {
  const coordinator = LoadingCoordinator.getInstance();
  await coordinator.developmentStart();
}

// Export for global access
declare global {
  interface Window {
    loadingCoordinator: LoadingCoordinator;
    startGame: typeof startGame;
    quickStartGame: typeof quickStartGame;
  }
}

const coordinator = LoadingCoordinator.getInstance();
window.loadingCoordinator = coordinator;
window.startGame = startGame;
window.quickStartGame = quickStartGame;
