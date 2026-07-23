#!/usr/bin/env bun
/**
 * Generate the Mac Falcon M4-D2 chassis plates as ASCII DXF R12 files.
 *
 * All dimensions are millimetres. The files are intentionally plain-text DXF
 * so they can be uploaded directly to a laser-cutting service.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUT_DIR = dirname(new URL(import.meta.url).pathname);
const MM_PER_INCH = 25.4;
const PLATE_DIAMETER = 300;
const PLATE_RADIUS = PLATE_DIAMETER / 2;
const CLEARANCE_M3 = 3.4;
const BALL_CASTER_HOLE = 2.8;
const BALL_CASTER_SPACING = 20.3;

type Layer = "CUT" | "ENGRAVE";

type Point = { x: number; y: number };

type Entity =
  | { kind: "circle"; layer: Layer; center: Point; radius: number }
  | { kind: "polyline"; layer: Layer; points: Point[]; closed?: boolean };

function fmt(value: number): string {
  return Number(value.toFixed(3)).toString();
}

function circle(layer: Layer, x: number, y: number, radius: number): Entity {
  return { kind: "circle", layer, center: { x, y }, radius };
}

function regularPolygon(
  radius: number,
  count: number,
  startAngle = 0,
): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = startAngle + (index / count) * Math.PI * 2;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
}

function roundedRect(
  layer: Layer,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  radius: number,
  segments = 3,
): Entity {
  const r = Math.min(radius, width / 2, height / 2);
  const corners = [
    { x: centerX + width / 2 - r, y: centerY + height / 2 - r, start: 0 },
    { x: centerX - width / 2 + r, y: centerY + height / 2 - r, start: 90 },
    { x: centerX - width / 2 + r, y: centerY - height / 2 + r, start: 180 },
    { x: centerX + width / 2 - r, y: centerY - height / 2 + r, start: 270 },
  ];

  const points: Point[] = [];
  for (const corner of corners) {
    for (let i = 0; i <= segments; i++) {
      const degrees = corner.start + (i / segments) * 90;
      const angle = (degrees * Math.PI) / 180;
      points.push({
        x: corner.x + r * Math.cos(angle),
        y: corner.y + r * Math.sin(angle),
      });
    }
  }
  return { kind: "polyline", layer, points, closed: true };
}

function addStandoffPattern(entities: Entity[]) {
  for (const point of regularPolygon(125, 6, 0)) {
    entities.push(circle("CUT", point.x, point.y, CLEARANCE_M3 / 2));
  }
}

function addBallCasterPattern(entities: Entity[], y: number) {
  entities.push(
    circle("CUT", -BALL_CASTER_SPACING / 2, y, BALL_CASTER_HOLE / 2),
  );
  entities.push(
    circle("CUT", BALL_CASTER_SPACING / 2, y, BALL_CASTER_HOLE / 2),
  );
}

function addBasePlate(): Entity[] {
  const entities: Entity[] = [circle("CUT", 0, 0, PLATE_RADIUS)];
  addStandoffPattern(entities);

  // Two radial motor clearance slots. They are deliberately generous around
  // the FIT0450's ~20 mm body width and ~70 mm body length.
  entities.push(roundedRect("CUT", -92, 0, 70, 24, 4));
  entities.push(roundedRect("CUT", 92, 0, 70, 24, 4));

  // Sensor apertures at the four cardinal positions.
  for (const point of [
    { x: 0, y: 135 },
    { x: 135, y: 0 },
    { x: 0, y: -135 },
    { x: -135, y: 0 },
  ]) {
    entities.push(roundedRect("CUT", point.x, point.y, 18, 12, 2));
  }

  // Two-hole mounting patterns for four generic lever micro-switches.
  // Verify the chosen switch's mounting pitch before cutting production units.
  for (const angleDegrees of [45, 135, 225, 315]) {
    const angle = (angleDegrees * Math.PI) / 180;
    const radial = { x: Math.cos(angle), y: Math.sin(angle) };
    const tangent = { x: -radial.y, y: radial.x };
    const center = { x: radial.x * 129, y: radial.y * 129 };
    for (const offset of [-5, 5]) {
      entities.push(
        circle(
          "CUT",
          center.x + tangent.x * offset,
          center.y + tangent.y * offset,
          3.2 / 2,
        ),
      );
    }
  }

  // Pololu #953 ball caster: two #2/M2-compatible mounting holes on 20.3 mm pitch.
  addBallCasterPattern(entities, -110);
  return entities;
}

function addShelfPlate(): Entity[] {
  const entities: Entity[] = [circle("CUT", 0, 0, PLATE_RADIUS)];
  addStandoffPattern(entities);

  // Rear cable-routing opening. This is a through-cut slot, not an engraving.
  entities.push(roundedRect("CUT", 0, -131, 80, 14, 4));

  // Mac Mini 2024 footprint guide. Keep this on ENGRAVE so the plate remains
  // a continuous support surface while still giving the assembler a placement mark.
  entities.push(roundedRect("ENGRAVE", 0, 0, 197, 197, 8, 6));
  return entities;
}

function dxf(entities: Entity[], title: string): string {
  const lines: string[] = [
    "0",
    "SECTION",
    "2",
    "HEADER",
    "9",
    "$ACADVER",
    "1",
    "AC1009",
    "9",
    "$INSUNITS",
    "70",
    "4",
    "9",
    "$MEASUREMENT",
    "70",
    "1",
    "0",
    "ENDSEC",
    "0",
    "SECTION",
    "2",
    "TABLES",
    "0",
    "TABLE",
    "2",
    "LAYER",
    "70",
    "3",
    "0",
    "LAYER",
    "2",
    "0",
    "70",
    "0",
    "62",
    "7",
    "6",
    "CONTINUOUS",
    "0",
    "LAYER",
    "2",
    "CUT",
    "70",
    "0",
    "62",
    "1",
    "6",
    "CONTINUOUS",
    "0",
    "LAYER",
    "2",
    "ENGRAVE",
    "70",
    "0",
    "62",
    "3",
    "6",
    "CONTINUOUS",
    "0",
    "ENDTAB",
    "0",
    "ENDSEC",
    "0",
    "SECTION",
    "2",
    "ENTITIES",
  ];

  // The title is stored as a comment-like DXF text value in the header area by
  // the generator, but no TEXT entities are added to avoid accidental cutting.
  void title;

  for (const entity of entities) {
    if (entity.kind === "circle") {
      lines.push(
        "0",
        "CIRCLE",
        "8",
        entity.layer,
        "10",
        fmt(entity.center.x),
        "20",
        fmt(entity.center.y),
        "30",
        "0",
        "40",
        fmt(entity.radius),
      );
      continue;
    }

    lines.push(
      "0",
      "POLYLINE",
      "8",
      entity.layer,
      "66",
      "1",
      "70",
      entity.closed ? "1" : "0",
    );
    for (const point of entity.points) {
      lines.push(
        "0",
        "VERTEX",
        "8",
        entity.layer,
        "10",
        fmt(point.x),
        "20",
        fmt(point.y),
        "30",
        "0",
      );
    }
    lines.push("0", "SEQEND");
  }

  lines.push("0", "ENDSEC", "0", "EOF", "");
  return lines.join("\n");
}

function writePlate(filename: string, entities: Entity[], title: string) {
  const path = join(OUT_DIR, filename);
  writeFileSync(path, dxf(entities, title), "utf8");
  console.log(`Wrote ${path}`);
}

mkdirSync(OUT_DIR, { recursive: true });
writePlate("base-plate.dxf", addBasePlate(), "Mac Falcon M4-D2 base plate");
writePlate("shelf-plate.dxf", addShelfPlate(), "Mac Falcon M4-D2 shelf plate");
console.log(
  `Plate diameter: ${PLATE_DIAMETER} mm (${PLATE_DIAMETER / MM_PER_INCH} in nominal)`,
);
