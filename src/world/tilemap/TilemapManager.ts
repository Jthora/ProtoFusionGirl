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
}
