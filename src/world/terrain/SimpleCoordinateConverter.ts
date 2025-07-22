// SimpleCoordinateConverter.ts
// Basic implementation of coordinate conversion for the terrain system
// Converts between lat/lon and tile coordinates using simple equirectangular projection

import { CoordinateConverter } from './types';
import { TilemapManager } from '../tilemap/TilemapManager';

export class SimpleCoordinateConverter implements CoordinateConverter {
  private readonly WORLD_WIDTH: number;
  private readonly WORLD_HEIGHT: number;
  
  constructor() {
    this.WORLD_WIDTH = TilemapManager.WORLD_WIDTH;
    this.WORLD_HEIGHT = 20037508; // Half Earth circumference in meters (Mercator projection)
  }

  latLonToTile(lat: number, lon: number): { x: number; y: number } {
    // Clamp latitude to valid range
    const clampedLat = Math.max(-85, Math.min(85, lat));
    
    // Convert longitude to x coordinate (simple linear mapping)
    // Longitude range -180 to 180 maps to 0 to WORLD_WIDTH
    const x = ((lon + 180) / 360) * this.WORLD_WIDTH;
    
    // Convert latitude to y coordinate using Mercator projection
    // This provides better area preservation than simple linear mapping
    const latRad = (clampedLat * Math.PI) / 180;
    const mercatorY = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
    const y = (this.WORLD_HEIGHT / 2) - (mercatorY * this.WORLD_HEIGHT / (2 * Math.PI));
    
    return { x: Math.round(x), y: Math.round(y) };
  }

  tileToLatLon(x: number, y: number): { lat: number; lon: number } {
    // Convert x coordinate to longitude
    const lon = (x / this.WORLD_WIDTH) * 360 - 180;
    
    // Convert y coordinate to latitude using inverse Mercator projection
    const mercatorY = (this.WORLD_HEIGHT / 2 - y) * (2 * Math.PI) / this.WORLD_HEIGHT;
    const latRad = 2 * (Math.atan(Math.exp(mercatorY)) - Math.PI / 4);
    const lat = (latRad * 180) / Math.PI;
    
    return { lat, lon };
  }

  wrapCoordinates(x: number, y: number): { x: number; y: number } {
    // Use TilemapManager's existing wrapping for x coordinate
    const wrappedX = TilemapManager.wrapX(x);
    
    // Y coordinate doesn't wrap (world has defined north/south bounds)
    const clampedY = Math.max(0, Math.min(this.WORLD_HEIGHT, y));
    
    return { x: wrappedX, y: clampedY };
  }

  // Helper method to convert meters to degrees (approximate)
  metersToDegreesLat(meters: number): number {
    return meters / 111320; // Approximate meters per degree of latitude
  }

  metersToDegreesLon(meters: number, lat: number): number {
    const latRad = (lat * Math.PI) / 180;
    return meters / (111320 * Math.cos(latRad)); // Adjust for latitude
  }

  // Helper method to convert degrees to meters (approximate)
  degreesToMetersLat(degrees: number): number {
    return degrees * 111320;
  }

  degreesToMetersLon(degrees: number, lat: number): number {
    const latRad = (lat * Math.PI) / 180;
    return degrees * 111320 * Math.cos(latRad);
  }

  // Calculate distance between two lat/lon points in meters
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
