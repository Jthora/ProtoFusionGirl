import './style.css'
import Phaser from 'phaser';
import { StartScene } from './scenes/StartScene';
import { GameScene } from './scenes/GameScene';
import { MinimalGameScene } from './scenes/MinimalGameScene';
import { PauseMenuScene } from './scenes/PauseMenuScene';
import { SettingsScene } from './scenes/SettingsScene';

// Import comprehensive error logging system
import { errorLogger, ErrorCategory, ErrorSeverity } from './utils/ErrorLogger';
import { createStartupError } from './utils/StartupErrors';
import { diagnostics } from './utils/StartupDiagnostics';

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
  // Clear the loading message
  appDiv.innerHTML = '';
} else {
  errorLogger.logError(createStartupError('DOM_CONTAINER_NOT_FOUND'));
}

import './style.css'
import Phaser from 'phaser';
import { StartScene } from './scenes/StartScene';
import { GameScene } from './scenes/GameScene';
import { MinimalGameScene } from './scenes/MinimalGameScene';
import { PauseMenuScene } from './scenes/PauseMenuScene';
import { SettingsScene } from './scenes/SettingsScene';

// Import comprehensive error logging system
import { errorLogger } from './utils/ErrorLogger';
import { createStartupError } from './utils/StartupErrors';
import './utils/StartupDiagnostics'; // Auto-runs diagnostics

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
  width: 800,
  height: 600,
  parent: 'app',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 500 },
      debug: false, // Set to true for development
    },
  },
  // Include both GameScene and MinimalGameScene for flexibility
  scene: [StartScene, GameScene, MinimalGameScene, PauseMenuScene, SettingsScene],
  backgroundColor: '#222',
  callbacks: {
    preBoot: (game) => {
      console.log('🎮 ProtoFusionGirl - Pre-boot phase');
    },
    postBoot: (game) => {
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
  
} catch (error) {
  errorLogger.logError(createStartupError('PHASER_INITIALIZATION_FAILED', { error }));
  console.error('🚨 CRITICAL: Game initialization failed!', error);
  
  // Show user-friendly error message
  if (appDiv) {
    appDiv.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 20px;
      ">
        <h1 style="font-size: 2.5em; margin-bottom: 20px;">🚨 Game Initialization Error</h1>
        <p style="font-size: 1.2em; margin-bottom: 30px; max-width: 600px;">
          ProtoFusionGirl encountered an error during startup. This may be due to browser compatibility issues or missing resources.
        </p>
        <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin-bottom: 30px;">
          <h3>🔧 Troubleshooting Steps:</h3>
          <ul style="text-align: left; margin: 0; padding-left: 20px;">
            <li>Refresh the page and try again</li>
            <li>Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)</li>
            <li>Check that WebGL is enabled in your browser</li>
            <li>Disable browser extensions that might interfere</li>
            <li>Clear browser cache and cookies</li>
          </ul>
        </div>
        <button onclick="location.reload()" style="
          background: #4CAF50;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
          margin-right: 10px;
        ">🔄 Retry</button>
        <button onclick="console.log(errorLogger.exportErrorReport())" style="
          background: #2196F3;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
        ">📋 Export Error Report</button>
      </div>
    `;
  }
}
