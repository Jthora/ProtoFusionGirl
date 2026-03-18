# Data Management & Modding

Data loading patterns and modding API documentation.

| Document | Description |
|----------|-------------|
| [modding.md](modding.md) | Mod creation guide — JSON schemas, IPFS asset uploads, Phaser integration, registry injection |

## Data Loader Pattern

Source: `src/data/` (128 lines) — 8 consistent loaders:

| Loader | Data File | Content |
|--------|-----------|---------|
| `characterDataLoader` | `data/characters.json` | Character stats, abilities |
| `skillDataLoader` | `data/skills.json` | Skill definitions |
| `attackDataLoader` | `data/attacks.json` | Attack types, damage, range |
| `cosmeticDataLoader` | `data/cosmetics.json` | Visual customization |
| `factionDataLoader` | `data/factions.json` | Faction definitions |
| `narrativeDataLoader` | `data/narratives.json` | Story events |
| `leylineDataLoader` | `data/leylines.json` | Ley line configurations |
| `zoneDataLoader` | `data/zones.json` | Zone definitions |

All loaders follow the same pattern: type-safe, JSON-sourced, with mod overlay support via `src/mods/mod_loader.ts`.
