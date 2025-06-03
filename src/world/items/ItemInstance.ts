// ItemInstance: Represents a stack or instance of an item
export interface ItemInstance {
  id: string;
  quantity: number;
  metadata?: Record<string, any>;
}

// Utility for creating an item instance
export function createItemInstance(id: string, quantity: number = 1, metadata?: Record<string, any>): ItemInstance {
  return { id, quantity, metadata };
}
