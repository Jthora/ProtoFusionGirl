#!/usr/bin/env bash
# build-sprites.sh — orchestrates the sprite pipeline.
#
# Usage:
#   npm run sprites                          # build all characters
#   npm run sprites -- --character jane      # single character
#   npm run sprites -- --animation jane_walk # single animation
#   npm run sprites -- --force               # bypass render cache
#   npm run sprites -- --dry-run             # validate tools, print plan, exit

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CATALOG="$SCRIPT_DIR/sprite-catalog.json"
RENDER_SCRIPT="$SCRIPT_DIR/render-sprites.py"
ASSEMBLE_SCRIPT="$SCRIPT_DIR/assemble-atlas.py"
export BLENDER="${BLENDER:-blender}"

# ─── Argument parsing ──────────────────────────────────────────────────────────
export FILTER_CHARACTER=""
export FILTER_ANIMATION=""
export FORCE=""
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --character)  FILTER_CHARACTER="$2"; shift 2 ;;
    --animation)  FILTER_ANIMATION="$2"; shift 2 ;;
    --force)      FORCE="--force";       shift   ;;
    --dry-run)    DRY_RUN=1;             shift   ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# ─── Tool checks ──────────────────────────────────────────────────────────────
require_tool() {
  local tool="$1"
  if ! command -v "$tool" &>/dev/null; then
    echo "[sprites] ERROR: '$tool' not found. Install it or set the env var." >&2
    exit 1
  fi
}

require_tool "$BLENDER"
require_tool python3
require_tool node

if [[ $DRY_RUN -eq 1 ]]; then
  echo "[sprites] Dry run — all required tools found."
  echo "[sprites] Catalog: $CATALOG"
  python3 - <<PYEOF
import json, os
cat = json.load(open('$CATALOG'))
for char, cfg in cat['characters'].items():
    fc = os.environ.get('FILTER_CHARACTER','')
    if fc and char != fc: continue
    for anim in cfg['animations']:
        fa = os.environ.get('FILTER_ANIMATION','')
        if fa and anim['key'] != fa: continue
        print(f"  Would render: {char}/{anim['key']}")
PYEOF
  exit 0
fi

# ─── Build loop (delegated to Python for catalog parsing) ─────────────────────
python3 "$SCRIPT_DIR/run-build-loop.py"
echo "[sprites] Build complete. Run: npm run sprites:validate"
