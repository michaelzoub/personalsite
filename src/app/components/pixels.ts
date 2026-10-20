// The site's rounded-pixel language, shared by the work glyphs and the easter
// egg. Cells pack edge to edge on a square grid so lit cells merge into solid
// masses. Each cell splits into four quadrants, one per corner, shaped by that
// corner's other three cells: a lit quadrant rounds off only when nothing
// touches the corner, and an unlit quadrant takes a fillet when both cells
// beside it are lit. Diagonal neighbors meet at a smooth neck.

export type Cell = [number, number]

const n = (v: number) => +v.toFixed(2)
const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const

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
  const paths = new Map<string, string>()
  const add = (layer: string, d: string) => paths.set(layer, (paths.get(layer) ?? '') + d)

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
      if (layer) {
        if (!h && !v && !layerAt(c + dx, r + dy)) {
          let d = `M${n(cx)} ${n(cy)}H${n(kx)}V${n(ky - dy * R)}`
          d += `C${n(kx)} ${n(ky - dy * R + dy * K)} ${n(kx - dx * R + dx * K)} ${n(ky)} ${n(kx - dx * R)} ${n(ky)}`
          add(layer, d + `H${n(cx)}Z`)
        } else {
          add(layer, `M${n(cx)} ${n(cy)}H${n(kx)}V${n(ky)}H${n(cx)}Z`)
        }
      } else if (h && v) {
        let d = `M${n(kx)} ${n(ky)}H${n(kx - dx * R)}`
        d += `C${n(kx - dx * R + dx * K)} ${n(ky)} ${n(kx)} ${n(ky - dy * R + dy * K)} ${n(kx)} ${n(ky - dy * R)}Z`
        add(v, d)
      }
    }
  }
  return paths
}

// A single-layer mass as one path.
export function pixelPath(cells: Cell[], size: number) {
  return pixelPaths(new Map(cells.map(([c, r]) => [`${c},${r}`, 'on'])), size).get('on') ?? ''
}
