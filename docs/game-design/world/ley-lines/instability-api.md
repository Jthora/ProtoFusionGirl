# Ley Line Instability Event API (Artifact-Driven)

**Artifact Reference:**
- `artifacts/leyline_instability_event_api_reference_2025-06-08.artifact`
- `artifacts/leyline_instability_event_design_2025-06-08.artifact`
- `artifacts/leyline_instability_event_integration_points_2025-06-08.artifact`

---

## Canonical Event Interface
```ts
export interface LeyLineInstabilityEvent {
  id: string;
  type: 'LEYLINE_INSTABILITY' | 'LEYLINE_SURGE' | 'LEYLINE_DISRUPTION' | 'RIFT_FORMED';
  leyLineId: string;
  nodeId?: string;
  severity: 'minor' | 'moderate' | 'major';
  triggeredBy: 'simulation' | 'player' | 'environment' | 'narrative';
  timestamp: number;
  branchId?: string;
  data?: Record<string, any>;
}
```

---

## EventBus Usage Contract
```ts
// Emitting an instability event
const event: LeyLineInstabilityEvent = {
  id: 'evt_leyline_001',
  type: 'LEYLINE_INSTABILITY',
  leyLineId: 'ley_12',
  nodeId: 'node_5',
  severity: 'moderate',
  triggeredBy: 'simulation',
  timestamp: Date.now(),
  branchId: 'branch_1',
  data: { reason: 'example' }
};
eventBus.emit({ type: event.type, data: event });

// Listening for instability events
// (You can listen for all types: 'LEYLINE_INSTABILITY', 'LEYLINE_SURGE', etc.)
eventBus.on('LEYLINE_INSTABILITY', (event) => {
  // event.data is a LeyLineInstabilityEvent
  // ...handle event...
});
```

---

## Integration Points & Extension Hooks
- **Simulation:** Emits events during world ticks (see `CosmicEnvSimulation.ts`).
- **World State:** Updates and propagates state, emits events (see `WorldStateManager.ts`).
- **Event Engine:** Propagates, merges, and emits events (see `MultiverseEventEngine.ts`).
- **Ley Line System:** Handles activation, stabilization, escalation, and exposes modding hooks (see `LeyLineSystem.ts`).
- **UI/UX:** Listens for events and updates overlays, minimap, pop-ups (see `UIManager.ts`).
- **Missions/Narrative:** Listens for events to trigger/advance objectives (see `MissionSystem.ts`).
- **Procedural/Pathfinding:** Adapts to instability/disruption/rift state (see `LeyLineProceduralGen.ts`, `LeyLinePathfinder.ts`).
- **Modding:** Register for or emit events using public hooks:
```ts
// Listen for all instability events (modding API)
LeyLineSystem.onInstabilityEvent((event) => { /* custom logic */ });
MultiverseEventEngine.onInstabilityEvent((event) => { /* custom logic */ });
// Emit a custom instability event
LeyLineSystem.emitInstabilityEvent(event);
MultiverseEventEngine.emitInstabilityEvent(event);
```

---

## Artifact-Driven State Transitions
- Stable → Instability → Surge/Disruption → Rift Formed → (Resolution or Escalation)
- Instability can propagate to nearby nodes/lines.
- Player or AI actions can stabilize or escalate events.

---

## Example Narrative/Game Design Hooks
- "A surge of wild energy ripples through the ley lines, destabilizing the region."
- "A dimensional rift tears open at the heart of the ley network—hostile entities pour forth."
- "The ley node pulses erratically. Stabilize it before a rift forms!"

---

## Testing & Validation

See: `artifacts/leyline_instability_event_test_plan_2025-06-08.artifact`

**Test Coverage Includes:**
- Unit: Event generation, state mutation, event emission/propagation, UI feedback, pathfinding adaptation.
- Integration: End-to-end propagation, branch/timeline divergence, mission/narrative triggers.
- Edge Cases: Simultaneous events, rapid escalation/resolution, player interaction during surges, timeline merge/rollback.
- Manual Playtest: Player feedback, UI overlays, stabilization/escalation, narrative/mission integration.

All code and features should be validated against this plan for artifact compliance.

---

## See Also
- `artifacts/leyline_instability_event_narrative_examples_2025-06-08.artifact`
- All affected modules listed in the integration points artifact.
