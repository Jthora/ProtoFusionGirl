// Favicon generation utility for ProtoFusionGirl
// This generates multiple favicon sizes from the base FusionGirl icon

export function generateFavicon() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Create a simple 32x32 favicon based on FusionGirl design
  canvas.width = 32;
  canvas.height = 32;
  
  // FusionGirl simplified icon colors
  const colors = {
    primary: '#4169E1',    // Royal blue
    accent: '#00FFCC',     // Cyan
    helmet: '#C0C0C0',     // Silver
    energy: '#FF69B4'      // Hot pink
  };
  
  // Clear canvas
  ctx.clearRect(0, 0, 32, 32);
  
  // Simplified FusionGirl face/helmet (circular)
  ctx.fillStyle = colors.helmet;
  ctx.beginPath();
  ctx.arc(16, 16, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Visor (oval)
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.ellipse(16, 14, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Energy accent lines
  ctx.fillStyle = colors.accent;
  ctx.fillRect(6, 12, 2, 8);   // Left accent
  ctx.fillRect(24, 12, 2, 8);  // Right accent
  ctx.fillRect(12, 6, 8, 2);   // Top accent
  
  // Energy glow effect
  ctx.fillStyle = colors.energy;
  ctx.globalAlpha = 0.6;
  
  // Small energy dots around the icon
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const x = 16 + Math.cos(angle) * 14;
    const y = 16 + Math.sin(angle) * 14;
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1.0;
  
  return canvas.toDataURL('image/png');
}

// Generate different sizes for better browser compatibility
export function generateMultipleFavicons() {
  const sizes = [16, 32, 48, 64, 128, 256];
  const favicons: { [key: string]: string } = {};
  
  sizes.forEach(size => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = size;
    canvas.height = size;
    
    // Scale the design proportionally
    const scale = size / 32;
    
    const colors = {
      primary: '#4169E1',
      accent: '#00FFCC', 
      helmet: '#C0C0C0',
      energy: '#FF69B4'
    };
    
    ctx.clearRect(0, 0, size, size);
    
    // Helmet/head (scaled)
    ctx.fillStyle = colors.helmet;
    ctx.beginPath();
    ctx.arc(size/2, size/2, 12 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Visor (scaled)
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.ellipse(size/2, size/2 - 2*scale, 8*scale, 6*scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Accent lines (scaled)
    ctx.fillStyle = colors.accent;
    ctx.fillRect(6*scale, 12*scale, 2*scale, 8*scale);
    ctx.fillRect((size - 8*scale), 12*scale, 2*scale, 8*scale);
    ctx.fillRect(12*scale, 6*scale, 8*scale, 2*scale);
    
    favicons[`${size}x${size}`] = canvas.toDataURL('image/png');
  });
  
  return favicons;
}

// Call this in the browser console to download generated favicons
export function downloadFavicons() {
  const favicons = generateMultipleFavicons();
  
  Object.entries(favicons).forEach(([size, dataUrl]) => {
    const link = document.createElement('a');
    link.download = `favicon-${size}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
