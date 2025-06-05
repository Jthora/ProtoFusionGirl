// AnchorSyncService.ts - Multiplayer anchor sharing/sync stub for ProtoFusionGirl
// This service is backend-agnostic and can be wired to WebSocket, peer-to-peer, or mock network.

export interface SharedAnchor {
  seed: string;
  label: string;
  center: { x: number, y: number };
  owner: string;
  shared: true;
}

export type AnchorTradeOfferEvent = {
  type: 'trade_offer',
  anchor: SharedAnchor,
  from: string,
  to: string
};
export type AnchorTradeAcceptEvent = {
  type: 'trade_accept',
  anchor: SharedAnchor,
  from: string,
  to: string
};
export type AnchorTradeRejectEvent = {
  type: 'trade_reject',
  anchor: SharedAnchor,
  from: string,
  to: string
};

export type AnchorSyncEvent =
  | { type: 'add', anchor: SharedAnchor }
  | { type: 'edit', seed: string, label: string }
  | { type: 'delete', seed: string }
  | AnchorTradeOfferEvent
  | AnchorTradeAcceptEvent
  | AnchorTradeRejectEvent;

export type AnchorSyncListener = (event: AnchorSyncEvent) => void;

export class AnchorSyncService {
  private listeners: AnchorSyncListener[] = [];
  private playerId: string;

  constructor(playerId: string) {
    this.playerId = playerId;
  }

  // Register a callback for incoming anchor events
  onEvent(listener: AnchorSyncListener) {
    this.listeners.push(listener);
  }

  // Simulate sending an event to the network (stub: just calls listeners directly)
  sendEvent(event: AnchorSyncEvent) {
    // In a real implementation, this would send to server/peers
    setTimeout(() => {
      for (const listener of this.listeners) {
        listener(event);
      }
    }, 0);
  }

  // Simulate receiving an event from the network
  receiveEvent(event: AnchorSyncEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  // Utility for generating a player ID (could be replaced with real auth/session)
  static generatePlayerId(): string {
    return 'player-' + Math.random().toString(36).slice(2, 10);
  }
}
