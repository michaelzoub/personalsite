// The site's rounded-pixel language, shared by the work glyphs and the easter
// egg. Cells pack edge to edge on a square grid so lit cells merge into solid
// masses. Each cell splits into four quadrants, one per corner, shaped by that
// corner's other three cells: a lit quadrant rounds off only when nothing
// touches the corner, and an unlit quadrant takes a fillet when both cells
// beside it are lit. Diagonal neighbors meet at a smooth neck.
//
// The quadrants are only scaffolding. Painted one by one they leave hairline
// seams wherever the rasterizer antialiases each piece on its own (iOS Safari,
// zoomed in), so edges two pieces of a layer share cancel out and what's left
// is traced into one outline per layer.

export type Cell = [number, number]

type Point = [number, number]
// With handles it's a cubic, otherwise a straight line.
type Edge = { from: Point; to: Point; c1?: Point; c2?: Point }

const n = (v: number) => +v.toFixed(2)
const at = (x: number, y: number): Point => [n(x), n(y)]
const id = ([x, y]: Point) => `${x},${y}`
const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const

// A closed piece through `points`; `arcs` holds the handles for the edge
// leaving a point. Every piece winds the same way, so two pieces always run a
// shared edge in opposite directions.
function piece(points: Point[], arcs: Record<number, [Point, Point]> = {}): Edge[] {
  const edges = points.map((from, i) => ({ from, to: points[(i + 1) % points.length], c1: arcs[i]?.[0], c2: arcs[i]?.[1] }))
  const area = edges.reduce((sum, { from, to }) => sum + from[0] * to[1] - to[0] * from[1], 0)
  return area > 0 ? edges : edges.reverse().map(({ from, to, c1, c2 }) => ({ from: to, to: from, c1: c2, c2: c1 }))
}

// Chains a layer's outer edges into closed loops.
function trace(edges: Edge[]) {
  const lines = new Set(edges.filter((edge) => !edge.c1).map((edge) => `${id(edge.from)}>${id(edge.to)}`))
  const outer = edges.filter((edge) => edge.c1 || !lines.has(`${id(edge.to)}>${id(edge.from)}`))
  const from = new Map<string, Edge[]>()
  for (const edge of outer) from.set(id(edge.from), [...(from.get(id(edge.from)) ?? []), edge])

  const used = new Set<Edge>()
  let d = ''
  for (const first of outer) {
    if (used.has(first)) continue
    const loop: Edge[] = []
    for (let edge: Edge | undefined = first; edge && !used.has(edge); edge = from.get(id(edge.to))?.find((next) => !used.has(next))) {
      used.add(edge)
      const prev = loop[loop.length - 1]
      // Runs of collinear lines collapse into one segment.
      if (prev && !prev.c1 && !edge.c1 && collinear(prev, edge)) loop[loop.length - 1] = { from: prev.from, to: edge.to }
      else loop.push(edge)
    }
    d += `M${first.from.join(' ')}`
    for (const { to, c1, c2 } of loop) d += c1 && c2 ? `C${c1.join(' ')} ${c2.join(' ')} ${to.join(' ')}` : `L${to.join(' ')}`
    d += 'Z'
  }
  return d
}

const collinear = (a: Edge, b: Edge) =>
  (a.to[0] - a.from[0]) * (b.to[1] - b.from[1]) === (a.to[1] - a.from[1]) * (b.to[0] - b.from[0])

// Outlines for a mass whose cells carry a layer (a color, say), one path per
// layer. The shape is decided by the whole mass, so layers that touch still
// read as one piece; a fillet takes the layer of the cell above or below it.
export function pixelPaths(cells: Map<string, string>, size: number) {
  const half = size / 2
  // Corner radius, shared by rounded corners and fillets so the two read as one curve.
  const R = size * .275
  // Cubic handle length for a quarter circle.
  const K = .5523 * R
  const layerAt = (c: number, r: number) => cells.get(`${c},${r}`)
  const pieces = new Map<string, Edge[]>()
  const add = (layer: string, edges: Edge[]) => pieces.set(layer, [...(pieces.get(layer) ?? []), ...edges])

  // Lit cells plus their unlit neighbors, which may hold fillets.
  const visit = new Set<string>()
  for (const key of cells.keys()) {
    const [c, r] = key.split(',').map(Number)
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) visit.add(`${c + dc},${r + dr}`)
  }

  for (const key of visit) {
    const [c, r] = key.split(',').map(Number)
    const layer = layerAt(c, r)
    const cx = c * size + half
    const cy = r * size + half
    for (const [dx, dy] of CORNERS) {
      const h = layerAt(c + dx, r)
      const v = layerAt(c, r + dy)
      const kx = cx + dx * half
      const ky = cy + dy * half
      // The quadrant's corner, plus the points a radius back from it along
      // each cell edge, where rounded corners and fillets start.
      const corner = at(kx, ky)
      const onSide = at(kx, ky - dy * R)
      const onRow = at(kx - dx * R, ky)
      const handles: [Point, Point] = [at(kx, ky - dy * R + dy * K), at(kx - dx * R + dx * K, ky)]
      if (layer) {
        const outline = [at(cx, cy), at(kx, cy), onSide]
        if (!h && !v && !layerAt(c + dx, r + dy)) add(layer, piece([...outline, onRow, at(cx, ky)], { 2: handles }))
        else add(layer, piece([...outline, corner, onRow, at(cx, ky)]))
      } else if (h && v) {
        add(v, piece([corner, onRow, onSide], { 1: [handles[1], handles[0]] }))
      }
    }
  }
  return new Map([...pieces].map(([layer, edges]) => [layer, trace(edges)]))
}

// A single-layer mass as one path.
export function pixelPath(cells: Cell[], size: number) {
  return pixelPaths(new Map(cells.map(([c, r]) => [`${c},${r}`, 'on'])), size).get('on') ?? ''
}
