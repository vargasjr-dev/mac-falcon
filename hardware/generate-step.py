#!/usr/bin/env python3
"""
Generate the M4-D2 Mobility Kit assembly.

Outputs:
  hardware/m4d2-assembly.step  — full CAD assembly (record / interchange)
  public/3d/m4d2.glb           — per-part meshes for the web explode viewer

All dimensions in millimetres, Z up. Shares dimensions with
hardware/generate-dxf.ts — change them together.
"""

import math
from pathlib import Path

import cadquery as cq
import trimesh

MM = 1.0
PLATE_D = 300.0
PLATE_T = 6.35          # 1/4 in acrylic
PLATE_R = PLATE_D / 2
STANDOFF_R = 125.0      # hex pattern of M3 standoffs
STANDOFF_HOLE = 3.4 / 2
STANDOFF_LEN = 80.0     # shelf height above base
MOTOR_W, MOTOR_L, MOTOR_H = 24.0, 70.0, 33.0   # FIT0450-ish body
MOTOR_X = 92.0
WHEEL_R, WHEEL_T = 32.0, 26.0
CASTER_Y, CASTER_PITCH = -110.0, 20.3
CASTER_HOLE = 2.8 / 2
PICO = (21.0, 51.0, 2.5)
BATTERY = (70.0, 150.0, 40.0)
MAC_MINI = 197.0
MAC_MINI_H = 58.0

PARTS = []  # (name, color_hex, shape, explode_dir)


def add(name, color, shape, explode):
    PARTS.append((name, color, shape, explode))


def radial(angle_deg, lift=0.0):
    a = math.radians(angle_deg)
    return cq.Vector(math.cos(a), math.sin(a), lift).normalized()


# ── Base plate ────────────────────────────────────────────────────────────────
base = cq.Workplane("XY").circle(PLATE_R).extrude(PLATE_T)
# motor slots
for sx in (-1, 1):
    base = (
        base.moveTo(sx * MOTOR_X, 0)
        .rect(MOTOR_L, MOTOR_W)
        .cutThruAll()
    )
# sensor apertures (cardinal)
for x, y in [(0, 135), (135, 0), (0, -135), (-135, 0)]:
    base = base.moveTo(x, y).rect(18, 12).cutThruAll()
# standoffs + caster holes
for i in range(6):
    a = math.radians(i * 60)
    base = base.moveTo(STANDOFF_R * math.cos(a), STANDOFF_R * math.sin(a)).circle(STANDOFF_HOLE).cutThruAll()
for dx in (-CASTER_PITCH / 2, CASTER_PITCH / 2):
    base = base.moveTo(dx, CASTER_Y).circle(CASTER_HOLE).cutThruAll()

add("Base plate", "#a8d8f0", base.val(), cq.Vector(0, 0, -1))

# ── Shelf plate ───────────────────────────────────────────────────────────────
shelf_z = PLATE_T + STANDOFF_LEN
shelf = cq.Workplane("XY", origin=(0, 0, shelf_z)).circle(PLATE_R).extrude(PLATE_T)
shelf = shelf.moveTo(0, -131).rect(80, 14).cutThruAll()
for i in range(6):
    a = math.radians(i * 60)
    shelf = shelf.moveTo(STANDOFF_R * math.cos(a), STANDOFF_R * math.sin(a)).circle(STANDOFF_HOLE).cutThruAll()

add("Shelf plate", "#a8d8f0", shelf.val(), cq.Vector(0, 0, 1))

# ── Standoffs ─────────────────────────────────────────────────────────────────
for i in range(6):
    a = math.radians(i * 60)
    x, y = STANDOFF_R * math.cos(a), STANDOFF_R * math.sin(a)
    rod = (
        cq.Workplane("XY", origin=(x, y, PLATE_T))
        .circle(3.0)
        .extrude(STANDOFF_LEN)
    )
    add(f"Standoff {i + 1}", "#9aa3ad", rod.val(), radial(i * 60, lift=0.35))

# ── Motors + wheels ───────────────────────────────────────────────────────────
for sx in (-1, 1):
    motor = (
        cq.Workplane("XY", origin=(sx * MOTOR_X, 0, PLATE_T))
        .box(MOTOR_L, MOTOR_W, MOTOR_H, centered=(True, True, False))
        .val()
    )
    add(f"Motor {'L' if sx < 0 else 'R'}", "#2a2a30", motor, cq.Vector(sx, 0, 0.2))
    wheel = (
        cq.Workplane("XY", origin=(sx * (MOTOR_X + (MOTOR_L / 2 + WHEEL_T / 2)), 0, PLATE_T + MOTOR_H / 2))
        .circle(WHEEL_R)
        .extrude(WHEEL_T, both=True).val()
        .rotate((sx * (MOTOR_X + MOTOR_L / 2 + WHEEL_T / 2), 0, PLATE_T + MOTOR_H / 2) if False else (0, 0, 0), (0, 0, 1), 0)
    )
    # orient wheel axis along X
    wheel = (
        cq.Workplane("XZ", origin=(sx * (MOTOR_X + MOTOR_L / 2 + WHEEL_T / 2), 0, PLATE_T + MOTOR_H / 2))
        .circle(WHEEL_R)
        .extrude(sx * WHEEL_T / 2, both=True)
        .val()
    )
    add(f"Wheel {'L' if sx < 0 else 'R'}", "#15151a", wheel, cq.Vector(sx, 0, 0.2))

# ── Ball caster ───────────────────────────────────────────────────────────────
caster_plate = (
    cq.Workplane("XY", origin=(0, CASTER_Y, PLATE_T))
    .box(40.0, 40.0, 3.0, centered=(True, True, False))
    .val()
)
add("Ball caster", "#c0c7cf", caster_plate, cq.Vector(0, -1, 0.4))
ball = (
    cq.Workplane("XY", origin=(0, CASTER_Y, PLATE_T - 14.0))
    .sphere(14.0)
    .val()
)
add("Caster ball", "#5a5f66", ball, cq.Vector(0, -1, -0.4))

# ── Pico W + battery on base ──────────────────────────────────────────────────
pico = (
    cq.Workplane("XY", origin=(-50, 30, PLATE_T))
    .box(PICO[0], PICO[1], PICO[2], centered=(True, True, False))
    .val()
)
add("Pico W", "#1f7a3d", pico, cq.Vector(-0.6, 0.6, 0.5))

battery = (
    cq.Workplane("XY", origin=(30, 30, PLATE_T))
    .box(BATTERY[0], BATTERY[1], BATTERY[2], centered=(True, True, False))
    .val()
)
add("Battery", "#3a3f46", battery, cq.Vector(0.6, 0.6, 0.5))

# ── Mac mini on shelf ─────────────────────────────────────────────────────────
mac = (
    cq.Workplane("XY", origin=(0, 0, shelf_z + PLATE_T))
    .box(MAC_MINI, MAC_MINI, MAC_MINI_H, centered=(True, True, False))
    .val()
)
add("Mac mini", "#d6dade", mac, cq.Vector(0, 0, 1))

# ── Exports ───────────────────────────────────────────────────────────────────
root = Path(__file__).resolve().parent.parent

asm = cq.Assembly(name="M4-D2 Mobility Kit")
for name, color, shape, _ in PARTS:
    asm.add(shape, name=name, color=cq.Color(color))
step_path = root / "hardware" / "m4d2-assembly.step"
asm.export(str(step_path))
print(f"Wrote {step_path} ({step_path.stat().st_size // 1024} KB)")

# Per-part STL → trimesh scene → GLB for the web viewer
scene = trimesh.Scene()
tmp = Path("/tmp/m4d2-parts")
tmp.mkdir(exist_ok=True)
for idx, (name, color, shape, _) in enumerate(PARTS):
    stl = tmp / f"part{idx}.stl"
    cq.exporters.export(cq.Workplane(obj=shape), str(stl), exportType="STL")
    mesh = trimesh.load(stl)
    scene.add_geometry(mesh, node_name=name, geom_name=name)

glb_path = root / "public" / "3d" / "m4d2.glb"
glb_path.parent.mkdir(exist_ok=True)
scene.export(str(glb_path))
print(f"Wrote {glb_path} ({glb_path.stat().st_size // 1024} KB, {len(PARTS)} parts)")
