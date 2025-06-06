// EventDrivenFeedbackRouter.ts
// See artifacts/narrative_feedback_integration_2025-06-05.artifact and agent_optimized_ui_ux_2025-06-05.artifact
// Routes feedback and narrative events to the appropriate overlays for ASI and Jane.

import { AgentOptimizedUI } from '../AgentOptimizedUI';

export type FeedbackEvent = {
  type: 'narrative' | 'world' | 'emotional' | 'relationship';
  role: 'ASI' | 'Jane';
  message: string;
  context?: any;
};

export class EventDrivenFeedbackRouter {
  private ui: AgentOptimizedUI;

  constructor(ui: AgentOptimizedUI) {
    this.ui = ui;
  }

  // Main entry point for feedback events
  routeFeedback(event: FeedbackEvent) {
    switch (event.type) {
      case 'narrative':
      case 'world':
        this.ui.showFeedback(event.role, event.message, event.context);
        break;
      case 'emotional':
      case 'relationship':
        // Could use a special overlay or notification for emotional/relationship feedback
        this.ui.showNotification(event.role, event.message, event.context);
        break;
      default:
        // Fallback to notification
        this.ui.showNotification(event.role, event.message, event.context);
    }
  }

  // Example: hook this up to the event bus
  listenToEventBus(eventBus: any) {
    eventBus.on('feedback', (event: FeedbackEvent) => {
      this.routeFeedback(event);
    });
  }
}
