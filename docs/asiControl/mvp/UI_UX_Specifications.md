# UI/UX Design Specifications for MVP ASI Interface

## Design Philosophy

The MVP ASI interface should make players feel like they're operating a sophisticated command center that provides superhuman capabilities. The design emphasizes information density, immediate feedback, and a sense of technological superiority.

## Visual Design Language

### Color Palette
```css
/* Primary Colors */
--asi-primary: #1a1a2e;      /* Dark navy background */
--asi-secondary: #16213e;    /* Border and accent color */
--asi-accent: #0f3460;       /* Interactive elements */

/* Status Colors */
--trust-high: #00ff88;       /* High trust - bright green */
--trust-medium: #ffaa00;     /* Medium trust - orange */
--trust-low: #ff4444;        /* Low trust - red */

/* Threat Colors */
--threat-critical: #ff0000;  /* Critical threat - red */
--threat-high: #ff6600;      /* High threat - orange */
--threat-medium: #ffaa00;    /* Medium threat - yellow */
--threat-low: #ffff00;       /* Low threat - bright yellow */

/* Information Colors */
--info-asi-only: #00aaff;    /* ASI-only information - blue */
--info-jane-aware: #888888;  /* Jane-aware information - gray */
--info-shared: #ffffff;      /* Shared information - white */

/* Magic Colors */
--magic-available: #aa00ff;  /* Available magic - purple */
--magic-cooldown: #666666;   /* Cooldown magic - dark gray */
--magic-active: #ff00aa;     /* Active magic - magenta */
```

### Typography
```css
/* Font Hierarchy */
--font-primary: 'Orbitron', monospace;    /* Sci-fi feel for titles */
--font-secondary: 'Roboto', sans-serif;   /* Clean readability for content */
--font-monospace: 'Roboto Mono', monospace; /* Data and numbers */

/* Font Sizes */
--text-title: 18px;
--text-subtitle: 14px;
--text-body: 12px;
--text-small: 10px;
--text-data: 11px;
```

### Layout Grid
```css
/* Grid System */
.command-center {
  display: grid;
  grid-template-columns: 60% 40%;
  grid-template-rows: auto 1fr;
  gap: 10px;
  height: 100vh;
  padding: 10px;
}

.main-panel {
  grid-column: 1;
  grid-row: 1 / -1;
}

.status-panel {
  grid-column: 2;
  grid-row: 1;
  height: 40%;
}

.guidance-panel {
  grid-column: 2;
  grid-row: 2;
  height: 60%;
}
```

## Component Specifications

### 1. Main Game Panel

#### Dimensions & Layout
- **Size**: 60% of screen width, 80% of screen height
- **Position**: Left side, vertically centered
- **Padding**: 10px internal padding
- **Border**: 2px solid `--asi-secondary` with 8px border radius

#### Visual Elements
```typescript
interface MainPanelConfig {
  width: number;
  height: number;
  overlayLayers: OverlayLayer[];
  zoomLevels: ZoomLevel[];
}

interface OverlayLayer {
  id: string;
  name: string;
  color: string;
  opacity: number;
  visible: boolean;
  zIndex: number;
}
```

#### Overlay System
- **Threat Overlays**: Pulsing circles with color-coded severity
- **Opportunity Overlays**: Subtle golden glints with soft glow
- **Emotional Overlays**: Soft color gradients around Jane
- **Magic Overlays**: Particle effects and energy flows

### 2. Status Panel

#### Dimensions & Layout
- **Size**: 30% of screen width, 40% of screen height
- **Position**: Top-right corner
- **Sections**: Trust meter, Jane's vitals, environmental status

#### Trust Meter Component
```typescript
interface TrustMeterDesign {
  width: number;
  height: 40;
  backgroundColor: '#1a1a2e';
  borderColor: '#16213e';
  borderWidth: 2;
  borderRadius: 8;
  
  bar: {
    height: 30;
    borderRadius: 6;
    colors: {
      low: '#ff4444';
      medium: '#ffaa00';
      high: '#00ff88';
    };
    animation: {
      duration: 500;
      easing: 'Power2';
    };
  };
  
  text: {
    fontSize: 14;
    color: '#ffffff';
    fontFamily: 'Roboto Mono';
    position: 'center';
  };
  
  trendIndicator: {
    size: 16;
    color: '#ffffff';
    position: 'top-right';
    symbols: {
      increasing: '↗';
      decreasing: '↘';
      stable: '→';
    };
  };
}
```

#### Jane's Vitals Display
```typescript
interface VitalsDisplayDesign {
  layout: 'vertical';
  spacing: 8;
  
  healthBar: {
    width: '100%';
    height: 20;
    backgroundColor: '#2a2a2a';
    foregroundColor: '#ff4444';
    borderRadius: 4;
    label: 'Health';
  };
  
  energyBar: {
    width: '100%';
    height: 20;
    backgroundColor: '#2a2a2a';
    foregroundColor: '#44aaff';
    borderRadius: 4;
    label: 'Energy';
  };
  
  emotionalState: {
    display: 'badge';
    colors: {
      calm: '#00ff88';
      confident: '#44aaff';
      stressed: '#ffaa00';
      anxious: '#ff4444';
    };
    position: 'top-right';
    fontSize: 10;
  };
}
```

### 3. Guidance Panel

#### Dimensions & Layout
- **Size**: 30% of screen width, 60% of screen height
- **Position**: Bottom-right corner
- **Max Suggestions**: 4 visible at once
- **Scrollable**: Yes, if more than 4 suggestions

#### Suggestion Button Design
```typescript
interface SuggestionButtonDesign {
  width: '100%';
  height: 60;
  margin: 5;
  borderRadius: 6;
  
  background: {
    default: '#2a2a2a';
    hover: '#333333';
    active: '#444444';
  };
  
  border: {
    width: 2;
    colors: {
      critical: '#ff4444';
      high: '#ffaa44';
      medium: '#44aaff';
      low: '#44ff44';
    };
  };
  
  text: {
    primary: {
      fontSize: 12;
      color: '#ffffff';
      fontFamily: 'Roboto';
      maxLines: 2;
    };
    secondary: {
      fontSize: 10;
      color: '#aaaaaa';
      fontFamily: 'Roboto';
      maxLines: 1;
    };
  };
  
  indicators: {
    priority: {
      size: 12;
      position: 'top-right';
      shape: 'circle';
    };
    confidence: {
      fontSize: 10;
      color: '#cccccc';
      position: 'bottom-right';
      format: '${value}%';
    };
  };
}
```

### 4. Magic Palette

#### Dimensions & Layout
- **Size**: Full width of screen, 80px height
- **Position**: Bottom of screen
- **Orientation**: Horizontal strip
- **Max Symbols**: 8 visible at once

#### Magic Symbol Design
```typescript
interface MagicSymbolDesign {
  size: 64;
  spacing: 8;
  
  container: {
    width: 64;
    height: 64;
    borderRadius: 8;
    backgroundColor: '#1a1a2e';
    borderColor: '#16213e';
    borderWidth: 2;
  };
  
  symbol: {
    size: 48;
    position: 'center';
    filters: {
      available: 'none';
      cooldown: 'grayscale(100%)';
      active: 'drop-shadow(0 0 10px #ff00aa)';
    };
  };
  
  cooldown: {
    overlay: {
      color: '#666666';
      opacity: 0.8;
    };
    timer: {
      fontSize: 10;
      color: '#ffffff';
      position: 'center';
    };
  };
  
  dragState: {
    ghostOpacity: 0.5;
    snapDistance: 20;
    previewColor: '#aa00ff';
  };
}
```

## Animation Specifications

### Trust Meter Animations
```typescript
interface TrustAnimations {
  levelChange: {
    duration: 500;
    easing: 'Power2';
    delay: 0;
  };
  
  trendChange: {
    duration: 300;
    easing: 'Back.easeOut';
    delay: 200;
  };
  
  pulse: {
    duration: 1000;
    easing: 'Sine.easeInOut';
    repeat: -1;
    yoyo: true;
    targets: ['alpha'];
    values: [0.8, 1.0];
  };
}
```

### Threat Overlay Animations
```typescript
interface ThreatAnimations {
  detection: {
    duration: 600;
    easing: 'Back.easeOut';
    fromScale: 0;
    toScale: 1;
  };
  
  asiOnlyPulse: {
    duration: 1500;
    easing: 'Sine.easeInOut';
    repeat: -1;
    yoyo: true;
    targets: ['alpha'];
    values: [0.7, 0.3];
  };
  
  janeAwareSteady: {
    alpha: 0.5;
    scale: 1.0;
  };
  
  escalation: {
    duration: 400;
    easing: 'Power2';
    scaleIncrease: 0.2;
    alphaIncrease: 0.3;
  };
}
```

### Guidance Panel Animations
```typescript
interface GuidanceAnimations {
  suggestionAppear: {
    duration: 400;
    easing: 'Back.easeOut';
    fromY: 20;
    fromAlpha: 0;
    toY: 0;
    toAlpha: 1;
  };
  
  suggestionClick: {
    duration: 200;
    easing: 'Power2';
    yoyo: true;
    targets: ['alpha'];
    values: [1.0, 0.5];
  };
  
  feedbackMessage: {
    appear: {
      duration: 300;
      easing: 'Back.easeOut';
      fromScale: 0;
      toScale: 1;
    };
    disappear: {
      duration: 1000;
      easing: 'Power2';
      delay: 2000;
      toAlpha: 0;
    };
  };
}
```

### Magic System Animations
```typescript
interface MagicAnimations {
  symbolDrag: {
    duration: 100;
    easing: 'Power2';
    scale: 1.2;
    alpha: 0.8;
  };
  
  symbolDrop: {
    duration: 200;
    easing: 'Back.easeOut';
    scale: 1.0;
    alpha: 1.0;
  };
  
  castingEffect: {
    duration: 800;
    easing: 'Power2';
    particleCount: 20;
    particleSpeed: 100;
    particleLifetime: 1000;
  };
  
  cooldownVisual: {
    duration: 200;
    easing: 'Power2';
    fromAlpha: 1.0;
    toAlpha: 0.3;
    overlayColor: '#666666';
  };
}
```

## Responsive Design

### Screen Size Breakpoints
```typescript
interface ResponsiveBreakpoints {
  mobile: {
    maxWidth: 768;
    layout: 'stacked';
    panelSizes: {
      main: '100%';
      status: '100%';
      guidance: '100%';
    };
  };
  
  tablet: {
    maxWidth: 1024;
    layout: 'hybrid';
    panelSizes: {
      main: '70%';
      status: '30%';
      guidance: '30%';
    };
  };
  
  desktop: {
    minWidth: 1025;
    layout: 'sidebar';
    panelSizes: {
      main: '60%';
      status: '40%';
      guidance: '40%';
    };
  };
}
```

### Touch Adaptations
```typescript
interface TouchAdaptations {
  minTouchTarget: 44; // Minimum touch target size in pixels
  
  gestures: {
    pinchToZoom: {
      enabled: true;
      minScale: 0.5;
      maxScale: 3.0;
    };
    
    panToMove: {
      enabled: true;
      momentum: true;
      bounds: 'game-world';
    };
    
    longPressForInfo: {
      enabled: true;
      duration: 500;
      feedback: 'haptic';
    };
  };
  
  buttonSizes: {
    guidance: {
      minHeight: 64;
      minWidth: 200;
    };
    
    magic: {
      minSize: 72;
      spacing: 12;
    };
  };
}
```

## Accessibility Features

### Visual Accessibility
```typescript
interface AccessibilityFeatures {
  colorBlind: {
    alternativeIndicators: true;
    patternOverlays: true;
    textLabels: true;
    shapes: {
      critical: 'triangle';
      high: 'diamond';
      medium: 'square';
      low: 'circle';
    };
  };
  
  highContrast: {
    enabled: true;
    contrastRatio: 4.5; // WCAG AA standard
    alternativeColors: {
      background: '#000000';
      text: '#ffffff';
      borders: '#ffffff';
    };
  };
  
  textScaling: {
    enabled: true;
    minScale: 0.8;
    maxScale: 1.5;
    steps: 0.1;
  };
}
```

### Motor Accessibility
```typescript
interface MotorAccessibility {
  keyboardNavigation: {
    enabled: true;
    focusVisible: true;
    skipLinks: true;
    shortcuts: {
      toggleThreatOverlay: 'T';
      toggleGuidancePanel: 'G';
      selectFirstSuggestion: '1';
      selectSecondSuggestion: '2';
      selectThirdSuggestion: '3';
      selectFourthSuggestion: '4';
    };
  };
  
  alternativeInput: {
    voiceCommands: true;
    eyeTracking: true;
    switchControl: true;
  };
  
  timing: {
    extendedTimeouts: true;
    pauseAnimations: true;
    disableAutoplay: true;
  };
}
```

## Performance Optimization

### Rendering Performance
```typescript
interface PerformanceSpecs {
  targetFrameRate: 60;
  maxDrawCalls: 100;
  textureAtlasing: true;
  
  optimizations: {
    culling: {
      enabled: true;
      margin: 50; // Pixels outside viewport
    };
    
    levelOfDetail: {
      enabled: true;
      distances: [200, 500, 1000];
      simplifications: ['remove-details', 'reduce-particles', 'hide-minor-elements'];
    };
    
    batching: {
      enabled: true;
      maxBatchSize: 50;
      sortByTexture: true;
    };
  };
}
```

### Memory Management
```typescript
interface MemoryManagement {
  objectPooling: {
    enabled: true;
    pools: {
      threatOverlays: 20;
      guidanceButtons: 10;
      magicEffects: 30;
      feedbackMessages: 5;
    };
  };
  
  assetManagement: {
    lazyLoading: true;
    unloadUnused: true;
    compressionLevel: 'high';
  };
  
  garbageCollection: {
    manualTrigger: true;
    threshold: 80; // Percentage of memory usage
    frequency: 30000; // Milliseconds
  };
}
```

This comprehensive UI/UX specification provides the foundation for implementing a cohesive, accessible, and performant ASI interface that supports the MVP goals while maintaining scalability for future enhancements.
