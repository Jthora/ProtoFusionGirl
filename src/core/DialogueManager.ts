// DialogueManager.ts
// Manages dialogue nodes, branching, and conversation flow

export interface DialogueNode {
  id: string;
  text: string;
  choices?: Array<{ text: string; next: string }>;
  // ...other fields (conditions, actions, etc.)
}

export class DialogueManager {
  private nodes: Map<string, DialogueNode> = new Map();
  private dialogueStartedCallbacks: Array<(node: DialogueNode) => void> = [];

  registerNode(node: DialogueNode) {
    this.nodes.set(node.id, node);
  }

  getNode(id: string): DialogueNode | undefined {
    return this.nodes.get(id);
  }

  startDialogue(startId: string) {
    const node = this.getNode(startId);
    if (node) {
      this.dialogueStartedCallbacks.forEach(cb => cb(node));
      // ...stub: begin dialogue flow logic
    }
  }

  onDialogueStarted(callback: (node: DialogueNode) => void) {
    this.dialogueStartedCallbacks.push(callback);
  }

  registerDefaultNodes() {
    // Register default/test dialogue nodes here instead of GameScene
    const testDialogue: DialogueNode = {
      id: 'npc_test_1_intro',
      text: 'Greetings, human. I am a PsiSys Robot. What do you seek?',
      choices: [
        { text: 'Who are you?', next: 'npc_test_1_identity' },
        { text: 'Goodbye.', next: 'npc_test_1_end' }
      ]
    };
    const identityNode: DialogueNode = {
      id: 'npc_test_1_identity',
      text: 'I am a PsiSys maintenance unit. My purpose is to assist and observe.',
      choices: [
        { text: 'Thanks.', next: 'npc_test_1_end' }
      ]
    };
    const endNode: DialogueNode = {
      id: 'npc_test_1_end',
      text: 'Farewell.',
      choices: []
    };
    this.registerNode(testDialogue);
    this.registerNode(identityNode);
    this.registerNode(endNode);
  }

  // Extension point: modding hook
  static globalInstance: DialogueManager | null = null;

  static registerGlobalInstance(instance: DialogueManager) {
    DialogueManager.globalInstance = instance;
  }
}

// Artifact: copilot_context_anchor_index_2025-06-05.artifact - DialogueManager extension points added

// ...stub: global DialogueManager instance
