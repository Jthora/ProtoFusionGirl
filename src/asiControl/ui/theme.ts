// ASI UI Theme constants — orange/gold on black matching fusiongirl.app aesthetic

export const ASI_COLORS = {
  primary: 0x0a0500,      // Near-black with warm undertone
  secondary: 0x150b00,    // Slightly lighter warm dark
  accent: 0xFF8C00,       // Orange — dominant fusiongirl.app brand color

  trustHigh: 0xFFD700,    // Gold — high trust
  trustMedium: 0xFF8C00,  // Orange — medium trust
  trustLow: 0xff4444,     // Red — low trust

  threatCritical: 0xff3300,
  threatHigh: 0xff6600,
  threatMedium: 0xFF8C00,
  threatLow: 0xFFD700,

  infoASIOnly: 0xFF8C00,
  infoJaneAware: 0x888880,
  infoShared: 0xffffff,

  magicAvailable: 0xFFD700,
  magicCooldown: 0x555544,
  magicActive: 0xFF8C00,
} as const;

export const ASI_LAYOUT = {
  padding: 10,
  borderRadius: 6,
} as const;
