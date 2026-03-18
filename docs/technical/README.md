# Technical Documentation

Implementation architecture, system specifications, and development infrastructure.

## Sections

| Folder | Description |
|--------|-------------|
| [architecture/](architecture/) | System dependency map, EventBus reference, GameScene decomposition plan |
| [systems/](systems/) | Per-system technical docs (navigation, world, ASI, UL) |
| [data/](data/) | Data management, modding API |
| [testing/](testing/) | Test infrastructure, automation |
| [ai-development/](ai-development/) | AI/NPC behavior development plan |

## Architecture Overview

The game uses a **Phaser 3 + TypeScript** stack with:
- **EventBus** — Type-safe pub/sub connecting all systems (70 lines, production quality)
- **ModularGameLoop** — Priority-based system registry (60 lines)
- **GameScene** — God object orchestrating everything (1,675 lines — needs decomposition)

See [architecture/system-dependency-map.md](architecture/system-dependency-map.md) for the complete wiring diagram.
