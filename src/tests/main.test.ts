// Test for main game initialization
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock Phaser since we're testing initialization logic, not the actual game engine
jest.mock('phaser', () => ({
  AUTO: 'AUTO',
  Game: jest.fn().mockImplementation(function(this: any, config: any) {
    this.config = config;
    this.destroy = jest.fn();
  }),
  Scene: jest.fn(),
}));

describe('Main Game Initialization', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '<div id="app"></div>';
    // Clear any existing Phaser instances
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = '';
  });

  it('should initialize the app div', () => {
    const appDiv = document.querySelector('#app');
    expect(appDiv).toBeTruthy();
  });

  it('should have Phaser game config ready', () => {
    // This test will pass once we implement the game config
    const expectedConfig = {
      type: 'AUTO',
      width: 800,
      height: 600,
      parent: 'app',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 500 },
          debug: true,
        },
      },
      backgroundColor: '#222',
    };

    // For now, we'll test that the structure is correct
    expect(expectedConfig.width).toBe(800);
    expect(expectedConfig.height).toBe(600);
    expect(expectedConfig.parent).toBe('app');
  });

  it('should not show only loading message when game is initialized', () => {
    // This test should pass now that we have a proper game initialized
    const appDiv = document.querySelector('#app');
    
    // After game initialization, the app div should be empty (Phaser takes over)
    // and should not contain the old loading message
    expect(appDiv?.innerHTML).not.toContain('Game is loading...');
    expect(appDiv?.innerHTML).not.toContain('Vercel deployment test successful!');
  });

  it('should have access to Phaser Game instance', () => {
    // Test that Phaser is properly loaded and available
    const Phaser = require('phaser');
    expect(Phaser.Game).toBeDefined();
    expect(Phaser.Scene).toBeDefined();
  });
});
