// Mock elevation source that simulates Earth-like elevation bands
import { TerrainDataSource, GeoBounds } from '../types';

export class MockElevationSource implements TerrainDataSource {
  getElevation(lat: number, lon: number): Promise<number> {
    // Simulate oceans below 0, land above 0 with mountainous regions
    const x = lon * Math.PI / 180;
    const y = lat * Math.PI / 180;
    let elevation = 0;
    elevation += Math.sin(x * 0.8) * Math.cos(y * 0.6) * 1500; // continents
    elevation += Math.sin(x * 3.2) * Math.cos(y * 2.4) * 500;  // ranges
    elevation -= Math.cos(x * 0.2) * 300; // ocean basins
    return Promise.resolve(Math.round(elevation));
  }
  hasDataAt(_lat: number, _lon: number): boolean { return true; }
  getResolution(): number { return 1000; }
  getCoverage(): GeoBounds { return { minX: -180, maxX: 180, minY: -85, maxY: 85, centerX: 0, centerY: 0 }; }
}
