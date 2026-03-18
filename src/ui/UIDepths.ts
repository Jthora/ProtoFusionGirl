// UIDepths.ts
// Single source of truth for all UI z-index (depth) values.
// Higher numbers render on top.

export const UIDepths = {
  // World / game objects
  WORLD: 0,
  PLAYER: 10,
  ENEMIES: 10,
  EFFECTS: 20,

  // In-world UI (attached to world space)
  HEALTH_BAR: 50,
  WAYPOINT: 60,

  // Screen-space HUD layers
  HUD_BASE: 100,        // UIBarSystem bars
  HUD_OVERLAY: 150,     // MissionHUD, SpeedControlUI displays
  HUD_NOTIFICATION: 200, // Transient toasts / alerts

  // Panels and dashboards
  DASHBOARD: 500,        // ASIDashboard, CommandCenterUI panels
  HELP_PANEL: 800,       // F1 help overlay

  // Scene overlays (pause, result, full-screen)
  SCENE_OVERLAY: 900,
  MODAL: 950,
  RESULT_SCREEN: 1000,
} as const;
