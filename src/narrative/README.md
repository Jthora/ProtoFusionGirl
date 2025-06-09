# Narrative Domain

This folder contains the narrative system for ProtoFusionGirl, following the domain-driven, event-oriented, and data-driven architecture.

## Purpose
- Manage narrative events, triggers, and actions
- Drive story progression and world changes based on player actions and game state

## Main Modules
- `NarrativeEngine.ts`: Loads narrative events from data, listens for triggers on the EventBus, and executes actions

## Integration Points
- Listens to all game events via the EventBus
- Loads narrative events from `data/narrative.json` using `narrativeLoader.ts`
- Can emit further events or call other systems as actions

## Example Usage
```ts
import { NarrativeEngine } from './NarrativeEngine';
import { EventBus } from '../core/EventBus';
const narrative = new NarrativeEngine(new EventBus());
```

## Event Contracts
- Listens: All game events (triggers defined in data)
- Emits: Custom events or actions as defined in narrative data

---
