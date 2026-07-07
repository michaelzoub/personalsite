---
name: svg-scene-positions
description: Make SVG element positions programmatic so dependent elements (arms, labels, connectors) are derived automatically from scene data instead of hardcoded. Use when placing elements relative to other SVG elements in an isometric or 2D scene.
---

# SVG Scene Positions

When an SVG scene contains elements that must be positioned relative to each other (e.g. robotic arms between crop beds, labels above nodes, connectors between ports), never hardcode the dependent positions. Extract the source elements as data and compute the rest.

## Workflow

1. **Identify source elements.** Find the elements that own their position (crop beds, nodes, ports). These are the ground truth.
2. **Extract as data.** Define each source element's geometry as a typed array (polygon corners, center point, bounding box). This replaces scattered coordinates in raw SVG strings.
3. **Write pure helpers.** `center(polygon)`, `midpoint(a, b)`, `offset(point, dx, dy)`. Keep them trivial and composable.
4. **Compute derived positions.** Aisles = midpoints between adjacent source centers. Cross-aisles = midpoints between columns. Add small directional offsets (e.g. forward toward the viewer in isometric) so elements sit naturally, not at dead center.
5. **Pair with per-element properties.** Animation timings, facing directions, colors — merge computed positions with a separate config array so geometry and behavior stay decoupled.
6. **Generate from the same data.** If feasible, render the source SVG elements from the same data array so there is exactly one source of truth. If the SVG is too complex to fully generate, at minimum keep the data array next to the SVG string and add a comment linking them.

## Rules

- Never manually calculate midpoints, offsets, or aisle positions by hand. Always compute them from the data.
- If a position looks wrong, fix the data or the helper — not the output.
- Keep the forward/offset constants named and documented (e.g. `AISLE_FORWARD = 0.6`) so they can be tuned without touching logic.
- Verify computed positions are inside the scene bounds and not on top of source elements.
- Sort source elements by the correct axis (depth in isometric, y in 2D) before pairing adjacent ones.

## Example

```tsx
type Pt = { x: number; y: number }
type CropBed = { id: string; column: 'left' | 'right'; corners: [Pt, Pt, Pt, Pt] }

const CROP_BEDS: CropBed[] = [/* ... */]

function bedCenter(bed: CropBed): Pt { /* average of corners */ }
function midPt(a: Pt, b: Pt): Pt { /* simple midpoint */ }

const AISLE_FORWARD = 0.6

function computeArms(): ArmProps[] {
  const left = CROP_BEDS.filter(b => b.column === 'left')
  const right = CROP_BEDS.filter(b => b.column === 'right')
  const slots = []

  for (const col of [left, right]) {
    for (let i = 0; i < col.length - 1; i++) {
      const m = midPt(bedCenter(col[i]), bedCenter(col[i + 1]))
      slots.push({ pos: { x: m.x, y: m.y + AISLE_FORWARD }, dir: i % 2 ? -1 : 1 })
    }
  }

  // Cross-aisle between columns at mid-depth
  const cross = midPt(bedCenter(left[1]), bedCenter(right[1]))
  slots.push({ pos: { x: cross.x, y: cross.y + AISLE_FORWARD }, dir: 1 })

  return slots.map((s, i) => ({ ...s.pos, ...ARM_TIMINGS[i], face: s.dir > 0 ? 26 : -26, dir: s.dir }))
}
```
