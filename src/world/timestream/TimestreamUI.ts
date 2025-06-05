// TimestreamUI.ts
// UI logic for visualizing and interacting with the Timestream Framework
default
import { TimestreamFramework, TimestreamBranch, AnchorEvent } from './TimestreamFramework';

export class TimestreamUI {
  private framework: TimestreamFramework;
  private container: HTMLElement;

  constructor(framework: TimestreamFramework, container: HTMLElement) {
    this.framework = framework;
    this.container = container;
    this.framework.onBranchChange(() => this.render());
    this.render();
  }

  render() {
    // Simple timeline/branch list for now
    this.container.innerHTML = '';
    const branches = this.framework.getAllBranches();
    for (const branch of branches) {
      const div = document.createElement('div');
      div.className = 'timestream-branch';
      div.textContent = `Branch: ${branch.id} (Parent: ${branch.parentId || 'root'}) | Consequences: ${branch.consequences.length}`;
      div.onclick = () => this.selectBranch(branch.id);
      this.container.appendChild(div);
    }
  }

  selectBranch(branchId: string) {
    // For now, just log and highlight
    const branch = this.framework.getAllBranches().find(b => b.id === branchId);
    if (branch) {
      alert(`Selected branch: ${branch.id}\nHistory: ${this.framework.getBranchHistory(branch.id).map(b => b.id).join(' -> ')}`);
    }
  }
}
