// jest.setup.js
// Mocks for Phaser and browser APIs to prevent test hangs.

// Mock Phaser if not already mocked
try {
  jest.mock('phaser');
} catch (e) {}

// Only mock browser APIs if window is defined (i.e., in jsdom)
if (typeof window !== 'undefined') {
  // Mock canvas and animation frame
  global.HTMLCanvasElement = window.HTMLCanvasElement || function() {};
  global.requestAnimationFrame = cb => setTimeout(cb, 0);
  global.cancelAnimationFrame = id => clearTimeout(id);

  // Optionally, mock other browser APIs as needed
  window.focus = window.focus || (() => {});
  window.scrollTo = window.scrollTo || (() => {});
}
