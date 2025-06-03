# protoFusionGirl

A 2D side-scroller prototype with modding and Web3 integration, built with Phaser.js, TypeScript, and Vite.

## Adding Mods

1. Place your mod JSON file in `src/mods/` (see `sample_mod.json` for schema).
2. Your mod should specify a name, version, entry script, and optional assets.
3. Mods will appear in the Start screen UI automatically if valid.
4. Enable/disable mods using the UI toggle.

For more details, see `docs/modding.md`.

---

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
