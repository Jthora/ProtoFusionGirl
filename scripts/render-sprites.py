#!/usr/bin/env python3
"""
render-sprites.py — Blender headless frame renderer for ProtoFusionGirl.

Usage (called by build-sprites.sh):
  blender --background <file.blend> --python scripts/render-sprites.py -- \
    --action <action_name> \
    --output-dir <output_directory> \
    --armature <armature_name>  [default: Armature] \
    --frame-step <N>             [default: 1] \
    --force                      [skip cache check]

Exit codes:
  0 — success
  1 — action not found in blend file
  2 — armature not found in blend file
  3 — output directory could not be created
  4 — render error
"""

import sys
import os
import argparse
import hashlib
import json

# ─── Parse args after the "--" separator ─────────────────────────────────────

def parse_args():
    argv = sys.argv
    if '--' in argv:
        argv = argv[argv.index('--') + 1:]
    else:
        argv = []

    parser = argparse.ArgumentParser(description='Blender headless sprite renderer')
    parser.add_argument('--action',     required=True,  help='Blender action name, e.g. jane_walk')
    parser.add_argument('--output-dir', required=True,  help='Directory to write PNG frames into')
    parser.add_argument('--armature',   default='Armature', help='Armature object name in .blend')
    parser.add_argument('--frame-step', type=int, default=1, help='Sample every Nth frame from source 30fps')
    parser.add_argument('--force',      action='store_true', help='Skip cache; re-render even if cached')
    return parser.parse_args(argv)

# ─── Cache helpers ────────────────────────────────────────────────────────────

def blend_hash(blend_path: str, action_name: str) -> str:
    """Hash of blend file mtime + action name — cheap cache key."""
    mtime = str(os.path.getmtime(blend_path)) if blend_path and os.path.exists(blend_path) else 'unknown'
    raw = f'{mtime}:{action_name}'
    return hashlib.md5(raw.encode()).hexdigest()[:12]

def cache_path(output_dir: str, action_name: str) -> str:
    return os.path.join(output_dir, f'.cache_{action_name}.json')

def is_cached(output_dir: str, action_name: str, h: str) -> bool:
    cp = cache_path(output_dir, action_name)
    if not os.path.exists(cp):
        return False
    with open(cp) as f:
        data = json.load(f)
    return data.get('hash') == h

def write_cache(output_dir: str, action_name: str, h: str, frame_count: int):
    cp = cache_path(output_dir, action_name)
    with open(cp, 'w') as f:
        json.dump({'hash': h, 'frame_count': frame_count}, f)

# ─── Blender helpers ──────────────────────────────────────────────────────────

def find_armature(armature_name: str):
    import bpy
    obj = bpy.data.objects.get(armature_name)
    if obj is None or obj.type != 'ARMATURE':
        return None
    return obj

def set_active_action(armature, action_name: str) -> bool:
    import bpy
    action = bpy.data.actions.get(action_name)
    if action is None:
        return False
    armature.animation_data_create()
    armature.animation_data.action = action
    return True

def render_frames(output_dir: str, action, frame_step: int, blend_file: str) -> int:
    import bpy
    scene = bpy.context.scene
    start = int(action.frame_range[0])
    end   = int(action.frame_range[1])

    os.makedirs(output_dir, exist_ok=True)

    count = 0
    frame = start
    while frame <= end:
        scene.frame_set(frame)
        scene.render.filepath = os.path.join(output_dir, f'frame_{count:04d}')
        try:
            bpy.ops.render.render(write_still=True)
        except Exception as e:
            print(f'[render-sprites] Render error at frame {frame}: {e}', file=sys.stderr)
            sys.exit(4)
        count += 1
        frame += frame_step

    return count

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    args = parse_args()

    # Prepare output dir
    try:
        os.makedirs(args.output_dir, exist_ok=True)
    except OSError as e:
        print(f'[render-sprites] Cannot create output dir {args.output_dir}: {e}', file=sys.stderr)
        sys.exit(3)

    # Lazy-import bpy (only available inside Blender)
    import bpy

    blend_file = bpy.data.filepath

    # Cache check
    h = blend_hash(blend_file, args.action)
    if not args.force and is_cached(args.output_dir, args.action, h):
        print(f'[render-sprites] cached: {args.action}')
        sys.exit(0)

    # Find armature
    armature = find_armature(args.armature)
    if armature is None:
        print(f'[render-sprites] Armature "{args.armature}" not found in blend file.', file=sys.stderr)
        sys.exit(2)

    # Set action
    if not set_active_action(armature, args.action):
        print(f'[render-sprites] Action "{args.action}" not found in blend file.', file=sys.stderr)
        sys.exit(1)

    action = bpy.data.actions[args.action]

    # Render
    print(f'[render-sprites] Rendering {args.action} (frame_step={args.frame_step}) → {args.output_dir}')
    count = render_frames(args.output_dir, action, args.frame_step, blend_file)

    # Write cache
    write_cache(args.output_dir, args.action, h, count)
    print(f'[render-sprites] Done: {count} frames written.')
    sys.exit(0)


if __name__ == '__main__':
    main()
