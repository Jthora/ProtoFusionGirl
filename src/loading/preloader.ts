// Preloader for ProtoFusionGirl
// Handles loading states, progress tracking, and splash screen timing

export interface LoadingStep {
  name: string;
  duration: number;
  message: string;
}

export class PreloaderManager {
  private static instance: PreloaderManager;
  private progressElement: HTMLElement | null = null;
  private statusElement: HTMLElement | null = null;
  private preloaderElement: HTMLElement | null = null;
  private currentProgress = 0;
  private isComplete = false;

  // Loading steps — HoloDeck instance booting from within PsiNet
  private loadingSteps: LoadingStep[] = [
    { name: 'holoboot',    duration: 180, message: 'HoloDeck instance initializing...' },
    { name: 'leylines',    duration: 180, message: 'Synchronizing ley line telemetry...' },
    { name: 'terrain',     duration: 160, message: 'Loading terrain manifold...' },
    { name: 'beu',         duration: 160, message: 'Beu relay nodes coming online...' },
    { name: 'psi_scan',    duration: 200, message: 'Psionic signature scan — ACTIVE' },
    { name: 'timeline',    duration: 160, message: 'Timeline anchors verified...' },
    { name: 'integrity',   duration: 220, message: 'Simulation integrity check... \u2588\u2588\u2591\u2591\u2591\u2591 WARNING' },
    { name: 'locate_jane', duration: 200, message: 'Locating Jane Tho\u02bera... CONFIRMED' },
    { name: 'ready',       duration: 180, message: 'PsiNet handshake \u2014 CONNECTED' }
  ];

  private constructor() {
    this.initializeElements();
  }

  public static getInstance(): PreloaderManager {
    if (!PreloaderManager.instance) {
      PreloaderManager.instance = new PreloaderManager();
    }
    return PreloaderManager.instance;
  }

  private initializeElements(): void {
    this.progressElement = document.getElementById('progress-fill');
    this.statusElement = document.getElementById('loading-status');
    this.preloaderElement = document.getElementById('preloader');
  }

  public async startLoading(): Promise<void> {
    // Guard: auto-started from index.html DOMContentLoaded — skip if already ran.
    if (this.isComplete) return;
    console.log('🎮 ProtoFusionGirl - Starting loading sequence');
    
    // Show initial state
    this.updateProgress(0, 'Initializing...');
    
    let totalDuration = 0;
    let currentDuration = 0;

    // Calculate total duration
    this.loadingSteps.forEach(step => {
      totalDuration += step.duration;
    });

    // Execute loading steps
    for (const step of this.loadingSteps) {
      this.updateStatus(step.message);
      console.log(`📊 Loading: ${step.name} - ${step.message}`);
      
      // Animate progress over the step duration
      await this.animateProgressStep(
        (currentDuration / totalDuration) * 100,
        ((currentDuration + step.duration) / totalDuration) * 100,
        step.duration
      );
      
      currentDuration += step.duration;
    }

    // Mark as complete
    this.isComplete = true;
    this.updateProgress(100, 'Observer connection live.');
    
    // Wait a moment before hiding
    await this.delay(100);
    await this.hidePreloader();
  }

  private async animateProgressStep(startPercent: number, endPercent: number, duration: number): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentPercent = startPercent + (endPercent - startPercent) * easeProgress;
        
        this.updateProgress(currentPercent);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  private updateProgress(percent: number, status?: string): void {
    if (this.progressElement) {
      this.progressElement.style.width = `${Math.round(percent)}%`;
    }
    
    if (status && this.statusElement) {
      this.statusElement.textContent = status;
    }
    
    this.currentProgress = percent;
  }

  private updateStatus(message: string): void {
    if (this.statusElement) {
      this.statusElement.textContent = message;
    }
  }

  private async hidePreloader(): Promise<void> {
    return new Promise(resolve => {
      if (this.preloaderElement) {
        this.preloaderElement.classList.add('hidden');
        
        // Remove from DOM after transition
        setTimeout(() => {
          if (this.preloaderElement) {
            this.preloaderElement.remove();
          }
          
          // Show the main app
          const appElement = document.getElementById('app');
          if (appElement) {
            appElement.classList.remove('loading');
          }
          
          resolve();
        }, 800); // Match CSS transition duration
      } else {
        resolve();
      }
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for external control
  public setProgress(percent: number, message?: string): void {
    this.updateProgress(percent, message);
  }

  public setStatus(message: string): void {
    this.updateStatus(message);
  }

  public getProgress(): number {
    return this.currentProgress;
  }

  public isLoadingComplete(): boolean {
    return this.isComplete;
  }

  // Method to manually complete loading (for faster development)
  public async forceComplete(): Promise<void> {
    if (!this.isComplete) {
      this.updateProgress(100, 'Loading complete!');
      this.isComplete = true;
      await this.delay(300);
      await this.hidePreloader();
    }
  }
}

// Auto-start preloader when script loads
document.addEventListener('DOMContentLoaded', () => {
  // Hide app initially
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.classList.add('loading');
  }
  
  // Start preloader
  const preloader = PreloaderManager.getInstance();
  preloader.startLoading().catch(error => {
    console.error('❌ Preloader error:', error);
    // Fallback: force complete on error
    preloader.forceComplete();
  });
});

// Export for use in main app
declare global {
  interface Window {
    preloader: PreloaderManager;
  }
}

window.preloader = PreloaderManager.getInstance();
