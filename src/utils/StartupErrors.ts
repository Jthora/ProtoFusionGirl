/**
 * ProtoFusionGirl - Comprehensive Startup Error Definitions
 * 
 * This file contains detailed error definitions for all possible startup,
 * initialization, and runtime issues that could occur in the game.
 */

import { ErrorCategory, ErrorSeverity, GameError } from './ErrorLogger';

export const STARTUP_ERRORS: Record<string, Omit<GameError, 'timestamp'>> = {
  // === CRITICAL STARTUP ERRORS ===
  PHASER_INITIALIZATION_FAILED: {
    id: 'PHASER_INITIALIZATION_FAILED',
    category: ErrorCategory.STARTUP,
    severity: ErrorSeverity.CRITICAL,
    message: 'Phaser Game Engine Failed to Initialize',
    details: 'The Phaser game engine could not be created or started',
    solution: 'Check browser compatibility and ensure WebGL is available. Refresh the page and try again.',
    subErrors: [
      {
        id: 'PHASER_CONFIG_INVALID',
        category: ErrorCategory.STARTUP,
        severity: ErrorSeverity.CRITICAL,
        message: 'Invalid Phaser Configuration',
        details: 'Game configuration object contains invalid properties',
        solution: 'Verify all configuration properties are valid Phaser options',
        timestamp: 0
      },
      {
        id: 'CANVAS_CREATION_FAILED',
        category: ErrorCategory.STARTUP,
        severity: ErrorSeverity.CRITICAL,
        message: 'Canvas Element Creation Failed',
        details: 'Browser cannot create HTML5 canvas element',
        solution: 'Ensure browser supports HTML5 Canvas API',
        timestamp: 0
      }
    ]
  },

  DOM_CONTAINER_NOT_FOUND: {
    id: 'DOM_CONTAINER_NOT_FOUND',
    category: ErrorCategory.STARTUP,
    severity: ErrorSeverity.CRITICAL,
    message: 'Game Container Element Not Found',
    details: 'The HTML element with id "app" could not be found in the DOM',
    solution: 'Ensure the index.html contains a div with id="app" before initializing the game.',
    subErrors: [
      {
        id: 'DOM_NOT_READY',
        category: ErrorCategory.STARTUP,
        severity: ErrorSeverity.HIGH,
        message: 'DOM Not Ready',
        details: 'Script executed before DOM content was loaded',
        solution: 'Ensure script runs after DOMContentLoaded event',
        timestamp: 0
      }
    ]
  },

  WEBGL_CONTEXT_LOST: {
    id: 'WEBGL_CONTEXT_LOST',
    category: ErrorCategory.STARTUP,
    severity: ErrorSeverity.CRITICAL,
    message: 'WebGL Context Lost',
    details: 'The WebGL rendering context was lost during initialization',
    solution: 'This usually indicates GPU driver issues. Try refreshing the page or restarting the browser.',
    subErrors: [
      {
        id: 'GPU_RESET',
        category: ErrorCategory.STARTUP,
        severity: ErrorSeverity.CRITICAL,
        message: 'GPU Reset Detected',
        details: 'Graphics card driver has reset',
        solution: 'Update graphics drivers and restart the browser',
        timestamp: 0
      },
      {
        id: 'OUT_OF_MEMORY',
        category: ErrorCategory.STARTUP,
        severity: ErrorSeverity.CRITICAL,
        message: 'GPU Out of Memory',
        details: 'Graphics card has run out of video memory',
        solution: 'Close other applications and browser tabs, or reduce graphics settings',
        timestamp: 0
      }
    ]
  },

  // === SCENE MANAGEMENT ERRORS ===
  SCENE_NOT_FOUND: {
    id: 'SCENE_NOT_FOUND',
    category: ErrorCategory.SCENE,
    severity: ErrorSeverity.CRITICAL,
    message: 'Game Scene Not Found',
    details: 'Attempted to start a scene that was not registered in the game configuration',
    solution: 'Verify the scene key exists in the main.ts scene array. Current issue: StartScene tries to start "GameScene" but only "MinimalGameScene" is registered.',
    subErrors: [
      {
        id: 'SCENE_KEY_MISMATCH',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.HIGH,
        message: 'Scene Key Mismatch',
        details: 'Scene key in code does not match registered scene key',
        solution: 'Check that scene keys match between registration and scene transitions',
        timestamp: 0
      },
      {
        id: 'SCENE_NOT_REGISTERED',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.HIGH,
        message: 'Scene Not Registered',
        details: 'Scene class exists but was not added to game configuration',
        solution: 'Add the scene to the scenes array in main.ts',
        timestamp: 0
      }
    ]
  },

  SCENE_TRANSITION_FAILED: {
    id: 'SCENE_TRANSITION_FAILED',
    category: ErrorCategory.SCENE,
    severity: ErrorSeverity.HIGH,
    message: 'Scene Transition Failed',
    details: 'Could not transition from one scene to another',
    solution: 'Check that target scene exists and is properly initialized',
    subErrors: [
      {
        id: 'SCENE_ALREADY_RUNNING',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.MEDIUM,
        message: 'Scene Already Running',
        details: 'Attempted to start a scene that is already active',
        solution: 'Check scene state before attempting transitions',
        timestamp: 0
      },
      {
        id: 'SCENE_CLEANUP_FAILED',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.MEDIUM,
        message: 'Scene Cleanup Failed',
        details: 'Previous scene failed to properly clean up resources',
        solution: 'Ensure all scene cleanup logic is properly implemented',
        timestamp: 0
      }
    ]
  },

  // === ASSET LOADING ERRORS ===
  ASSET_LOAD_TIMEOUT: {
    id: 'ASSET_LOAD_TIMEOUT',
    category: ErrorCategory.ASSET,
    severity: ErrorSeverity.HIGH,
    message: 'Asset Loading Timeout',
    details: 'Game assets failed to load within the expected timeframe',
    solution: 'Check network connection and asset file availability. Assets may be too large or server unresponsive.',
    subErrors: [
      {
        id: 'NETWORK_SLOW',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: 'Slow Network Connection',
        details: 'Network connection is too slow for asset loading',
        solution: 'Wait for better connection or enable low-bandwidth mode',
        timestamp: 0
      },
      {
        id: 'SERVER_UNRESPONSIVE',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.HIGH,
        message: 'Asset Server Unresponsive',
        details: 'Game asset server is not responding',
        solution: 'Check if game servers are online or try again later',
        timestamp: 0
      }
    ]
  },

  TEXTURE_LOAD_FAILED: {
    id: 'TEXTURE_LOAD_FAILED',
    category: ErrorCategory.ASSET,
    severity: ErrorSeverity.HIGH,
    message: 'Texture Loading Failed',
    details: 'One or more game textures could not be loaded',
    solution: 'Check that texture files exist and are in supported formats (PNG, JPG, WebP)',
    subErrors: [
      {
        id: 'TEXTURE_FORMAT_UNSUPPORTED',
        category: ErrorCategory.ASSET,
        severity: ErrorSeverity.MEDIUM,
        message: 'Unsupported Texture Format',
        details: 'Texture file format is not supported by the browser',
        solution: 'Convert textures to PNG or JPG format',
        timestamp: 0
      },
      {
        id: 'TEXTURE_CORRUPTED',
        category: ErrorCategory.ASSET,
        severity: ErrorSeverity.MEDIUM,
        message: 'Corrupted Texture File',
        details: 'Texture file appears to be corrupted or incomplete',
        solution: 'Re-download or replace the corrupted texture file',
        timestamp: 0
      }
    ]
  },

  // === AUDIO SYSTEM ERRORS ===
  AUDIO_CONTEXT_BLOCKED: {
    id: 'AUDIO_CONTEXT_BLOCKED',
    category: ErrorCategory.AUDIO,
    severity: ErrorSeverity.MEDIUM,
    message: 'Audio Context Blocked by Browser',
    details: 'Browser autoplay policy prevents audio initialization without user interaction',
    solution: 'Audio will be enabled after first user interaction (click, tap, or key press). This is normal browser behavior.',
    subErrors: [
      {
        id: 'AUTOPLAY_POLICY_STRICT',
        category: ErrorCategory.AUDIO,
        severity: ErrorSeverity.MEDIUM,
        message: 'Strict Autoplay Policy',
        details: 'Browser has strict autoplay prevention enabled',
        solution: 'User must interact with page before audio can play',
        timestamp: 0
      }
    ]
  },

  WEB_AUDIO_NOT_SUPPORTED: {
    id: 'WEB_AUDIO_NOT_SUPPORTED',
    category: ErrorCategory.AUDIO,
    severity: ErrorSeverity.MEDIUM,
    message: 'Web Audio API Not Supported',
    details: 'Browser does not support the Web Audio API',
    solution: 'Audio features will be limited. Consider upgrading to a modern browser.',
    subErrors: [
      {
        id: 'LEGACY_BROWSER',
        category: ErrorCategory.COMPATIBILITY,
        severity: ErrorSeverity.MEDIUM,
        message: 'Legacy Browser Detected',
        details: 'Browser version is too old for modern web features',
        solution: 'Update browser to latest version for best experience',
        timestamp: 0
      }
    ]
  },

  AUDIO_DECODE_ERROR: {
    id: 'AUDIO_DECODE_ERROR',
    category: ErrorCategory.AUDIO,
    severity: ErrorSeverity.MEDIUM,
    message: 'Audio File Decode Error',
    details: 'Audio file could not be decoded by the browser',
    solution: 'Check audio file format and encoding. Supported formats: MP3, OGG, WebM, WAV',
    subErrors: [
      {
        id: 'CODEC_NOT_SUPPORTED',
        category: ErrorCategory.AUDIO,
        severity: ErrorSeverity.MEDIUM,
        message: 'Audio Codec Not Supported',
        details: 'Audio file uses unsupported codec',
        solution: 'Convert audio to widely supported format like MP3',
        timestamp: 0
      }
    ]
  },

  // === PHYSICS ENGINE ERRORS ===
  PHYSICS_ENGINE_FAILED: {
    id: 'PHYSICS_ENGINE_FAILED',
    category: ErrorCategory.PHYSICS,
    severity: ErrorSeverity.HIGH,
    message: 'Physics Engine Initialization Failed',
    details: 'Arcade Physics system could not be initialized',
    solution: 'Check Phaser physics configuration and browser compatibility',
    subErrors: [
      {
        id: 'PHYSICS_CONFIG_INVALID',
        category: ErrorCategory.PHYSICS,
        severity: ErrorSeverity.HIGH,
        message: 'Invalid Physics Configuration',
        details: 'Physics configuration contains invalid properties',
        solution: 'Verify physics configuration matches Phaser documentation',
        timestamp: 0
      }
    ]
  },

  COLLISION_DETECTION_ERROR: {
    id: 'COLLISION_DETECTION_ERROR',
    category: ErrorCategory.PHYSICS,
    severity: ErrorSeverity.MEDIUM,
    message: 'Collision Detection Error',
    details: 'Physics collision detection system encountered an error',
    solution: 'Check physics body setup and collision group configuration',
    subErrors: [
      {
        id: 'PHYSICS_BODY_INVALID',
        category: ErrorCategory.PHYSICS,
        severity: ErrorSeverity.MEDIUM,
        message: 'Invalid Physics Body',
        details: 'Game object has invalid or corrupted physics body',
        solution: 'Recreate physics body with valid parameters',
        timestamp: 0
      }
    ]
  },

  // === UI SYSTEM ERRORS ===
  UI_COMPONENT_RENDER_FAILED: {
    id: 'UI_COMPONENT_RENDER_FAILED',
    category: ErrorCategory.UI,
    severity: ErrorSeverity.MEDIUM,
    message: 'UI Component Render Failed',
    details: 'A UI component could not be rendered properly',
    solution: 'Check UI component code and ensure all required properties are set',
    subErrors: [
      {
        id: 'UI_ELEMENT_NOT_FOUND',
        category: ErrorCategory.UI,
        severity: ErrorSeverity.MEDIUM,
        message: 'UI Element Not Found',
        details: 'Required UI element could not be located',
        solution: 'Ensure UI element exists before attempting to modify it',
        timestamp: 0
      },
      {
        id: 'UI_STYLE_INVALID',
        category: ErrorCategory.UI,
        severity: ErrorSeverity.LOW,
        message: 'Invalid UI Style',
        details: 'UI component has invalid style properties',
        solution: 'Check UI style configuration and CSS properties',
        timestamp: 0
      }
    ]
  },

  INPUT_HANDLER_FAILED: {
    id: 'INPUT_HANDLER_FAILED',
    category: ErrorCategory.UI,
    severity: ErrorSeverity.MEDIUM,
    message: 'Input Handler Failed',
    details: 'Input event handler could not be registered or executed',
    solution: 'Check input handler code and event listener setup',
    subErrors: [
      {
        id: 'KEYBOARD_NOT_AVAILABLE',
        category: ErrorCategory.UI,
        severity: ErrorSeverity.MEDIUM,
        message: 'Keyboard Input Not Available',
        details: 'Keyboard input plugin is not accessible',
        solution: 'Ensure keyboard input is enabled in game configuration',
        timestamp: 0
      },
      {
        id: 'TOUCH_NOT_SUPPORTED',
        category: ErrorCategory.UI,
        severity: ErrorSeverity.LOW,
        message: 'Touch Input Not Supported',
        details: 'Device does not support touch input',
        solution: 'Use keyboard or mouse input instead',
        timestamp: 0
      }
    ]
  },

  // === NETWORK & CONNECTIVITY ERRORS ===
  NETWORK_CONNECTION_LOST: {
    id: 'NETWORK_CONNECTION_LOST',
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    message: 'Network Connection Lost',
    details: 'Internet connection was lost during gameplay',
    solution: 'Check network connection. Game will attempt to reconnect automatically.',
    subErrors: [
      {
        id: 'WIFI_DISCONNECTED',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: 'WiFi Disconnected',
        details: 'WiFi connection was lost',
        solution: 'Reconnect to WiFi network',
        timestamp: 0
      },
      {
        id: 'DATA_CONNECTION_LOST',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: 'Mobile Data Connection Lost',
        details: 'Mobile data connection was lost',
        solution: 'Check mobile data settings and signal strength',
        timestamp: 0
      }
    ]
  },

  API_REQUEST_FAILED: {
    id: 'API_REQUEST_FAILED',
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    message: 'API Request Failed',
    details: 'Request to game API server failed',
    solution: 'Check network connection and try again. Server may be temporarily unavailable.',
    subErrors: [
      {
        id: 'API_RATE_LIMITED',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: 'API Rate Limited',
        details: 'Too many requests sent to API server',
        solution: 'Wait before making additional requests',
        timestamp: 0
      },
      {
        id: 'API_AUTHENTICATION_FAILED',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.HIGH,
        message: 'API Authentication Failed',
        details: 'Could not authenticate with game API',
        solution: 'Check login credentials and try again',
        timestamp: 0
      }
    ]
  },

  // === STORAGE & PERSISTENCE ERRORS ===
  SAVE_GAME_FAILED: {
    id: 'SAVE_GAME_FAILED',
    category: ErrorCategory.STORAGE,
    severity: ErrorSeverity.MEDIUM,
    message: 'Save Game Failed',
    details: 'Could not save game progress to browser storage',
    solution: 'Check if browser storage is available and not full. Enable cookies if disabled.',
    subErrors: [
      {
        id: 'STORAGE_QUOTA_EXCEEDED',
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.MEDIUM,
        message: 'Storage Quota Exceeded',
        details: 'Browser storage is full',
        solution: 'Clear browser data or remove old save files',
        timestamp: 0
      },
      {
        id: 'STORAGE_PERMISSION_DENIED',
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.MEDIUM,
        message: 'Storage Permission Denied',
        details: 'Browser denied access to local storage',
        solution: 'Enable cookies and local storage in browser settings',
        timestamp: 0
      }
    ]
  },

  LOAD_GAME_FAILED: {
    id: 'LOAD_GAME_FAILED',
    category: ErrorCategory.STORAGE,
    severity: ErrorSeverity.MEDIUM,
    message: 'Load Game Failed',
    details: 'Could not load saved game data',
    solution: 'Save data may be corrupted or incompatible. Try starting a new game.',
    subErrors: [
      {
        id: 'SAVE_DATA_CORRUPTED',
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.MEDIUM,
        message: 'Save Data Corrupted',
        details: 'Save file contains invalid or corrupted data',
        solution: 'Delete corrupted save file and start new game',
        timestamp: 0
      },
      {
        id: 'SAVE_VERSION_INCOMPATIBLE',
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.MEDIUM,
        message: 'Save Version Incompatible',
        details: 'Save file is from incompatible game version',
        solution: 'Save file cannot be loaded due to version mismatch',
        timestamp: 0
      }
    ]
  },

  // === PERFORMANCE ERRORS ===
  LOW_FRAMERATE_DETECTED: {
    id: 'LOW_FRAMERATE_DETECTED',
    category: ErrorCategory.PERFORMANCE,
    severity: ErrorSeverity.MEDIUM,
    message: 'Low Frame Rate Detected',
    details: 'Game is running below optimal frame rate',
    solution: 'Consider lowering graphics settings or closing other applications.',
    subErrors: [
      {
        id: 'GPU_BOTTLENECK',
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.MEDIUM,
        message: 'GPU Performance Bottleneck',
        details: 'Graphics card is struggling to maintain performance',
        solution: 'Reduce graphics quality settings',
        timestamp: 0
      },
      {
        id: 'CPU_BOTTLENECK',
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.MEDIUM,
        message: 'CPU Performance Bottleneck',
        details: 'Processor is struggling to maintain performance',
        solution: 'Close other applications to free up CPU resources',
        timestamp: 0
      }
    ]
  },

  MEMORY_LEAK_DETECTED: {
    id: 'MEMORY_LEAK_DETECTED',
    category: ErrorCategory.PERFORMANCE,
    severity: ErrorSeverity.HIGH,
    message: 'Memory Leak Detected',
    details: 'Game memory usage is continuously increasing',
    solution: 'Restart the game to free up memory. This may be a bug that needs fixing.',
    subErrors: [
      {
        id: 'TEXTURE_MEMORY_LEAK',
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.HIGH,
        message: 'Texture Memory Leak',
        details: 'Textures are not being properly disposed',
        solution: 'Restart game to clear texture memory',
        timestamp: 0
      },
      {
        id: 'OBJECT_MEMORY_LEAK',
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.HIGH,
        message: 'Object Memory Leak',
        details: 'Game objects are not being properly cleaned up',
        solution: 'Restart game to clear object memory',
        timestamp: 0
      }
    ]
  },

  // === SECURITY ERRORS ===
  CONTENT_SECURITY_POLICY_VIOLATION: {
    id: 'CONTENT_SECURITY_POLICY_VIOLATION',
    category: ErrorCategory.SECURITY,
    severity: ErrorSeverity.MEDIUM,
    message: 'Content Security Policy Violation',
    details: 'Game content violates browser security policy',
    solution: 'Check browser security settings and allow game content if safe.',
    subErrors: [
      {
        id: 'INLINE_SCRIPT_BLOCKED',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        message: 'Inline Script Blocked',
        details: 'Browser blocked inline JavaScript execution',
        solution: 'Allow inline scripts for this site or use external script files',
        timestamp: 0
      }
    ]
  },

  CROSS_ORIGIN_REQUEST_BLOCKED: {
    id: 'CROSS_ORIGIN_REQUEST_BLOCKED',
    category: ErrorCategory.SECURITY,
    severity: ErrorSeverity.MEDIUM,
    message: 'Cross-Origin Request Blocked',
    details: 'Browser blocked request to external resource due to CORS policy',
    solution: 'Game server needs to properly configure CORS headers.',
    subErrors: [
      {
        id: 'CORS_PREFLIGHT_FAILED',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        message: 'CORS Preflight Failed',
        details: 'CORS preflight request was rejected by server',
        solution: 'Server must allow CORS requests from game domain',
        timestamp: 0
      }
    ]
  },

  // === MOD SYSTEM ERRORS ===
  MOD_LOAD_FAILED: {
    id: 'MOD_LOAD_FAILED',
    category: ErrorCategory.MOD,
    severity: ErrorSeverity.MEDIUM,
    message: 'Mod Loading Failed',
    details: 'One or more game mods could not be loaded',
    solution: 'Check mod compatibility and file integrity. Disable problematic mods.',
    subErrors: [
      {
        id: 'MOD_VERSION_INCOMPATIBLE',
        category: ErrorCategory.MOD,
        severity: ErrorSeverity.MEDIUM,
        message: 'Mod Version Incompatible',
        details: 'Mod is not compatible with current game version',
        solution: 'Update mod to compatible version or disable it',
        timestamp: 0
      },
      {
        id: 'MOD_DEPENDENCY_MISSING',
        category: ErrorCategory.MOD,
        severity: ErrorSeverity.MEDIUM,
        message: 'Mod Dependency Missing',
        details: 'Mod requires other mods that are not installed',
        solution: 'Install required mod dependencies or disable the mod',
        timestamp: 0
      },
      {
        id: 'MOD_SCRIPT_ERROR',
        category: ErrorCategory.MOD,
        severity: ErrorSeverity.MEDIUM,
        message: 'Mod Script Error',
        details: 'Mod contains JavaScript errors that prevent loading',
        solution: 'Report to mod author or disable the problematic mod',
        timestamp: 0
      }
    ]
  },

  MOD_REGISTRY_UNAVAILABLE: {
    id: 'MOD_REGISTRY_UNAVAILABLE',
    category: ErrorCategory.MOD,
    severity: ErrorSeverity.MEDIUM,
    message: 'Mod Registry Unavailable',
    details: 'Cannot connect to mod registry service',
    solution: 'Mod features will be limited. Check network connection and try again later.',
    subErrors: [
      {
        id: 'BLOCKCHAIN_CONNECTION_FAILED',
        category: ErrorCategory.MOD,
        severity: ErrorSeverity.MEDIUM,
        message: 'Blockchain Connection Failed',
        details: 'Cannot connect to blockchain network for mod registry',
        solution: 'Check network connection and blockchain service status',
        timestamp: 0
      }
    ]
  },

  // === ANALYTICS ERRORS ===
  ANALYTICS_INITIALIZATION_FAILED: {
    id: 'ANALYTICS_INITIALIZATION_FAILED',
    category: ErrorCategory.ANALYTICS,
    severity: ErrorSeverity.LOW,
    message: 'Analytics Initialization Failed',
    details: 'Game analytics system could not be initialized',
    solution: 'Analytics features will be disabled. Game will continue to function normally.',
    subErrors: [
      {
        id: 'TRACKING_BLOCKED',
        category: ErrorCategory.ANALYTICS,
        severity: ErrorSeverity.LOW,
        message: 'Tracking Blocked',
        details: 'Browser or ad blocker is preventing analytics tracking',
        solution: 'Analytics will be disabled. This does not affect gameplay.',
        timestamp: 0
      }
    ]
  },

  // === UNIVERSAL LANGUAGE SYSTEM ERRORS ===
  UL_SYMBOL_LOAD_FAILED: {
    id: 'UL_SYMBOL_LOAD_FAILED',
    category: ErrorCategory.ASSET,
    severity: ErrorSeverity.MEDIUM,
    message: 'Universal Language Symbol Loading Failed',
    details: 'Could not load Universal Language symbol definitions',
    solution: 'UL features will be limited. Check asset availability and network connection.',
    subErrors: [
      {
        id: 'UL_SYMBOL_INDEX_CORRUPTED',
        category: ErrorCategory.ASSET,
        severity: ErrorSeverity.MEDIUM,
        message: 'UL Symbol Index Corrupted',
        details: 'Universal Language symbol index file is corrupted',
        solution: 'Re-download game assets or contact support',
        timestamp: 0
      },
      {
        id: 'UL_GRAMMAR_PARSE_ERROR',
        category: ErrorCategory.ASSET,
        severity: ErrorSeverity.MEDIUM,
        message: 'UL Grammar Parse Error',
        details: 'Universal Language grammar rules could not be parsed',
        solution: 'Check grammar file format and syntax',
        timestamp: 0
      }
    ]
  }
};

// Helper function to create error with timestamp
/**
 * Create a startup error with proper timestamp and context
 */
export function createStartupError(errorId: keyof typeof STARTUP_ERRORS, context?: any): GameError {
  const errorTemplate = STARTUP_ERRORS[errorId];
  if (!errorTemplate) {
    throw new Error(`Unknown startup error ID: ${errorId}`);
  }

  return {
    ...errorTemplate,
    timestamp: Date.now(),
    context,
    subErrors: errorTemplate.subErrors?.map(subError => ({
      ...subError,
      timestamp: Date.now()
    }))
  };
}

/**
 * Get startup errors by category for enhanced filtering
 */
export function getStartupErrorsByCategory(category: ErrorCategory): Array<Omit<GameError, 'timestamp'>> {
  return Object.values(STARTUP_ERRORS).filter(error => error.category === category);
}

/**
 * Check if an error ID exists in the startup errors
 */
export function isValidStartupErrorId(errorId: string): errorId is keyof typeof STARTUP_ERRORS {
  return errorId in STARTUP_ERRORS;
}
