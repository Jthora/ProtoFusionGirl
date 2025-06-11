// TimestreamUtils.ts
// Utility functions for Timestream Framework (hashing, diffing, etc.)
import { AnchorEvent, TimestreamBranch } from './TimestreamFramework';

export class TimestreamUtils {
  // Simple hash for event/branch IDs (replace with cryptographic hash for production)
  static simpleHash(input: string): string {
    let hash = 0, i, chr;
    for (i = 0; i < input.length; i++) {
      chr = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash.toString();
  }

  // Generate a unique event ID from anchor event data
  static eventIdFromAnchor(event: Omit<AnchorEvent, 'id'>): string {
    return this.simpleHash(JSON.stringify(event));
  }

  // Generate a unique branch ID from parent and event
  static branchId(parentId: string | undefined, eventId: string): string {
    return `${parentId || 'root'}:${eventId}`;
  }

  // Diff two branches (placeholder)
  static diffBranches(_a: TimestreamBranch, _b: TimestreamBranch): any {
    // TODO: Implement world state diffing
    return {};
  }

  // Deep diff two objects (returns only changed keys/values)
  static deepDiff(a: any, b: any): any {
    if (a === b) return undefined;
    if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return b;
    const diff: any = Array.isArray(a) ? [] : {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      if (!(key in b)) continue; // Only care about new/changed keys
      const d = this.deepDiff(a[key], b[key]);
      if (d !== undefined) diff[key] = d;
    }
    return Object.keys(diff).length ? diff : undefined;
  }
}
