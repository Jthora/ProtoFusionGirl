// WorldEditSession.test.ts
// Basic instantiation test for WorldEditSession
import { WorldEditSession } from './WorldEditSession';
describe('WorldEditSession', () => {
  // TODO: Test multi-user session handling (simulate multiple users editing in one session)
  it('can be instantiated via factory', () => {
    const session = WorldEditSession.createTestSession();
    expect(session).toBeDefined();
  });
  it('exposes core editing collaborators', () => {
    const session = WorldEditSession.createTestSession();
    expect(session.brush).toBeDefined();
    expect(session.history).toBeDefined();
  });
});
