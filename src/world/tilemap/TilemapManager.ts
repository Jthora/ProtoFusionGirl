// TilemapManager: High-level API for tilemap/world operations (load, save, edit, query, etc.)
// Centralizes all world/tilemap dependencies and exposes a unified API for world logic.
// Only import what is needed for the instance, and use type-only imports where possible for performance/type safety.
// See artifacts/tilemap_system_design.artifact for design, pseudocode, and open questions.
import { ChunkManager } from './ChunkManager';
import { WorldEditService } from './WorldEditService';
import { TileRegistry } from './TileRegistry';
import { WorldPersistence } from './WorldPersistence';
import { WorldGen } from './WorldGen';
import { CraftingPanel } from '../../ui/components/CraftingPanel';
import { CraftingRegistry } from '../crafting/CraftingRegistry';
import { CraftingService } from '../crafting/CraftingService';
import { ItemRegistry } from '../items/ItemRegistry';
import { Inventory } from '../inventory/Inventory';
import { InventoryService } from '../inventory/InventoryService';
import { InventoryPanel } from '../../ui/components/InventoryPanel';
import { EquipmentRegistry } from '../equipment/EquipmentRegistry';
import { Equipment } from '../equipment/Equipment';
import { EquipmentService } from '../equipment/EquipmentService';
import { PlayerStats } from '../player/PlayerStats';
import { EquipmentPanel } from '../../ui/components/EquipmentPanel';

export class TilemapManager {
  chunkManager: ChunkManager;
  editService: WorldEditService;
  tileRegistry: TileRegistry;
  persistence: WorldPersistence;
  worldGen: WorldGen;
  craftingRegistry: CraftingRegistry;
  craftingService: CraftingService;
  craftingPanel: CraftingPanel;
  playerInventory: Record<string, number> = {};
  itemRegistry: ItemRegistry;
  inventory: Inventory;
  inventoryService: InventoryService;
  inventoryPanel: InventoryPanel;
  equipmentRegistry: EquipmentRegistry;
  equipment: Equipment;
  equipmentService: EquipmentService;
  playerStats: PlayerStats;
  equipmentPanel: EquipmentPanel;

  constructor() {
    this.chunkManager = new ChunkManager(this);
    this.editService = new WorldEditService(this);
    this.tileRegistry = new TileRegistry();
    this.persistence = new WorldPersistence(this);
    this.worldGen = new WorldGen(this);
    this.craftingRegistry = new CraftingRegistry();
    this.craftingService = new CraftingService(
      this.craftingRegistry,
      () => this.playerInventory,
      (changes) => {
        for (const k in changes) {
          this.playerInventory[k] = (this.playerInventory[k] || 0) + changes[k];
          if (this.playerInventory[k] <= 0) delete this.playerInventory[k];
        }
      }
    );
    this.craftingPanel = new CraftingPanel(
      this.craftingRegistry,
      this.craftingService,
      (recipeId) => {
        if (this.craftingService.craft(recipeId)) {
          // Optionally: emit event, show feedback, etc.
        }
      }
    );
    this.itemRegistry = new ItemRegistry();
    this.inventory = new Inventory(20);
    this.inventoryService = new InventoryService(this.inventory, this.itemRegistry);
    this.inventoryPanel = new InventoryPanel(this.inventoryService);
    this.equipmentRegistry = new EquipmentRegistry();
    this.equipment = new Equipment();
    this.equipmentService = new EquipmentService(this.equipment, this.equipmentRegistry);
    this.playerStats = new PlayerStats({ health: 100, attack: 5, defense: 2, speed: 1 }, this.equipmentService);
    this.equipmentPanel = new EquipmentPanel(this.equipmentService, this.playerStats);
  }

  // Example: load world from file or seed
  async loadWorld(options: { file?: string; seed?: string }) {
    if (options.file) {
      return this.persistence.loadFromFile(options.file);
    } else if (options.seed) {
      return this.worldGen.generateFromSeed(options.seed);
    }
  }

  // Example: save world
  async saveWorld(path: string) {
    return this.persistence.saveToFile(path);
  }

  /**
   * Register tiles from a mod (calls TileRegistry.registerTilesFromMod)
   */
  registerModTiles(mod: { id: string, tiles: any[] }) {
    this.tileRegistry.registerTilesFromMod(mod);
  }

  /**
   * Set/get mod metadata (calls WorldPersistence)
   */
  setModMetadata(modId: string, data: any) {
    this.persistence.setModMetadata(modId, data);
  }
  getModMetadata(modId: string): any {
    return this.persistence.getModMetadata(modId);
  }

  /**
   * Serializes a grid of tiles around a center point into a deterministic seed string.
   * @param center The center of the grid (world coordinates)
   * @param size The size of the grid (width, height)
   * @param options Optional: { shape: 'rectangle' | 'circle' | 'custom', includeEnvironment: boolean }
   * @returns A deterministic string or hash representing the grid state
   */
  serializeGridToSeed(center: { x: number, y: number }, size: { width: number, height: number }, options?: { shape?: string, includeEnvironment?: boolean }): string {
    // Collect tile data in the grid
    const tiles: any[] = [];
    const halfW = Math.floor(size.width / 2);
    const halfH = Math.floor(size.height / 2);
    for (let dx = -halfW; dx <= halfW; dx++) {
      for (let dy = -halfH; dy <= halfH; dy++) {
        // Optionally support shapes (rectangle/circle/custom)
        if (options?.shape === 'circle') {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > Math.max(halfW, halfH)) continue;
        }
        const x = TilemapManager.wrapX(center.x + dx);
        const y = center.y + dy;
        // Get tile type and metadata (replace with actual tile access logic)
        const tile = this.getTileAt(x, y);
        tiles.push({ x, y, type: tile?.type, meta: tile?.meta });
      }
    }
    // Optionally include environment data (entities, weather, etc.)
    let environmentData = undefined;
    if (options?.includeEnvironment) {
      environmentData = this.collectEnvironmentData(center, size);
    }
    // Deterministically stringify and hash the data
    const raw = JSON.stringify({ tiles, environmentData });
    // Use a simple hash for now (replace with SHA-256 or better in production)
    let hash = 0, i, chr;
    for (i = 0; i < raw.length; i++) {
      chr = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash.toString();
  }

  // Placeholder: get tile at world coordinates (replace with actual logic)
  getTileAt(_x: number, _y: number): any {
    // ...fetch tile from chunkManager or world data...
    return { type: 'empty', meta: {} };
  }

  // Placeholder: collect environment data (entities, weather, etc.)
  collectEnvironmentData(_center: { x: number, y: number }, _size: { width: number, height: number }): any {
    // ...fetch entities, weather, etc. in the area...
    return {};
  }

  // --- World Looping Constants ---
  static readonly EARTH_CIRCUMFERENCE_METERS = 40075017; // Equatorial circumference in meters/tiles
  static readonly WORLD_WIDTH = TilemapManager.EARTH_CIRCUMFERENCE_METERS; // 1m per tile
  static readonly WORLD_HEIGHT = 965400; // ~600 miles (up+down) in meters/tiles (300 miles above ground, 300 miles below)

  /**
   * Returns the wrapped X coordinate for horizontal world looping.
   * @param x The world X coordinate (in meters/tiles)
   */
  static wrapX(x: number): number {
    const w = TilemapManager.WORLD_WIDTH;
    return ((x % w) + w) % w;
  }

  /**
   * Returns true if two X coordinates are adjacent, accounting for world wrap.
   */
  static areAdjacentX(x1: number, x2: number): boolean {
    const w = TilemapManager.WORLD_WIDTH;
    return Math.abs(TilemapManager.wrapX(x1) - TilemapManager.wrapX(x2)) === 1 ||
      (TilemapManager.wrapX(x1) === 0 && TilemapManager.wrapX(x2) === w - 1) ||
      (TilemapManager.wrapX(x1) === w - 1 && TilemapManager.wrapX(x2) === 0);
  }

  // --- Toroidal Distance Utility ---
  /**
   * Returns the minimum toroidal (wrapped) distance between two X coordinates.
   * Useful for AI, minimaps, chunk management, and edge-aware logic.
   */
  static toroidalDistanceX(x1: number, x2: number): number {
    const w = TilemapManager.WORLD_WIDTH;
    const dx = Math.abs(TilemapManager.wrapX(x1) - TilemapManager.wrapX(x2));
    return Math.min(dx, w - dx);
  }

  /**
   * Returns the minimum toroidal (wrapped) distance between two chunk X coordinates.
   * @param chunkX1 First chunk X
   * @param chunkX2 Second chunk X
   * @param chunkSize Size of a chunk in tiles
   */
  static toroidalChunkDistanceX(chunkX1: number, chunkX2: number, chunkSize: number): number {
    const worldWidthChunks = Math.ceil(TilemapManager.WORLD_WIDTH / chunkSize);
    const dx = Math.abs(((chunkX1 % worldWidthChunks) + worldWidthChunks) % worldWidthChunks - ((chunkX2 % worldWidthChunks) + worldWidthChunks) % worldWidthChunks);
    return Math.min(dx, worldWidthChunks - dx);
  }

  // --- Chunk Coordinate Wrapping Utility ---
  /**
   * Wraps a chunk X coordinate for horizontal world looping.
   * @param chunkX The chunk X coordinate
   * @param chunkSize The size of a chunk in tiles
   */
  static wrapChunkX(chunkX: number, chunkSize: number): number {
    const worldWidthChunks = Math.ceil(TilemapManager.WORLD_WIDTH / chunkSize);
    return ((chunkX % worldWidthChunks) + worldWidthChunks) % worldWidthChunks;
  }

  // --- BigInt Support for Extreme Scale (Optional, for future-proofing) ---
  /**
   * Returns the wrapped X coordinate for horizontal world looping using BigInt.
   * @param x The world X coordinate (in meters/tiles, as bigint)
   */
  static wrapXBigInt(x: bigint): bigint {
    const w = BigInt(TilemapManager.WORLD_WIDTH);
    return ((x % w) + w) % w;
  }

  /**
   * Returns the minimum toroidal (wrapped) distance between two X coordinates using BigInt.
   */
  static toroidalDistanceXBigInt(x1: bigint, x2: bigint): bigint {
    const w = BigInt(TilemapManager.WORLD_WIDTH);
    const dx = (TilemapManager.wrapXBigInt(x1) - TilemapManager.wrapXBigInt(x2));
    const absDx = dx < 0n ? -dx : dx;
    return absDx < (w - absDx) ? absDx : (w - absDx);
  }

  /**
   * Vectorized/batch version: Wraps an array of X coordinates for horizontal world looping.
   * @param xs Array of X coordinates (number[])
   * @returns Array of wrapped X coordinates
   */
  static wrapXBatch(xs: number[]): number[] {
    const w = TilemapManager.WORLD_WIDTH;
    return xs.map(x => ((x % w) + w) % w);
  }

  /**
   * Vectorized/batch version: Computes minimum toroidal distances for arrays of X coordinates.
   * @param x1s Array of first X coordinates
   * @param x2s Array of second X coordinates
   * @returns Array of minimum toroidal distances
   */
  static toroidalDistanceXBatch(x1s: number[], x2s: number[]): number[] {
    const w = TilemapManager.WORLD_WIDTH;
    return x1s.map((x1, i) => {
      const x2 = x2s[i];
      const dx = Math.abs(TilemapManager.wrapX(x1) - TilemapManager.wrapX(x2));
      return Math.min(dx, w - dx);
    });
  }

  /**
   * 2D toroidal distance utility (for future vertical wrapping).
   * Returns the minimum toroidal distance between two points (x1, y1) and (x2, y2).
   * @param x1 X1 coordinate
   * @param y1 Y1 coordinate
   * @param x2 X2 coordinate
   * @param y2 Y2 coordinate
   * @param wrapY If true, wrap Y as well (default: false)
   */
  static toroidalDistance2D(x1: number, y1: number, x2: number, y2: number, wrapY = false): number {
    const dx = TilemapManager.toroidalDistanceX(x1, x2);
    let dy = Math.abs(y1 - y2);
    if (wrapY) {
      const h = TilemapManager.WORLD_HEIGHT;
      dy = Math.min(dy, h - dy);
    }
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Floating-point safe wrapX (for future floating-point world coordinates).
   * Uses Math.fround for precision safety.
   */
  static wrapXFloat(x: number): number {
    const w = TilemapManager.WORLD_WIDTH;
    return Math.fround(((x % w) + w) % w);
  }

  /**
   * Floating-point safe toroidal distance (for future floating-point world coordinates).
   */
  static toroidalDistanceXFloat(x1: number, x2: number): number {
    const w = TilemapManager.WORLD_WIDTH;
    const dx = Math.abs(TilemapManager.wrapXFloat(x1) - TilemapManager.wrapXFloat(x2));
    return Math.fround(Math.min(dx, w - dx));
  }

  /**
   * Custom distance metric for toroidal X (e.g., for AI/pathfinding heuristics).
   * @param x1 First X coordinate
   * @param x2 Second X coordinate
   * @param metricFn Function to apply to the minimum toroidal distance (default: identity)
   */
  static toroidalDistanceXCustom(x1: number, x2: number, metricFn: (d: number) => number = d => d): number {
    const d = TilemapManager.toroidalDistanceX(x1, x2);
    return metricFn(d);
  }

  // --- Usage Example (for contributors) ---
  /**
   * Example usage:
   *   // Wrap X coordinate
   *   const wrappedX = TilemapManager.wrapX(x);
   *   // Batch wrap
   *   const wrappedXs = TilemapManager.wrapXBatch([x1, x2, x3]);
   *   // 2D toroidal distance
   *   const dist2D = TilemapManager.toroidalDistance2D(x1, y1, x2, y2, true);
   *   // Custom metric (e.g., squared distance)
   *   const sqDist = TilemapManager.toroidalDistanceXCustom(x1, x2, d => d * d);
   */

  // --- Chunk Event Hooks and Modding Support ---
  private chunkReplacementHooks: Array<(chunkX: number, chunkY: number, newChunk: any, oldChunk: any) => void> = [];

  /**
   * Register a mod hook for chunk replacement events.
   */
  registerChunkReplacementHook(hook: (chunkX: number, chunkY: number, newChunk: any, oldChunk: any) => void) {
    this.chunkReplacementHooks.push(hook);
  }

  /**
   * Called after a chunk is replaced. Handles downstream updates (tilemap, minimap, physics, UI, mod hooks).
   * @param chunkX The wrapped chunk X coordinate
   * @param chunkY The chunk Y coordinate
   * @param newChunk The new chunk data
   * @param oldChunk The old chunk data (if any)
   */
  onChunkReplaced(chunkX: number, chunkY: number, newChunk: any, oldChunk: any) {
    // Call mod hooks
    for (const hook of this.chunkReplacementHooks) {
      hook(chunkX, chunkY, newChunk, oldChunk);
    }
    // TODO: Refresh tilemap, minimap, physics, and notify other systems as needed
    // Example: this.refreshAfterChunkReplacement(chunkX, chunkY);
  }

  /**
   * Refreshes tilemap, entities, and minimap for the affected chunk after replacement.
   * @param chunkX The wrapped chunk X coordinate
   * @param chunkY The chunk Y coordinate
   */
  refreshAfterChunkReplacement(chunkX: number, chunkY: number) {
    // Update minimap if present
    if ((this as any).scene && (this as any).scene.minimap) {
      (this as any).scene.minimap.updateMinimap();
    }
    // TODO: Add logic to refresh tilemap layers for the affected chunk
    // TODO: Refresh or respawn entities if needed
    // TODO: Update physics bodies if tile collision changes
    // This method can be expanded as the engine evolves
  }

  /**
   * Save the full advanced game state (meta, playerState, worldState, anchors) using WorldPersistence.
   */
  async saveFullGameState(path: string, meta: any, playerState: any, worldState: any, anchors: any) {
    return this.persistence.saveFullGameState(path, meta, playerState, worldState, anchors);
  }

  /**
   * Load the full advanced game state (meta, playerState, worldState, anchors) using WorldPersistence.
   */
  async loadFullGameState(path: string) {
    return this.persistence.loadFullGameState(path);
  }

  /**
   * Save a branch (timeline/warp zone) with its seed and deltas.
   */
  async saveBranch(branchId: string, branchData: { seed: string, deltas: any[] }, file: string) {
    return this.persistence.saveBranch(branchId, branchData, file);
  }

  /**
   * Load a branch (timeline/warp zone) with its seed and deltas.
   */
  async loadBranch(file: string) {
    return this.persistence.loadBranch(file);
  }

  /**
   * Save anchors (for anchor/warp integration)
   */
  async saveAnchors(anchors: Record<string, any>, file: string) {
    return this.persistence.saveAnchors(anchors, file);
  }

  /**
   * Load anchors
   */
  async loadAnchors(file: string) {
    return this.persistence.loadAnchors(file);
  }

  // --- Delta/Branch Logic Prototype ---
  private branchDeltas: Record<string, Array<{x: number, y: number, prevTile: string, newTile: string, timestamp: number}>> = {};
  private currentBranch: string = 'main';

  /**
   * Record a tile edit as a delta for the current branch.
   */
  recordTileDelta(x: number, y: number, prevTile: string, newTile: string) {
    const branchId = this.getCurrentBranch();
    // Use WorldPersistence to record delta in the correct branch
    if (this.persistence && this.persistence.recordDelta) {
      this.persistence.recordDelta(branchId, { x, y, prevTile, newTile, timestamp: Date.now() });
    } else {
      // Fallback: legacy in-memory branchDeltas
      if (!this.branchDeltas[branchId]) this.branchDeltas[branchId] = [];
      this.branchDeltas[branchId].push({ x, y, prevTile, newTile, timestamp: Date.now() });
    }
  }

  // --- Branch/anchor listing integration with WorldPersistence ---
  getAllBranches() {
    if (this.persistence && this.persistence.listBranches) {
      // Map to BranchInfo format for TimelinePanel
      return this.persistence.listBranches().map((b: any, idx: number) => ({
        id: b.id,
        parentId: b.parent || (b.id === 'main' ? undefined : 'main'),
        label: b.id === 'main' ? 'Main Timeline' : `Branch ${b.id}`,
        created: Date.now() - idx * 10000 // TODO: Use real creation time if available
      }));
    }
    return [{ id: 'main', label: 'Main Timeline', created: Date.now() }];
  }

  deleteBranch(branchId: string) {
    if (this.persistence && this.persistence.pruneBranch) {
      this.persistence.pruneBranch(branchId);
    }
  }

  mergeBranch(childId: string, parentId: string) {
    if (this.persistence && this.persistence.mergeBranches) {
      this.persistence.mergeBranches(parentId, childId);
    }
  }

  // --- Anchor listing integration with WorldPersistence ---
  getAllAnchors(branchId?: string) {
    if (this.persistence && this.persistence.listAnchors) {
      return this.persistence.listAnchors(branchId);
    }
    return [];
  }

  // --- Stubs for branch/delta/anchor UI integration ---
  getCurrentBranch(): string {
    // TODO: Track current branch in TilemapManager; for now, return 'main' or a default
    return 'main';
  }

  getBranchDeltas(branchId: string): any[] {
    if (this.persistence && this.persistence.getBranch) {
      const branch = this.persistence.getBranch(branchId);
      return branch?.deltas || [];
    }
    return [];
  }

  async applyDeltasToWorld(deltas: any[]) {
    // TODO: Implement delta application logic (replay tile edits, warps, etc.)
    // For now, this is a stub
    // Example: for (const delta of deltas) { ...apply delta... }
  }

  switchBranch(branchId: string) {
    // TODO: Implement branch switching logic (update current branch, reload world state, etc.)
    // For now, this is a stub
  }
}
