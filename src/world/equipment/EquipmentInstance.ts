// EquipmentInstance: Represents an equipped item
import type { EquipmentSlot } from './EquipmentSlot';

export interface EquipmentInstance {
  id: string;
  slot: EquipmentSlot;
  metadata?: Record<string, any>;
}
