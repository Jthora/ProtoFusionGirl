#!/usr/bin/env python3
"""
run-build-loop.py — called by build-sprites.sh to iterate sprite-catalog.json
and invoke Blender + assemble-atlas.py for each animation.
"""
import json
import os
import subprocess
import sys

REPO_ROOT       = os.environ.get('REPO_ROOT', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLENDER         = os.environ.get('BLENDER', 'blender')
FORCE           = os.environ.get('FORCE', '')
FILTER_CHAR     = os.environ.get('FILTER_CHARACTER', '')
FILTER_ANIM     = os.environ.get('FILTER_ANIMATION', '')

SCRIPT_DIR      = os.path.join(REPO_ROOT, 'scripts')
CATALOG_PATH    = os.path.join(SCRIPT_DIR, 'sprite-catalog.json')
RENDER_SCRIPT   = os.path.join(SCRIPT_DIR, 'render-sprites.py')
ASSEMBLE_SCRIPT = os.path.join(SCRIPT_DIR, 'assemble-atlas.py')

with open(CATALOG_PATH) as f:
    catalog = json.load(f)

for char_id, cfg in catalog['characters'].items():
    if FILTER_CHAR and char_id != FILTER_CHAR:
        continue

    blend_file = os.path.join(REPO_ROOT, cfg['blend_file'])
    if not os.path.exists(blend_file):
        print(f'[sprites] SKIP {char_id}: blend file not found at {blend_file}')
        continue

    out_dir = os.path.join(REPO_ROOT, cfg['output_dir'])
    os.makedirs(out_dir, exist_ok=True)

    for anim in cfg['animations']:
        key = anim['key']
        if FILTER_ANIM and key != FILTER_ANIM:
            continue

        tmp_dir  = f'/tmp/pfg_render/{char_id}/{key}'
        out_png  = os.path.join(out_dir, f'{key}.png')
        out_json = os.path.join(out_dir, f'{key}.json')

        # Use blender_action if set (Meshy pipeline), fall back to key (legacy)
        blender_action = anim.get('blender_action', key)

        # 1. Render frames via Blender headless
        render_cmd = [
            BLENDER, '--background', blend_file,
            '--python', RENDER_SCRIPT,
            '--',
            '--action',     blender_action,
            '--output-dir', tmp_dir,
            '--armature',   cfg.get('armature', 'Armature'),
            '--frame-step', str(anim['frame_step']),
        ]
        if FORCE:
            render_cmd.append('--force')

        print(f'[sprites] Rendering {char_id}/{key} ...')
        result = subprocess.run(render_cmd)
        if result.returncode != 0:
            print(f'[sprites] ERROR: render failed for {key} (exit {result.returncode})', file=sys.stderr)
            sys.exit(result.returncode)

        # 2. Assemble sprite sheet
        assemble_cmd = [
            sys.executable, ASSEMBLE_SCRIPT,
            '--input-dir',   tmp_dir,
            '--output-png',  out_png,
            '--output-json', out_json,
            '--key',         key,
        ]
        result = subprocess.run(assemble_cmd)
        if result.returncode != 0:
            print(f'[sprites] ERROR: assemble failed for {key}', file=sys.stderr)
            sys.exit(result.returncode)
