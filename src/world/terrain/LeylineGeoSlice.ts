// Utility to convert world X along a circular wrap into lat/lon along a defined leyline slice
export interface GeoCoord { latitude: number; longitude: number }

export interface LeylineGeoSliceConfig {
  start: GeoCoord;
  end: GeoCoord;
}

export class LeylineGeoSlice {
  constructor(private config: LeylineGeoSliceConfig, private worldWidth: number) {}

  xToLatLon(x: number): GeoCoord {
    const t = ((x % this.worldWidth) + this.worldWidth) % this.worldWidth / this.worldWidth;
    const lat = this.lerp(this.config.start.latitude, this.config.end.latitude, t);
    let lonDelta = this.config.end.longitude - this.config.start.longitude;
    if (lonDelta > 180) lonDelta -= 360;
    if (lonDelta < -180) lonDelta += 360;
    const lon = this.wrapLon(this.config.start.longitude + lonDelta * t);
    return { latitude: lat, longitude: lon };
  }

  private lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
  private wrapLon(lon: number) { let L = lon; while (L > 180) L -= 360; while (L < -180) L += 360; return L; }
}
