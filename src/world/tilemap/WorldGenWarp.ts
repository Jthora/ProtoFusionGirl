import { TilemapManager } from './TilemapManager';
import { WarpZone, deserializeWarpZone, restoreWarpZone } from './WarpZoneUtils';
import { getWarpZoneDatakey } from './WarpZoneHash';

/**
 * Restores a warp zone from a datakey/seed (datablob) into the world at the given origin.
 * If the datakey is not found in storage, does nothing.
 * @param tilemapManager TilemapManager instance
 * @param datakey The warp zone datakey/seed (hex string)
 * @param storage Map of datakey -> datablob (could be local, remote, or player inventory)
 * @param originX X coordinate to restore at (optional, defaults to warp zone's origin)
 * @param originY Y coordinate to restore at (optional, defaults to warp zone's origin)
 */
export async function restoreWarpZoneFromDatakey(
  tilemapManager: TilemapManager,
  datakey: string,
  storage: Record<string, string>,
  originX?: number,
  originY?: number
) {
  const datablob = storage[datakey];
  if (!datablob) return;
  const zone: WarpZone = deserializeWarpZone(datablob);
  // Optionally override origin
  if (typeof originX === 'number') zone.originX = originX;
  if (typeof originY === 'number') zone.originY = originY;
  restoreWarpZone(tilemapManager, zone);
}

/**
 * Example: Save a warp zone to storage and get its datakey.
 */
export async function saveWarpZoneToStorage(
  zone: WarpZone,
  storage: Record<string, string>
): Promise<string> {
  const datakey = await getWarpZoneDatakey(zone);
  storage[datakey] = JSON.stringify(zone);
  return datakey;
}
