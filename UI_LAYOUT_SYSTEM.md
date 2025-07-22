# ProtoFusionGirl UI Layout System

## Overview

The new UI Layout System has been implemented to solve screen clutter issues and provide a clean, fullscreen gaming experience. The system keeps the center of the screen clear for gameplay while organizing all UI elements into logical zones.

## Key Features

### 1. Fullscreen Support
- Game now scales to full browser window
- Responsive layout adapts to any screen size
- No more fixed 800x600 resolution

### 2. Zone-Based Layout
- **Top Bar**: Health, PSI, status indicators
- **Bottom Bar**: Speed indicator, control hints
- **Left Panel**: Mission info, contextual data
- **Right Panel**: Minimap, debug tools
- **Center Safe Zone**: Protected gameplay area
- **Overlays**: Modal dialogs and complex UI

### 3. UI Component Management
- **Essential UI**: Always visible (health bars, minimap)
- **Contextual UI**: Show/hide on demand (inventory, ASI overlay)
- **Debug UI**: Development tools (ley line overlay)

## Keyboard Controls

| Key | Function |
|-----|----------|
| `Q` | Toggle ASI Overlay |
| `C` | Toggle Command Center |
| `I` | Toggle Inventory |
| `D` | Toggle Ley Line Debug Overlay |
| `H` | Hide/Show All Contextual UI |
| `U` | Show UI Layout Debug |

## Architecture

### UILayoutManager
Central manager that:
- Calculates screen zones based on current resolution
- Registers and positions UI components
- Handles screen resize events
- Provides layout debugging tools

### UIBarSystem
Essential UI elements organized into bars:
- Health and PSI bars with visual indicators
- Status text showing current mode and trust level
- Speed indicator and control hints
- Integrated minimap container

### Component Registration
```typescript
// Register a component with the layout system
layoutManager.registerComponent(
  'componentId',     // Unique identifier
  componentObject,   // The UI component
  'topBar',         // Zone to place it in
  'essential'       // Priority level
);
```

## Benefits

### For Players
- ✅ Clear center screen for gameplay
- ✅ Organized, non-intrusive UI
- ✅ Fullscreen immersive experience
- ✅ Easy access to all functions via hotkeys

### For Developers  
- ✅ Consistent UI positioning system
- ✅ Easy to add new UI components
- ✅ Responsive design handles all screen sizes
- ✅ Debug tools for layout visualization

## Implementation Details

### GameScene Integration
The GameScene now:
1. Initializes UILayoutManager early in create()
2. Creates UIBarSystem for essential elements
3. Registers all UI components with proper zones
4. Hides contextual UI by default
5. Updates UI elements in the update loop

### Screen Size Configuration
- CSS updated for fullscreen support
- Phaser configured with responsive scaling
- Layout zones calculated dynamically

### Migration from Old System
- Removed hardcoded text overlays
- Converted ASI overlay to contextual UI
- Moved minimap to right panel
- Organized all controls into logical groups

## Future Enhancements

1. **Custom Layout Profiles**: Allow players to customize UI layout
2. **Animation System**: Smooth transitions for UI show/hide
3. **Mobile Support**: Touch-friendly layout adaptations
4. **Accessibility**: High contrast mode, font scaling
5. **Mod Support**: Allow mods to register custom UI elements

## Usage Example

```typescript
// In a scene's create method:
const layoutManager = new UILayoutManager(this);
const barSystem = new UIBarSystem(this, layoutManager);

// Register a custom component
layoutManager.registerComponent(
  'myCustomUI', 
  myUIElement, 
  'leftPanel', 
  'contextual'
);

// Hide it initially
layoutManager.hideComponent('myCustomUI');

// Toggle with hotkey
this.input.keyboard.on('keydown-M', () => {
  layoutManager.toggleComponent('myCustomUI');
});
```

This system ensures ProtoFusionGirl maintains excellent visibility for gameplay while providing comprehensive UI functionality.
