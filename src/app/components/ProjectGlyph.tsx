import type { CSSProperties, ReactNode } from 'react'
import { pixelPath, type Cell } from './pixels'

// Small pixel icons that stand in for each project's thumbnail. One language
// for all of them: a coarse 7×7 grid of cells in one color, drawn as rounded
// pixel masses (see ./pixels), with unlit cells inside a mass as rounded holes.
// Each glyph is a single icon with one quiet, looping motion — never a cycle of
// icons. Every glyph's resting state is a finished frame, so
// prefers-reduced-motion simply switches motion off.

const COLS = 7
const ROWS = 7
const CELL = 8

// `on` is part of the mass; `ping` pulses out and fades; `blink` briefly fills
// a hole (an eye closing); `spark` half-fills a hole and lets it fade.
type Kind = 'on' | 'ping' | 'blink' | 'spark'
type Legend = Record<string, { kind: Kind; delay?: number }>
type Glyph = { art: string[]; legend: Legend } | { spread: true }

const on = { '#': { kind: 'on' } } satisfies Legend

const glyphs: Record<string, Glyph> = {
  // MapBench — a map pin pings the ground, dots rippling out below its tip.
  mapbench: {
    art: [
      '..###..',
      '.##.##.',
      '.#####.',
      '..###..',
      '...#...',
      '.......',
      'o.i.i.o',
    ],
    legend: { ...on, i: { kind: 'ping' }, o: { kind: 'ping', delay: 180 } },
  },
  // Rubicon — an agent, blinking now and then.
  rubicon: {
    art: [
      '...#...',
      '.#####.',
      '##e#e##',
      '.#####.',
      '..#.#..',
    ],
    legend: { ...on, e: { kind: 'blink' } },
  },
  // Decentralizing AI — one solid block breaks apart into a mesh of peers,
  // then signals hop between them.
  'decentralizing-ai': { spread: true },
  // The biggest hurdle to AGI — a brain, a spark passing back and forth
  // between its halves without pause.
  'biggest-hurdle-agi': {
    art: [
      '.##.##.',
      '###.###',
      '#l###r#',
      '###.###',
      '.##.##.',
    ],
    legend: { ...on, l: { kind: 'spark' }, r: { kind: 'spark', delay: 1600 } },
  },
}

function legendGlyph(art: string[], legend: Legend) {
  // Center the art on the grid.
  const ox = (COLS - art[0].length) >> 1
  const oy = (ROWS - art.length) >> 1
  const layers = new Map<string, { kind: Kind; delay: number; cells: Cell[] }>()
  art.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      const entry = legend[ch]
      if (!entry) return
      const key = `${entry.kind}-${entry.delay ?? 0}`
      if (!layers.has(key)) layers.set(key, { kind: entry.kind, delay: entry.delay ?? 0, cells: [] })
      layers.get(key)!.cells.push([c + ox, r + oy])
    }),
  )
  return [...layers.entries()].map(([key, { kind, delay, cells }]) => {
    const style = delay ? ({ '--d': `${delay}ms` } as CSSProperties) : undefined
    // Blinks and sparks fill a hole with a plain square, a hair oversized so
    // it tucks under the mass around it and leaves no seam.
    const d =
      kind === 'blink' || kind === 'spark'
        ? cells.map(([c, r]) => `M${c * CELL - .5} ${r * CELL - .5}h${CELL + 1}v${CELL + 1}h${-CELL - 1}Z`).join('')
        : pixelPath(cells, CELL)
    return <path key={key} className={`g-dot g-${kind}`} style={style} d={d} />
  })
}

// The spread: a 3×3 block at the center whose cells drift out to a 3×3
// lattice spanning the grid. Cells render at their lattice spot and start
// offset back into the block; the fused block fades as it splits, then faint
// hairlines link each peer to its neighbors — a mesh with no center — and
// links light up one after another in a scattered order, like peers talking.
const BLOCK = 2
const LINK = 1.2
// Pulse order for the links, horizontal then vertical, row by row.
const TALK = [3, 9, 0, 6, 11, 1, 7, 4, 10, 2, 8, 5]
function spread() {
  const block: Cell[] = []
  const links: ReactNode[] = []
  const peers: ReactNode[] = []
  const talk = () => ({ '--d': `${TALK[links.length] * 500}ms` }) as CSSProperties
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      const lc = i * 3
      const lr = j * 3
      block.push([BLOCK + i, BLOCK + j])
      if (i < 2) links.push(<rect key={`lh-${i}-${j}`} className="g-dot g-link" style={talk()} x={(lc + 1) * CELL} y={lr * CELL + (CELL - LINK) / 2} width={2 * CELL} height={LINK} />)
      if (j < 2) links.push(<rect key={`lv-${i}-${j}`} className="g-dot g-link" style={talk()} x={lc * CELL + (CELL - LINK) / 2} y={(lr + 1) * CELL} width={LINK} height={2 * CELL} />)
      const style = { '--tx': `${(BLOCK + i - lc) * CELL}px`, '--ty': `${(BLOCK + j - lr) * CELL}px` } as CSSProperties
      peers.push(<path key={`p-${i}-${j}`} className="g-dot g-spread" style={style} d={pixelPath([[lc, lr]], CELL)} />)
    }
  }
  return [...links, ...peers, <path key="block" className="g-dot g-fuse" d={pixelPath(block, CELL)} />]
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg className="glyph" viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} aria-hidden="true">
      {children}
    </svg>
  )
}

export function ProjectGlyph({ id }: { id: string }) {
  const glyph = glyphs[id]
  if (!glyph) return null
  if ('spread' in glyph) return <Svg>{spread()}</Svg>

  return <Svg>{legendGlyph(glyph.art, glyph.legend)}</Svg>
}
