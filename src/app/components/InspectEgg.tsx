'use client'

import gsap from 'gsap'
import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { LuArrowUpRight, LuX } from 'react-icons/lu'
import { palette } from '../data/palette'
import { pixelPaths } from './pixels'
import { BrandStripes } from './BrandMark'

// Easter egg: dwell in the top-right corner (tap or press it on touch) and a
// care package shoots to the center, unfolds into a dialog, and "Start" turns the page into its box model
// (margins, padding, gaps) with a track playing underneath.

type Stage = 'idle' | 'flight' | 'dialog' | 'inspect'
type Edges = [number, number, number, number]
type Rect = { x: number; y: number; w: number; h: number }
// pin: index of the sticky/fixed ancestor the box rides along with, or -1.
type Box = Rect & { depth: number; pin: number; margin: Edges; padding: Edges; border: Edges; tag?: string; tagShift?: number }
type Gap = Rect & { value: number; pin: number }
// A sticky or fixed element and where it sat in the document when measured.
type Pin = { el: Element; x: number; y: number }
type Layout = { boxes: Box[]; gaps: Gap[]; pins: Pin[] }
type Hover = Rect & { name: string; className: string; margin: Edges; padding: Edges; border: Edges }

const TRACK = { src: '/audio/texture-401.mp3', title: 'Texture 401', artist: 'Joachim Spieth' }
const DWELL_MS = 320
// Touch has no hover, so the corner answers to a tap or a short press instead.
const CORNER = 72
const TAP_SLOP = 10
const FLIGHT_MS = 820
const TRAIL_LAG_MS = 170
const DIALOG_W = 440
// The gray tray around the white card: card radius 10 + tray padding 8.
const DIALOG_R = 18
const TRAY = '#f2f5f9'
// Shadow only, no stroke, same as the inspect HUD.
const SHADOW = '0 8px 24px rgba(15,28,48,.08), 0 1px 3px rgba(15,28,48,.05)'

// Chrome's box-model colors, swapped for the logo's five stripes.
const [red, orange, yellow, amber] = palette.map((color) => color.base)
const colorVars = { '--gap': red, '--margin': orange, '--padding': yellow, '--hover': amber } as CSSProperties
const amberTint = palette[3].tint

const LANDMARKS = new Set(['MAIN', 'HEADER', 'SECTION', 'NAV', 'ARTICLE', 'ASIDE', 'FOOTER', 'UL', 'OL', 'FIGURE', 'H1', 'H2'])
const LEAVES = new Set(['SVG', 'PRE', 'CANVAS', 'VIDEO', 'IFRAME', 'PICTURE'])
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'BR'])
const MAX_BOXES = 500
const TAG_CHAR = 5.6 // 9px Roboto Mono advance, for laying tags side by side

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fmt = (value: number) => String(Math.round(value * 10) / 10)
const px = (edges: Edges) => edges.map((v) => `${v}px`).join(' ')

function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

/* The package, in the work glyphs' rounded-pixel language: an ink lid over a
   body striped in the logo's five colors, one column each. */
const PX = 8
const PACKAGE = [
  '#######',
  '.12345.',
  '.12345.',
  '.12345.',
  '.12345.',
]
const PK_W = PACKAGE[0].length * PX
const PK_H = PACKAGE.length * PX
const packagePaths = Array.from(pixelPaths(
  new Map(PACKAGE.flatMap((row, r) => [...row].flatMap((ch, c) =>
    ch === '.' ? [] : [[`${c},${r}`, ch === '#' ? 'currentColor' : palette[Number(ch) - 1].base] as const],
  ))),
  PX,
))

function PackageGlyph() {
  return (
    <svg className="egg-package" width={PK_W} height={PK_H} viewBox={`0 0 ${PK_W} ${PK_H}`} aria-hidden="true">
      {packagePaths.map(([fill, d]) => <path key={fill} fill={fill} d={d} />)}
    </svg>
  )
}

export function InspectEgg() {
  const [mounted, setMounted] = useState(false)
  const [stage, setStage] = useState<Stage>('idle')
  const [trail, setTrail] = useState(false)
  const dwell = useRef<number>()
  const audio = useRef<HTMLAudioElement | null>(null)
  const fade = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      window.clearTimeout(dwell.current)
      fade.current?.kill()
      audio.current?.pause()
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (stage === 'inspect') root.dataset.inspect = ''
    else delete root.dataset.inspect
  }, [stage])

  const launch = () => {
    if (reducedMotion()) return setStage('dialog')
    setTrail(true)
    setStage('flight')
  }
  const launchRef = useLatest(launch)

  // A listener rather than a hit zone, so the corner never swallows taps meant
  // for the page. Scrolling cancels the pointer, so a swipe that starts in the
  // corner doesn't count.
  useEffect(() => {
    if (stage !== 'idle') return
    let start: { id: number; x: number; y: number } | null = null
    let timer = 0
    const reset = () => {
      window.clearTimeout(timer)
      start = null
    }
    const fire = () => {
      reset()
      launchRef.current()
    }
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || !event.isPrimary) return
      if (event.clientX < window.innerWidth - CORNER || event.clientY > CORNER) return
      start = { id: event.pointerId, x: event.clientX, y: event.clientY }
      timer = window.setTimeout(fire, DWELL_MS)
    }
    const onMove = (event: PointerEvent) => {
      if (start?.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP) reset()
    }
    // Deferred past the tap's own click, so it can't land on the new backdrop.
    const onUp = (event: PointerEvent) => {
      if (start?.id !== event.pointerId) return
      window.clearTimeout(timer)
      timer = window.setTimeout(fire, 0)
    }
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', reset)
    return () => {
      reset()
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', reset)
    }
  }, [stage, launchRef])

  // Called inside the click handler so the browser treats it as user-initiated.
  const play = () => {
    const track = audio.current ?? new Audio(TRACK.src)
    audio.current = track
    track.loop = true
    // Wire Web Audio here, inside the click, so the context is allowed to run.
    // Volume lives on a gain node after the analyser, so the EQ always hears
    // the track at full level.
    const level = levelFor(track)
    level.value = 0
    void track.play().catch(() => {})
    fade.current?.kill()
    fade.current = gsap.to(level, { value: .6, duration: 1.8, ease: 'power1.out' })
  }

  const stop = () => {
    const track = audio.current
    if (!track) return
    fade.current?.kill()
    fade.current = gsap.to(levelFor(track), {
      value: 0,
      duration: .6,
      ease: 'power1.in',
      onComplete: () => {
        track.pause()
        track.currentTime = 0
      },
    })
  }

  if (!mounted) return null

  return createPortal(
    <>
      {stage === 'idle' && (
        <div
          className="egg-zone"
          data-egg
          aria-hidden="true"
          onPointerEnter={() => { dwell.current = window.setTimeout(launch, DWELL_MS) }}
          onPointerLeave={() => window.clearTimeout(dwell.current)}
        />
      )}
      {stage === 'idle' && <PullEgg onTrigger={launch} />}
      {trail && <Flight onLand={() => setStage('dialog')} onDone={() => setTrail(false)} />}
      {stage === 'dialog' && <CarePackage onStart={play} onClosed={(started) => setStage(started ? 'inspect' : 'idle')} />}
      {stage === 'inspect' && <Blueprint audio={audio.current} onExit={() => { stop(); setStage('idle') }} />}
    </>,
    document.body,
  )
}

/* PullEgg: a second way in. Keep scrolling past the bottom of the page: after
   ~1000px of pulling (any upward scroll resets it) the page grows a runway and
   the logo's five stripes rise across the full width, middle first, then its
   neighbors, then the outer pair. At the end of the runway the stripes warp
   into a sliver and the care package launches. */
const PULL_ARM = 2200
const RUNWAY_VH = 12
// Seconds the stripes take to catch up with the scroll, so one big flick
// plays out as a glide instead of a jump.
const CATCH_UP = 1.4
// Reveal: where each stripe starts rising, as a fraction of the runway (middle, neighbors, edges).
const STRIPE_START = [.3, .15, 0, .15, .3]
const STRIPE_SPAN = .15
// Squeeze: after the reveal the band narrows to the flight trail's width (one PX per color),
// eased so every scrolled pixel moves it a little less than the last.
const SQUEEZE_FROM = .5
const SQUEEZE_TO = .97
// The trail's head never reaches the bottom: it leads the eye at this fraction
// of the viewport, so scrolling feels like following it down.
const HEAD_AT = .62

function PullEgg({ onTrigger }: { onTrigger: () => void }) {
  const [armed, setArmed] = useState(false)
  const runway = useRef<HTMLDivElement>(null)
  const band = useRef<HTMLDivElement>(null)
  const stripes = useRef<(HTMLSpanElement | null)[]>([])
  const triggerRef = useLatest(onTrigger)

  // Phase 1: count scroll intent at the very bottom, where the page can't move.
  useEffect(() => {
    if (armed) return
    let pull = 0
    let touchY: number | null = null
    const atBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
    const add = (delta: number) => {
      if (delta < 0) return void (pull = 0)
      if (!atBottom()) return
      pull += delta
      if (pull >= PULL_ARM) setArmed(true)
    }
    const onWheel = (event: WheelEvent) => add(event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1))
    const onTouchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? null }
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY
      if (touchY === null || y === undefined) return
      add(touchY - y)
      touchY = y
    }
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) add(120)
      else if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) add(-1)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [armed])

  // Phase 2: the runway is real scroll space; progress through it raises, then squeezes, the stripes.
  useEffect(() => {
    const el = runway.current
    const strip = band.current
    if (!armed || !el || !strip) return
    let leaving = false
    let lastY = window.scrollY
    const clamp = (v: number) => Math.min(1, Math.max(0, v))
    const update = () => {
      if (leaving) return
      const top = el.getBoundingClientRect().top + window.scrollY
      const y = window.scrollY
      const goingUp = y < lastY - 1
      lastY = y
      // Scrolling back above the runway resets the egg.
      if (goingUp && y + window.innerHeight < top + 40) return setArmed(false)
      const target = clamp((y + window.innerHeight - top) / el.offsetHeight)
      render()
      chase?.kill()
      chase = gsap.to(state, { progress: target, duration: CATCH_UP, ease: 'power2.out', onUpdate: render })
    }
    const state = { progress: 0 }
    let chase: gsap.core.Tween | null = null
    const render = () => {
      if (leaving) return
      const { progress } = state
      // Middle stripe runs from the end of the page to the head; the others
      // catch up behind it, so the head reads as a stepped point.
      const bandTop = Math.max(0, el.getBoundingClientRect().top)
      const reach = Math.max(0, window.innerHeight * HEAD_AT - bandTop) / window.innerHeight
      stripes.current.forEach((stripe, i) => {
        if (stripe) gsap.set(stripe, { scaleY: reach * gsap.parseEase('power2.out')(clamp((progress - STRIPE_START[i]) / STRIPE_SPAN)) })
      })
      const squeeze = gsap.parseEase('power3.out')(clamp((progress - SQUEEZE_FROM) / (SQUEEZE_TO - SQUEEZE_FROM)))
      const full = el.clientWidth
      gsap.set(strip, { width: Math.round(full + (PX * palette.length - full) * squeeze) })
      if (progress >= SQUEEZE_TO) exit()
    }
    // The thin band slides off to the right; the page returns to the top and
    // the package flies back in from the corner, trail first.
    const exit = () => {
      leaving = true
      const done = () => {
        document.documentElement.style.overflow = ''
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
        setArmed(false)
        triggerRef.current()
      }
      if (reducedMotion()) return done()
      document.documentElement.style.overflow = 'hidden'
      // Swap the band for five parallel strokes that run down, bend through a
      // quarter turn and stream off the right edge, the way the flight's trail
      // follows its curve. A dash window slides along each path, so the ribbon
      // flows around the corner instead of moving as a rigid block.
      const box = strip.getBoundingClientRect()
      const w = window.innerWidth
      const h = window.innerHeight
      const cx = box.left + box.width / 2
      const R = Math.min(w, h) * .22
      const bend = h * HEAD_AT
      const NS = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(NS, 'svg')
      svg.setAttribute('class', 'pull-exit')
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      const paths = palette.map((color, i) => {
        const o = (i - 2) * PX
        const r = R - o
        const path = document.createElementNS(NS, 'path')
        path.setAttribute('d', `M ${cx + o} ${box.top - 2} V ${bend} A ${r} ${r} 0 0 0 ${cx + R} ${bend + r} H ${w + h}`)
        path.setAttribute('stroke', color.base)
        path.setAttribute('stroke-width', String(PX + 1))
        path.setAttribute('fill', 'none')
        svg.appendChild(path)
        return path
      })
      document.body.appendChild(svg)
      const visible = bend - box.top + 2
      paths.forEach((path) => {
        const len = path.getTotalLength()
        path.style.strokeDasharray = `${visible} ${len + visible}`
        path.style.strokeDashoffset = '0'
        path.dataset.len = String(len)
      })
      gsap.set(strip, { opacity: 0 })
      gsap.timeline({ onComplete: () => { svg.remove(); done() } })
        .to(paths, {
          strokeDashoffset: (_, path: SVGPathElement) => -Number(path.dataset.len),
          duration: 1.1,
          ease: 'power2.in',
        })
        .to({}, { duration: .1 })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    const stopChase = () => chase?.kill()
    window.addEventListener('resize', update)
    return () => {
      stopChase()
      document.documentElement.style.overflow = ''
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [armed, triggerRef])

  if (!armed) return null
  return (
    <div ref={runway} className="pull-runway" data-egg aria-hidden="true" style={{ height: `${RUNWAY_VH * 100}vh` }}>
      <div ref={band} className="pull-stripes">
        {palette.map((color, i) => (
          <span key={color.name} ref={(node) => { stripes.current[i] = node }} style={{ background: color.base }} />
        ))}
      </div>
    </div>
  )
}

/* EqMark: the logo as a live level meter. Each stripe follows one slice of
   the track's spectrum, low on the left to high on the right, so it moves
   with the music instead of looping. Falls back to the CSS loop if Web Audio
   isn't available. */
const EQ_BANDS: [number, number][] = [[40, 120], [120, 400], [400, 1500], [1500, 5000], [5000, 14000]]
const EQ_FLOOR = .22
const EQ_ATTACK = .55
const EQ_RELEASE = .3
// Each band is mapped through its own recent floor-to-peak range: the low end
// never drops near zero on this track (pinned bars), and 1.5–5k is ~15x quieter
// than the bass (a dead bar). Edges snap outward fast and relax inward slowly.
const EQ_RANGE_MIN = .01 // with the 12%-of-peak floor below, keeps silence from turning into noise
const EQ_RANGE_RELAX = .012 // per frame (~1.5s), toward the current level
const EQ_CURVE = 1.6
// A media element can only be wired into Web Audio once, so the graph lives on
// the element itself. A module-level cache would be wiped by hot reload while
// the element survives, and the second wiring would throw.
// Graph: element -> analyser -> gain -> speakers. The element stays at full
// volume so the analyser sees the real signal; fades happen on the gain.
type AudioGraph = { analyser: AnalyserNode; gain: GainNode }
type WiredAudio = HTMLAudioElement & { __eqGraph?: AudioGraph }

function graphFor(audio: WiredAudio): AudioGraph | null {
  const cached = audio.__eqGraph
  if (cached) {
    void (cached.analyser.context as AudioContext).resume()
    return cached
  }
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  const context = new Ctx()
  const analyser = context.createAnalyser()
  analyser.fftSize = 1024
  analyser.smoothingTimeConstant = .6
  const gain = context.createGain()
  context.createMediaElementSource(audio).connect(analyser)
  analyser.connect(gain)
  gain.connect(context.destination)
  void context.resume()
  audio.__eqGraph = { analyser, gain }
  return audio.__eqGraph
}

// Something GSAP can tween as a plain number: the gain if Web Audio is wired,
// otherwise the element's own volume.
function levelFor(audio: HTMLAudioElement) {
  let graph: AudioGraph | null = null
  try { graph = graphFor(audio) } catch (error) { console.warn('Audio graph unavailable', error) }
  if (graph) {
    audio.volume = 1
    const gain = graph.gain.gain
    return { get value() { return gain.value }, set value(v: number) { gain.value = v } }
  }
  return { get value() { return audio.volume }, set value(v: number) { audio.volume = v } }
}

function EqMark({ audio }: { audio: HTMLAudioElement | null }) {
  const bars = useRef<(HTMLElement | null)[]>([])
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (!audio || reducedMotion()) return
    let analyser: AnalyserNode | null = null
    try { analyser = graphFor(audio)?.analyser ?? null } catch (error) {
      console.warn('EqMark: falling back to the CSS loop', error)
      return
    }
    if (!analyser) return
    setLive(true)
    const bins = new Uint8Array(analyser.frequencyBinCount)
    const hz = analyser.context.sampleRate / analyser.fftSize
    const levels = EQ_BANDS.map(() => EQ_FLOOR)
    const lows = EQ_BANDS.map(() => 1)
    const highs = EQ_BANDS.map(() => 0)
    let frame = 0
    const tick = () => {
      analyser!.getByteFrequencyData(bins)
      EQ_BANDS.forEach(([lo, hi], i) => {
        const from = Math.max(1, Math.floor(lo / hz))
        const to = Math.max(from + 1, Math.ceil(hi / hz))
        let sum = 0
        for (let b = from; b < to; b++) sum += bins[b]
        const energy = sum / (to - from) / 255
        lows[i] = energy < lows[i] ? energy : lows[i] + (energy - lows[i]) * EQ_RANGE_RELAX
        highs[i] = energy > highs[i] ? energy : highs[i] + (energy - highs[i]) * EQ_RANGE_RELAX
        // Eased so the bars rest mid-height and kick up on hits instead of hugging the top.
        const raw = Math.pow(Math.min(1, Math.max(0, (energy - lows[i]) / Math.max(EQ_RANGE_MIN, highs[i] * .12, highs[i] - lows[i]))), EQ_CURVE)
        const target = EQ_FLOOR + (1 - EQ_FLOOR) * raw
        levels[i] += (target - levels[i]) * (target > levels[i] ? EQ_ATTACK : EQ_RELEASE)
        const bar = bars.current[i]
        if (bar) bar.style.height = `${(levels[i] * 100).toFixed(1)}%`
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [audio])

  return (
    <span className="egg-hud-mark" data-live={live || undefined} aria-hidden="true">
      {palette.map((color, i) => (
        <i key={color.name} ref={(node) => { bars.current[i] = node }} style={{ '--c': color.base } as CSSProperties} />
      ))}
    </span>
  )
}

/* Flight: the five-stripe ribbon arcs from the corner down to the center, its
   leading edge stopping exactly where the package's body ends. Then the
   package's own lid (the same ink row) swipes in from the side, overshoots a
   hair and settles, cutting all five bars at once: what's below becomes the
   box, what's above fades where it is. While the ribbon bends, its ends fan
   out a little (inner lanes lead), like the pull egg's exit; both ends square
   off as it lands. The box then fades in place as the dialog grows under it. */
const LID_W = PK_W
const lidPaths = Array.from(pixelPaths(
  new Map([...PACKAGE[0]].flatMap((ch, c) => ch === '#' ? [[`${c},0`, 'currentColor'] as const] : [])),
  PX,
))

function Flight({ onLand, onDone }: { onLand: () => void; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lidRef = useRef<HTMLDivElement>(null)
  const callbacks = useLatest({ onLand, onDone })

  useEffect(() => {
    const canvas = canvasRef.current
    const lid = lidRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !lid || !ctx) {
      callbacks.current.onLand()
      callbacks.current.onDone()
      return
    }

    const { width: w, height: h } = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    // The package as the dialog will draw it: centered in the viewport.
    const boxTop = Math.round(h / 2 - PK_H / 2)
    const boxLeft = Math.round(w / 2 - PK_W / 2)
    const cutY = boxTop + PX // bottom of the lid row

    // The curve ends at the bottom of the box, arriving straight down so the
    // five lanes line up with the body's five columns.
    // A quadratic arc from the corner to a point above the box, then a true
    // straight drop, so the bars are perfectly vertical where the lid cuts.
    const DROP = Math.min(160, (boxTop + PK_H - 30) * .45)
    const a = { x: w - 30, y: 30 }
    const b = { x: boxLeft + PK_W / 2, y: boxTop + PK_H - DROP }
    const end = { x: b.x, y: boxTop + PK_H }
    const c = { x: b.x, y: a.y + (b.y - a.y) * .05 }
    const SPLIT = .82 // share of t spent on the arc; the arc-length table evens it out
    const arc = (t: number) => {
      const s = t / SPLIT
      const u = 1 - s
      return {
        p: { x: u * u * a.x + 2 * u * s * c.x + s * s * b.x, y: u * u * a.y + 2 * u * s * c.y + s * s * b.y },
        d: { x: 2 * u * (c.x - a.x) + 2 * s * (b.x - c.x), y: 2 * u * (c.y - a.y) + 2 * s * (b.y - c.y) },
      }
    }
    const point = (t: number) => {
      if (t <= SPLIT) return arc(t).p
      const s = (t - SPLIT) / (1 - SPLIT)
      return { x: b.x, y: b.y + (end.y - b.y) * s }
    }
    const normal = (t: number) => {
      if (t > SPLIT) return { x: -1, y: 0 }
      const { d } = arc(t)
      const length = Math.hypot(d.x, d.y) || 1
      return { x: -d.y / length, y: d.x / length }
    }
    // Arc-length table, so the trail can be measured along the curve.
    const TABLE = 240
    const lengths = [0]
    for (let i = 1, prev = point(0); i <= TABLE; i++) {
      const next = point(i / TABLE)
      lengths.push(lengths[i - 1] + Math.hypot(next.x - prev.x, next.y - prev.y))
      prev = next
    }
    const total = lengths[TABLE]
    // Signed curvature, normalized, so lane ends can stagger on the bends.
    const curvature = (t: number) => {
      if (t > SPLIT) return 0
      const { d } = arc(t)
      const ddx = 2 * (b.x - 2 * c.x + a.x)
      const ddy = 2 * (b.y - 2 * c.y + a.y)
      return (d.x * ddy - d.y * ddx) / Math.pow(Math.hypot(d.x, d.y) || 1, 3)
    }
    let maxCurve = 1e-6
    for (let i = 0; i <= TABLE; i++) maxCurve = Math.max(maxCurve, Math.abs(curvature(i / TABLE)))
    const FAN = 1.4 // px of lead per px of lane offset at the tightest bend
    const FAN_EASE = 160 // px before the box over which the fan fades out
    const lengthAt = (t: number) => {
      const f = t * TABLE
      const i = Math.min(TABLE - 1, Math.floor(f))
      return lengths[i] + (lengths[i + 1] - lengths[i]) * (f - i)
    }
    const tAt = (len: number) => {
      let lo = 0
      let hi = TABLE
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (lengths[mid] < len) lo = mid + 1
        else hi = mid
      }
      return lo / TABLE
    }

    // Five parallel strokes in the logo's colors, each riding the curve at its
    // own offset, so the band bends with the flight. Lane 0 ends up leftmost.
    const SAMPLES = 80
    const drawTrail = (tail: number, head: number, fan = true) => {
      const from = lengthAt(tail)
      const to = lengthAt(head)
      if (to <= from) return
      ctx.lineWidth = PX + 1
      ctx.lineCap = 'butt'
      ctx.lineJoin = 'round'
      palette.forEach((color, lane) => {
        const o = (2 - lane) * PX
        // Inner lanes lead around a bend, outer ones trail.
        // The fan eases out over the final straight drop, so the ends are
        // square by the time they reach the box.
        const lead = (t: number, len: number) =>
          fan ? o * FAN * state.fan * (curvature(t) / maxCurve) * Math.min(1, Math.max(0, (total - len) / FAN_EASE)) : 0
        const t0 = tAt(Math.min(total, Math.max(0, from + lead(tail, from))))
        const t1 = tAt(Math.min(total, Math.max(0, to + lead(head, to))))
        if (t1 <= t0) return
        ctx.beginPath()
        for (let i = 0; i <= SAMPLES; i++) {
          const t = t0 + (t1 - t0) * (i / SAMPLES)
          const p = point(t)
          const n = normal(t)
          if (i === 0) ctx.moveTo(p.x + n.x * o, p.y + n.y * o)
          else ctx.lineTo(p.x + n.x * o, p.y + n.y * o)
        }
        ctx.strokeStyle = color.base
        ctx.stroke()
      })
    }

    // Where the tail rests while the ribbon waits for the lid.
    // Inside the straight drop, so the top edge is level, not cut at an angle.
    const tailRest = tAt(total - DROP + 2)

    // The lid whips in from the left edge.
    const lidFrom = -LID_W - 40
    // fan: how much the ends stagger; it settles to 0 as the ribbon lands so
    // both ends are square before the lid arrives.
    const state = { head: 0, tail: 0, lidX: lidFrom, alpha: 1, cut: 0, fan: 1 }
    const clipRect = (x: number, y: number, rw: number, rh: number) => {
      ctx.beginPath()
      ctx.rect(x, y, rw, rh)
      ctx.clip()
    }
    const render = () => {
      ctx.clearRect(0, 0, w, h)
      gsap.set(lid, { x: state.lidX, force3D: true })
      // The whole ribbon stays intact until the lid arrives, then it is cut
      // across all five bars at once.
      const blade = state.cut ? w : 0
      const above = cutY
      ctx.save()
      clipRect(blade, 0, w - blade, h)
      drawTrail(state.tail, state.head)
      ctx.restore()
      if (blade <= 0) return
      // Below the lid, left of the blade: the box body, solid.
      ctx.save()
      clipRect(0, cutY, blade, h - cutY)
      drawTrail(0, state.head, false)
      ctx.restore()
      // Above it: the severed ribbon stays put and fades.
      ctx.save()
      clipRect(0, 0, blade, above)
      ctx.globalAlpha = state.alpha
      drawTrail(state.tail, state.head)
      ctx.restore()
    }
    render()

    gsap.set(lid, { x: lidFrom, y: boxTop, transformOrigin: '50% 100%', autoAlpha: 1 })

    const duration = FLIGHT_MS / 1000
    const swipe = duration - .04
    const swept = swipe + .18
    const timeline = gsap.timeline({ onUpdate: render, onComplete: () => callbacks.current.onDone() })
    timeline
      .to(state, { head: 1, duration, ease: 'power3.out' }, 0)
      .to(state, { tail: tailRest, duration, ease: 'power3.out' }, TRAIL_LAG_MS / 1000)
      .to(state, { fan: 0, duration: .3, ease: 'power2.out' }, duration - .3)
      // Fast in, rigid while it cuts so the blade edge and the cut always
      // match. Once seated, one small vertical squash is the only bounce.
      // It overshoots a few px to the right, then springs back to sit flush.
      .to(state, { lidX: boxLeft + 10, duration: .18, ease: 'power3.out' }, swipe)
      .set(state, { cut: 1 }, swipe + .1)
      .to(state, { lidX: boxLeft, duration: .45, ease: 'elastic.out(1, .45)' }, swipe + .18)
      // The severed top just fades where it is: no retracting, no resizing.
      .to(state, { alpha: 0, duration: .25, ease: 'power1.in' }, swept + .05)
      .call(() => {
        callbacks.current.onLand()
        // The box fades out right where it is as the dialog grows from under
        // it. No swap to the dialog's own glyph: that one is drawn slightly
        // differently, and the swap read as a resize.
        gsap.to([lid, canvas], { autoAlpha: 0, duration: .18, ease: 'power1.in' })
      }, [], swept + .45)
      .to({}, { duration: .22 }) // let the fade finish before unmounting
    return () => {
      timeline.kill()
      gsap.killTweensOf([lid, canvas])
    }
  }, [callbacks])

  return (
    <div className="egg-flight" data-egg aria-hidden="true">
      <canvas ref={canvasRef} />
      <div ref={lidRef} className="egg-flight-icon">
        <svg className="egg-package" width={LID_W} height={PX} viewBox={`0 0 ${LID_W} ${PX}`} aria-hidden="true">
          {lidPaths.map(([fill, d]) => <path key={fill} fill={fill} d={d} />)}
        </svg>
      </div>
    </div>
  )
}

/* Dialog: picks up exactly where the flight left off (the package at the
   center); the package fades out as a gray tray grows from under it into
   the dialog, holding a white card — the logo stripes on top,
   the title and quote, then the CTA. */
function CarePackage({ onStart, onClosed }: { onStart: () => void; onClosed: (started: boolean) => void }) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const glyphRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const intro = useRef<gsap.Context | null>(null)
  const closing = useRef(false)
  const callbacks = useLatest({ onStart, onClosed })
  // Client-only (portaled after mount), so the viewport is safe to read here.
  const [dialogW] = useState(() => Math.min(DIALOG_W, window.innerWidth - 32))

  useLayoutEffect(() => {
    const backdrop = backdropRef.current
    const shell = shellRef.current
    const glyph = glyphRef.current
    const body = bodyRef.current
    const card = body?.firstElementChild
    if (!backdrop || !shell || !glyph || !body || !card) return
    const height = body.offsetHeight
    const final = { width: dialogW, height, borderRadius: DIALOG_R, backgroundColor: TRAY, boxShadow: SHADOW }
    // Opened by the pointer, so skip the keyboard ring where the browser allows it.
    const focusStart = () => startRef.current?.focus({ preventScroll: true, focusVisible: false } as FocusOptions)

    intro.current = gsap.context(() => {
      if (reducedMotion()) {
        gsap.set(shell, final)
        gsap.set(glyph, { autoAlpha: 0 })
        gsap.set(body, { autoAlpha: 1 })
        gsap.fromTo([backdrop, shell], { opacity: 0 }, { opacity: 1, duration: .2, onComplete: focusStart })
        return
      }
      // The flight's own box fades out in place; the tray grows straight out
      // from under it into the dialog.
      gsap.timeline({ onComplete: focusStart })
        .set(glyph, { autoAlpha: 0 }, 0)
        .to(backdrop, { opacity: 1, duration: .4, ease: 'power2.out' }, 0)
        .to(shell, { ...final, duration: .42, ease: 'power3.out' }, 0)
        // The shell doesn't clip: the card only shows once the tray is within
        // its 8px padding of full size, so it always sits inside the tray.
        .set(body, { autoAlpha: 1 }, .3)
        .fromTo(card, { opacity: 0, scale: .98 }, { opacity: 1, scale: 1, duration: .24, ease: 'power2.out' }, .3)
        .fromTo(card.children, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .28, stagger: .035, ease: 'power3.out' }, .32)
    })

    return () => {
      intro.current?.revert()
      intro.current = null
    }
  }, [])

  const close = (started: boolean) => {
    if (closing.current) return
    closing.current = true
    if (started) callbacks.current.onStart()
    intro.current?.kill()
    const shell = shellRef.current
    const backdrop = backdropRef.current
    if (!shell || !backdrop) return callbacks.current.onClosed(started)
    const reduced = reducedMotion()
    // The CSS press transition would smear GSAP's per-frame transform.
    shell.style.transition = 'none'
    gsap.to(backdrop, { opacity: 0, duration: reduced ? .01 : .28, ease: 'power2.in' })
    gsap.to(shell, {
      opacity: 0,
      scale: reduced ? 1 : .96,
      duration: reduced ? .01 : .2,
      ease: 'power2.in',
      onComplete: () => callbacks.current.onClosed(started),
    })
  }
  const closeRef = useLatest(close)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeRef])

  return (
    <>
      <div ref={backdropRef} className="egg-backdrop" data-egg aria-hidden="true" onClick={() => close(false)} />
      <div className="egg-layer" data-egg>
        <div ref={shellRef} className="egg-shell" role="dialog" aria-modal="true" aria-labelledby="egg-title" aria-describedby="egg-line">
          <div ref={bodyRef} className="egg-body" style={{ width: dialogW }}>
            <div className="egg-card">
              <div className="egg-head" aria-hidden="true"><BrandStripes /></div>
              <div className="egg-row">
                <h2 id="egg-title" className="egg-title">You found something!</h2>
                <p id="egg-line" className="egg-line">Not all those who wander are lost.</p>
              </div>
              <button ref={startRef} type="button" className="egg-cta" style={{ '--tint': amberTint } as CSSProperties} onClick={() => close(true)}>
                <span>Enter experience</span>
                <LuArrowUpRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div ref={glyphRef} className="egg-glyph" aria-hidden="true"><PackageGlyph /></div>
      </div>
    </>
  )
}

const readEdges = (style: CSSStyleDeclaration, prop: 'margin' | 'padding' | 'border'): Edges =>
  (['top', 'right', 'bottom', 'left'] as const).map((side) =>
    parseFloat(style.getPropertyValue(prop === 'border' ? `border-${side}-width` : `${prop}-${side}`)) || 0,
  ) as Edges

function gapsOf(el: Element, rect: DOMRect, style: CSSStyleDeclaration, pin: number): Gap[] {
  const sx = window.scrollX
  const sy = window.scrollY
  const padding = readEdges(style, 'padding')
  const border = readEdges(style, 'border')
  const left = rect.left + border[3] + padding[3]
  const right = rect.right - border[1] - padding[1]
  const kids = Array.from(el.children)
    .filter((kid) => {
      const s = getComputedStyle(kid)
      return s.display !== 'none' && s.position !== 'absolute' && s.position !== 'fixed'
    })
    .map((kid) => kid.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0)

  const gaps: Gap[] = []
  for (let i = 1; i < kids.length; i++) {
    const a = kids[i - 1]
    const b = kids[i]
    if (b.top - a.bottom >= 1) {
      gaps.push({ x: left + sx, y: a.bottom + sy, w: right - left, h: b.top - a.bottom, value: b.top - a.bottom, pin })
    } else if (b.left - a.right >= 1) {
      const top = Math.min(a.top, b.top)
      const bottom = Math.max(a.bottom, b.bottom)
      gaps.push({ x: a.right + sx, y: top + sy, w: b.left - a.right, h: bottom - top, value: b.left - a.right, pin })
    }
  }
  return gaps
}

function measure(): Layout {
  const root = document.querySelector('main') ?? document.body
  const sx = window.scrollX
  const sy = window.scrollY
  const boxes: Box[] = []
  const gaps: Gap[] = []
  const pins: Pin[] = []

  const walk = (el: Element, depth: number, pin: number) => {
    if (boxes.length >= MAX_BOXES) return
    const tag = el.tagName.toUpperCase()
    if (SKIP.has(tag) || el.hasAttribute('data-egg')) return
    const style = getComputedStyle(el)
    if (style.display === 'none') return
    const rect = el.getBoundingClientRect()
    // Sticky and fixed boxes move against the document as the page scrolls, so
    // they and everything inside them are drawn on a sheet that follows them.
    if (style.position === 'sticky' || style.position === 'fixed') {
      pin = pins.push({ el, x: rect.left + sx, y: rect.top + sy }) - 1
    }
    const shown = style.display !== 'contents' && style.visibility !== 'hidden' && rect.width >= 1 && rect.height >= 1
    if (shown) {
      boxes.push({
        x: rect.left + sx,
        y: rect.top + sy,
        w: rect.width,
        h: rect.height,
        depth,
        pin,
        margin: readEdges(style, 'margin').map((v) => Math.max(0, v)) as Edges,
        padding: readEdges(style, 'padding'),
        border: readEdges(style, 'border'),
        tag: LANDMARKS.has(tag) ? `${tag.toLowerCase()} ${fmt(rect.width)}×${fmt(rect.height)}` : undefined,
      })
      if (/flex|grid/.test(style.display) && (parseFloat(style.rowGap) > 0 || parseFloat(style.columnGap) > 0)) {
        gaps.push(...gapsOf(el, rect, style, pin))
      }
    }
    if (LEAVES.has(tag)) return
    Array.from(el.children).forEach((child) => walk(child, shown ? depth + 1 : depth, pin))
  }

  walk(root, 0, -1)

  // Nested landmarks often share a corner (section > h2); line their tags up
  // left to right instead of stacking them.
  const corners = new Map<string, number>()
  boxes.forEach((box) => {
    if (!box.tag) return
    const corner = `${Math.round(box.x)},${Math.round(box.y)}`
    const shift = corners.get(corner) ?? 0
    box.tagShift = shift
    corners.set(corner, shift + box.tag.length * TAG_CHAR + 8)
  })
  return { boxes, gaps, pins }
}

function describe(el: Element): Hover {
  const rect = el.getBoundingClientRect()
  const style = getComputedStyle(el)
  const className = (el.getAttribute('class') ?? '').trim().split(/\s+/)[0]
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    w: rect.width,
    h: rect.height,
    name: el.tagName.toLowerCase(),
    className: className ? `.${className}` : '',
    margin: readEdges(style, 'margin').map((v) => Math.max(0, v)) as Edges,
    padding: readEdges(style, 'padding'),
    border: readEdges(style, 'border'),
  }
}

// Number chips sit in the middle of each band wide enough to hold one.
function bandLabels(r: Rect, edges: Edges, outside: boolean) {
  const [t, right, b, l] = edges
  const cx = r.x + r.w / 2
  const cy = r.y + r.h / 2
  return [
    { value: t, x: cx, y: outside ? r.y - t / 2 : r.y + t / 2, min: 12 },
    { value: right, x: outside ? r.x + r.w + right / 2 : r.x + r.w - right / 2, y: cy, min: 18 },
    { value: b, x: cx, y: outside ? r.y + r.h + b / 2 : r.y + r.h - b / 2, min: 12 },
    { value: l, x: outside ? r.x - l / 2 : r.x + l / 2, y: cy, min: 18 },
  ].filter((spot) => spot.value >= spot.min)
}

function innerRect(r: Rect, border: Edges): Rect {
  return { x: r.x + border[3], y: r.y + border[0], w: r.w - border[1] - border[3], h: r.h - border[0] - border[2] }
}

function Bands({ box, prefix }: { box: Rect & { margin: Edges; padding: Edges; border: Edges }; prefix: string }) {
  const { x, y, w, h, margin: m, padding: p, border } = box
  const inner = innerRect(box, border)
  return (
    <>
      {m.some(Boolean) && (
        <div className={`${prefix}-margin`} style={{ left: x - m[3], top: y - m[0], width: w + m[1] + m[3], height: h + m[0] + m[2], borderWidth: px(m) }} />
      )}
      {p.some(Boolean) && (
        <div className={`${prefix}-padding`} style={{ left: inner.x, top: inner.y, width: inner.w, height: inner.h, borderWidth: px(p) }} />
      )}
    </>
  )
}

function Sheet({ boxes, gaps }: { boxes: Box[]; gaps: Gap[] }) {
  return (
    <>
      {boxes.map((box, i) => <Bands key={`b${i}`} box={box} prefix="bp" />)}
      {boxes.map((box, i) => (
        <div key={`o${i}`} className="bp-box" data-depth={box.depth} style={{ left: box.x, top: box.y, width: box.w, height: box.h, '--c': palette[box.depth % palette.length].base } as CSSProperties} />
      ))}
      {gaps.map((gap, i) => <div key={`g${i}`} className="bp-gap" style={{ left: gap.x, top: gap.y, width: gap.w, height: gap.h }} />)}
      {boxes.map((box, i) => (
        <Fragment key={`l${i}`}>
          {bandLabels(box, box.margin, true).map((spot, j) => (
            <span key={`m${j}`} className="bp-num" style={{ left: spot.x, top: spot.y, '--c': 'var(--margin)' } as CSSProperties}>{fmt(spot.value)}</span>
          ))}
          {bandLabels(innerRect(box, box.border), box.padding, false).map((spot, j) => (
            <span key={`p${j}`} className="bp-num" style={{ left: spot.x, top: spot.y, '--c': 'var(--padding)' } as CSSProperties}>{fmt(spot.value)}</span>
          ))}
        </Fragment>
      ))}
      {gaps.filter((gap) => gap.value >= 8).map((gap, i) => (
        <span key={`gl${i}`} className="bp-num" style={{ left: gap.x + gap.w / 2, top: gap.y + gap.h / 2, '--c': 'var(--gap)' } as CSSProperties}>{fmt(gap.value)}</span>
      ))}
      {boxes.filter((box) => box.tag).map((box, i) => (
        <span key={`t${i}`} className="bp-tag" style={{ left: box.x + (box.tagShift ?? 0), top: box.y, '--c': palette[box.depth % palette.length].base } as CSSProperties}>{box.tag}</span>
      ))}
    </>
  )
}

/* Demolition: the facade is every piece of visible content (text blocks and
   replaced media). Pieces in view tremble, hinge off and drop in a shower of
   dust, top to bottom, and the blueprint is drafted in their wake. The facade
   then settles back as a faint ghost over the foundation. */
const REPLACED = new Set(['IMG', 'SVG', 'VIDEO', 'CANVAS', 'IFRAME', 'PICTURE'])
const SWEEP = 1.1 // seconds for the demolition to travel down the viewport
const GHOST = { opacity: .9 }
// In the egg state the settled facade (text and the dot glyphs) turns light
// blue, so the warm blueprint reads as the structure and the content as ink
// on a drawing. html[data-egg-blue] holds the settled colors; the swap itself
// is a GSAP tween from whatever main shows now (mid-wash included) to them.
const TINT = ['--ink', '--muted', '--date-ink', '--faint', '--prose-ink']
let tint: gsap.core.Tween | null = null
const tintFacade = (on: boolean, duration = 0) => {
  const root = document.documentElement
  const main = document.querySelector('main')
  tint?.kill()
  const from = main && Object.fromEntries(TINT.map((name) => [name, getComputedStyle(main).getPropertyValue(name).trim()]))
  const clear = () => TINT.forEach((name) => main?.style.removeProperty(name))
  clear()
  if (on) root.dataset.eggBlue = ''
  else delete root.dataset.eggBlue
  if (main && duration) tint = gsap.from(main, { ...from, duration, ease: 'power1.inOut', onComplete: clear })
}

function facadePieces(root: Element) {
  const found = new Set<Element>()
  const walk = (el: Element) => {
    const tag = el.tagName.toUpperCase()
    if (SKIP.has(tag) || el.hasAttribute('data-egg') || getComputedStyle(el).display === 'none') return
    const hasText = Array.from(el.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
    if (REPLACED.has(tag) || hasText) {
      // Transforms skip plain inline boxes, so a link or span falls with its block.
      let piece = el
      while (piece.parentElement && piece.parentElement !== root && !REPLACED.has(piece.tagName.toUpperCase()) && getComputedStyle(piece).display === 'inline') {
        piece = piece.parentElement
      }
      found.add(piece)
      return
    }
    Array.from(el.children).forEach(walk)
  }
  Array.from(root.children).forEach(walk)
  const pieces = Array.from(found)
  return pieces.filter((piece) => !pieces.some((other) => other !== piece && other.contains(piece)))
}

// When a document-space top edge gets hit by the sweep; null if out of view.
function sweepAt(top: number) {
  const offset = top - window.scrollY
  if (offset < -200 || offset > window.innerHeight + 40) return null
  return Math.min(1, Math.max(0, offset / window.innerHeight)) * SWEEP
}

const spread = (min: number, max: number) => min + Math.random() * (max - min)

function demolish(timeline: gsap.core.Timeline, pieces: Element[], dust: HTMLElement) {
  pieces.forEach((piece) => {
    const rect = piece.getBoundingClientRect()
    const at = sweepAt(rect.top + window.scrollY)
    if (at === null || rect.bottom < 0) {
      timeline.set(piece, GHOST, 0)
      return
    }
    const side = Math.random() < .5 ? -1 : 1
    const jolt = spread(1, 2.2)
    timeline.to(piece, {
      keyframes: [
        { x: jolt, duration: .04 },
        { x: -jolt, duration: .04 },
        { x: 0, duration: .04 },
        { y: spread(28, 70), rotation: side * spread(2, 9), opacity: 0, duration: .46, ease: 'power2.in' },
      ],
      transformOrigin: side < 0 ? '0% 100%' : '100% 100%',
    }, at)

    // A few specks crumble off the bottom edge as each piece lets go.
    const specks = Math.min(5, 2 + Math.round(rect.width / 160))
    for (let i = 0; i < specks; i++) {
      const speck = document.createElement('i')
      const size = spread(1.2, 3)
      Object.assign(speck.style, { left: `${rect.left + Math.random() * rect.width}px`, top: `${rect.bottom - 2}px`, width: `${size}px`, height: `${size}px` })
      dust.append(speck)
      timeline.fromTo(speck, { opacity: 0 }, {
        keyframes: [
          { opacity: spread(.35, .7), duration: .06 },
          { x: spread(-18, 18), y: spread(40, 110), rotation: spread(-90, 90), opacity: 0, duration: spread(.55, .9), ease: 'power1.in' },
        ],
        onComplete: () => speck.remove(),
      }, at + .12 + Math.random() * .12)
    }
  })
  // The facade settles back as a ghost so the foundation reads first, still
  // in its dark ink, then washes over to blue once it has fully settled.
  timeline.set(pieces, { x: 0, y: 0, rotation: 0 }, SWEEP + .7)
  timeline.to(pieces, { ...GHOST, duration: .5, ease: 'power1.out', stagger: { amount: .25 } }, SWEEP + .7)
  timeline.call(tintFacade, [true, 1.1], SWEEP + 1.55)
}

// The blueprint drafts itself in the sweep's wake: outlines trace from their
// corner, bands and gap hatching wash in, then the numbers pop on last.
function draft(timeline: gsap.core.Timeline, layer: HTMLElement) {
  const later = (el: Element, lead: number, pick: (at: number) => void) => {
    const at = sweepAt(parseFloat((el as HTMLElement).style.top) || 0)
    if (at === null) return
    pick(at + lead)
  }
  layer.querySelectorAll<HTMLElement>('.bp-box').forEach((el) => later(el, .1 + Number(el.dataset.depth ?? 0) * .012, (at) => {
    timeline.fromTo(el, { opacity: 0, clipPath: 'inset(0% 100% 100% 0%)' }, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: .34, ease: 'power2.out', clearProps: 'opacity,clipPath' }, at)
  }))
  layer.querySelectorAll<HTMLElement>('.bp-margin,.bp-padding').forEach((el) => later(el, .22, (at) => {
    timeline.fromTo(el, { opacity: 0 }, { opacity: 1, duration: .32, ease: 'power1.out', clearProps: 'opacity' }, at)
  }))
  layer.querySelectorAll<HTMLElement>('.bp-gap').forEach((el) => later(el, .26, (at) => {
    timeline.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .3, ease: 'power2.out', clearProps: 'clipPath' }, at)
  }))
  layer.querySelectorAll<HTMLElement>('.bp-num,.bp-tag').forEach((el) => later(el, 0, (at) => {
    const tag = el.classList.contains('bp-tag')
    timeline.fromTo(el,
      { opacity: 0, scale: .5, x: 0, y: 0, xPercent: tag ? 0 : -50, yPercent: tag ? -100 : -50 },
      { opacity: 1, scale: 1, x: 0, y: 0, duration: .26, ease: 'back.out(2.2)', clearProps: 'opacity,transform' },
      SWEEP * .6 + .35 + at * .4)
  }))
}

/* Blueprint: Chrome's inspect overlay for the whole page at once. Bands and
   chips are positioned in document coordinates, so scrolling is free; we only
   re-measure when layout can change. */
function Blueprint({ audio, onExit }: { audio: HTMLAudioElement | null; onExit: () => void }) {
  const pathname = usePathname()
  const [layout, setLayout] = useState<Layout | null>(null)
  const [hover, setHover] = useState<Hover | null>(null)
  const [leaving, setLeaving] = useState(false)
  const exitRef = useLatest(onExit)
  const layerRef = useRef<HTMLDivElement>(null)
  const dustRef = useRef<HTMLDivElement>(null)
  const grainRef = useRef<HTMLDivElement>(null)
  const scene = useRef<gsap.Context | null>(null)
  const pieces = useRef<Element[]>([])
  // Each piece's inline style from before the demolition. Reverting the GSAP
  // context isn't enough: the exit tween overwrites the fall mid-flight, and
  // its revert would restore the tumbled pose it started from.
  const facade = useRef(new Map<Element, string | null>())
  // Pieces are mid-fall while demolishing, so measuring then would draw the
  // blueprint where they tumbled to. Defer until the facade has settled.
  const demolishing = useRef(false)
  const remeasure = useRef<(() => void) | null>(null)
  const pinRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let frame = 0
    let deferred = false
    const update = () => {
      if (demolishing.current) {
        deferred = true
        return
      }
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setLayout(measure()))
    }
    remeasure.current = () => {
      if (!deferred) return
      deferred = false
      update()
    }
    update()
    const late = window.setTimeout(update, 320)
    const observer = new ResizeObserver(update)
    observer.observe(document.body)
    window.addEventListener('resize', update)
    void document.fonts?.ready.then(update)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(late)
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [pathname])

  useEffect(() => {
    let frame = 0
    let last: Element | null = null
    let pointer: { x: number; y: number } | null = null
    const probe = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!pointer) return
        const hit = document.elementFromPoint(pointer.x, pointer.y)
        const root = document.querySelector('main') ?? document.body
        const target = hit?.closest('svg') ?? hit
        if (!target || !root.contains(target) || target.closest('[data-egg]')) {
          last = null
          return setHover(null)
        }
        if (target === last) return
        last = target
        setHover(describe(target))
      })
    }
    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY }
      probe()
    }
    const onLeave = (event: PointerEvent) => {
      // Touch pointers "leave" right after lifting; keep the tapped element shown.
      if (event.pointerType !== 'mouse') return
      pointer = null
      last = null
      setHover(null)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerdown', onMove, { passive: true })
    // Re-describe on scroll even if the target hasn't changed: a sticky
    // element moves against the document while the pointer stays on it.
    const onScroll = () => {
      last = null
      probe()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerdown', onMove)
      window.removeEventListener('scroll', onScroll)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // Sticky sheets follow their element: shift each by how far it has moved
  // from where it was measured. Synced in the scroll event so it lands in the
  // same frame as the scroll.
  useLayoutEffect(() => {
    const pins = layout?.pins ?? []
    if (!pins.length) return
    const sync = () => pins.forEach((pin, i) => {
      const sheet = pinRefs.current[i]
      if (!sheet) return
      const rect = pin.el.getBoundingClientRect()
      sheet.style.transform = `translate(${rect.left + window.scrollX - pin.x}px, ${rect.top + window.scrollY - pin.y}px)`
    })
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [layout])

  // Runs once, on the first measurement, before that frame paints.
  const measured = layout !== null
  useLayoutEffect(() => {
    const layer = layerRef.current
    const dust = dustRef.current
    const grain = grainRef.current
    if (!measured || !layer || !dust || !grain || scene.current) return
    const root = document.querySelector('main') ?? document.body
    pieces.current = facadePieces(root)
    pieces.current.forEach((piece) => facade.current.set(piece, piece.getAttribute('style')))
    scene.current = gsap.context(() => {
      if (reducedMotion()) {
        gsap.set(pieces.current, GHOST)
        tintFacade(true)
        gsap.from(layer, { opacity: 0, duration: .2 })
        return
      }
      demolishing.current = true
      const timeline = gsap.timeline({
        onComplete: () => {
          demolishing.current = false
          remeasure.current?.()
        },
      })
      timeline.from(grain, { opacity: 0, duration: SWEEP + .4, ease: 'none' }, 0)
      demolish(timeline, pieces.current, dust)
      draft(timeline, layer)
    })
  }, [measured])

  useEffect(() => () => {
    demolishing.current = false
    tintFacade(false)
    scene.current?.kill()
    scene.current = null
    // Drop GSAP's cached transforms too, or the next tween on a piece would
    // start from its tumbled pose.
    gsap.set(Array.from(facade.current.keys()), { clearProps: 'transform' })
    facade.current.forEach((style, piece) => {
      if (style === null) piece.removeAttribute('style')
      else piece.setAttribute('style', style)
    })
    facade.current.clear()
  }, [])

  useEffect(() => {
    if (!leaving) return
    tintFacade(false, .2)
    scene.current?.add(() => {
      gsap.to(pieces.current, { x: 0, y: 0, rotation: 0, opacity: 1, duration: .22, ease: 'power2.out', overwrite: true })
    })
    const timer = window.setTimeout(() => exitRef.current(), 220)
    return () => window.clearTimeout(timer)
  }, [leaving, exitRef])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLeaving(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const boxes = layout?.boxes ?? []
  const gaps = layout?.gaps ?? []
  const pins = layout?.pins ?? []
  const tipBelow = hover ? hover.y + hover.h + 40 < window.scrollY + window.innerHeight : true

  return (
    <>
      <div ref={grainRef} className="bp-grain" data-egg data-leaving={leaving || undefined} aria-hidden="true" />
      <div ref={dustRef} className="bp-dust" data-egg aria-hidden="true" />
      <div ref={layerRef} className="bp" data-egg data-leaving={leaving || undefined} aria-hidden="true" style={colorVars}>
        <Sheet boxes={boxes.filter((box) => box.pin < 0)} gaps={gaps.filter((gap) => gap.pin < 0)} />
        {pins.map((_, i) => (
          <div key={`pin${i}`} ref={(el) => { pinRefs.current[i] = el }} className="bp-pin">
            <Sheet boxes={boxes.filter((box) => box.pin === i)} gaps={gaps.filter((gap) => gap.pin === i)} />
          </div>
        ))}
        {hover && (
          <>
            <Bands box={hover} prefix="bp-hover" />
            <div className="bp-hover-box" style={{ left: hover.x, top: hover.y, width: hover.w, height: hover.h }} />
            <div className="bp-tip" style={{ left: hover.x, top: tipBelow ? hover.y + hover.h + 6 : hover.y - 6, transform: tipBelow ? undefined : 'translateY(-100%)' }}>
              <b>{hover.name}</b>{hover.className}<span>{fmt(hover.w)} × {fmt(hover.h)}</span>
            </div>
          </>
        )}
      </div>
      <div className="egg-hud" data-egg data-leaving={leaving || undefined} role="region" aria-label="Inspect mode">
        <EqMark audio={audio} />
        <span className="egg-hud-track">
          {TRACK.title}<span>{TRACK.artist}</span>
        </span>
        <button type="button" onClick={() => setLeaving(true)} aria-label="Exit inspect mode">
          <LuX aria-hidden="true" />
        </button>
      </div>
    </>
  )
}
