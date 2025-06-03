# protoFusionGirl Modding Guide

Welcome to the protoFusionGirl modding guide! This document will help you create, validate, and load mods for the game. Mods can add new sprites, levels, mechanics, and more.

## Mod JSON Schema

A mod must include a JSON metadata file with the following structure:

```json
{
  "name": "My Mod Name",
  "version": "1.0.0",
  "entry": "mod_entry.js",
  "assets": [
    { "key": "enemySprite", "cid": "<ipfs_cid>" }
  ],
  "description": "A short description of what your mod does."
}
```

- `name`: The mod's display name.
- `version`: Semantic version string.
- `entry`: The main script file (JavaScript, loaded from IPFS).
- `assets`: Array of asset objects, each with a `key` and IPFS `cid`.
- `description`: (Optional) Short description for UI display.

## Creating a Mod

1. **Create your assets** (sprites, audio, etc.) and upload them to IPFS (e.g., via [Pinata](https://pinata.cloud)).
2. **Write your mod script** (JavaScript/TypeScript) that exports your mod logic (e.g., a new Phaser.Scene or entity).
3. **Create your mod JSON** as shown above, referencing your assets and entry script by IPFS CID.
4. **Upload your mod JSON and entry script to IPFS.**
5. **Register your mod** on-chain using the ModRegistry smart contract (coming soon).

## Loading Mods in protoFusionGirl

- Mods are loaded via the mod loader (`src/mods/mod_loader.ts`).
- The loader fetches the mod JSON from IPFS, validates it, and loads assets/scripts dynamically.
- Only mods that pass schema validation will be loaded.

## Example Mod JSON

```json
{
  "name": "Sample Enemy Mod",
  "version": "1.0.0",
  "entry": "enemy_mod.js",
  "assets": [
    { "key": "enemySprite", "cid": "bafybeibwzif2w3k3n2k3n2k3n2k3n2k3n2k3n2k3n2k3n2k3n2k3n2k3n2" }
  ],
  "description": "Adds a new enemy sprite loaded from IPFS and spawns it in the level."
}
```

## Modding Best Practices

- Use unique names and keys for your assets and mods.
- Test your mod locally before uploading to IPFS.
- Avoid using `eval` or unsafe code in your mod scripts.
- Follow the [plugin API documentation](#) (coming soon) for safe interaction with the game.

## Resources
- [Pinata IPFS Upload](https://pinata.cloud)
- [Phaser.js Docs](https://phaser.io)
- [protoFusionGirl GitHub](https://github.com/your-repo)

---

For questions or to share your mods, join the community on X (@Jono_Thora) or Discord (coming soon)!
