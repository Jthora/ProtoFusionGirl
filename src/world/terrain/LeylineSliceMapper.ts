// Maps world X to a great-circle-like slice based on a configured leyline path
import { GeoCoord } from './types';
import { TilemapManager } from '../tilemap/TilemapManager';

export interface LeylineSliceConfig {
  // Example: define a great-circle by two anchor geocoords
  start: GeoCoord;
  end: GeoCoord;
}

export class LeylineSliceMapper {
  private config: LeylineSliceConfig;
  private circumference = TilemapManager.WORLD_WIDTH; // meters-as-tiles

  constructor(config: LeylineSliceConfig) {
    this.config = config;
  }

  // Map a world X (0..WORLD_WIDTH) to a geo coordinate along the slice (interpolated)
  xToGeo(x: number): GeoCoord {
    const t = (TilemapManager.wrapX(x)) / this.circumference; // 0..1 around the loop
    // Simple spherical linear interpolation placeholder
    const lat = this.lerp(this.config.start.latitude, this.config.end.latitude, t);
    // Wrap longitude across dateline
    let lonDelta = this.config.end.longitude - this.config.start.longitude;
    if (lonDelta > 180) lonDelta -= 360;
    if (lonDelta < -180) lonDelta += 360;
    const lon = this.wrapLon(this.config.start.longitude + lonDelta * t);
    return { latitude: lat, longitude: lon };
  }

  private lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
  private wrapLon(lon: number): number { let L = lon; while (L > 180) L -= 360; while (L < -180) L += 360; return L; }
}
