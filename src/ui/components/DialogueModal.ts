// DialogueModal.ts
// Minimal dialogue modal UI for ProtoFusionGirl
import Phaser from 'phaser';
import { DialogueManager, DialogueNode } from '../../core/DialogueManager';

export class DialogueModal {
  private scene: Phaser.Scene;
  private dialogueManager: DialogueManager;
  private container?: Phaser.GameObjects.Container;
  private textObj?: Phaser.GameObjects.Text;
  private choiceObjs: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene, dialogueManager: DialogueManager) {
    this.scene = scene;
    this.dialogueManager = dialogueManager;
  }

  show(node: DialogueNode) {
    this.hide();
    this.container = this.scene.add.container(100, 100);
    this.textObj = this.scene.add.text(0, 0, node.text, { font: '20px monospace', color: '#fff', backgroundColor: '#222', wordWrap: { width: 400 } });
    this.container.add(this.textObj);
    let y = 60;
    this.choiceObjs = [];
    (node.choices || []).forEach((choice, idx) => {
      const choiceText = this.scene.add.text(0, y, `[${idx + 1}] ${choice.text}`, { font: '18px monospace', color: '#ff0', backgroundColor: '#333' })
        .setInteractive()
        .on('pointerdown', () => {
          this.dialogueManager.startDialogue(choice.next);
        });
      this.container.add(choiceText);
      this.choiceObjs.push(choiceText);
      y += 32;
    });
    if ((node.choices || []).length === 0) {
      // End of dialogue, click to close
      this.textObj.setText(node.text + '\n\n[Click to close]');
      this.textObj.setInteractive().on('pointerdown', () => this.hide());
    }
  }

  hide() {
    this.container?.destroy();
    this.textObj = undefined;
    this.choiceObjs.forEach(obj => obj.destroy());
    this.choiceObjs = [];
  }
}
