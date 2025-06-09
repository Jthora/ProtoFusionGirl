// ulResourceLoader.test.ts
// Automated tests for Universal Language (UL) resource loader, modding, and event bus integration

import ULResourceLoader from '../ulResourceLoader';
import { ulEventBus, ULEventType, ULEventPayload } from '../ulEventBus';

const events: { type: ULEventType; payload: ULEventPayload }[] = [];
beforeAll(() => {
  // Listen to all UL events for test assertions
  (Object.keys(ulEventBus.listeners) as ULEventType[]).forEach(type => {
    ulEventBus.on(type, payload => events.push({ type, payload }));
  });
});
beforeEach(() => { events.length = 0; });

describe('ULResourceLoader', () => {
  it('loads and validates core puzzles', () => {
    const puzzles = ULResourceLoader.loadPuzzles();
    expect(Array.isArray(puzzles)).toBe(true);
    puzzles.forEach(p => {
      expect(typeof p.id).toBe('string');
      expect(p.prompt).toBeDefined();
    });
    expect(events.some(e => e.type === 'ul:puzzle:loaded')).toBe(true);
  });

  it('loads and validates core symbols', () => {
    const symbols = ULResourceLoader.loadSymbols();
    expect(Array.isArray(symbols)).toBe(true);
    symbols.forEach(s => {
      expect(typeof s.name).toBe('string');
      expect(s.properties).toBeDefined();
    });
    expect(events.some(e => e.type === 'ul:symbol:loaded')).toBe(true);
  });

  it('loads and validates core grammar', () => {
    const grammar = ULResourceLoader.loadGrammar();
    expect(Array.isArray(grammar)).toBe(true);
    grammar.forEach(r => {
      expect(typeof r.rule).toBe('string');
    });
  });

  it('loads and validates core animations', () => {
    const anims = ULResourceLoader.loadAnimations();
    expect(typeof anims).toBe('object');
    expect(Object.keys(anims).length).toBeGreaterThan(0);
    expect(events.some(e => e.type === 'ul:animation:loaded')).toBe(true);
  });

  it('handles duplicate IDs and emits validation errors', () => {
    // Simulate duplicate by calling loader twice (should warn/emit error for duplicates)
    ULResourceLoader.loadSymbols();
    ULResourceLoader.loadSymbols();
    expect(events.some(e => e.type === 'ul:symbol:validated' && e.payload.errors?.includes('Duplicate symbol name'))).toBe(true);
  });

  // Add more tests for modded content, missing metadata, and invalid schema as needed
});
