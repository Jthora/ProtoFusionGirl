// SimpleTerrainCache.ts
// Basic LRU (Least Recently Used) cache implementation for terrain data
// Manages memory usage and provides fast access to frequently requested terrain

import { TerrainCache, TerrainData } from './types';

interface CacheEntry {
  data: TerrainData;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
}

export class SimpleTerrainCache implements TerrainCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0
  };

  constructor(maxSize: number = 1000, ttl: number = 30 * 60 * 1000) { // 30 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): TerrainData | undefined {
    this.stats.totalRequests++;
    
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }
    
    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }
    
    // Update access statistics
    entry.lastAccessed = now;
    entry.accessCount++;
    this.stats.hits++;
    
    return entry.data;
  }

  set(key: string, data: TerrainData): void {
    const now = Date.now();
    
    // If adding a new key would exceed capacity, evict entries until we have space
    while (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    
    const entry: CacheEntry = {
      data,
      timestamp: now,
      lastAccessed: now,
      accessCount: 1
    };
    
    this.cache.set(key, entry);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    
    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
  }

  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    const hitRate = this.stats.totalRequests > 0 
      ? this.stats.hits / this.stats.totalRequests 
      : 0;
    
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100 // Round to 2 decimal places
    };
  }

  // Additional utility methods
  
  getDetailedStats(): {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    evictions: number;
    totalRequests: number;
    hitRate: number;
    averageAccessCount: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const baseStats = this.getStats();
    
    let totalAccessCount = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;
    
    for (const entry of this.cache.values()) {
      totalAccessCount += entry.accessCount;
      oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
      newestTimestamp = Math.max(newestTimestamp, entry.timestamp);
    }
    
    const averageAccessCount = this.cache.size > 0 
      ? totalAccessCount / this.cache.size 
      : 0;
    
    return {
      ...baseStats,
      maxSize: this.maxSize,
      evictions: this.stats.evictions,
      totalRequests: this.stats.totalRequests,
      averageAccessCount: Math.round(averageAccessCount * 100) / 100,
      oldestEntry: oldestTimestamp,
      newestEntry: newestTimestamp
    };
  }

  evictExpired(): number {
    const now = Date.now();
    let evictedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        evictedCount++;
      }
    }
    
    this.stats.evictions += evictedCount;
    return evictedCount;
  }

  // Get cache entries sorted by access pattern (for debugging/monitoring)
  getMostAccessed(limit: number = 10): Array<{
    key: string;
    accessCount: number;
    lastAccessed: number;
    age: number;
  }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        age: Date.now() - entry.timestamp
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
    
    return entries;
  }

  getLeastAccessed(limit: number = 10): Array<{
    key: string;
    accessCount: number;
    lastAccessed: number;
    age: number;
  }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        age: Date.now() - entry.timestamp
      }))
      .sort((a, b) => a.accessCount - b.accessCount)
      .slice(0, limit);
    
    return entries;
  }

  // Preload terrain data for a region (useful for predictive caching)
  async preloadRegion(
    centerLat: number,
    centerLon: number,
    radius: number,
    resolution: number,
    terrainProvider: (lat: number, lon: number) => Promise<TerrainData>
  ): Promise<number> {
    let loadedCount = 0;
    const step = resolution / 111320; // Convert meters to approximate degrees
    
    for (let lat = centerLat - radius * step; lat <= centerLat + radius * step; lat += step) {
      for (let lon = centerLon - radius * step; lon <= centerLon + radius * step; lon += step) {
        const key = `${lat.toFixed(4)},${lon.toFixed(4)},${resolution}`;
        
        if (!this.has(key)) {
          try {
            const terrainData = await terrainProvider(lat, lon);
            this.set(key, terrainData);
            loadedCount++;
          } catch (error) {
            console.warn(`Failed to preload terrain at ${lat}, ${lon}:`, error);
          }
        }
      }
    }
    
    return loadedCount;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }
}
