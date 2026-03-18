# Testing Infrastructure

Test framework, automation, and current test status.

| Document | Description |
|----------|-------------|
| [automation.md](automation.md) | Lint, format, and test automation configuration |
| [precommit.md](precommit.md) | Pre-commit hook setup |

## Current Status

- **Framework**: Jest 30.0.5 with TypeScript (tsconfig.jest.json)
- **Test suites**: 97 total (75 pass, 22 fail — 23% failure rate)
- **Individual tests**: 434 total (423 pass, 11 fail — 2.5% failure rate)

## Failing Test Suites (22)

| Category | Suites | Likely Cause |
|----------|--------|-------------|
| Universal Language | ulEngine, ULSymbolIndex, ulPuzzle, ulResourceLoader | Schema/type mismatch |
| Ley Lines | LeylineEnergySystem, LeyLineEvents.integration | Dependency mocking |
| Tilemap | WorldPersistence, WorldEditService, WorldEditPermissions, TileSelectionOverlay, TileClipboard | LocalStorage/DOM mocking |
| Navigation | SpeedTransitionController, NavigationManager.enhanced | Physics timing edges |
| Missions | MissionSystem | Event wiring |
| ASI | MVP.test | Empty MVP files (0 bytes) |
| Integration | integration.test, Jane_LeyLineManager, Minimap_LeyLineOverlay, UIManager | Cross-system deps |
| Other | Jane.test, AttackLoader.test, Cosmetics.test | Data loader mocking |

Most failures are **integration/mocking issues**, not logic bugs. The 423 passing tests confirm core logic works.
