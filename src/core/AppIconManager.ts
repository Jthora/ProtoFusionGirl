// App Icon Integration for ProtoFusionGirl
// This ensures the FusionGirl icon is properly displayed across all platforms

export class AppIconManager {
  private static instance: AppIconManager;
  
  private constructor() {}
  
  public static getInstance(): AppIconManager {
    if (!AppIconManager.instance) {
      AppIconManager.instance = new AppIconManager();
    }
    return AppIconManager.instance;
  }
  
  // Initialize app icon settings
  public initialize(): void {
    this.setPageTitle();
    this.setMetaTags();
    this.setPWASettings();
  }
  
  private setPageTitle(): void {
    document.title = 'ProtoFusionGirl — HoloDeck Observer Protocol';
  }
  
  private setMetaTags(): void {
    // Update meta description for better app representation
    this.updateOrCreateMeta('description', 
      'Experience superior AI-mediated gameplay in ProtoFusionGirl. Control Jane through advanced ASI interface with omniscient awareness and environmental orchestration.');
    
    // Keywords for app stores and search
    this.updateOrCreateMeta('keywords', 
      'ProtoFusionGirl, ASI, AI Control, Game, FusionGirl, Jane, Interactive Fiction, Sci-fi');
    
    // Open Graph tags for social sharing
    this.updateOrCreateMeta('og:title', 'ProtoFusionGirl - ASI Control Interface');
    this.updateOrCreateMeta('og:description', 
      'Experience superior AI-mediated gameplay through advanced ASI control systems.');
    this.updateOrCreateMeta('og:image', '/favicon-512.png');
    this.updateOrCreateMeta('og:type', 'website');
    
    // Twitter Card tags
    this.updateOrCreateMeta('twitter:card', 'summary_large_image');
    this.updateOrCreateMeta('twitter:title', 'ProtoFusionGirl');
    this.updateOrCreateMeta('twitter:description', 
      'Advanced ASI Control Interface Game');
    this.updateOrCreateMeta('twitter:image', '/favicon-512.png');
  }
  
  private updateOrCreateMeta(name: string, content: string): void {
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('twitter:')) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  }
  
  private setPWASettings(): void {
    // Set theme color dynamically based on game state
    const themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (themeColorMeta) {
      themeColorMeta.content = '#FF8C00';
    }
    
    // Update manifest theme on the fly if needed
    this.updateManifestTheme();
  }
  
  private async updateManifestTheme(): Promise<void> {
    try {
      // This would dynamically update the manifest if we need runtime changes
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (manifestLink) {
        // Manifest is already properly configured in manifest.json
        console.log('App manifest loaded with FusionGirl branding');
      }
    } catch (error) {
      console.log('Manifest update not needed:', error);
    }
  }
  
  // Method to update icon dynamically (for different game states)
  public updateIconForGameState(state: 'normal' | 'asi_active' | 'combat'): void {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    if (favicon) {
      switch (state) {
        case 'asi_active':
          // Could switch to a glowing version when ASI is active
          favicon.href = '/favicon-512.png';
          break;
        case 'combat':
          // Could switch to a red-tinted version during combat
          favicon.href = '/favicon-512.png';
          break;
        default:
          favicon.href = '/favicon.png';
      }
    }
  }
  
  // Get app icon for use in game UI
  public getAppIconUrl(size: 'small' | 'medium' | 'large' = 'medium'): string {
    switch (size) {
      case 'small':
        return '/favicon-192.png';
      case 'large':
        return '/favicon-512.png';
      default:
        return '/favicon-192.png';
    }
  }
}
