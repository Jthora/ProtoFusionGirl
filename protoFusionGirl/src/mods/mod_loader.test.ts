// Jest test for validateMod function in mod_loader.ts
// Use CommonJS require for Jest compatibility
const { validateMod } = require('./mod_loader');

describe('validateMod', () => {
  it('validates correct mod metadata', () => {
    const validMod = {
      name: 'TestMod',
      version: '1.0.0',
      entry: 'QmTestEntryCID',
      assets: [
        { type: 'sprite', cid: 'QmTestSpriteCID' }
      ]
    };
    expect(validateMod(validMod)).toBe(true);
  });

  it('fails if required fields are missing', () => {
    const invalidMod = {
      version: '1.0.0',
      entry: 'QmTestEntryCID'
    };
    expect(validateMod(invalidMod)).toBe(false);
  });

  it('fails if assets is not an array', () => {
    const invalidMod = {
      name: 'TestMod',
      version: '1.0.0',
      entry: 'QmTestEntryCID',
      assets: 'not-an-array'
    };
    expect(validateMod(invalidMod)).toBe(false);
  });
});
