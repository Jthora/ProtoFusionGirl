#!/usr/bin/env python3
"""
setup-blender-scene.py — Create the master jane_master.blend from a Meshy GLB.

Automates tasks 1110–1116 and 1301–1315 from the animation pipeline tracker.

Usage (run from repo root):
  blender --background --python scripts/setup-blender-scene.py -- \\
    --glb-file  FusionGirl_3DAnim/Meshy_AI_biped-idle.zip \\
    --output-blend assets-src/jane/jane_master.blend

  OR, if already unzipped:
  blender --background --python scripts/setup-blender-scene.py -- \\
    --glb-file  /tmp/pfg_setup/biped-idle.glb \\
    --output-blend assets-src/jane/jane_master.blend

The script will:
  1. Clear the default scene
  2. Unzip the source zip (if a .zip path is given) to a temp dir
  3. Import the GLB (character mesh + rig + idle animation)
  4. Position armature: feet at Z=0
  5. Create PFG_Silhouette emission material, apply to all meshes
  6. Add orthographic camera: X=0, Y=-5, Z=0.9, rot X=90°, Ortho Scale=2.2
  7. Set World Background to pure white
  8. Enable Freestyle, 2px contour edges only
  9. Render settings: 128x128, RGBA PNG, compression 15%, output path //temp/frame_
 10. Save as the output blend file

After this script succeeds:
  - Verify with: blender assets-src/jane/jane_master.blend
  - Press F12 to test-render — should show black silhouette on white background
  - Then run import-animation.py for each remaining 22 animations
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
    parser = argparse.ArgumentParser(description='Create master Blender scene from Meshy GLB')
    parser.add_argument('--glb-file',      required=True,
                        help='Path to Meshy .zip or .glb file')
    parser.add_argument('--output-blend',  required=True,
                        help='Output path for .blend file, e.g. assets-src/jane/jane_master.blend')
    parser.add_argument('--ortho-scale',   type=float, default=2.2,
                        help='Orthographic scale (default 2.2 — adjust if character is too large/small)')
    parser.add_argument('--frame-size',    type=int,   default=128,
                        help='Render resolution in pixels (default 128)')
    return parser.parse_args(argv)


def unzip_glb(zip_path: str, temp_dir: str) -> str:
    """Unzip a Meshy zip and return the path to the .glb inside."""
    with zipfile.ZipFile(zip_path, 'r') as zf:
        glb_names = [n for n in zf.namelist() if n.lower().endswith('.glb')]
        if not glb_names:
            raise RuntimeError(f'No .glb file found inside {zip_path}')
        glb_name = glb_names[0]
        zf.extract(glb_name, temp_dir)
        return os.path.join(temp_dir, glb_name)


def clear_scene():
    import bpy
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    # Remove all orphan data
    for block in list(bpy.data.meshes):
        bpy.data.meshes.remove(block)
    for block in list(bpy.data.cameras):
        bpy.data.cameras.remove(block)
    for block in list(bpy.data.lights):
        bpy.data.lights.remove(block)


def import_glb(glb_path: str):
    import bpy
    bpy.ops.import_scene.gltf(filepath=glb_path)
    print(f'[setup-scene] Imported: {glb_path}')


def find_armature():
    import bpy
    for obj in bpy.data.objects:
        if obj.type == 'ARMATURE':
            return obj
    return None


def position_armature(armature):
    """Move armature so feet sit at Z=0."""
    import bpy
    # Deselect all, select armature
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = armature
    armature.select_set(True)

    # Find lowest Z among all mesh verts in world space
    mesh_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    min_z = 0.0
    if mesh_objects:
        min_z = min(
            (armature.matrix_world @ v.co).z
            for obj in mesh_objects
            for v in obj.data.vertices
        )

    if abs(min_z) > 0.001:
        armature.location.z -= min_z
        bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
        print(f'[setup-scene] Adjusted armature Z by {-min_z:.4f} to ground feet at Z=0')
    else:
        print('[setup-scene] Armature already grounded at Z=0')


def create_silhouette_material():
    """Create PFG_Silhouette: Emission black, strength 1.0."""
    import bpy
    mat_name = 'PFG_Silhouette'
    mat = bpy.data.materials.get(mat_name) or bpy.data.materials.new(name=mat_name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    emission = nodes.new(type='ShaderNodeEmission')
    emission.inputs['Color'].default_value = (0.0, 0.0, 0.0, 1.0)   # black
    emission.inputs['Strength'].default_value = 1.0
    links.new(emission.outputs['Emission'], output.inputs['Surface'])
    print('[setup-scene] PFG_Silhouette material created')
    return mat


def apply_material_to_all_meshes(mat):
    import bpy
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.data.materials.clear()
            obj.data.materials.append(mat)
    print('[setup-scene] PFG_Silhouette applied to all mesh objects')


def setup_camera(ortho_scale: float):
    import bpy
    import math
    cam_data = bpy.data.cameras.new(name='PFG_Camera')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = ortho_scale

    cam_obj = bpy.data.objects.new('PFG_Camera', cam_data)
    bpy.context.collection.objects.link(cam_obj)
    cam_obj.location = (0.0, -5.0, 0.9)
    cam_obj.rotation_euler = (math.radians(90), 0.0, 0.0)

    bpy.context.scene.camera = cam_obj
    print(f'[setup-scene] Orthographic camera created (scale={ortho_scale})')


def setup_world():
    import bpy
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new('PFG_World')
        bpy.context.scene.world = world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    nodes.clear()
    bg = nodes.new(type='ShaderNodeBackground')
    bg.inputs['Color'].default_value = (1.0, 1.0, 1.0, 1.0)   # pure white
    bg.inputs['Strength'].default_value = 1.0
    output = nodes.new(type='ShaderNodeOutputWorld')
    world.node_tree.links.new(bg.outputs['Background'], output.inputs['Surface'])
    print('[setup-scene] World background set to pure white')


def setup_freestyle():
    import bpy
    scene = bpy.context.scene
    view_layer = bpy.context.view_layer
    scene.render.use_freestyle = True
    view_layer.use_freestyle = True

    # Clear existing line sets and add a single contour set
    freestyle = view_layer.freestyle_settings
    for ls in list(freestyle.linesets):
        freestyle.linesets.remove(ls)
    ls = freestyle.linesets.new('PFG_Contour')
    ls.select_silhouette = True
    ls.select_border = True
    ls.select_contour = True
    ls.select_crease = False
    ls.select_edge_mark = False
    ls.linestyle.thickness = 2.0
    print('[setup-scene] Freestyle enabled: 2px contour outlines')


def setup_render_settings(frame_size: int):
    import bpy
    render = bpy.context.scene.render
    render.resolution_x = frame_size
    render.resolution_y = frame_size
    render.resolution_percentage = 100
    render.image_settings.file_format = 'PNG'
    render.image_settings.color_mode = 'RGBA'
    render.image_settings.compression = 15
    render.filepath = '//temp/frame_'
    # Standard color management (not Filmic — keeps black pure black)
    bpy.context.scene.display_settings.display_device = 'sRGB'
    bpy.context.scene.view_settings.view_transform = 'Standard'
    print(f'[setup-scene] Render: {frame_size}x{frame_size} RGBA PNG, output //temp/frame_')


def save_blend(output_path: str):
    import bpy
    abs_path = os.path.abspath(output_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=abs_path)
    print(f'[setup-scene] Saved: {abs_path}')


def main():
    args = parse_args()
    glb_src = args.glb_file

    temp_dir = None
    if glb_src.lower().endswith('.zip'):
        temp_dir = tempfile.mkdtemp(prefix='pfg_setup_')
        glb_src = unzip_glb(glb_src, temp_dir)
        print(f'[setup-scene] Unzipped GLB to: {glb_src}')

    if not os.path.exists(glb_src):
        print(f'[setup-scene] ERROR: GLB file not found: {glb_src}', file=sys.stderr)
        sys.exit(1)

    import bpy

    print('[setup-scene] Clearing default scene...')
    clear_scene()

    print(f'[setup-scene] Importing GLB: {glb_src}')
    import_glb(glb_src)

    armature = find_armature()
    if armature is None:
        print('[setup-scene] ERROR: No armature found in GLB. Is this a rigged character?', file=sys.stderr)
        sys.exit(2)
    print(f'[setup-scene] Found armature: {armature.name}')

    # Rename armature to standard name
    armature.name = 'Armature'
    if armature.data:
        armature.data.name = 'Armature'

    position_armature(armature)

    mat = create_silhouette_material()
    apply_material_to_all_meshes(mat)
    setup_camera(args.ortho_scale)
    setup_world()
    setup_freestyle()
    setup_render_settings(args.frame_size)
    save_blend(args.output_blend)

    # List discovered actions for the user
    import bpy
    actions = list(bpy.data.actions.keys())
    print(f'[setup-scene] Actions in file: {actions}')
    print(f'[setup-scene] Done. Open {args.output_blend} in Blender and press F12 to verify.')
    print('[setup-scene] Then run import-animation.py for each remaining animation.')

    if temp_dir:
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == '__main__':
    main()
