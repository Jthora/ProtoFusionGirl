#!/usr/bin/env python3
"""
import-animation.py — Import a Meshy GLB animation into an existing master blend.

Automates the repetitive part of task 1110 (for each of the 22 non-idle animations).

Usage:
  blender --background assets-src/jane/jane_master.blend \\
    --python scripts/import-animation.py -- \\
    --glb-file FusionGirl_3DAnim/Meshy_AI_biped-quick-walk.zip \\
    --action-name biped-quick-walk

  The script will:
    1. Unzip the .zip (if given) to a temp dir
    2. Import the GLB — this adds a second armature + animation to the scene
    3. Find the new action (the first action not already in the file)
    4. Rename it to --action-name
    5. Delete the imported armature (keep the action in bpy.data.actions)
    6. Save the blend file (overwrite in place)

After running for all 23 animations, jane_master.blend will contain all actions
and render-sprites.py can be called with any --action <blender_action> value.
"""

import sys
import os
import argparse
import zipfile
import tempfile


def parse_args():
    argv = sys.argv
    if '--' in argv:
        argv = argv[argv.index('--') + 1:]
    else:
        argv = []
    parser = argparse.ArgumentParser(description='Import animation from Meshy GLB into master blend')
    parser.add_argument('--glb-file',    required=True,
                        help='Path to Meshy .zip or .glb file')
    parser.add_argument('--action-name', required=True,
                        help='Target action name in Blender (e.g. biped-quick-walk)')
    return parser.parse_args(argv)


def unzip_glb(zip_path: str, temp_dir: str) -> str:
    with zipfile.ZipFile(zip_path, 'r') as zf:
        glb_names = [n for n in zf.namelist() if n.lower().endswith('.glb')]
        if not glb_names:
            raise RuntimeError(f'No .glb file found inside {zip_path}')
        glb_name = glb_names[0]
        zf.extract(glb_name, temp_dir)
        return os.path.join(temp_dir, glb_name)


def main():
    args = parse_args()
    glb_src = args.glb_file
    target_action = args.action_name

    temp_dir = None
    if glb_src.lower().endswith('.zip'):
        temp_dir = tempfile.mkdtemp(prefix='pfg_import_')
        glb_src = unzip_glb(glb_src, temp_dir)
        print(f'[import-anim] Unzipped GLB to: {glb_src}')

    if not os.path.exists(glb_src):
        print(f'[import-anim] ERROR: GLB file not found: {glb_src}', file=sys.stderr)
        sys.exit(1)

    import bpy

    # Record actions present before import
    before = set(bpy.data.actions.keys())
    # Record objects present before import
    before_objects = set(bpy.data.objects.keys())

    print(f'[import-anim] Importing: {glb_src}')
    bpy.ops.import_scene.gltf(filepath=glb_src)

    # Actions added by import
    after = set(bpy.data.actions.keys())
    new_actions = list(after - before)
    if not new_actions:
        print('[import-anim] WARNING: No new action found after import. '
              'The GLB may not contain an animation track.', file=sys.stderr)
        sys.exit(3)

    # If multiple new actions, use the first one
    imported_action_name = new_actions[0]
    imported_action = bpy.data.actions[imported_action_name]

    # Rename to target
    if imported_action_name != target_action:
        if target_action in bpy.data.actions:
            print(f'[import-anim] WARNING: Action "{target_action}" already exists — overwriting.')
            bpy.data.actions.remove(bpy.data.actions[target_action])
        imported_action.name = target_action
        print(f'[import-anim] Renamed action "{imported_action_name}" → "{target_action}"')
    else:
        print(f'[import-anim] Action already named "{target_action}"')

    # Remove objects added by import (armature, meshes) — keep only the action
    after_objects = set(bpy.data.objects.keys())
    new_objects = after_objects - before_objects
    for obj_name in new_objects:
        obj = bpy.data.objects.get(obj_name)
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)
    print(f'[import-anim] Removed {len(new_objects)} imported object(s), kept action data.')

    # Save blend in place
    blend_path = bpy.data.filepath
    bpy.ops.wm.save_mainfile()
    print(f'[import-anim] Saved: {blend_path}')
    print(f'[import-anim] Actions now in file: {sorted(bpy.data.actions.keys())}')

    if temp_dir:
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == '__main__':
    main()
