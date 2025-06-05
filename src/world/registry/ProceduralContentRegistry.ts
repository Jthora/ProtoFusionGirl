// ProceduralContentRegistry: Versioned registry for seeds, datakeys, procedural rules, and modded content.
// Integrates with save/load, tile/datakey systems, and mod loader.
export interface ProceduralContentEntry {
  id: string;
  type: 'seed' | 'datakey' | 'rule' | 'asset';
  value: any;
  version: string;
  modId?: string;
  status?: 'active' | 'deprecated';
}

export class ProceduralContentRegistry {
  private entries: Map<string, ProceduralContentEntry> = new Map();

  registerContent(entry: ProceduralContentEntry) {
    this.entries.set(entry.id, entry);
  }

  lookupContent(id: string): ProceduralContentEntry | undefined {
    return this.entries.get(id);
  }

  deprecateContent(id: string) {
    const entry = this.entries.get(id);
    if (entry) entry.status = 'deprecated';
  }

  migrateContent(id: string, newValue: any, newVersion: string) {
    const entry = this.entries.get(id);
    if (entry) {
      entry.value = newValue;
      entry.version = newVersion;
    }
  }

  validateMod(modId: string): boolean {
    // TODO: Implement mod validation logic (schema, compatibility, etc.)
    return true;
  }

  getAllEntries(type?: string) {
    if (!type) return Array.from(this.entries.values());
    return Array.from(this.entries.values()).filter(e => e.type === type);
  }
}
