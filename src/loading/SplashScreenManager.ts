// Splash Screen Manager for ProtoFusionGirl
// Handles the post-loading splash screen with FusionGirl branding and ASI introduction

export interface SplashConfig {
  showLogo: boolean;
  showSubtitle: boolean;
  showASIIntro: boolean;
  duration: number;
  skipable: boolean;
}

export class SplashScreenManager {
  private static instance: SplashScreenManager;
  private splashElement: HTMLElement | null = null;
  private isShowing = false;
  private skipHandler: ((event: Event) => void) | null = null;

  private constructor() {}

  public static getInstance(): SplashScreenManager {
    if (!SplashScreenManager.instance) {
      SplashScreenManager.instance = new SplashScreenManager();
    }
    return SplashScreenManager.instance;
  }

  public async showSplash(_config: SplashConfig = {
    showLogo: true,
    showSubtitle: true,
    showASIIntro: true,
    duration: 4000,
    skipable: true
  }): Promise<void> {
    // Splash removed — the HoloDeck preloader and Jono's first-contact sequence
    // together form the complete entry experience. A third layer of interstitial
    // copy adds delay without adding meaning.
    return Promise.resolve();

    // Dead code below preserved for reference if ever needed
    if (this.isShowing) return;

    this.isShowing = true;
    this.createSplashScreen(_config);
    
    return new Promise(resolve => {
      const cleanup = () => {
        this.isShowing = false;
        if (this.skipHandler) {
          document.removeEventListener('keydown', this.skipHandler as EventListener);
          document.removeEventListener('click', this.skipHandler as EventListener);
        }
        resolve();
      };

      // Auto-hide after duration
      const autoHideTimer = setTimeout(() => {
        this.hideSplash().then(cleanup);
      }, config.duration);

      // Skip functionality
      if (config.skipable) {
        this.skipHandler = (event: Event) => {
          if (event instanceof KeyboardEvent && 
              !['Enter', 'Space', 'Escape'].includes(event.code)) {
            return;
          }
          
          clearTimeout(autoHideTimer);
          this.hideSplash().then(cleanup);
        };

        document.addEventListener('keydown', this.skipHandler as EventListener);
        document.addEventListener('click', this.skipHandler as EventListener);
      }
    });
  }

  private createSplashScreen(config: SplashConfig): void {
    // Remove existing splash if any
    if (this.splashElement) {
      this.splashElement.remove();
    }

    // Create splash container
    this.splashElement = document.createElement('div');
    this.splashElement.className = 'splash-screen';
    this.splashElement.innerHTML = this.generateSplashHTML(config);

    // Add to DOM
    document.body.appendChild(this.splashElement);

    // Trigger animations
    setTimeout(() => {
      if (this.splashElement) {
        this.splashElement.classList.add('show');
      }
    }, 100);
  }

  private generateSplashHTML(config: SplashConfig): string {
    let html = '';

    if (config.showLogo) {
      html += `
        <div class="splash-logo">
          <img src="/favicon-512.png" alt="FusionGirl" class="splash-icon">
          <div class="splash-title">ProtoFusionGirl</div>
        </div>
      `;
    }

    if (config.showSubtitle) {
      html += `
        <div class="splash-subtitle">
          Advanced ASI Control Interface
        </div>
      `;
    }

    if (config.showASIIntro) {
      html += `
        <div class="splash-intro">
          <div class="intro-text">
            <p>Welcome to the ASI Control Interface</p>
            <p>Experience superior AI-mediated gameplay</p>
            <p>Control Jane through omniscient awareness</p>
          </div>
        </div>
      `;
    }

    if (config.skipable) {
      html += `
        <div class="splash-skip">
          <span>Press any key or click to continue</span>
        </div>
      `;
    }

    return html;
  }

  private async hideSplash(): Promise<void> {
    return new Promise(resolve => {
      if (this.splashElement) {
        this.splashElement.classList.add('hide');
        
        setTimeout(() => {
          if (this.splashElement) {
            this.splashElement.remove();
            this.splashElement = null;
          }
          resolve();
        }, 800);
      } else {
        resolve();
      }
    });
  }

  // Add splash screen styles dynamically
  public injectSplashStyles(): void {
    if (document.getElementById('splash-styles')) return;

    const style = document.createElement('style');
    style.id = 'splash-styles';
    style.textContent = `
      .splash-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #000011 0%, #001122 50%, #000033 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 15000;
        opacity: 0;
        transition: opacity 0.8s ease-in-out;
        color: white;
        text-align: center;
      }

      .splash-screen.show {
        opacity: 1;
      }

      .splash-screen.hide {
        opacity: 0;
      }

      .splash-logo {
        margin-bottom: 2rem;
        animation: splash-fade-in 1s ease-out;
      }

      .splash-icon {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        box-shadow: 0 0 40px rgba(65, 105, 225, 0.8);
        animation: splash-glow 2s ease-in-out infinite alternate;
        margin-bottom: 1rem;
      }

      .splash-title {
        font-size: 3rem;
        font-weight: bold;
        color: #ffffff;
        text-shadow: 0 0 20px rgba(65, 105, 225, 0.8);
        margin-bottom: 0.5rem;
      }

      .splash-subtitle {
        font-size: 1.5rem;
        color: #00ffcc;
        margin-bottom: 3rem;
        animation: splash-fade-in 1s ease-out 0.5s both;
      }

      .splash-intro {
        max-width: 600px;
        animation: splash-fade-in 1s ease-out 1s both;
      }

      .intro-text p {
        font-size: 1.2rem;
        margin: 1rem 0;
        color: rgba(255, 255, 255, 0.9);
        animation: splash-text-flow 0.8s ease-out;
      }

      .intro-text p:nth-child(2) {
        animation-delay: 0.2s;
      }

      .intro-text p:nth-child(3) {
        animation-delay: 0.4s;
      }

      .splash-skip {
        position: absolute;
        bottom: 2rem;
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.6);
        animation: splash-pulse 2s ease-in-out infinite;
      }

      @keyframes splash-fade-in {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes splash-glow {
        from {
          box-shadow: 0 0 40px rgba(65, 105, 225, 0.8);
        }
        to {
          box-shadow: 0 0 60px rgba(65, 105, 225, 1), 0 0 100px rgba(0, 255, 204, 0.6);
        }
      }

      @keyframes splash-text-flow {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes splash-pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    `;

    document.head.appendChild(style);
  }
}

// Initialize splash screen styles when loaded
document.addEventListener('DOMContentLoaded', () => {
  const splashManager = SplashScreenManager.getInstance();
  splashManager.injectSplashStyles();
});

// Export for global access
declare global {
  interface Window {
    splashScreen: SplashScreenManager;
  }
}

window.splashScreen = SplashScreenManager.getInstance();
