// WorldEditInput.test.ts
// Basic instantiation test for WorldEditInput
import { WorldEditInput } from './WorldEditInput';
describe('WorldEditInput', () => {
  // TODO: Test edge cases for invalid input (send invalid input and check error handling)
  it('can be instantiated via factory', () => {
    const input = WorldEditInput.createTestInput();
    expect(input).toBeDefined();
  });
  it('handles pointer and keyboard events without error', () => {
    const input = WorldEditInput.createTestInput();
    expect(() => input.handlePointerDown(10, 5)).not.toThrow();
    expect(() => input.handlePointerMove(11, 5)).not.toThrow();
    expect(() => input.handlePointerUp(11, 5)).not.toThrow();
    expect(() => input.handleKeyDown('b')).not.toThrow();
  });
});
