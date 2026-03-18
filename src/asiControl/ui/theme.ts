// ASI UI Theme constants, aligned with docs/asiControl/mvp/UI_UX_Specifications.md

export const ASI_COLORS = {
  primary: 0x1a1a2e,
  secondary: 0x16213e,
  accent: 0x0f3460,

  trustHigh: 0x00ff88,
  trustMedium: 0xffaa00,
  trustLow: 0xff4444,

  threatCritical: 0xff0000,
  threatHigh: 0xff6600,
  threatMedium: 0xffaa00,
  threatLow: 0xffff00,

  infoASIOnly: 0x00aaff,
  infoJaneAware: 0x888888,
  infoShared: 0xffffff,

  magicAvailable: 0xaa00ff,
  magicCooldown: 0x666666,
  magicActive: 0xff00aa,
} as const;

export const ASI_LAYOUT = {
  padding: 10,
  borderRadius: 8,
} as const;
