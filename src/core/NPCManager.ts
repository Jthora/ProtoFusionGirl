// NPCManager.ts
// Manages NPCs, allies, and factions for ProtoFusionGirl

import { EventBus, Event } from './EventBus';

export type Faction = 'PsiSys' | 'BeuSprites' | 'Neutral' | string;

export interface NPC {
  id: string;
  name: string;
  faction: Faction;
  isAlly: boolean;
  relationship: number;
  // ...other stats/fields
}

export class NPCManager {
  private npcs: Map<string, NPC> = new Map();
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  registerNPC(npc: NPC) {
    this.npcs.set(npc.id, npc);
    // ...emit event, etc.
  }

  getNPC(id: string): NPC | undefined {
    return this.npcs.get(id);
  }

  summonAlly(id: string) {
    // ...stub: summon ally logic
  }

  setRelationship(id: string, value: number) {
    const npc = this.npcs.get(id);
    if (npc) npc.relationship = value;
  }

  // Event hooks for world/UI integration
  onNPCUpdated(callback: (npc: NPC) => void) {
    this.eventBus.on('npcUpdated', (event: Event<NPC>) => callback(event.data));
  }

  updateNPC(npc: NPC) {
    this.npcs.set(npc.id, npc);
    this.eventBus.emit({ type: 'npcUpdated', data: npc });
  }

  // Extension point: modding hook
  static globalInstance: NPCManager | null = null;

  static registerGlobalInstance(instance: NPCManager) {
    NPCManager.globalInstance = instance;
  }

  static spawnTestNPC(scene: Phaser.Scene, onInteract: (npcId: string) => void): Phaser.GameObjects.Sprite {
    const npcId = 'npc_test_1';
    const sprite = scene.add.sprite(400, 300, 'player', 0).setTint(0x00ffcc).setScale(0.8);
    sprite.setInteractive();
    sprite.on('pointerdown', () => onInteract(npcId));
    return sprite;
  }

  static isPlayerNearNPC(playerSprite: Phaser.GameObjects.Sprite, npcSprite: Phaser.GameObjects.Sprite): boolean {
    const dist = Phaser.Math.Distance.Between(playerSprite.x, playerSprite.y, npcSprite.x, npcSprite.y);
    return dist < 64;
  }

  // ...stub: more NPC/allies/factions logic
}

// Artifact: copilot_context_anchor_index_2025-06-05.artifact - NPCManager extension points added

// ...stub: global NPCManager instance, hooks for modding
