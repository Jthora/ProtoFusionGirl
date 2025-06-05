// TimestreamHooks.ts
// Modding and system integration hooks for the Timestream Framework
import { AnchorEvent, TimestreamBranch } from './TimestreamFramework';

export type AnchorEventHook = (event: AnchorEvent, branch: TimestreamBranch) => void;
export type BranchChangeHook = (branch: TimestreamBranch) => void;

export class TimestreamHooks {
  private static anchorEventHooks: AnchorEventHook[] = [];
  private static branchChangeHooks: BranchChangeHook[] = [];

  static registerAnchorEventHook(hook: AnchorEventHook) {
    this.anchorEventHooks.push(hook);
  }

  static registerBranchChangeHook(hook: BranchChangeHook) {
    this.branchChangeHooks.push(hook);
  }

  static triggerAnchorEvent(event: AnchorEvent, branch: TimestreamBranch) {
    for (const hook of this.anchorEventHooks) hook(event, branch);
  }

  static triggerBranchChange(branch: TimestreamBranch) {
    for (const hook of this.branchChangeHooks) hook(branch);
  }
}
