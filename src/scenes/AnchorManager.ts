// AnchorManager.ts
// Extracted anchor management and trading logic from GameScene for modularity.
import { AnchorSyncService, AnchorSyncEvent } from '../services/AnchorSyncService';
import { MissionManager } from '../world/missions/MissionManager';

export class AnchorManager {
  anchors: { seed: string, label: string, center: { x: number, y: number }, owner?: string, shared?: boolean }[] = [];
  anchorSync?: AnchorSyncService;
  playerId: string;
  anchorTradeOfferQueue: AnchorSyncEvent[] = [];
  anchorTradeState: 'idle' | 'offering' | 'awaiting_response' | 'received_offer' | 'reviewing_offers' = 'idle';
  anchorPanel?: Phaser.GameObjects.DOMElement;
  anchorTradeOfferModal?: any;
  missionManager: MissionManager;
  scene: Phaser.Scene;
  lastAnchorTradeEvent?: AnchorSyncEvent;
  pendingAnchorTrade?: { anchor: any, toPlayerId: string };

  constructor(scene: Phaser.Scene, missionManager: MissionManager, playerId: string) {
    this.scene = scene;
    this.missionManager = missionManager;
    this.playerId = playerId;
    this.anchorSync = new AnchorSyncService(playerId);
    this.anchorSync.onEvent(this.handleAnchorSyncEvent.bind(this));
  }

  setAnchorTradeState(state: 'idle' | 'offering' | 'awaiting_response' | 'received_offer' | 'reviewing_offers', event?: AnchorSyncEvent) {
    this.anchorTradeState = state;
    this.lastAnchorTradeEvent = event;
    if (state === 'reviewing_offers') {
      this.showAnchorTradeOfferQueue();
    }
  }

  showAnchorTradeOfferQueue() {
    if (this.anchorTradeOfferQueue.length === 0) {
      this.setAnchorTradeState('idle');
      return;
    }
    const offer = this.anchorTradeOfferQueue[0];
    if (this.anchorTradeOfferModal) this.anchorTradeOfferModal.destroy();
    // You may need to import AnchorTradeOfferModal or pass it in via constructor
    this.anchorTradeOfferModal = new (this.scene as any).AnchorTradeOfferModal({
      scene: this.scene,
      offer: { from: (offer as any).from, anchor: (offer as any).anchor },
      onAccept: () => this.acceptAnchorTradeOffer(offer),
      onReject: () => this.rejectAnchorTradeOffer(offer)
    });
    this.anchorTradeOfferModal.show();
  }

  acceptAnchorTradeOffer(offer: any) {
    this.anchorSync?.sendEvent({
      type: 'trade_accept',
      anchor: offer.anchor,
      from: this.playerId,
      to: offer.from
    });
    this.anchors.push({ ...offer.anchor });
    this.saveAnchorsToStorage();
    this.updateMinimapAnchors((this.scene as any).minimap);
    this.anchorTradeOfferQueue.shift();
    this.setAnchorTradeState(this.anchorTradeOfferQueue.length > 0 ? 'reviewing_offers' : 'idle');
    this.missionManager.triggerEventForAllMissions('anchor_trade_completed', { with: offer.from });
    (this.scene as any).grantAnchorTradeReward?.();
  }

  rejectAnchorTradeOffer(offer: any) {
    this.anchorSync?.sendEvent({
      type: 'trade_reject',
      anchor: offer.anchor,
      from: this.playerId,
      to: offer.from
    });
    this.anchorTradeOfferQueue.shift();
    this.setAnchorTradeState(this.anchorTradeOfferQueue.length > 0 ? 'reviewing_offers' : 'idle');
  }

  handleAnchorSyncEvent(event: AnchorSyncEvent) {
    if (event.type === 'add') {
      if (!this.anchors.some(a => a.seed === event.anchor.seed)) {
        this.anchors.push({ ...event.anchor });
        this.saveAnchorsToStorage();
        this.updateMinimapAnchors((this.scene as any).minimap);
      }
    } else if (event.type === 'edit') {
      const anchor = this.anchors.find(a => a.seed === event.seed);
      if (anchor) {
        anchor.label = event.label;
        this.saveAnchorsToStorage();
        this.updateMinimapAnchors((this.scene as any).minimap);
      }
    } else if (event.type === 'delete') {
      const idx = this.anchors.findIndex(a => a.seed === event.seed);
      if (idx !== -1) {
        this.anchors.splice(idx, 1);
        this.saveAnchorsToStorage();
        this.updateMinimapAnchors((this.scene as any).minimap);
      }
    } else if (event.type === 'trade_offer' && event.to === this.playerId) {
      this.anchorTradeOfferQueue.push(event);
      if (this.anchorTradeState === 'idle') {
        this.setAnchorTradeState('reviewing_offers');
      }
      this.missionManager.triggerEventForAllMissions('anchor_trade_offer_received', { from: event.from });
    } else if (event.type === 'trade_accept' && event.to === this.playerId) {
      this.setAnchorTradeState('idle', event);
      this.missionManager.triggerEventForAllMissions('anchor_trade_completed', { with: event.from });
      alert(`Player ${event.from} accepted your anchor trade for '${event.anchor.label}'.`);
    } else if (event.type === 'trade_reject' && event.to === this.playerId) {
      this.setAnchorTradeState('idle', event);
      alert(`Player ${event.from} rejected your anchor trade for '${event.anchor.label}'.`);
    }
  }

  saveAnchorsToStorage() {
    localStorage.setItem('realityAnchors', JSON.stringify(this.anchors));
  }

  updateMinimapAnchors(minimap: any) {
    if (minimap) {
      minimap.drawWarpAnchors(
        this.anchors.map(a => ({ x: a.center.x, y: a.center.y, datakey: a.label }))
      );
    }
  }

  broadcastAnchorAdd(anchor: { seed: string, label: string, center: { x: number, y: number } }) {
    if (this.anchorSync) {
      this.anchorSync.sendEvent({
        type: 'add',
        anchor: { ...anchor, owner: this.playerId, shared: true }
      });
    }
  }
  broadcastAnchorEdit(seed: string, label: string) {
    if (this.anchorSync) {
      this.anchorSync.sendEvent({ type: 'edit', seed, label });
    }
  }
  broadcastAnchorDelete(seed: string) {
    if (this.anchorSync) {
      this.anchorSync.sendEvent({ type: 'delete', seed });
    }
  }

  offerAnchorTrade(anchorIdx: number, toPlayerId: string) {
    if (!this.anchorSync) return;
    const anchor = this.anchors[anchorIdx];
    if (!anchor) return;
    const sharedAnchor = {
      seed: anchor.seed,
      label: anchor.label,
      center: anchor.center,
      owner: anchor.owner || this.playerId,
      shared: true as const
    };
    this.anchorSync.sendEvent({
      type: 'trade_offer',
      anchor: sharedAnchor,
      from: this.playerId,
      to: toPlayerId
    });
    this.setAnchorTradeState('awaiting_response');
    this.missionManager.triggerEventForAllMissions('anchor_trade_offered', { to: toPlayerId });
    alert('Trade offer sent!');
  }

  acceptAnchorTrade(trade: { anchor: any, fromPlayerId: string }) {
    if (!this.anchorSync) return;
    this.anchorSync.sendEvent({
      type: 'trade_accept',
      anchor: trade.anchor,
      from: this.playerId,
      to: trade.fromPlayerId
    });
    this.anchors.push({ ...trade.anchor });
    this.saveAnchorsToStorage();
    this.updateMinimapAnchors((this.scene as any).minimap);
    alert('Anchor trade accepted!');
  }

  showAnchorPanel() {
    if (this.anchorPanel) {
      this.anchorPanel.setVisible(true);
      return;
    }
    // Create a simple HTML UI for anchor management with edit/delete
    const html = `
      <div style="background:#222244;color:#fff;padding:12px;border-radius:8px;width:260px;max-height:320px;overflow:auto;">
        <h4>Reality Anchors</h4>
        <button id='import-anchor-btn' style='margin-bottom:8px;width:100%;'>Import Shared Anchor</button>
        <ul style='list-style:none;padding:0;margin:0;'>
          ${this.anchors.map((a, i) => `
            <li style='margin-bottom:8px;'>
              <button data-anchor='${i}' style='width:40%;margin-bottom:2px;'>${a.label} <span style='font-size:10px;color:#aaa;'>[${a.owner || 'local'}]</span></button>
              <button data-edit='${i}' style='width:10%;margin-left:2px;'>✎</button>
              <button data-delete='${i}' style='width:10%;margin-left:2px;color:#ff4444;'>🗑</button>
              <button data-export='${i}' style='width:15%;margin-left:2px;'>Share</button>
              <button data-trade='${i}' style='width:20%;margin-left:2px;'>Offer Trade</button>
            </li>`).join('')}
        </ul>
        <button id='close-anchor-panel' style='margin-top:8px;width:100%;'>Close</button>
      </div>
    `;
    this.anchorPanel = (this.scene as any).add.dom((this.scene as any).scale.width - 280, 60).createFromHTML(html).setDepth(2000).setScrollFactor(0);
    this.anchorPanel.addListener('click');
    this.anchorPanel.on('click', (event: any) => {
      if (event.target.id === 'close-anchor-panel') {
        this.anchorPanel?.setVisible(false);
      } else if (event.target.id === 'import-anchor-btn') {
        this.importAnchor();
      } else if (event.target.dataset && event.target.dataset.anchor) {
        const idx = parseInt(event.target.dataset.anchor, 10);
        const anchor = this.anchors[idx];
        if (anchor) {
          // Show anchor details or allow editing
          const detailHtml = `
            <div style="background:#333;color:#fff;padding:12px;border-radius:8px;">
              <h4>${anchor.label} <small style="color:#aaa;">[${anchor.owner || 'local'}]</small></h4>
              <p>Seed: ${anchor.seed}</p>
              <p>Center: (${anchor.center.x.toFixed(2)}, ${anchor.center.y.toFixed(2)})</p>
              <button id='edit-anchor-${idx}' style='margin-top:8px;width:100%;'>Edit</button>
              <button id='delete-anchor-${idx}' style='margin-top:8px;width:100%;color:#ff4444;'>Delete</button>
              <button id='export-anchor-${idx}' style='margin-top:8px;width:100%;'>Share</button>
              <button id='trade-anchor-${idx}' style='margin-top:8px;width:100%;'>Offer Trade</button>
              <button id='close-detail-${idx}' style='margin-top:8px;width:100%;'>Close</button>
            </div>
          `;
          (this.scene as any).add.dom(400, 300).createFromHTML(detailHtml).setDepth(2100).setScrollFactor(0);
        }
      } else if (event.target.dataset && event.target.dataset.edit) {
        const idx = parseInt(event.target.dataset.edit, 10);
        const anchor = this.anchors[idx];
        if (anchor) {
          const newLabel = prompt('Enter new label for anchor:', anchor.label);
          if (newLabel !== null) {
            this.broadcastAnchorEdit(anchor.seed, newLabel);
            anchor.label = newLabel;
            this.saveAnchorsToStorage();
            this.updateMinimapAnchors((this.scene as any).minimap);
          }
        }
      } else if (event.target.dataset && event.target.dataset.delete) {
        const idx = parseInt(event.target.dataset.delete, 10);
        const anchor = this.anchors[idx];
        if (anchor) {
          const confirmDelete = confirm(`Are you sure you want to delete the anchor '${anchor.label}'?`);
          if (confirmDelete) {
            this.broadcastAnchorDelete(anchor.seed);
            this.anchors.splice(idx, 1);
            this.saveAnchorsToStorage();
            this.updateMinimapAnchors((this.scene as any).minimap);
          }
        }
      } else if (event.target.dataset && event.target.dataset.export) {
        const idx = parseInt(event.target.dataset.export, 10);
        this.exportAnchor(idx);
      } else if (event.target.dataset && event.target.dataset.trade) {
        const idx = parseInt(event.target.dataset.trade, 10);
        const toPlayerId = prompt('Enter Player ID to trade with:');
        if (toPlayerId) {
          this.offerAnchorTrade(idx, toPlayerId);
        }
      }
    });
  }

  // --- Anchor Import/Export ---
  importAnchor() {
    // Implement anchor import logic (e.g., prompt for JSON, parse, add to anchors)
    const json = prompt('Paste anchor JSON:');
    if (!json) return;
    try {
      const anchor = JSON.parse(json);
      if (anchor && anchor.seed && anchor.label && anchor.center) {
        this.anchors.push(anchor);
        this.saveAnchorsToStorage();
        this.updateMinimapAnchors((this.scene as any).minimap);
        alert('Anchor imported!');
      } else {
        alert('Invalid anchor data.');
      }
    } catch (e) {
      alert('Failed to parse anchor JSON.');
    }
  }

  exportAnchor(idx: number) {
    const anchor = this.anchors[idx];
    if (!anchor) return;
    const json = JSON.stringify(anchor, null, 2);
    prompt('Copy this anchor JSON:', json);
  }
}
