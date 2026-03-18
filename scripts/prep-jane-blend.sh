#!/usr/bin/env bash
# prep-jane-blend.sh — Build jane_master.blend from all Meshy GLB zips.
#
# Automates pipeline tasks 1110–1116 + 1301–1315.
# Run this once from the repo root before running `npm run sprites`.
#
# Usage:
#   ./scripts/prep-jane-blend.sh
#   BLENDER=/path/to/blender ./scripts/prep-jane-blend.sh    # custom Blender path
#   ./scripts/prep-jane-blend.sh --dry-run                   # print plan, no changes
#
# Prerequisites:
#   - Blender 4.x installed and accessible as `blender` (or set BLENDER env var)
#   - FusionGirl_3DAnim/ directory with all Meshy zip files (at repo root)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BLENDER="${BLENDER:-blender}"
CATALOG="$REPO_ROOT/scripts/sprite-catalog.json"
SETUP_SCRIPT="$REPO_ROOT/scripts/setup-blender-scene.py"
IMPORT_SCRIPT="$REPO_ROOT/scripts/import-animation.py"
BLEND_OUT="$REPO_ROOT/assets-src/jane/jane_master.blend"
DRY_RUN=0

for arg in "$@"; do
  [ "$arg" = "--dry-run" ] && DRY_RUN=1
done

# ── Preflight checks ─────────────────────────────────────────────────────────

if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 not found" >&2; exit 1
fi

if ! "$BLENDER" --version &>/dev/null 2>&1; then
  echo "ERROR: Blender not found at '$BLENDER'. Set BLENDER=/path/to/blender" >&2; exit 1
fi

if [ ! -f "$CATALOG" ]; then
  echo "ERROR: sprite-catalog.json not found at $CATALOG" >&2; exit 1
fi

# ── Read catalog via Python ───────────────────────────────────────────────────
# Extract ordered list of "meshy_zip|blender_action" pairs for jane

mapfile -t ANIM_PAIRS < <(python3 - <<'PYEOF'
import json, sys, os
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__ if "__file__" in dir() else ".")))
catalog_path = os.path.join(os.environ.get("REPO_ROOT", "."), "scripts", "sprite-catalog.json")
with open(catalog_path) as f:
    cat = json.load(f)
for anim in cat["characters"]["jane"]["animations"]:
    z = anim.get("meshy_zip", "")
    a = anim.get("blender_action", anim["key"])
    if z:
        print(f"{z}|{a}")
PYEOF
)

if [ ${#ANIM_PAIRS[@]} -eq 0 ]; then
  echo "ERROR: No animations found in catalog" >&2; exit 1
fi

FIRST_ZIP="${ANIM_PAIRS[0]%%|*}"
FIRST_ACTION="${ANIM_PAIRS[0]##*|}"

echo "=== ProtoFusionGirl — Jane Master Blend Setup ==="
echo "  Output: $BLEND_OUT"
echo "  Animations: ${#ANIM_PAIRS[@]}"
echo "  First (base): $FIRST_ZIP ($FIRST_ACTION)"
echo ""

[ $DRY_RUN -eq 1 ] && echo "--- DRY RUN ---"

# ── Step 1: Create master blend from idle GLB ─────────────────────────────────

if [ ! -f "$BLEND_OUT" ] || [ $DRY_RUN -eq 0 ]; then
  echo "[1/${#ANIM_PAIRS[@]}] Setting up master blend from: $FIRST_ZIP"
  if [ $DRY_RUN -eq 0 ]; then
    "$BLENDER" --background --python "$SETUP_SCRIPT" -- \
      --glb-file  "$REPO_ROOT/$FIRST_ZIP" \
      --output-blend "$BLEND_OUT"
    echo "  ✓ Master blend created"
  else
    echo "  [dry] blender --background --python setup-blender-scene.py -- --glb-file $FIRST_ZIP --output-blend $BLEND_OUT"
  fi
else
  echo "[1/${#ANIM_PAIRS[@]}] Master blend already exists — skipping setup"
fi

# ── Step 2: Import each remaining animation ───────────────────────────────────

TOTAL=${#ANIM_PAIRS[@]}
for i in "${!ANIM_PAIRS[@]}"; do
  [ $i -eq 0 ] && continue   # already handled above
  PAIR="${ANIM_PAIRS[$i]}"
  ZIP="${PAIR%%|*}"
  ACTION="${PAIR##*|}"
  IDX=$((i + 1))

  echo "[$IDX/$TOTAL] Importing: $ZIP ($ACTION)"
  if [ $DRY_RUN -eq 0 ]; then
    "$BLENDER" --background "$BLEND_OUT" \
      --python "$IMPORT_SCRIPT" -- \
      --glb-file    "$REPO_ROOT/$ZIP" \
      --action-name "$ACTION"
    echo "  ✓ $ACTION imported"
  else
    echo "  [dry] blender --background $BLEND_OUT --python import-animation.py -- --glb-file $ZIP --action-name $ACTION"
  fi
done

echo ""
echo "=== Done: $BLEND_OUT ==="
echo "Next steps:"
echo "  1. Open in Blender and press F12 — verify black silhouette on white background"
echo "  2. Check Action Editor — all ${#ANIM_PAIRS[@]} actions should be present"
echo "  3. Run: npm run sprites"
