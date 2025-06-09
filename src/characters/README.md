# Characters Domain

This folder contains all character logic for ProtoFusionGirl, following the domain-driven, event-oriented, and data-driven architecture.

## Purpose
- Manage all character logic (Jane, Companions, Enemies)
- Handle stats, skills, AI, inventory, customization, and faction

## Main Modules
- `Jane.ts`: Core class for Jane Tho'ra (FusionGirl), loads stats, skills, cosmetics, and faction from data, emits events for all major actions
- (Future) `Companion.ts`, `Enemy.ts`: For other character types

## Integration Points
- Integrates with combat, narrative, world, and customization systems via the EventBus
- Loads stats from `data/characters.json`, skills from `data/skills.json`, cosmetics from `data/cosmetics.json`, and faction from `data/factions.json` using loader utilities

## Example Usage
```ts
import { Jane } from './Jane';
import { EventBus } from '../core/EventBus';
const jane = new Jane({ eventBus: new EventBus() });
console.log(jane.skills); // Data-driven skills loaded from data/skills.json
console.log(jane.cosmetics); // Data-driven cosmetics loaded from data/cosmetics.json
console.log(jane.faction); // Data-driven faction loaded from data/factions.json
```

## Event Contracts
- Emits: `CHARACTER_MOVED`, `JANE_LEVEL_UP`, `JANE_DAMAGED`, etc.
- Listens: Narrative and combat events as needed

---
