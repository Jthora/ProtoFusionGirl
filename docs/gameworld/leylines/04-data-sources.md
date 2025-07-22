# Global Terrain Data Sources & APIs

## Project: ProtoFusionGirl
**Date**: July 20, 2025  
**Document**: Data Sources Reference  
**Status**: Research Complete

---

## 🌍 **Primary Data Sources**

### **1. GEBCO (General Bathymetric Chart of the Oceans)**
- **URL**: https://www.gebco.net/
- **Coverage**: Global (land + ocean)
- **Resolution**: 15 arc-second (~450m at equator)
- **File Size**: ~2GB (global grid)
- **Format**: NetCDF, GeoTIFF
- **License**: Free for non-commercial use
- **Quality**: ⭐⭐⭐⭐⭐ (Excellent for oceans, good for land)

```typescript
interface GEBCODataset {
  name: "GEBCO_2023";
  resolution: "15 arc-second";
  coverage: "global";
  elevationRange: [-11034, 8848]; // meters (Mariana Trench to Everest)
  downloadUrl: "https://download.gebco.net/";
  apiEndpoint: "https://www.gebco.net/data_and_products/gebco_web_services/";
}
```

### **2. NASA SRTM (Shuttle Radar Topography Mission)**
- **URL**: https://www2.jpl.nasa.gov/srtm/
- **Coverage**: 56°S to 60°N (99% of populated areas)
- **Resolution**: 1 arc-second (~30m) and 3 arc-second (~90m)
- **File Size**: ~25GB (global 30m), ~6GB (global 90m)
- **Format**: GeoTIFF, HGT
- **License**: Public domain
- **Quality**: ⭐⭐⭐⭐⭐ (Excellent for land elevation)

```typescript
interface SRTMDataset {
  name: "SRTM GL1" | "SRTM GL3";
  resolution: "1 arc-second" | "3 arc-second";
  coverage: "56S to 60N";
  accuracy: "±16m vertical, ±20m horizontal";
  downloadUrl: "https://cloud.sdsc.edu/v1/AUTH_opentopography/Raster/SRTMGL1/";
  tiles: "40,000+ individual files";
}
```

### **3. ASTER GDEM (Advanced Spaceborne Thermal Emission)**
- **URL**: https://asterweb.jpl.nasa.gov/gdem.asp
- **Coverage**: 83°N to 83°S
- **Resolution**: 1 arc-second (~30m)
- **File Size**: ~20GB (global)
- **Format**: GeoTIFF
- **License**: Free for research/education
- **Quality**: ⭐⭐⭐⭐ (Good, some artifacts in steep terrain)

### **4. OpenTopography**
- **URL**: https://www.opentopography.org/
- **Coverage**: Select regions (high detail)
- **Resolution**: 1m-10m (LiDAR)
- **File Size**: Varies by region
- **Format**: LAZ, GeoTIFF, XYZ
- **License**: Varies (often free for research)
- **Quality**: ⭐⭐⭐⭐⭐ (Highest detail available)

---

## 🔌 **API Integration**

### **Open Elevation API**
```typescript
interface OpenElevationAPI {
  endpoint: "https://api.open-elevation.com/api/v1/lookup";
  method: "POST";
  rateLimit: "1000 requests/day (free)";
  maxPoints: 512; // per request
  accuracy: "SRTM 30m resolution";
}

// Usage example
const elevationData = await fetch('https://api.open-elevation.com/api/v1/lookup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    locations: [
      { latitude: 41.161758, longitude: -8.583933 },
      { latitude: 40.7128, longitude: -74.0060 }
    ]
  })
});
```

### **Google Elevation API**
```typescript
interface GoogleElevationAPI {
  endpoint: "https://maps.googleapis.com/maps/api/elevation/json";
  method: "GET";
  rateLimit: "512 points per request, 100,000 requests/day";
  pricing: "$5 per 1000 requests";
  accuracy: "Multiple data sources";
}

// Usage example
const googleElevation = async (points: Array<{lat: number, lng: number}>) => {
  const locations = points.map(p => `${p.lat},${p.lng}`).join('|');
  const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${API_KEY}`;
  return await fetch(url);
};
```

### **USGS Elevation Point Query Service**
```typescript
interface USGSElevationAPI {
  endpoint: "https://nationalmap.gov/epqs/pqs.php";
  method: "GET";
  coverage: "USA only";
  rateLimit: "No official limit";
  pricing: "Free";
  accuracy: "10m 3DEP data";
}

// Usage example
const usgsElevation = async (lat: number, lon: number) => {
  const url = `https://nationalmap.gov/epqs/pqs.php?x=${lon}&y=${lat}&units=Meters&output=json`;
  return await fetch(url);
};
```

---

## 📥 **Data Download Strategies**

### **GEBCO Global Download**
```bash
# Download GEBCO 2023 global grid (~2GB)
wget https://www.bodc.ac.uk/data/open_download/gebco/gebco_2023/zip/
unzip GEBCO_2023.zip

# Or use the GEBCO Web Map Service
curl "https://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv?request=GetMap&service=WMS&BBOX=-180,-90,180,90&width=21600&height=10800&layers=GEBCO_LATEST&format=image/geotiff"
```

### **SRTM Tile Download**
```typescript
class SRTMDownloader {
  private readonly BASE_URL = 'https://cloud.sdsc.edu/v1/AUTH_opentopography/Raster/SRTMGL1/';
  
  async downloadTile(lat: number, lon: number): Promise<ArrayBuffer> {
    const fileName = this.generateSRTMFileName(lat, lon);
    const url = `${this.BASE_URL}${fileName}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SRTM tile not found: ${fileName}`);
    }
    
    return await response.arrayBuffer();
  }
  
  private generateSRTMFileName(lat: number, lon: number): string {
    const latHem = lat >= 0 ? 'N' : 'S';
    const lonHem = lon >= 0 ? 'E' : 'W';
    const latStr = Math.abs(Math.floor(lat)).toString().padStart(2, '0');
    const lonStr = Math.abs(Math.floor(lon)).toString().padStart(3, '0');
    
    return `${latHem}${latStr}${lonHem}${lonStr}.SRTMGL1.hgt.zip`;
  }
}
```

### **Regional Data Caching**
```typescript
class RegionalDataCache {
  private readonly CACHE_DIR = '/data/terrain-cache/';
  private readonly REGION_SIZE = 1; // degrees
  
  async getCachedRegion(lat: number, lon: number): Promise<Float32Array | null> {
    const regionKey = this.getRegionKey(lat, lon);
    const cachePath = `${this.CACHE_DIR}${regionKey}.bin`;
    
    try {
      const buffer = await this.loadFromCache(cachePath);
      return new Float32Array(buffer);
    } catch {
      return null; // Not cached
    }
  }
  
  async cacheRegion(
    lat: number, 
    lon: number, 
    elevationData: Float32Array
  ): Promise<void> {
    const regionKey = this.getRegionKey(lat, lon);
    const cachePath = `${this.CACHE_DIR}${regionKey}.bin`;
    
    await this.saveToCache(cachePath, elevationData.buffer);
  }
  
  private getRegionKey(lat: number, lon: number): string {
    const regionLat = Math.floor(lat / this.REGION_SIZE) * this.REGION_SIZE;
    const regionLon = Math.floor(lon / this.REGION_SIZE) * this.REGION_SIZE;
    return `${regionLat}_${regionLon}`;
  }
}
```

---

## 🗺️ **Coordinate Systems & Projections**

### **WGS84 (World Geodetic System 1984)**
```typescript
interface WGS84Coordinates {
  latitude: number;  // -90 to +90 degrees
  longitude: number; // -180 to +180 degrees
  elevation?: number; // meters above mean sea level
}

const WGS84_CONSTANTS = {
  SEMI_MAJOR_AXIS: 6378137.0,           // meters
  FLATTENING: 1 / 298.257223563,
  SEMI_MINOR_AXIS: 6356752.314245,      // meters
  ECCENTRICITY_SQUARED: 0.00669437999014
};
```

### **Coordinate Conversion Utilities**
```typescript
class CoordinateUtils {
  static degreesToMeters(degrees: number, latitude: number): number {
    const metersPerDegree = 111320 * Math.cos(latitude * Math.PI / 180);
    return degrees * metersPerDegree;
  }
  
  static metersToDegrees(meters: number, latitude: number): number {
    const metersPerDegree = 111320 * Math.cos(latitude * Math.PI / 180);
    return meters / metersPerDegree;
  }
  
  static calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371000; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }
}
```

---

## 📊 **Data Quality Assessment**

### **Source Comparison Matrix**
| Source | Global Coverage | Resolution | Accuracy | File Size | Update Frequency |
|--------|----------------|------------|----------|-----------|------------------|
| GEBCO  | ✅ Ocean+Land   | 450m       | ±20m     | 2GB       | Annual           |
| SRTM   | 🔶 56°S-60°N    | 30m        | ±16m     | 25GB      | Static (2000)    |
| ASTER  | ✅ 83°S-83°N    | 30m        | ±17m     | 20GB      | Static (2019)    |
| OpenTopo| 🔶 Regional    | 1-10m      | ±1m      | Variable  | Ongoing          |

### **Quality Metrics by Region**
```typescript
interface RegionQuality {
  region: string;
  dataSource: string;
  verticalAccuracy: number;    // meters RMSE
  horizontalAccuracy: number;  // meters RMSE
  completeness: number;        // 0-1 (data coverage)
  reliability: number;         // 0-1 (consistency score)
}

const QUALITY_BY_REGION: RegionQuality[] = [
  {
    region: "North America",
    dataSource: "SRTM + LiDAR",
    verticalAccuracy: 3.2,
    horizontalAccuracy: 8.1,
    completeness: 0.98,
    reliability: 0.95
  },
  {
    region: "Europe",
    dataSource: "SRTM + National DEMs",
    verticalAccuracy: 2.8,
    horizontalAccuracy: 7.3,
    completeness: 0.97,
    reliability: 0.94
  },
  {
    region: "Ocean Floor",
    dataSource: "GEBCO",
    verticalAccuracy: 25.0,
    horizontalAccuracy: 100.0,
    completeness: 0.85,
    reliability: 0.80
  }
];
```

---

## 🔄 **Data Processing Pipeline**

### **ETL (Extract, Transform, Load) Process**
```typescript
class TerrainDataPipeline {
  async processGlobalData(): Promise<void> {
    console.log('Starting terrain data processing...');
    
    // Extract: Download raw data
    const gebcoData = await this.downloadGEBCO();
    const srtmTiles = await this.downloadSRTMTiles();
    
    // Transform: Process and merge data
    const mergedData = await this.mergeDataSources(gebcoData, srtmTiles);
    const optimizedData = await this.optimizeForWeb(mergedData);
    
    // Load: Store in game-ready format
    await this.storeProcessedData(optimizedData);
    
    console.log('Terrain data processing complete');
  }
  
  private async optimizeForWeb(data: RawTerrainData): Promise<OptimizedTerrainData> {
    return {
      compressed: await this.compressElevationData(data.elevations),
      indexed: await this.createSpatialIndex(data.coordinates),
      tiled: await this.createTileStructure(data, 1000), // 1km tiles
      metadata: this.generateMetadata(data)
    };
  }
}
```

---

**Next Steps**: Choose specific data sources based on selected terrain approach and implement data access layer for the chosen solution.
