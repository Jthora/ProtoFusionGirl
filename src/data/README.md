# Data Folder

This folder contains all data-driven content for ProtoFusionGirl, following the architecture and schema artifacts.

## Data Files
- `characters.json`: Character base stats and config
- `attacks.json`: Attack definitions for combat
- `skills.json`: Skill definitions
- `cosmetics.json`: Cosmetic items (outfits, wings, etc.)
- `factions.json`: Faction definitions
- `narrative.json`: Narrative event definitions

## Loader Utilities
- `characterLoader.ts`: Loads character data
- `attackLoader.ts`: Loads attack data
- `skillLoader.ts`: Loads skill data
- `cosmeticLoader.ts`: Loads cosmetic data
- `factionLoader.ts`: Loads faction data
- `narrativeLoader.ts`: Loads narrative event data

## Guidelines
- All data files must validate against their schema (see `artifacts/data_schema_content_2025-06-07.artifact`)
- New content should be added via data, not code
- See each loader utility for usage
