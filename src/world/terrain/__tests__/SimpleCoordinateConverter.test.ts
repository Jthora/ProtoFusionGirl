// SimpleCoordinateConverter.test.ts
// Unit tests for coordinate conversion

import { SimpleCoordinateConverter } from '../SimpleCoordinateConverter';

describe('SimpleCoordinateConverter', () => {
  let converter: SimpleCoordinateConverter;

  beforeEach(() => {
    converter = new SimpleCoordinateConverter();
  });

  it('should wrap coordinates correctly', () => {
    const coords1 = converter.wrapCoordinates(0, 1000);
    const coords2 = converter.wrapCoordinates(40075017, 1000); // Exact Earth circumference
    
    console.log('coords1:', coords1);
    console.log('coords2:', coords2);
    
    // Should wrap to the same x coordinate
    expect(coords1.x).toBe(coords2.x);
  });

  it('should convert lat/lon to tiles', () => {
    const tile = converter.latLonToTile(40.7128, -74.0060); // NYC
    expect(tile.x).toBeGreaterThan(0);
    expect(tile.y).toBeGreaterThan(0);
  });
});
