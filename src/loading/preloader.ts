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

  // Loading steps with realistic timing
  private loadingSteps: LoadingStep[] = [
    { name: 'init', duration: 500, message: 'Initializing ASI Control Interface...' },
    { name: 'assets', duration: 800, message: 'Loading FusionGirl assets...' },
    { name: 'leylines', duration: 600, message: 'Calibrating ley line network...' },
    { name: 'asi_systems', duration: 700, message: 'Activating ASI systems...' },
    { name: 'trust_protocols', duration: 400, message: 'Establishing trust protocols...' },
    { name: 'threat_detection', duration: 500, message: 'Initializing threat detection...' },
    { name: 'guidance_engine', duration: 600, message: 'Loading guidance algorithms...' },
    { name: 'world_generation', duration: 900, message: 'Generating world chunks...' },
    { name: 'final_checks', duration: 300, message: 'Running final diagnostics...' },
    { name: 'ready', duration: 200, message: 'ASI Control Interface ready!' }
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
    this.updateProgress(100, 'Complete!');
    
    // Wait a moment before hiding
    await this.delay(500);
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
