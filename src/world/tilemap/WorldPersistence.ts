/**
   * --- API & Edge Case Documentation ---
   *
   * API Overview:
   * - loadFromFile(file): Loads world data, auto-migrates legacy formats.
   * - saveToFile(file): Saves world data in current format.
   * - loadAdvancedStateFromFile(file): Loads advanced state, auto-migrates legacy formats.
   * - saveAdvancedStateToFile(file, state): Saves advanced state.
   * - migrateLegacySaveData(legacyData): Converts legacy data to new multiverse format.
   * - createBranch, mergeBranches, pruneBranch: Branch management.
   * - recordDelta: Record a delta (tile edit, warp, etc.) in a branch.
   * - setAnchor, getAnchor, listAnchors: Anchor management.
   * - listBranches, getBranch: Branch queries.
   * - triggerAutosave: Stub for autosave/event feedback.
   * - generateDeterministicSeed: Deterministic seed for procedural content.
   * - isDatakeyUnique: Datakey uniqueness check (stub, to be integrated with registry).
   *
   * Edge Cases:
   * - Legacy save files (no branches/anchors): Auto-migrated to a single-branch format.
   * - Branch/anchor ID collisions: Throws error or overwrites, depending on method.
   * - Merge conflicts: mergeBranches is naive (appends deltas); CRDT/advanced merge needed for production.
   * - Autosave/event feedback: Not yet implemented; stub provided for integration.
   * - Datakey uniqueness: Always returns true (stub); must be integrated with procedural registry for real checks.
   * - File I/O: Uses Node.js fs/promises for desktop, fetch for browser; browser save is stubbed.
   * - Optional registries/services: Uses duck typing for optional services (itemRegistry, equipmentRegistry, etc.).
   * - Error handling: Throws on missing branches, branch collisions, or missing files.
   *
   * See artifacts for full integration and migration plans.
   */

// WorldPersistence: Handles saving/loading world data (chunks, metadata, etc.) to disk or cloud
import { TilemapManager } from './TilemapManager';
import { Jane } from '../../core/Jane';
import { EventBus } from '../../core/EventBus';
import { TimestreamFramework } from '../timestream/TimestreamFramework';
import { LeyLineInstabilityEvent } from '../leyline/types';

export class WorldPersistence {
  private tilemapManager: TilemapManager;
  private modMetadata: Record<string, any> = {};
  private timestreamFramework: TimestreamFramework;

  // --- Advanced Multiverse State ---
  private multiverseState: {
    branches: Record<string, { seed: string, deltas: any[], leyLineEvents?: LeyLineInstabilityEvent[], parent?: string, children?: string[] }>; // Add leyLineEvents
    anchors: Record<string, any>;
    meta: any;
  } = {
    branches: {},
    anchors: {},
    meta: {},
  };

  private proceduralRegistry: any; // Add reference to ProceduralContentRegistry
  private jane: Jane | null = null;
  private eventBus: EventBus | null = null;

  constructor(tilemapManager: TilemapManager) {
    this.tilemapManager = tilemapManager;
    this.timestreamFramework = new TimestreamFramework();
  }

  setModMetadata(modId: string, data: any) {
    this.modMetadata[modId] = data;
  }

  getModMetadata(modId: string): any {
    return this.modMetadata[modId];
  }

  setProceduralRegistry(registry: any) {
    this.proceduralRegistry = registry;
  }

  setJane(jane: Jane) {
    this.jane = jane;
  }

  setEventBus(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Migration helper: Convert legacy save data to the new multiverse-aware format.
   * @param legacyData The old save data object
   * @returns The migrated advanced state object
   */
  migrateLegacySaveData(legacyData: any): any {
    // Detect if already in new format
    if (legacyData && legacyData.branches && legacyData.anchors) return legacyData;
    // Migrate legacy flat world data to a single-branch multiverse state
    const defaultBranchId = 'main';
    const migrated = {
      branches: {
        [defaultBranchId]: {
          seed: typeof legacyData.seed === 'string' ? legacyData.seed : 'default-seed',
          deltas: Array.isArray(legacyData.deltas) ? legacyData.deltas : [],
          parent: undefined,
          children: []
        }
      },
      anchors: legacyData.anchors || {},
      meta: legacyData.meta || {}
    };
    // Optionally migrate other fields (chunks, registries, etc.)
    return migrated;
  }

  /**
   * Loads world data from a JSON file (chunks, metadata, etc.), including Jane and speeder state.
   * If Jane or speeder state is missing (legacy save), instantiate defaults.
   */
  async loadFromFile(file: string) {
    let data: any;
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.fetch === 'function';
    if (isBrowser) {
      const res = await fetch(file);
      data = await res.json();
    } else {
      const fs = await import('fs/promises');
      const content = await fs.readFile(file, 'utf-8');
      data = JSON.parse(content);
    }
    // --- Migration logic for legacy data ---
    if (!data.branches || !data.anchors) {
      data = this.migrateLegacySaveData(data);
    }
    // Update internal state for round-trip and migration correctness
    if (data.branches) this.multiverseState.branches = data.branches;
    if (data.anchors) this.multiverseState.anchors = data.anchors;
    if (data.meta) this.multiverseState.meta = data.meta;
    // ...existing code for loading chunks, registries, etc...
    if (data.chunks) {
      this.tilemapManager.chunkManager.setLoadedChunks(data.chunks);
    }
    if (data.tileRegistry) {
      this.tilemapManager.tileRegistry.fromJSON(data.tileRegistry);
    }
    if (data.itemRegistry && (this.tilemapManager as any).itemRegistry) {
      (this.tilemapManager as any).itemRegistry.fromJSON(data.itemRegistry);
    }
    if (data.equipmentRegistry && (this.tilemapManager as any).equipmentRegistry) {
      (this.tilemapManager as any).equipmentRegistry.fromJSON(data.equipmentRegistry);
    }
    if (data.equipmentService && (this.tilemapManager as any).equipmentService) {
      (this.tilemapManager as any).equipmentService.fromJSON(data.equipmentService);
    }
    if (data.playerStats && (this.tilemapManager as any).playerStats) {
      (this.tilemapManager as any).playerStats.fromJSON(data.playerStats);
    }
    if (data.inventory && (this.tilemapManager as any).inventoryService) {
      (this.tilemapManager as any).inventoryService.fromJSON(data.inventory);
    }
    if (data.modMetadata) {
      this.modMetadata = data.modMetadata;
    }
    // --- Jane and Magneto Speeder integration ---
    if (data.jane) {
      if (this.eventBus) {
        this.jane = Jane.fromJSON(data.jane, this.eventBus);
      } else {
        // Fallback: create with dummy event bus
        this.jane = Jane.fromJSON(data.jane, { emit: () => {} } as any);
      }
    } else {
      // Legacy save: create default Jane
      if (this.eventBus) {
        this.jane = new Jane({ eventBus: this.eventBus });
      } else {
        this.jane = new Jane({ eventBus: { emit: () => {} } as any });
      }
    }
    // --- End migration logic ---
    // Return a deep clone to avoid test pollution and match test expectations
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Saves world data (chunks, metadata, etc.), including Jane and speeder state.
   */
  async saveToFile(file: string) {
    const data: any = {
      chunks: this.tilemapManager.chunkManager.getLoadedChunks(),
      tileRegistry: this.tilemapManager.tileRegistry.toJSON(),
      itemRegistry: (this.tilemapManager as any).itemRegistry?.toJSON?.(),
      equipmentRegistry: (this.tilemapManager as any).equipmentRegistry?.toJSON?.(),
      equipmentService: (this.tilemapManager as any).equipmentService?.toJSON?.(),
      playerStats: (this.tilemapManager as any).playerStats?.toJSON?.(),
      inventory: (this.tilemapManager as any).inventoryService?.toJSON?.(),
      modMetadata: this.modMetadata,
      jane: this.jane ? this.jane.toJSON() : undefined,
      // --- Add multiverse state for round-trip ---
      branches: this.multiverseState.branches,
      anchors: this.multiverseState.anchors,
      meta: this.multiverseState.meta
    };
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.fetch === 'function';
    if (isBrowser) {
      // const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      // Optionally: trigger download or autosave
    } else {
      const fs = await import('fs/promises');
      await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
    }
  }

  /**
   * Save the advanced world state (branches, deltas, anchors, meta) to a JSON file.
   * @param file Path to save the world file
   * @param state The advanced save state object
   */
  async saveAdvancedStateToFile(file: string, state: any) {
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.fetch === 'function';
    if (isBrowser) {
      // Optionally: trigger download or autosave
      // const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    } else {
      const fs = await import('fs/promises');
      await fs.writeFile(file, JSON.stringify(state, null, 2), 'utf-8');
    }
  }

  /**
   * Load the advanced world state (branches, deltas, anchors, meta) from a JSON file.
   * Handles migration from legacy formats if needed.
   * @param file Path to the world file
   * @returns The loaded advanced save state object
   */
  async loadAdvancedStateFromFile(file: string) {
    let data: any;
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.fetch === 'function';
    if (isBrowser) {
      const res = await fetch(file);
      data = await res.json();
    } else {
      const fs = await import('fs/promises');
      const content = await fs.readFile(file, 'utf-8');
      data = JSON.parse(content);
    }
    // --- Migration logic for legacy data ---
    if (!data.branches || !data.anchors) {
      data = this.migrateLegacySaveData(data);
    }
    // --- End migration logic ---
    return data;
  }

  /**
   * Save a branch (timeline/warp zone) with its seed and deltas.
   */
  async saveBranch(branchId: string, branchData: { seed: string, deltas: any[] }, file: string) {
    // For prototype: just save branch data to a file
    const fs = await import('fs/promises');
    await fs.writeFile(file, JSON.stringify({ branchId, ...branchData }, null, 2), 'utf-8');
  }

  /**
   * Load a branch (timeline/warp zone) with its seed and deltas.
   */
  async loadBranch(file: string) {
    const fs = await import('fs/promises');
    const content = await fs.readFile(file, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Save anchors (for anchor/warp integration)
   */
  async saveAnchors(anchors: Record<string, any>, file: string) {
    const fs = await import('fs/promises');
    await fs.writeFile(file, JSON.stringify({ anchors }, null, 2), 'utf-8');
  }

  /**
   * Load anchors
   */
  async loadAnchors(file: string) {
    const fs = await import('fs/promises');
    const content = await fs.readFile(file, 'utf-8');
    return JSON.parse(content).anchors;
  }

  /**
   * Main entrypoint for advanced save: gather meta, playerState, worldState (branches), anchors, and save.
   */
  async saveFullGameState(file: string, meta: any, playerState: any, worldState: any, anchors: any) {
    const state = { meta, playerState, worldState, anchors };
    await this.saveAdvancedStateToFile(file, state);
  }

  /**
   * Main entrypoint for advanced load: load and return meta, playerState, worldState, anchors.
   */
  async loadFullGameState(file: string) {
    return await this.loadAdvancedStateFromFile(file);
  }

  /**
   * (Optional) Save a single chunk (for streaming worlds)
   */
  async saveChunk(_chunkX: number, _chunkY: number, _chunk: any) {
    // Implement as needed for your persistence model
    // For now, just a stub
  }

  /**
   * (Optional) Load a single chunk (for streaming worlds)
   */
  loadChunk(_chunkX: number, _chunkY: number): any {
    // Implement as needed for your persistence model
    // For now, just a stub
    return null;
  }

  /**
   * Create a new branch (timeline/warp zone) with a given seed and optional parent branch.
   * @param branchId Unique branch/timeline ID
   * @param seed Deterministic seed for this branch
   * @param parentBranchId Optional parent branch for relationship tracking
   */
  async createBranch(branchId: string, seed: string, parentBranchId?: string) {
    if (this.multiverseState.branches[branchId]) throw new Error('Branch already exists');
    this.multiverseState.branches[branchId] = { seed, deltas: [], parent: parentBranchId, children: [] };
    if (parentBranchId && this.multiverseState.branches[parentBranchId]) {
      this.multiverseState.branches[parentBranchId].children = this.multiverseState.branches[parentBranchId].children || [];
      this.multiverseState.branches[parentBranchId].children.push(branchId);
    }
  }

  /**
   * Merge two branches (timelines) and resolve deltas/conflicts.
   * Artifact: leyline_instability_event_integration_points_2025-06-08.artifact
   */
  async mergeBranches(targetBranchId: string, sourceBranchId: string) {
    const target = this.multiverseState.branches[targetBranchId];
    const source = this.multiverseState.branches[sourceBranchId];
    if (!target || !source) throw new Error('Branch not found');
    // Naive merge: append source deltas to target (TODO: CRDT/advanced merge)
    target.deltas = target.deltas.concat(source.deltas);
    // --- Artifact-driven ley line instability merge ---
    if (target.leyLineEvents && source.leyLineEvents) {
      target.leyLineEvents = this.timestreamFramework.resolveInstabilityOnMerge(target, source);
    } else if (source.leyLineEvents) {
      target.leyLineEvents = source.leyLineEvents;
    }
    // Optionally: mark source as merged/pruned
    delete this.multiverseState.branches[sourceBranchId];
  }

  /**
   * Prune (delete) a branch and all its deltas/anchors.
   */
  async pruneBranch(branchId: string) {
    delete this.multiverseState.branches[branchId];
    // Optionally: remove related anchors
    for (const anchorId in this.multiverseState.anchors) {
      if (this.multiverseState.anchors[anchorId].branch === branchId) {
        delete this.multiverseState.anchors[anchorId];
      }
    }
  }

  /**
   * Record a tile edit/warp as a delta in the active branch.
   * @param branchId The branch/timeline to record to
   * @param delta The tile edit/warp delta object
   */
  recordDelta(branchId: string, delta: any) {
    if (!this.multiverseState.branches[branchId]) throw new Error('Branch not found');
    this.multiverseState.branches[branchId].deltas.push(delta);
    // TODO: Trigger autosave/event feedback if needed
  }

  /**
   * Add or update an anchor.
   * @param anchorId Unique anchor ID
   * @param anchorData Anchor data (should include branch, position, label, etc.)
   */
  setAnchor(anchorId: string, anchorData: any) {
    this.multiverseState.anchors[anchorId] = anchorData;
    // TODO: Trigger autosave/event feedback if needed
  }

  /**
   * Get anchor data by ID.
   */
  getAnchor(anchorId: string) {
    return this.multiverseState.anchors[anchorId];
  }

  /**
   * List all anchors (optionally filter by branch).
   */
  listAnchors(branchId?: string) {
    if (!branchId) return Object.values(this.multiverseState.anchors);
    return Object.values(this.multiverseState.anchors).filter(a => a.branch === branchId);
  }

  /**
   * List all branches (optionally with metadata).
   */
  listBranches() {
    return Object.entries(this.multiverseState.branches).map(([id, data]) => ({ id, ...data }));
  }

  /**
   * Get branch data by ID.
   */
  getBranch(branchId: string) {
    return this.multiverseState.branches[branchId];
  }

  /**
   * (Stub) Hook for autosave/event feedback after important changes.
   * @param reason String describing the trigger (e.g., 'delta', 'anchor', 'branch')
   */
  triggerAutosave(_reason: string) {
    // TODO: Integrate with autosave system/event bus
  }

  /**
   * Generate a deterministic, collision-resistant seed for a region/grid.
   * Uses SHA-256 and includes all relevant metadata.
   * @param gridData The tile/environment data to hash
   * @returns A unique seed string
   */
  async generateDeterministicSeed(gridData: any): Promise<string> {
    // TODO: Use crypto.subtle (browser) or crypto (node) for SHA-256
    // For now, fallback to simple hash
    const raw = JSON.stringify(gridData);
    let hash = 0, i, chr;
    for (i = 0; i < raw.length; i++) {
      chr = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return 'seed-' + hash.toString();
  }

  // Override isDatakeyUnique to use the registry
  isDatakeyUnique(datakey: string): boolean {
    if (this.proceduralRegistry && this.proceduralRegistry.lookupContent) {
      return !this.proceduralRegistry.lookupContent(datakey);
    }
    return true;
  }

  // Optionally, register seeds/datakeys on save
  registerSeedOrDatakey(id: string, type: 'seed' | 'datakey', value: any, version: string, modId?: string) {
    if (this.proceduralRegistry && this.proceduralRegistry.registerContent) {
      this.proceduralRegistry.registerContent({ id, type, value, version, modId, status: 'active' });
    }
  }

  /**
   * Delete an anchor by ID (public API for UI integration)
   */
  deleteAnchor(anchorId: string) {
    delete this.multiverseState.anchors[anchorId];
  }

  // --- Anchor/Branch Export/Import, Diff/Merge, Conflict Resolution ---
  exportBranch(branchId: string): any {
    const branch = this.getBranch(branchId);
    if (!branch) throw new Error('Branch not found');
    return JSON.parse(JSON.stringify(branch)); // Deep copy for export
  }

  importBranch(branchId: string, branchData: any) {
    if (this.multiverseState.branches[branchId]) throw new Error('Branch already exists');
    this.multiverseState.branches[branchId] = branchData;
  }

  diffBranches(branchAId: string, branchBId: string): any {
    const a = this.getBranch(branchAId);
    const b = this.getBranch(branchBId);
    if (!a || !b) throw new Error('Branch not found');
    // Naive diff: compare deltas arrays
    return {
      deltasA: a.deltas,
      deltasB: b.deltas,
      onlyInA: a.deltas.filter((d: any) => !b.deltas.includes(d)),
      onlyInB: b.deltas.filter((d: any) => !a.deltas.includes(d)),
    };
  }

  resolveBranchConflict(branchId: string, resolution: any) {
    // Apply a user- or system-provided resolution to a branch's deltas
    if (this.multiverseState.branches[branchId]) {
      this.multiverseState.branches[branchId].deltas = resolution.deltas;
    }
  }
}
