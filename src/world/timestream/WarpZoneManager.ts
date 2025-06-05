// WarpZoneManager.ts
// Manages all warp zones, triggers, and effects on world/timestream
import { WarpZone } from './types';

export type WarpZoneHandler = (zone: WarpZone, context: any) => void;

export class WarpZoneManager {
  private zones: Map<string, WarpZone> = new Map();
  private zoneTypes: Map<string, WarpZoneHandler> = new Map();

  registerZoneType(type: string, handler: WarpZoneHandler): void {
    this.zoneTypes.set(type, handler);
  }

  addZone(zone: WarpZone): void {
    this.zones.set(zone.id, zone);
  }

  triggerZone(zoneId: string, context: any): void {
    const zone = this.zones.get(zoneId);
    if (!zone) return;
    const handler = this.zoneTypes.get(zone.triggerType);
    if (handler) handler(zone, context);
  }

  // Serialization/deserialization stubs
  serialize(): any {
    // Serialize all zones and zone types
    return {
      zones: Array.from(this.zones.values()),
      zoneTypes: Array.from(this.zoneTypes.keys())
    };
  }
  deserialize(data: any): void {
    // Deserialize zones from JSON
    if (data?.zones) {
      this.zones.clear();
      for (const zone of data.zones) {
        this.zones.set(zone.id, zone);
      }
    }
    // Note: zoneTypes (handlers) cannot be deserialized directly
  }
}
