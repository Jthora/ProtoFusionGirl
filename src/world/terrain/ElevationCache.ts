// Simple quantized LRU cache for elevation lookups

export class ElevationCache {
  private cache = new Map<string, number>();
  private order: string[] = [];
  constructor(private maxEntries: number = 5000, private quant: number = 0.01) {}

  private key(lat: number, lon: number): string {
    const qLat = Math.round(lat / this.quant) * this.quant;
    const qLon = Math.round(lon / this.quant) * this.quant;
    return `${qLat.toFixed(2)},${qLon.toFixed(2)}`;
  }

  get(lat: number, lon: number): number | undefined {
    const k = this.key(lat, lon);
    if (!this.cache.has(k)) return undefined;
    // touch LRU
    this.order = this.order.filter(x => x !== k);
    this.order.push(k);
    return this.cache.get(k);
  }

  set(lat: number, lon: number, elevation: number): void {
    const k = this.key(lat, lon);
    if (!this.cache.has(k)) {
      this.order.push(k);
      if (this.order.length > this.maxEntries) {
        const old = this.order.shift();
        if (old) this.cache.delete(old);
      }
    } else {
      // refresh LRU position
      this.order = this.order.filter(x => x !== k);
      this.order.push(k);
    }
    this.cache.set(k, elevation);
  }

  clear(): void {
    this.cache.clear();
    this.order = [];
  }
}
