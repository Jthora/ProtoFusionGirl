import './style.css'
import Phaser from 'phaser';
import { StartScene } from './scenes/StartScene';
import { GameScene } from './scenes/GameScene';
import { MinimalGameScene } from './scenes/MinimalGameScene';
import { PauseMenuScene } from './scenes/PauseMenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { TimelineResultScene } from './scenes/TimelineResultScene';

// Import comprehensive error logging system
import { errorLogger } from './utils/ErrorLogger';
import { createStartupError } from './utils/StartupErrors';
import './utils/StartupDiagnostics'; // Auto-runs diagnostics
import './utils/SceneValidatorSimple'; // Auto-runs scene validation
import './utils/RuntimeMonitor'; // Auto-runs runtime monitoring
import './utils/ErrorSystemSummary'; // Auto-runs error system summary
// Import ASI Control Interface monitoring
import { asiHealthMonitor } from './utils/ASIHealthMonitor';
import { asiDemo } from './utils/ASIIntegrationDemo';

// Import App Icon Manager for proper branding
import { AppIconManager } from './core/AppIconManager';

// Import Loading System
import { LoadingCoordinator } from './loading/LoadingCoordinator';
// Import development loading utilities
import './loading/DevLoadingUtils';

// Initialize app icon and branding
const appIconManager = AppIconManager.getInstance();
appIconManager.initialize();

// Initialize loading coordinator
const loadingCoordinator = LoadingCoordinator.getInstance();

// Set up game ready callback to initialize Phaser after loading
loadingCoordinator.setGameReadyCallback(() => {
  initializePhaserGame();
});

// Check if we should use development loading (faster for development)
const urlParams = new URLSearchParams(window.location.search);
const quickStart = urlParams.has('quick');

if (quickStart) {
  // Quick start for development
  loadingCoordinator.quickStart();
} else if (import.meta.env.DEV) {
  // Development mode: fast timings
  loadingCoordinator.developmentStart();
} else {
  // Production: full loading sequence with proper timing
  loadingCoordinator.startFullLoadingSequence();
}

function initializePhaserGame() {
  const appDiv = document.querySelector<HTMLDivElement>('#app');
  if (appDiv) {
    // Clear the loading message
    appDiv.innerHTML = '';
  } else {
    errorLogger.logError(createStartupError('DOM_CONTAINER_NOT_FOUND'));
  }

  // Game configuration with comprehensive error handling
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: '100%',
    height: '100%',
    parent: 'app',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: '100%',
      height: '100%'
    },
  physics: {
      default: 'arcade',
      arcade: {
    // Gravity is controlled at runtime by WorldPhysics.setupGravity. Keep config gravity neutral.
    gravity: { x: 0, y: 0 },
        debug: false, // Set to true for development
      },
    },
    // Include both GameScene and MinimalGameScene for flexibility
    scene: [StartScene, GameScene, MinimalGameScene, PauseMenuScene, SettingsScene, TimelineResultScene],
    backgroundColor: '#222',
    callbacks: {
      preBoot: () => {
        console.log('🎮 ProtoFusionGirl - Pre-boot phase');
      },
      postBoot: () => {
        console.log('🎮 ProtoFusionGirl - Post-boot phase');
        errorLogger.logStartupSuccess();
      }
    }
  };

  // Initialize the game with error handling
  try {
    const game = new Phaser.Game(config);
  
  // Global error handlers for Phaser-specific errors
  game.events.on('ready', () => {
    console.log('🎉 ProtoFusionGirl - Game ready!');
  });
  
  game.events.on('destroy', () => {
    console.log('🛑 ProtoFusionGirl - Game destroyed');
  });
  
  // WebGL context lost handling
  game.canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    errorLogger.logError(createStartupError('WEBGL_CONTEXT_LOST', { event }));
  });
  
  game.canvas.addEventListener('webglcontextrestored', () => {
    console.log('✅ WebGL context restored');
  });
  
  console.log('🚀 ProtoFusionGirl - Game initialized successfully!');
  
  // Initialize ASI Health Monitoring after successful game startup
  console.log('🤖 Starting ASI Control Interface monitoring...');
  asiHealthMonitor.startMonitoring();
  
  // Expose ASI monitor globally for debugging
  (window as any).asiHealthMonitor = asiHealthMonitor;
  (window as any).asiDemo = asiDemo;
  
  } catch (error) {
    errorLogger.logError(createStartupError('PHASER_INITIALIZATION_FAILED', { error }));
    console.error('🚨 CRITICAL: Game initialization failed!', error);
  
    if (appDiv) {
      appDiv.innerHTML = `
        <div style="
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          height:100vh; font-family:'Courier New',Courier,monospace;
          background:#0d0e10; color:#f0ede8; text-align:left; padding:40px;
        ">
          <div style="max-width:560px; border:1px solid rgba(255,140,0,0.25); border-left:2px solid #FF8C00; padding:28px 32px; background:#0a0b0d;">
            <div style="color:#ff5c5c; font-size:12px; letter-spacing:1.5px; margin-bottom:12px;">[PSISYS] CRITICAL FAULT — HoloDeck init failed</div>
            <div style="color:#FF8C00; font-size:13px; letter-spacing:1.2px; margin-bottom:18px;">Simulation engine could not start.</div>
            <div style="color:#5a5e66; font-size:11px; letter-spacing:1px; margin-bottom:4px;">Possible causes:</div>
            <ul style="color:#a0a4ac; font-size:11px; letter-spacing:0.8px; margin:0 0 20px 16px; padding:0; line-height:1.9;">
              <li>WebGL unavailable or disabled in this browser</li>
              <li>Browser extension interfering with canvas</li>
              <li>Missing or blocked resources — try clearing cache</li>
            </ul>
            <div style="display:flex; gap:12px; margin-top:4px;">
              <button onclick="location.reload()" style="
                background:#1a1200; color:#FF8C00; border:1px solid rgba(255,140,0,0.4);
                padding:9px 20px; font-family:'Courier New',monospace; font-size:12px;
                letter-spacing:1.2px; cursor:pointer;
              ">[ RETRY ]</button>
              <button onclick="console.log(window.errorLogger?.exportErrorReport?.())" style="
                background:#0d0e10; color:#5a5e66; border:1px solid rgba(90,94,102,0.3);
                padding:9px 20px; font-family:'Courier New',monospace; font-size:12px;
                letter-spacing:1.2px; cursor:pointer;
              ">[ EXPORT REPORT ]</button>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Expose error logger globally for debugging
  (window as any).errorLogger = errorLogger;
}

// Call initialization when loading is complete (handled by LoadingCoordinator)