# Render Script Specification

Design spec for `scripts/render-sprites.py` — the Blender headless render script.

---

## Invocation

```bash
blender --background assets-src/jane/jane.blend \
        --python scripts/render-sprites.py \
        -- \
        --action jane_walk \
        --output-dir /tmp/pfg_render/jane_walk \
        --frame-step 3
```

The `--` separates Blender's own args from the script's args.

---

## Script Interface

### CLI Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `--action` | Yes | — | Name of the Blender action to render |
| `--output-dir` | Yes | — | Directory to write frame PNGs |
| `--frame-step` | No | `1` | Render every Nth frame (downsampling) |
| `--frame-width` | No | `128` | Frame width in pixels |
| `--frame-height` | No | `128` | Frame height in pixels |
| `--armature-name` | No | `Armature` | Name of the armature object in Blender |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success — all frames rendered |
| 1 | Action not found in blend file |
| 2 | Armature not found |
| 3 | Output directory could not be created |
| 4 | Render error on specific frame |

---

## Script Structure

```python
import bpy
import sys
import os
import argparse

def parse_args():
    """Parse args after the -- separator."""
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []

    parser = argparse.ArgumentParser()
    parser.add_argument("--action", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--frame-step", type=int, default=1)
    parser.add_argument("--frame-width", type=int, default=128)
    parser.add_argument("--frame-height", type=int, default=128)
    parser.add_argument("--armature-name", default="Armature")
    return parser.parse_args(argv)


def find_armature(name):
    """Find armature object by name."""
    obj = bpy.data.objects.get(name)
    if obj is None or obj.type != 'ARMATURE':
        return None
    return obj


def set_active_action(armature, action_name):
    """Set the active action on the armature."""
    action = bpy.data.actions.get(action_name)
    if action is None:
        return False
    if armature.animation_data is None:
        armature.animation_data_create()
    armature.animation_data.action = action
    return True


def render_frames(output_dir, action, frame_step, width, height):
    """Render all frames of the current action."""
    scene = bpy.context.scene
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

    start = int(action.frame_range[0])
    end = int(action.frame_range[1])

    frame_index = 0
    for frame_number in range(start, end + 1, frame_step):
        scene.frame_set(frame_number)
        output_path = os.path.join(output_dir, f"frame_{frame_index:04d}.png")
        scene.render.filepath = output_path
        bpy.ops.render.render(write_still=True)
        frame_index += 1

    return frame_index  # total frames rendered


def main():
    args = parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    armature = find_armature(args.armature_name)
    if armature is None:
        print(f"ERROR: Armature '{args.armature_name}' not found", file=sys.stderr)
        sys.exit(2)

    if not set_active_action(armature, args.action):
        print(f"ERROR: Action '{args.action}' not found", file=sys.stderr)
        sys.exit(1)

    action = bpy.data.actions[args.action]
    count = render_frames(args.output_dir, action, args.frame_step,
                          args.frame_width, args.frame_height)

    print(f"OK: Rendered {count} frames to {args.output_dir}")
    sys.exit(0)


main()
```

---

## Atlas Assembler: assemble-atlas.py

Assembles rendered frame PNGs into a sprite sheet grid.

```python
#!/usr/bin/env python3
"""
Assemble a directory of frame_NNNN.png files into a sprite sheet.

Usage:
  python3 assemble-atlas.py \
    --input-dir /tmp/pfg_render/jane_walk \
    --output public/assets/sprites/jane/jane_walk.png \
    --frame-width 128 \
    --frame-height 128 \
    --cols 8 \
    --key-prefix jane_walk_
"""

import argparse
import glob
import json
import os
from PIL import Image

def assemble(input_dir, output_path, frame_w, frame_h, cols, key_prefix):
    frames = sorted(glob.glob(os.path.join(input_dir, "frame_*.png")))

    if not frames:
        raise ValueError(f"No frames found in {input_dir}")

    n = len(frames)
    rows = (n + cols - 1) // cols

    sheet = Image.new("RGBA", (cols * frame_w, rows * frame_h), (0, 0, 0, 0))

    frame_data = {}
    for i, frame_path in enumerate(frames):
        img = Image.open(frame_path).convert("RGBA")
        col = i % cols
        row = i // cols
        x = col * frame_w
        y = row * frame_h
        sheet.paste(img, (x, y))

        key = f"{key_prefix}{i:03d}"
        frame_data[key] = {
            "frame": {"x": x, "y": y, "w": frame_w, "h": frame_h},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": frame_w, "h": frame_h},
            "sourceSize": {"w": frame_w, "h": frame_h}
        }

    sheet.save(output_path, "PNG")

    return frame_data, cols * frame_w, rows * frame_h


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--frame-width", type=int, default=128)
    parser.add_argument("--frame-height", type=int, default=128)
    parser.add_argument("--cols", type=int, default=8)
    parser.add_argument("--key-prefix", required=True)
    parser.add_argument("--json-output")
    args = parser.parse_args()

    frame_data, w, h = assemble(
        args.input_dir, args.output,
        args.frame_width, args.frame_height,
        args.cols, args.key_prefix
    )

    if args.json_output:
        atlas = {
            "frames": frame_data,
            "meta": {
                "image": os.path.basename(args.output),
                "format": "RGBA8888",
                "size": {"w": w, "h": h},
                "scale": "1"
            }
        }
        with open(args.json_output, "w") as f:
            json.dump(atlas, f, indent=2)

    print(f"OK: {len(frame_data)} frames → {args.output}")
```

---

## Headless Blender Requirements

On Linux CI servers, Blender headless rendering requires:

```bash
# CPU rendering (no GPU needed on CI):
export CYCLES_DEVICE=CPU

# If no display (CI/headless):
export DISPLAY=:0
# or use Xvfb:
Xvfb :0 -screen 0 1024x768x24 &
export DISPLAY=:0

# EEVEE on headless Linux requires EGL or Xvfb
# Alternatively force Cycles for CI (slower but works without display):
# In render-sprites.py, set: scene.render.engine = 'CYCLES'
```

For local Mac/Windows development: Blender headless works without display.

---

## Performance Notes

| Machine | Engine | Time per animation (16 frames) |
|---------|--------|-------------------------------|
| Mac M2 | EEVEE | ~30 seconds |
| Mac M2 | Cycles | ~5 minutes |
| Linux RTX 3080 | EEVEE | ~15 seconds |
| Linux CPU only | EEVEE | ~2 minutes |

For 24 animations with EEVEE on M2: ~12 minutes total.
Incremental cache (Task 3.6) brings this down to seconds for unchanged animations.
