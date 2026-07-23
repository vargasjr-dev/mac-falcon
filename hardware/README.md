# M4-D2 chassis plates

These are the two laser-cut plates for the M4-D2 Mobility Kit:

- [`base-plate.dxf`](./base-plate.dxf) — 300 mm round base, motor slots, cliff-sensor apertures, bump-switch mounting holes, M3 standoffs, and ball-caster mounting holes.
- [`shelf-plate.dxf`](./shelf-plate.dxf) — 300 mm round upper shelf, M3 standoffs, Mac Mini placement guide on the `ENGRAVE` layer, and rear cable-routing slot.

## Fabrication

1. Upload both DXF files to [SendCutSend](https://sendcutsend.com/).
2. Select **clear acrylic**, nominal **1/4 in (6.35 mm)** thickness.
3. Keep the files in millimetres. The DXF header declares millimetre units.
4. Treat `CUT` as through-cut geometry and `ENGRAVE` as a placement guide. If the vendor does not offer engraving, omit the `ENGRAVE` layer or use it as a reference only.
5. Deburr the cut edges and dry-fit the motors, sensors, switches, standoffs, and ball caster before final assembly.

## Design assumptions to verify before a production run

- Base and shelf diameter: **300 mm**.
- M3 clearance holes: **3.4 mm**.
- FIT0450 motor slots: **70 × 24 mm**, centered at ±92 mm on the X axis.
- TCRT5000 sensor apertures: **18 × 12 mm** at the four cardinal positions.
- Pololu #953 ball-caster mounting pattern: two **2.8 mm** holes on **20.3 mm** pitch.
- The bump-switch mounting pattern is for a generic small lever micro-switch; verify the selected switch's mounting pitch before cutting.
- The shelf's `ENGRAVE` outline is a 197 × 197 mm Mac Mini 2024 placement guide with 8 mm corner radius; it is not a through-cut.

The source generator is [`generate-dxf.ts`](./generate-dxf.ts). Regenerate both files with:

```bash
bun run hardware:dxf
```
