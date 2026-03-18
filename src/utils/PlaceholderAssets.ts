// Placeholder asset creation utility
// This creates minimal assets to allow the game to run

export function createPlaceholderCanvas(width: number, height: number, color: string = '#00ff00'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

export function createPlayerSpritesheet(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 32 * 4; // 4 frames wide, 32px each
  canvas.height = 32 * 4; // 4 animation rows, 32px each
  const ctx = canvas.getContext('2d')!;
  
  // Jane/FusionGirl color palette - Sci-fi inspired
  const playerColors = {
    suit: '#4169E1',      // Royal blue suit
    accent: '#00FFCC',    // Cyan accents (ley line energy)
    helmet: '#C0C0C0',    // Silver helmet
    visor: '#000080',     // Navy blue visor
    energy: '#FF69B4'     // Hot pink energy effects
  };
  
  // Create 16 frames total (4x4 grid)
  // Row 0: idle (frames 0-3)
  // Row 1: run (frames 4-7, but we only use 4-9 which includes 8-9 from row 2)
  // Row 2: continuation of run (frames 8-11, but only 8-9 used) + jump start (10-12)
  // Row 3: fall (frames 12-15, but only 13-15 used)
  
  for (let frameIndex = 0; frameIndex < 16; frameIndex++) {
    const col = frameIndex % 4;
    const row = Math.floor(frameIndex / 4);
    const x = col * 32;
    const y = row * 32;
    
    // Clear frame
    ctx.clearRect(x, y, 32, 32);
    
    // Determine animation type and phase
    let animType = 'idle';
    let phase = 0;
    
    if (frameIndex >= 0 && frameIndex <= 3) {
      animType = 'idle';
      phase = frameIndex;
    } else if (frameIndex >= 4 && frameIndex <= 9) {
      animType = 'run';
      phase = frameIndex - 4;
    } else if (frameIndex >= 10 && frameIndex <= 12) {
      animType = 'jump';
      phase = frameIndex - 10;
    } else if (frameIndex >= 13 && frameIndex <= 15) {
      animType = 'fall';
      phase = frameIndex - 13;
    }
    
    // Character body animation offsets
    let bodyOffsetX = 0;
    let bodyOffsetY = 0;
    let legOffset = 0;
    
    if (animType === 'idle') {
      bodyOffsetY = Math.sin(phase * Math.PI / 2) * 1; // Subtle breathing
    } else if (animType === 'run') {
      bodyOffsetX = Math.sin(phase * Math.PI / 3) * 1;
      legOffset = Math.sin(phase * Math.PI / 3) * 2;
    } else if (animType === 'jump') {
      bodyOffsetY = -phase * 2; // Rising animation
    } else if (animType === 'fall') {
      bodyOffsetY = phase * 1; // Falling animation
    }
    
    // Main suit body (12x16 centered)
    ctx.fillStyle = playerColors.suit;
    ctx.fillRect(x + 10 + bodyOffsetX, y + 8 + bodyOffsetY, 12, 16);
    
    // Helmet/head (8x8)
    ctx.fillStyle = playerColors.helmet;
    ctx.fillRect(x + 12, y + 4, 8, 8);
    
    // Visor (6x4)
    ctx.fillStyle = playerColors.visor;
    ctx.fillRect(x + 13, y + 5, 6, 4);
    
    // Legs (animated based on movement)
    ctx.fillStyle = playerColors.suit;
    ctx.fillRect(x + 11 + legOffset, y + 24, 4, 6); // Left leg
    ctx.fillRect(x + 17 - legOffset, y + 24, 4, 6); // Right leg
    
    // Accent details (ley line energy patterns)
    ctx.fillStyle = playerColors.accent;
    ctx.fillRect(x + 9 + bodyOffsetX, y + 10 + bodyOffsetY, 2, 12); // Left accent line
    ctx.fillRect(x + 21 + bodyOffsetX, y + 10 + bodyOffsetY, 2, 12); // Right accent line
    ctx.fillRect(x + 12, y + 14 + bodyOffsetY, 8, 1); // Chest accent
    
    // Energy glow effect (varies by animation frame)
    const glowIntensity = 0.3 + (Math.sin(frameIndex * Math.PI / 8) * 0.2);
    ctx.fillStyle = playerColors.energy;
    ctx.globalAlpha = glowIntensity;
    
    // Energy particles around character (fewer and smaller)
    for (let p = 0; p < 4; p++) {
      const px = x + 16 + Math.cos(p * Math.PI / 2 + frameIndex * 0.3) * 8;
      const py = y + 16 + Math.sin(p * Math.PI / 2 + frameIndex * 0.3) * 8;
      ctx.fillRect(px, py, 1, 1);
    }
    
    ctx.globalAlpha = 1.0;
  }
  
  return canvas;
}

export function createTileset(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 32 * 4; // 4 tiles wide
  canvas.height = 32 * 3; // 3 tiles high (12 total tiles)
  const ctx = canvas.getContext('2d')!;
  
  // ProtoFusionGirl Enhanced Tile Palette
  const tileDefinitions = [
    { name: 'air', color: '#87CEEB', border: '#4682B4' },        // Sky blue
    { name: 'grass', color: '#32CD32', border: '#228B22' },      // Lime green
    { name: 'dirt', color: '#8B4513', border: '#654321' },       // Saddle brown
    { name: 'stone', color: '#708090', border: '#2F4F4F' },      // Slate gray
    
    { name: 'water', color: '#1E90FF', border: '#0000CD' },      // Dodger blue
    { name: 'sand', color: '#F4A460', border: '#DDD79C' },       // Sandy brown
    { name: 'wood', color: '#A0522D', border: '#8B4513' },       // Sienna
    { name: 'metal', color: '#C0C0C0', border: '#808080' },      // Silver
    
    { name: 'crystal', color: '#9370DB', border: '#663399' },     // Medium purple
    { name: 'lava', color: '#FF4500', border: '#DC143C' },       // Orange red
    { name: 'ice', color: '#B0E0E6', border: '#87CEEB' },        // Powder blue
    { name: 'leyline', color: '#00FFCC', border: '#40E0D0' }     // Cyan/Turquoise
  ];
  
  for (let i = 0; i < tileDefinitions.length; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const tile = tileDefinitions[i];
    
    const x = col * 32;
    const y = row * 32;
    
    // Fill base color
    ctx.fillStyle = tile.color;
    ctx.fillRect(x, y, 32, 32);
    
    // Add texture pattern for visual interest
    ctx.fillStyle = tile.border;
    ctx.globalAlpha = 0.3;
    
    // Different patterns for different tile types
    switch (tile.name) {
      case 'grass':
        // Grass texture - small dots
        for (let gx = 0; gx < 32; gx += 4) {
          for (let gy = 0; gy < 32; gy += 4) {
            if (Math.random() > 0.7) {
              ctx.fillRect(x + gx, y + gy, 2, 2);
            }
          }
        }
        break;
      case 'stone':
        // Stone texture - irregular blocks
        ctx.fillRect(x + 4, y + 4, 8, 8);
        ctx.fillRect(x + 16, y + 8, 6, 6);
        ctx.fillRect(x + 8, y + 20, 10, 8);
        break;
      case 'water':
        // Water texture - wave lines
        ctx.beginPath();
        for (let wx = 0; wx < 32; wx += 8) {
          ctx.moveTo(x + wx, y + 16);
          ctx.quadraticCurveTo(x + wx + 4, y + 12, x + wx + 8, y + 16);
        }
        ctx.stroke();
        break;
      case 'crystal':
        // Crystal texture - geometric shapes
        ctx.fillRect(x + 8, y + 8, 16, 16);
        ctx.fillRect(x + 12, y + 4, 8, 8);
        ctx.fillRect(x + 12, y + 20, 8, 8);
        break;
      case 'metal':
        // Metal texture - grid pattern
        for (let mx = 8; mx < 32; mx += 8) {
          ctx.fillRect(x + mx, y, 1, 32);
          ctx.fillRect(x, y + mx, 32, 1);
        }
        break;
    }
    
    ctx.globalAlpha = 1.0;
    
    // Add border for tile definition
    ctx.strokeStyle = tile.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 32, 32);
  }
  
  return canvas;
}

export function createBackgroundImage(width: number, height: number, baseColor: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // Create a gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, baseColor);
  gradient.addColorStop(1, '#000000');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas;
}

export function createMagnetoSpeederSprite(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 48; // Larger than player for visibility
  canvas.height = 24; // Wide aspect ratio for vehicle
  const ctx = canvas.getContext('2d')!;
  
  // MagnetoSpeeder color palette - High-tech spacecraft
  const speederColors = {
    hull: '#2C3E50',       // Dark blue-gray hull
    accent: '#00FFCC',     // Cyan energy accents
    thruster: '#FF4444',   // Red thruster glow
    cockpit: '#4A90E2',    // Blue cockpit glass
    energy: '#FFFF00',     // Yellow energy core
    detail: '#7F8C8D'      // Gray details
  };
  
  // Clear background
  ctx.clearRect(0, 0, 48, 24);
  
  // Main hull (elongated oval)
  ctx.fillStyle = speederColors.hull;
  ctx.beginPath();
  ctx.ellipse(24, 12, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Cockpit (front section)
  ctx.fillStyle = speederColors.cockpit;
  ctx.beginPath();
  ctx.ellipse(32, 12, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Energy core (center glow)
  ctx.fillStyle = speederColors.energy;
  ctx.beginPath();
  ctx.arc(24, 12, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Ley line energy conduits (cyan lines)
  ctx.strokeStyle = speederColors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(8, 10);
  ctx.lineTo(40, 10);
  ctx.moveTo(8, 14);
  ctx.lineTo(40, 14);
  ctx.stroke();
  
  // Thruster exhaust (back)
  ctx.fillStyle = speederColors.thruster;
  ctx.beginPath();
  ctx.ellipse(8, 12, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Detail fins (top and bottom)
  ctx.fillStyle = speederColors.detail;
  ctx.fillRect(16, 6, 16, 2); // Top fin
  ctx.fillRect(16, 16, 16, 2); // Bottom fin
  
  // Navigation lights
  ctx.fillStyle = speederColors.energy;
  ctx.fillRect(12, 8, 2, 2); // Left light
  ctx.fillRect(34, 8, 2, 2); // Right light
  
  return canvas;
}

export function createDropPodTexture(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 20;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  // Capsule top (dome)
  ctx.fillStyle = '#ccddff';
  ctx.beginPath();
  ctx.ellipse(10, 10, 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Capsule body
  ctx.fillStyle = '#aabbee';
  ctx.fillRect(2, 10, 16, 18);
  // Center stripe (ley line accent)
  ctx.strokeStyle = '#00eeff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 2);
  ctx.lineTo(10, 30);
  ctx.stroke();
  // Heat ring at base
  ctx.strokeStyle = '#ff8844';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(2, 26);
  ctx.lineTo(18, 26);
  ctx.stroke();
  return canvas;
}

export function createHypersonicEffectSprite(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 64; // Larger for trail effect
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  
  // Create sonic boom / hypersonic trail effect
  const gradient = ctx.createLinearGradient(0, 16, 64, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); // Bright white center
  gradient.addColorStop(0.3, 'rgba(0, 255, 204, 0.6)'); // Cyan shock wave
  gradient.addColorStop(0.6, 'rgba(255, 100, 100, 0.4)'); // Red heat signature
  gradient.addColorStop(1, 'rgba(255, 255, 0, 0.2)'); // Yellow trail
  
  // Draw the hypersonic trail
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(32, 16, 30, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add shock wave lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const x = 10 + i * 12;
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.lineTo(x + 8, 16);
    ctx.lineTo(x, 24);
    ctx.stroke();
  }
  
  return canvas;
}
