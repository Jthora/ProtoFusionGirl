// Jest test for validateMod function in mod_loader.ts
import { validateMod } from './mod_loader';

describe('validateMod', () => {
  it('validates correct mod metadata', () => {
    const validMod = {
      name: 'TestMod',
      version: '1.0.0',
      entry: 'QmTestEntryCID',
      assets: [
        { key: 'sprite', cid: 'QmTestSpriteCID' }
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

  it('should validate a correct mod structure with optional description', () => {
    const validMod = {
      name: 'Test Mod',
      version: '1.0.0',
      entry: 'test.js',
      assets: [],
      description: 'A test mod.'
    };
    expect(validateMod(validMod)).toBe(true);
  });

  it('should reject a mod missing required fields', () => {
    const invalidMod = {
      version: '1.0.0',
      entry: 'test.js',
      assets: []
    };
    expect(validateMod(invalidMod)).toBe(false);
  });

  it('should reject a mod with invalid asset structure', () => {
    const invalidMod = {
      name: 'BadAssetMod',
      version: '1.0.0',
      entry: 'bad.js',
      assets: [{ cid: 'QmTest' }] // missing key
    };
    expect(validateMod(invalidMod)).toBe(false);
  });

  it('should accept a mod with no assets', () => {
    const validMod = {
      name: 'NoAssetsMod',
      version: '1.0.0',
      entry: 'noassets.js'
    };
    expect(validateMod(validMod)).toBe(true);
  });
});
