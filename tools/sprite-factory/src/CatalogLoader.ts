// CatalogLoader.ts — loads sprite-catalog.json and all atlas JSONs.

export interface AnimationEntry {
  key: string;
  fps: number;
  frames: number;
  loop: boolean;
  hold_last: boolean;
}

export interface CharacterEntry {
  id: string;
  atlasKey: string;
  atlasUrl: string;
  atlasJsonUrl: string;
  animations: AnimationEntry[];
}

export class CatalogLoader {
  async load(): Promise<CharacterEntry[]> {
    const catalog = await fetch('/scripts/sprite-catalog.json').then(r => r.json());
    const entries: CharacterEntry[] = [];

    for (const [charId, config] of Object.entries(catalog.characters) as [string, any][]) {
      const atlasJsonUrl = `/${config.output_dir}/${config.atlas_name}.json`;

      try {
        const atlasJson = await fetch(atlasJsonUrl).then(r => r.json());
        const pfgAnims: Record<string, any> = atlasJson.meta?.pfg?.animations ?? {};

        entries.push({
          id: charId,
          atlasKey: charId,
          atlasUrl: `/${config.output_dir}/${config.atlas_name}.png`,
          atlasJsonUrl,
          animations: config.animations.map((anim: any) => ({
            key:      anim.key,
            fps:      anim.fps,
            frames:   Object.keys(pfgAnims[anim.key]?.frames ?? {}).length ||
                      // fall back: count keys with matching prefix in atlas
                      Object.keys(atlasJson.frames ?? {}).filter((k: string) => k.startsWith(anim.key + '_')).length,
            loop:     anim.loop,
            hold_last: anim.hold_last,
          })),
        });
      } catch {
        console.warn(`[CatalogLoader] Skipping ${charId} — atlas not yet rendered`);
      }
    }

    return entries;
  }
}
