#!/usr/bin/env python3
"""
assemble-atlas.py — Assembles rendered PNG frames into a sprite sheet grid
and emits a Phaser-compatible JSON frame coordinate fragment.

Usage:
  python3 scripts/assemble-atlas.py \
    --input-dir  /tmp/pfg/jane_walk \
    --output-png public/assets/sprites/jane/jane_walk.png \
    --output-json public/assets/sprites/jane/jane_walk.json \
    --key         jane_walk \
    --cols        8

Outputs:
  - <output-png>  : grid sprite sheet (cols × ceil(frames/cols) rows)
  - <output-json> : Phaser JSON Hash fragment { "frames": { "jane_walk_000": {...} } }
"""

import sys
import os
import glob
import json
import argparse
import math

FRAME_W = 128
FRAME_H = 128


def parse_args():
    parser = argparse.ArgumentParser(description='Assemble frames into sprite sheet')
    parser.add_argument('--input-dir',   required=True, help='Directory of frame_NNNN.png files')
    parser.add_argument('--output-png',  required=True, help='Output sprite sheet PNG path')
    parser.add_argument('--output-json', required=True, help='Output JSON fragment path')
    parser.add_argument('--key',         required=True, help='Animation key prefix, e.g. jane_walk')
    parser.add_argument('--cols',        type=int, default=8, help='Frames per row (default: 8)')
    return parser.parse_args()


def main():
    args = parse_args()

    try:
        from PIL import Image
    except ImportError:
        print('[assemble-atlas] ERROR: Pillow not installed. Run: pip3 install Pillow', file=sys.stderr)
        sys.exit(1)

    # Collect frames
    pattern = os.path.join(args.input_dir, 'frame_*.png')
    frame_paths = sorted(glob.glob(pattern))
    if not frame_paths:
        print(f'[assemble-atlas] No frames found in {args.input_dir}', file=sys.stderr)
        sys.exit(1)

    n = len(frame_paths)
    cols = min(args.cols, n)
    rows = math.ceil(n / cols)

    sheet_w = cols * FRAME_W
    sheet_h = rows * FRAME_H

    sheet = Image.new('RGBA', (sheet_w, sheet_h), (0, 0, 0, 0))
    frames_json = {}

    for i, path in enumerate(frame_paths):
        img = Image.open(path).convert('RGBA')
        if img.size != (FRAME_W, FRAME_H):
            img = img.resize((FRAME_W, FRAME_H), Image.LANCZOS)

        col = i % cols
        row = i // cols
        x = col * FRAME_W
        y = row * FRAME_H
        sheet.paste(img, (x, y))

        frame_key = f'{args.key}_{i:03d}'
        frames_json[frame_key] = {
            'frame':    {'x': x,    'y': y,    'w': FRAME_W, 'h': FRAME_H},
            'rotated':  False,
            'trimmed':  False,
            'spriteSourceSize': {'x': 0, 'y': 0, 'w': FRAME_W, 'h': FRAME_H},
            'sourceSize': {'w': FRAME_W, 'h': FRAME_H},
        }

    # Write sprite sheet
    os.makedirs(os.path.dirname(os.path.abspath(args.output_png)), exist_ok=True)
    sheet.save(args.output_png, 'PNG')
    print(f'[assemble-atlas] Saved sheet: {args.output_png} ({n} frames, {cols}×{rows})')

    # Write JSON fragment
    os.makedirs(os.path.dirname(os.path.abspath(args.output_json)), exist_ok=True)
    with open(args.output_json, 'w') as f:
        json.dump({'frames': frames_json}, f, indent=2)
    print(f'[assemble-atlas] Saved JSON:  {args.output_json}')


if __name__ == '__main__':
    main()
