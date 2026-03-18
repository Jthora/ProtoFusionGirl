# Build Integration

How to wire the sprite pipeline into the npm build system and CI.

---

## npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "sprites": "bash scripts/build-sprites.sh",
    "sprites:jane": "bash scripts/build-sprites.sh --character jane",
    "sprites:force": "bash scripts/build-sprites.sh --force",
    "sprites:validate": "node scripts/validate-atlas.js",
    "sprites:dry-run": "bash scripts/build-sprites.sh --dry-run",
    "dev": "npm run sprites && vite",
    "build": "npm run sprites && tsc && vite build"
  }
}
```

The `dev` script ensures sprites are regenerated (or cache-validated) before
Vite starts, so developers always have fresh sprites. The incremental cache
(Stage 3 Task 3.6) makes this fast: if nothing changed, it exits in <1 second.

---

## build-sprites.sh

```bash
#!/usr/bin/env bash
set -euo pipefail

CATALOG="scripts/sprite-catalog.json"
BLENDER="${BLENDER_PATH:-blender}"  # override with BLENDER_PATH env var
PYTHON="${PYTHON_PATH:-python3}"
FORCE="${FORCE:-false}"
DRY_RUN="${DRY_RUN:-false}"
TARGET_CHARACTER="${CHARACTER:-all}"

# Parse args
for arg in "$@"; do
  case $arg in
    --force)       FORCE=true ;;
    --dry-run)     DRY_RUN=true ;;
    --character=*) TARGET_CHARACTER="${arg#*=}" ;;
    --animation=*) TARGET_ANIMATION="${arg#*=}" ;;
  esac
done

if [ "$DRY_RUN" = "true" ]; then
  echo "DRY RUN: sprite pipeline would execute"
  echo "  Catalog: $CATALOG"
  echo "  Blender: $($BLENDER --version 2>&1 | head -1)"
  echo "  Python: $($PYTHON --version)"
  exit 0
fi

# Run pipeline via Node orchestrator
node scripts/build-sprites.js \
  --catalog "$CATALOG" \
  --blender "$BLENDER" \
  --python "$PYTHON" \
  $([ "$FORCE" = "true" ] && echo "--force") \
  $([ -n "${TARGET_CHARACTER:-}" ] && echo "--character $TARGET_CHARACTER") \
  $([ -n "${TARGET_ANIMATION:-}" ] && echo "--animation $TARGET_ANIMATION")

echo "Sprite build complete."
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BLENDER_PATH` | `blender` | Path to Blender executable |
| `PYTHON_PATH` | `python3` | Path to Python 3 executable |
| `VITE_REAL_SPRITES` | `false` | Enable real sprites in Vite dev server |

For local development, add to `.env.local`:
```
VITE_REAL_SPRITES=true
BLENDER_PATH=/Applications/Blender.app/Contents/MacOS/blender
```

For CI, set in the CI environment:
```yaml
env:
  BLENDER_PATH: /usr/local/bin/blender
  VITE_REAL_SPRITES: true
```

---

## CI Pipeline Integration

`.github/workflows/sprites.yml` (optional — run only on blend file changes):

```yaml
name: Build Sprites

on:
  push:
    paths:
      - 'assets-src/**/*.blend'
      - 'scripts/sprite-catalog.json'
      - 'scripts/render-sprites.py'

jobs:
  build-sprites:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true  # required for .blend files in git LFS

      - name: Install Blender
        run: |
          sudo apt-get install -y blender
          blender --version

      - name: Install Python deps
        run: pip3 install Pillow

      - name: Build sprites
        run: npm run sprites

      - name: Validate atlas
        run: npm run sprites:validate

      - name: Upload atlas artifacts
        uses: actions/upload-artifact@v4
        with:
          name: jane-atlas
          path: public/assets/sprites/jane/
```

**Note**: `.blend` files should be stored in git LFS to avoid bloating the repo.
Add to `.gitattributes`:
```
assets-src/**/*.blend filter=lfs diff=lfs merge=lfs -text
assets-src/**/*.fbx filter=lfs diff=lfs merge=lfs -text
```

---

## validate-atlas.js

```javascript
#!/usr/bin/env node
// Validates a Phaser atlas JSON against expected frame counts

const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('scripts/sprite-catalog.json'));
const path = require('path');

let errors = 0;

for (const [charId, charConfig] of Object.entries(catalog.characters)) {
  const atlasPath = path.join(charConfig.output_dir, charConfig.atlas_name + '.json');

  if (!fs.existsSync(atlasPath)) {
    console.error(`MISSING: ${atlasPath}`);
    errors++;
    continue;
  }

  const atlas = JSON.parse(fs.readFileSync(atlasPath));
  const frames = atlas.frames;

  for (const anim of charConfig.animations) {
    const prefix = `${anim.key}_`;
    const animFrames = Object.keys(frames).filter(k => k.startsWith(prefix));

    if (animFrames.length === 0) {
      console.error(`MISSING FRAMES: ${anim.key} (expected prefix '${prefix}')`);
      errors++;
    } else {
      console.log(`OK: ${anim.key} — ${animFrames.length} frames`);
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s). Atlas validation failed.`);
  process.exit(1);
}

console.log('\nAll atlas frames validated successfully.');
```

---

## Developer Workflow

Typical day-to-day workflow after Stage 3:

```bash
# 1. Update an animation in Blender (edit keyframes, save jane.blend)
# 2. Re-render just that animation:
npm run sprites -- --animation jane_walk

# 3. Start dev server (sprites are already current):
npm run dev

# 4. Or rebuild everything from scratch:
npm run sprites:force
```

The cache check uses `.blend` file modification time + action name hash.
If the `.blend` file hasn't changed, all animations are skipped in <1 second.
