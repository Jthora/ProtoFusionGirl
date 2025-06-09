# Customization Domain

This folder contains the customization system for ProtoFusionGirl, following the domain-driven, event-oriented, and data-driven architecture.

## Purpose
- Manage player and character customization (cosmetics, loadouts, etc.)
- Handle unlocking and equipping cosmetics via events

## Main Modules
- `CustomizationEngine.ts`: Loads cosmetics from data, listens for unlock/equip events, updates state, and emits events

## Integration Points
- Loads cosmetics from `data/cosmetics.json` using `cosmeticLoader.ts`
- Emits and listens for events such as `UNLOCK_COSMETIC`, `EQUIP_COSMETIC`, `COSMETIC_EQUIPPED`, `COSMETIC_UNLOCKED`

## Example Usage
```ts
import { CustomizationEngine } from './CustomizationEngine';
import { EventBus } from '../core/EventBus';
const customization = new CustomizationEngine(new EventBus());
```

## Event Contracts
- Listens: `UNLOCK_COSMETIC`, `EQUIP_COSMETIC`
- Emits: `COSMETIC_EQUIPPED`, `COSMETIC_UNLOCKED`

---
