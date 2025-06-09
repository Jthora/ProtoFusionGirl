// AgentOptimizedUI.ts
// See artifacts/agent_optimized_ui_ux_2025-06-05.artifact for rationale and requirements.
// Provides modular, context-aware overlays and panels for both ASI (player) and Jane (avatar).
// Supports feedback overlays, context-sensitive notifications, and pluggable UI extensions.

import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/EventTypes';

export interface OverlayConfig {
  id: string;
  role: 'ASI' | 'Jane';
  type: 'feedback' | 'notification' | 'panel';
  content: any;
  context?: any;
}

export type OverlayComponent = (config: OverlayConfig) => void;

export class AgentOptimizedUI {
  private overlays: Map<string, OverlayConfig> = new Map();
  private overlayComponents: Map<string, OverlayComponent> = new Map();

  // Register a new overlay component (for modding/extensibility)
  registerOverlayComponent(id: string, component: OverlayComponent) {
    this.overlayComponents.set(id, component);
  }

  // Show an overlay for ASI or Jane
  showOverlay(config: OverlayConfig) {
    this.overlays.set(config.id, config);
    const component = this.overlayComponents.get(config.id);
    if (component) {
      component(config);
    } else {
      // Default rendering logic (stub)
      // ...
    }
  }

  // Hide an overlay
  hideOverlay(id: string) {
    this.overlays.delete(id);
    // ...remove from UI...
  }

  // Show a context-sensitive notification
  showNotification(role: 'ASI' | 'Jane', message: string, context?: any) {
    this.showOverlay({
      id: `notification-${Date.now()}`,
      role,
      type: 'notification',
      content: message,
      context
    });
  }

  // Show feedback overlay (narrative, world, emotional, etc.)
  showFeedback(role: 'ASI' | 'Jane', feedback: any, context?: any) {
    this.showOverlay({
      id: `feedback-${Date.now()}`,
      role,
      type: 'feedback',
      content: feedback,
      context
    });
  }

  // List all overlays for a role
  getOverlaysForRole(role: 'ASI' | 'Jane') {
    return Array.from(this.overlays.values()).filter(o => o.role === role);
  }

  // Extension point: allow mods to add new overlay types, feedback, etc.
  // ...

  /**
   * Attach the unified EventBus and listen for overlay/notification events.
   * This should be called once after instantiation.
   */
  attachEventBus(eventBus: EventBus) {
    eventBus.on('OVERLAY_SHOW', (event: GameEvent<'OVERLAY_SHOW'>) => {
      this.showOverlay(event.data);
    });
    eventBus.on('OVERLAY_HIDE', (event: GameEvent<'OVERLAY_HIDE'>) => {
      this.hideOverlay(event.data.id);
    });
    eventBus.on('NOTIFICATION_SHOW', (event: GameEvent<'NOTIFICATION_SHOW'>) => {
      this.showNotification(event.data.role, event.data.message, event.data.context);
    });
  }

  // TODO: Add context-aware overlays for different game states (combat, exploration, narrative, etc.).
  // TODO: Implement feedback overlays for player/ASI actions and system events.
  // TODO: Expose plugin/modding API for custom overlays and notifications.
}
