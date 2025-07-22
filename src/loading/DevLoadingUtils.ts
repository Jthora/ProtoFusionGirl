// Development Loading Utils
// Quick utilities for testing different loading experiences during development

export function addLoadingDevControls(): void {
  // Only add in development
  if (import.meta.env.PROD) return;

  // Add dev controls to the page
  const devControls = document.createElement('div');
  devControls.id = 'dev-loading-controls';
  devControls.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 30000;
    border: 1px solid #333;
  `;

  devControls.innerHTML = `
    <div style="margin-bottom: 0.5rem; font-weight: bold;">🔧 Loading Dev Controls</div>
    <button id="quick-start-btn" style="margin: 2px; padding: 4px 8px; font-size: 11px;">Quick Start</button>
    <button id="full-loading-btn" style="margin: 2px; padding: 4px 8px; font-size: 11px;">Full Loading</button>
    <button id="skip-splash-btn" style="margin: 2px; padding: 4px 8px; font-size: 11px;">Skip Splash</button>
    <button id="force-complete-btn" style="margin: 2px; padding: 4px 8px; font-size: 11px;">Force Complete</button>
    <div style="margin-top: 0.5rem; font-size: 10px; opacity: 0.7;">
      Progress: <span id="dev-progress">0%</span>
    </div>
  `;

  document.body.appendChild(devControls);

  // Add event listeners
  document.getElementById('quick-start-btn')?.addEventListener('click', () => {
    (window as any).quickStartGame?.();
  });

  document.getElementById('full-loading-btn')?.addEventListener('click', () => {
    location.reload();
  });

  document.getElementById('skip-splash-btn')?.addEventListener('click', () => {
    (window as any).splashScreen?.hideSplash?.();
  });

  document.getElementById('force-complete-btn')?.addEventListener('click', () => {
    (window as any).preloader?.forceComplete?.();
  });

  // Update progress indicator
  const updateProgress = () => {
    const progressElement = document.getElementById('dev-progress');
    if (progressElement && (window as any).preloader) {
      progressElement.textContent = `${Math.round((window as any).preloader.getProgress?.() || 0)}%`;
    }
  };

  setInterval(updateProgress, 100);

  // Hide after game loads
  document.addEventListener('gameReady', () => {
    setTimeout(() => {
      devControls.style.opacity = '0.3';
    }, 2000);
  });
}

// URL parameter helpers for loading control
export function getLoadingOptions(): { quick: boolean; skipSplash: boolean; dev: boolean } {
  const params = new URLSearchParams(window.location.search);
  return {
    quick: params.has('quick'),
    skipSplash: params.has('nsplash'),
    dev: params.has('dev')
  };
}

// Auto-add dev controls in development - DISABLED
// if (import.meta.env.DEV) {
//   document.addEventListener('DOMContentLoaded', () => {
//     addLoadingDevControls();
//   });
// }
