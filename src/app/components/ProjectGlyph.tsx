import type { CSSProperties } from 'react'

// Small dot-matrix icons that stand in for each project's thumbnail. One
// language for all of them: a 19×15 grid of identical dots in one color, no
// background dots, and motion that only changes opacity. Work glyphs show one
// icon at a time and morph between them — dots shared by both shapes stay lit,
// the rest sweep out and trace back in clockwise. Every glyph's resting state is a
// finished frame, so prefers-reduced-motion simply switches motion off.

const COLS = 19
const ROWS = 15
const PITCH = 4

type Kind = 'on' | 'show' | 'pulse' | 'hub' | 'peer'
type Legend = Record<string, { kind: Kind; delay?: (c: number, r: number) => number }>
// `frame` is the seconds each icon owns (hold + transition; the g-m* keyframes
// scale with it). `phase` delays the first morph so glyphs don't start in step.
type Glyph = { art: string[]; legend: Legend } | { frames: string[][]; rest: number; frame: number; phase?: number }

const pin = [
  '..#####..',
  '.#.....#.',
  '#.......#',
  '#..###..#',
  '#..#.#..#',
  '#..###..#',
  '#.......#',
  '.#.....#.',
  '..#...#..',
  '...#.#...',
  '....#....',
]

const roundBot = [
  '....#....',
  '....#....',
  '..#####..',
  '.#.....#.',
  '#.......#',
  '#..#.#..#',
  '#.......#',
  '#..###..#',
  '#.......#',
  '.#.....#.',
  '..#####..',
]

const boxBot = [
  '..#...#..',
  '..#...#..',
  '#########',
  '#.......#',
  '#.#####.#',
  '#.#####.#',
  '#.......#',
  '#.......#',
  '#.#.#.#.#',
  '#.......#',
  '#########',
]

const dollar = [
  '...#...',
  '.#####.',
  '#..#..#',
  '#..#...',
  '#..#...',
  '.#####.',
  '...#..#',
  '...#..#',
  '#..#..#',
  '.#####.',
  '...#...',
]

const user = [
  '...###...',
  '..#...#..',
  '..#...#..',
  '..#...#..',
  '...###...',
  '.........',
  '..#####..',
  '.#.....#.',
  '#.......#',
  '#.......#',
  '#########',
]

const glyphs: Record<string, Glyph> = {
  // MapBench — a map pin turns into an agent.
  mapbench: { frames: [pin, roundBot], rest: 1, frame: 2.6 },
  // Rubicon — an agent pays, and the money reaches a writer.
  rubicon: { frames: [boxBot, dollar, user], rest: 0, frame: 3.4, phase: 1.2 },
  // The biggest hurdle to AGI — the folds wire up one by one, then it sparks.
  'biggest-hurdle-agi': {
    art: [
      '...................',
      '...................',
      '...................',
      's....####.####....s',
      '.s..#....#....#..s.',
      '...#.ff..#..ff.#...',
      '...#...f.#.f...#...',
      'ss..#....#....#..ss',
      '...#.ff..#..ff.#...',
      '...#...f.#.f...#...',
      '.s..#....#....#..s.',
      's....####.####....s',
      '...................',
      '...................',
      '...................',
    ],
    legend: {
      '#': { kind: 'on' },
      f: { kind: 'show', delay: (c, r) => (r > 7 ? 300 : 0) + (c > 9 ? 150 : 0) + (4 - Math.abs(c - 9)) * 50 },
      s: { kind: 'pulse' },
    },
  },
  // Decentralizing AI — one hub and its spokes give way to a ring of peers.
  'decentralizing-ai': {
    art: [
      '...................',
      '...................',
      '......n.....n......',
      '.....nnnooonnn.....',
      '.....ons...sno.....',
      '....o...s.s...o....',
      '..no....shs....on..',
      '.nnnsssshhhssssnnn.',
      '..no....shs....on..',
      '....o...s.s...o....',
      '.....ons...sno.....',
      '.....nnnooonnn.....',
      '......n.....n......',
      '...................',
      '...................',
    ],
    legend: {
      n: { kind: 'on' },
      h: { kind: 'hub' },
      s: { kind: 'hub' },
      o: { kind: 'peer', delay: (c, r) => ((Math.atan2(r - 7, c - 9) + Math.PI) / (2 * Math.PI)) * 700 },
    },
  },
}

// Centers an icon on the grid; returns whether a cell is lit.
function lit(icon: string[], c: number, r: number) {
  const x = c - ((COLS - icon[0].length) >> 1)
  const y = r - ((ROWS - icon.length) >> 1)
  return icon[y]?.[x] === '#'
}

const dot = (c: number, r: number, className: string, style?: CSSProperties) => (
  <circle key={`${c}-${r}`} cx={c * PITCH + PITCH / 2} cy={r * PITCH + PITCH / 2} r="1.3" className={className} style={style} />
)

const cells = Array.from({ length: COLS * ROWS }, (_, i) => [i % COLS, Math.floor(i / COLS)] as const)

export function ProjectGlyph({ id }: { id: string }) {
  const glyph = glyphs[id]
  if (!glyph) return null

  if ('frames' in glyph) {
    const { frames, rest, frame, phase = 0 } = glyph
    return (
      <svg className="glyph" viewBox={`0 0 ${COLS * PITCH} ${ROWS * PITCH}`} style={{ '--dur': `${frames.length * frame}s` } as CSSProperties} aria-hidden="true">
        {cells.map(([c, r]) => {
          const bits = frames.map((f) => (lit(f, c, r) ? '1' : '0')).join('')
          if (!bits.includes('1')) return null
          if (!bits.includes('0')) return dot(c, r, 'g-dot g-on')
          // Clockwise from twelve o'clock, so shapes trace over like the network glyph's ring.
          const turn = (Math.atan2(c - (COLS >> 1), (ROWS >> 1) - r) + 2 * Math.PI) % (2 * Math.PI)
          const delay = Math.round(phase * 1000 + (turn / (2 * Math.PI)) * 600)
          return dot(c, r, `g-dot g-morph${bits[rest] === '1' ? ' is-rest' : ''}`, { animationName: `g-m${bits}`, '--d': `${delay}ms` } as CSSProperties)
        })}
      </svg>
    )
  }

  return (
    <svg className="glyph" viewBox={`0 0 ${COLS * PITCH} ${ROWS * PITCH}`} aria-hidden="true">
      {cells.map(([c, r]) => {
        const entry = glyph.legend[glyph.art[r][c]]
        if (!entry) return null
        const delay = entry.delay?.(c, r)
        return dot(c, r, `g-dot g-${entry.kind}`, delay ? ({ '--d': `${Math.round(delay)}ms` } as CSSProperties) : undefined)
      })}
    </svg>
  )
}
