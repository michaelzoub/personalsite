'use client'

import gsap from 'gsap'
import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { LuArrowRight, LuX } from 'react-icons/lu'
import { palette } from '../data/palette'

// Easter egg: dwell in the top-right corner and a care package shoots to the
// center, unfolds into a dialog, and "Start" turns the page into its box model
// (margins, padding, gaps) with a track playing underneath.

type Stage = 'idle' | 'flight' | 'dialog' | 'inspect'
type Edges = [number, number, number, number]
type Rect = { x: number; y: number; w: number; h: number }
type Box = Rect & { depth: number; margin: Edges; padding: Edges; border: Edges; tag?: string; tagShift?: number }
type Gap = Rect & { value: number }
type Layout = { boxes: Box[]; gaps: Gap[] }
type Hover = Rect & { name: string; className: string; margin: Edges; padding: Edges; border: Edges }

const TRACK = { src: '/audio/texture-401.mp3', title: 'Texture 401', artist: 'Joachim Spieth' }
const DWELL_MS = 320
const FLIGHT_MS = 820
const TRAIL_LAG_MS = 170
const ICON = 48
const DIALOG_W = 340
const DIALOG_R = 12
// Shadow only, no stroke, same as the inspect HUD.
const SHADOW = '0 8px 24px rgba(15,28,48,.08), 0 1px 3px rgba(15,28,48,.05)'

// Chrome's box-model colors, swapped for the logo's five stripes.
const [red, orange, yellow, amber] = palette.map((color) => color.base)
const colorVars = { '--gap': red, '--margin': orange, '--padding': yellow, '--hover': amber } as CSSProperties

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

/* The package, in the same dot language as the work glyphs: an isometric box
   drawn as three dot lattices. Edges are solid ink, the faces are shaded by dot
   opacity (lit top, darker sides), and a strip of tape in the logo's five
   colors runs over the lid seam and down the front. */
const PK_EDGE = 22
const PK_STEPS = 6
const PK_PAD = 2
const PK_W = Math.ceil(PK_EDGE * Math.sqrt(3) + PK_PAD * 2)
const PK_H = PK_EDGE * 2 + PK_PAD * 2
const PK_PITCH = PK_EDGE / PK_STEPS
const PK_DOT = 1.15

type PackageDot = { x: number; y: number; opacity: number; tape?: string }

const packageDots: PackageDot[] = (() => {
  const cos = Math.cos(Math.PI / 6) * PK_EDGE
  const sin = Math.sin(Math.PI / 6) * PK_EDGE
  const top = { x: PK_W / 2, y: PK_PAD }
  const right = { x: cos, y: sin }
  const left = { x: -cos, y: sin }
  const down = { x: 0, y: PK_EDGE }
  const front = { x: top.x + right.x + left.x, y: top.y + right.y + left.y }
  const dots = new Map<string, PackageDot & { rank: number }>()
  const tapeDots: { x: number; y: number; t: number }[] = []
  const put = (x: number, y: number, opacity: number, rank: number) => {
    const key = `${Math.round(x * 10)},${Math.round(y * 10)}`
    const current = dots.get(key)
    if (!current || current.rank < rank) dots.set(key, { x, y, opacity, rank })
  }
  // Each face is origin + i·u + j·v over an N×N lattice; boundary dots are edges.
  const face = (origin: { x: number; y: number }, u: { x: number; y: number }, v: { x: number; y: number }, shade: number, tapeAt: 'i' | 'j' | null, tapeFrom: number) => {
    const n = PK_STEPS
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const x = origin.x + (u.x * i + v.x * j) / n
        const y = origin.y + (u.y * i + v.y * j) / n
        const onTape = (tapeAt === 'i' && i === n / 2) || (tapeAt === 'j' && j === n / 2)
        if (onTape) tapeDots.push({ x, y, t: tapeFrom + (tapeAt === 'i' ? j : i) })
        put(x, y, i === 0 || j === 0 || i === n || j === n ? 1 : shade, i === 0 || j === 0 || i === n || j === n ? 1 : 0)
      }
    }
  }
  face(top, right, left, .18, 'i', 0) // lid: tape along the seam, back to front
  face(front, { x: -left.x, y: -left.y }, down, .52, null, 0) // right side
  face(front, { x: -right.x, y: -right.y }, down, .34, 'i', PK_STEPS) // left side: tape runs down it

  const ordered = tapeDots.sort((a, b) => a.t - b.t)
  const span = ordered[ordered.length - 1].t || 1
  ordered.forEach(({ x, y, t }) => {
    const key = `${Math.round(x * 10)},${Math.round(y * 10)}`
    const color = palette[Math.min(palette.length - 1, Math.floor((t / span) * palette.length))].base
    dots.set(key, { x, y, opacity: 1, tape: color, rank: 2 })
  })
  return Array.from(dots.values()).map(({ x, y, opacity, tape }) => ({ x, y, opacity, tape }))
})()

function PackageGlyph() {
  return (
    <svg className="egg-package" width={PK_W} height={PK_H} viewBox={`0 0 ${PK_W} ${PK_H}`} aria-hidden="true">
      {packageDots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.tape ? 1.45 : PK_DOT}
          fill={dot.tape ?? 'currentColor'}
          opacity={dot.opacity}
          data-tape={dot.tape ? '' : undefined}
        />
      ))}
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

  // Called inside the click handler so the browser treats it as user-initiated.
  const play = () => {
    const track = audio.current ?? new Audio(TRACK.src)
    audio.current = track
    track.loop = true
    track.volume = 0
    void track.play().catch(() => {})
    fade.current?.kill()
    fade.current = gsap.to(track, { volume: .6, duration: 1.8, ease: 'power1.out' })
  }

  const stop = () => {
    const track = audio.current
    if (!track) return
    fade.current?.kill()
    fade.current = gsap.to(track, {
      volume: 0,
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
      {trail && <Flight onLand={() => setStage('dialog')} onDone={() => setTrail(false)} />}
      {stage === 'dialog' && <CarePackage onStart={play} onClosed={(started) => setStage(started ? 'inspect' : 'idle')} />}
      {stage === 'inspect' && <Blueprint onExit={() => { stop(); setStage('idle') }} />}
    </>,
    document.body,
  )
}

/* Flight: the package arcs from the corner to the center, dragging a five-stripe
   trail in the logo colors. A GSAP timeline drives head and tail along the same
   curve, the tail starting a beat later, so the trail shortens on its own once
   the package lands. */
function Flight({ onLand, onDone }: { onLand: () => void; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const callbacks = useLatest({ onLand, onDone })

  useEffect(() => {
    const canvas = canvasRef.current
    const icon = iconRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !icon || !ctx) {
      callbacks.current.onLand()
      callbacks.current.onDone()
      return
    }

    const { width: w, height: h } = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    const a = { x: w - 30, y: 30 }
    const b = { x: w / 2, y: h / 2 }
    const c = { x: b.x + (a.x - b.x) * .15, y: a.y + (b.y - a.y) * .05 }
    const point = (t: number) => {
      const u = 1 - t
      return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y }
    }
    const normal = (t: number) => {
      const dx = 2 * (1 - t) * (c.x - a.x) + 2 * t * (b.x - c.x)
      const dy = 2 * (1 - t) * (c.y - a.y) + 2 * t * (b.y - c.y)
      const length = Math.hypot(dx, dy) || 1
      return { x: -dy / length, y: dx / length }
    }
    // Arc-length table, so trail dots sit at a fixed pitch along the curve and
    // stay put as the head advances: the trail is printed, not dragged.
    const TABLE = 240
    const lengths = [0]
    for (let i = 1, prev = point(0); i <= TABLE; i++) {
      const next = point(i / TABLE)
      lengths.push(lengths[i - 1] + Math.hypot(next.x - prev.x, next.y - prev.y))
      prev = next
    }
    const lengthAt = (t: number) => {
      const f = t * TABLE
      const i = Math.min(TABLE - 1, Math.floor(f))
      return lengths[i] + (lengths[i + 1] - lengths[i]) * (f - i)
    }
    const tAt = (length: number) => {
      let lo = 0
      let hi = TABLE
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1
        if (lengths[mid] < length) lo = mid
        else hi = mid
      }
      return (lo + (length - lengths[lo]) / ((lengths[hi] - lengths[lo]) || 1)) / TABLE
    }

    // The package's dot lattice carried on behind it: ten lanes at the box's
    // pitch, two per logo color, narrowing and fading toward the tail. It starts
    // at the box's back edge so it reads as coming out of the package.
    const LANES = 10
    const HEAD_GAP = 18
    const drawTrail = (tail: number, head: number) => {
      const from = lengthAt(tail)
      const to = lengthAt(head) - HEAD_GAP
      if (to <= from) return
      for (let at = Math.ceil(from / PK_PITCH) * PK_PITCH; at <= to; at += PK_PITCH) {
        const f = (at - from) / (to - from)
        const t = tAt(at)
        const p = point(t)
        const n = normal(t)
        const reach = ((LANES - 1) / 2) * Math.sqrt(f) + .5
        for (let lane = 0; lane < LANES; lane++) {
          const offset = lane - (LANES - 1) / 2
          if (Math.abs(offset) > reach) continue
          ctx.globalAlpha = Math.pow(f, 1.3)
          ctx.fillStyle = palette[lane >> 1].base
          ctx.beginPath()
          ctx.arc(p.x + n.x * offset * PK_PITCH, p.y + n.y * offset * PK_PITCH, PK_DOT, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }

    const progress = { head: 0, tail: 0 }
    const render = () => {
      const { head, tail } = progress
      ctx.clearRect(0, 0, w, h)
      drawTrail(tail, head)
      const p = point(head)
      gsap.set(icon, { x: p.x - ICON / 2, y: p.y - ICON / 2, rotation: (1 - head) * -32, force3D: true })
    }
    render()

    const duration = FLIGHT_MS / 1000
    const timeline = gsap.timeline({ onUpdate: render, onComplete: () => callbacks.current.onDone() })
    timeline
      .to(progress, {
        head: 1,
        duration,
        ease: 'power3.out',
        onComplete: () => {
          gsap.set(icon, { opacity: 0 })
          callbacks.current.onLand()
        },
      }, 0)
      .to(progress, { tail: 1, duration, ease: 'power3.out' }, TRAIL_LAG_MS / 1000)
    return () => { timeline.kill() }
  }, [callbacks])

  return (
    <div className="egg-flight" data-egg aria-hidden="true">
      <canvas ref={canvasRef} />
      <div ref={iconRef} className="egg-flight-icon">
        <PackageGlyph />
      </div>
    </div>
  )
}

/* Dialog: picks up exactly where the flight left off (the package at the
   center), firms into a white tile, then slowly widens into one of the
   landing's index rows (title, muted line, glyph on the right) while the
   package slides over into the glyph slot and the backdrop blurs in. */
function CarePackage({ onStart, onClosed }: { onStart: () => void; onClosed: (started: boolean) => void }) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const glyphRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const slotRef = useRef<HTMLSpanElement>(null)
  const intro = useRef<gsap.Context | null>(null)
  const closing = useRef(false)
  const callbacks = useLatest({ onStart, onClosed })

  useLayoutEffect(() => {
    const backdrop = backdropRef.current
    const shell = shellRef.current
    const glyph = glyphRef.current
    const body = bodyRef.current
    const slot = slotRef.current
    if (!backdrop || !shell || !glyph || !body || !slot) return
    const height = body.offsetHeight
    // The glyph layer stays centered in the shell, so its resting offset is the
    // slot's center measured from the finished dialog's center.
    const slotBox = slot.getBoundingClientRect()
    const bodyBox = body.getBoundingClientRect()
    const rest = {
      x: slotBox.left - bodyBox.left + slotBox.width / 2 - DIALOG_W / 2,
      y: slotBox.top - bodyBox.top + slotBox.height / 2 - height / 2,
    }
    const final = { width: DIALOG_W, height, borderRadius: DIALOG_R, backgroundColor: '#fff', boxShadow: SHADOW }
    // Opened by the pointer, so skip the keyboard ring where the browser allows it.
    const focusStart = () => startRef.current?.focus({ preventScroll: true, focusVisible: false } as FocusOptions)

    intro.current = gsap.context(() => {
      if (reducedMotion()) {
        gsap.set(shell, final)
        gsap.set(glyph, rest)
        gsap.set(body, { opacity: 1 })
        gsap.fromTo([backdrop, shell], { opacity: 0 }, { opacity: 1, duration: .2, onComplete: focusStart })
        return
      }
      gsap.timeline({ onComplete: focusStart })
        .to(shell, { width: 72, height: 72, borderRadius: 18, backgroundColor: '#fff', boxShadow: SHADOW, duration: .34, ease: 'power4.out' })
        .addLabel('open', '+=.06')
        .to(backdrop, { opacity: 1, duration: .9, ease: 'power1.out' }, 'open')
        .to(shell, { ...final, duration: .72, ease: 'power4.inOut' }, 'open')
        .to(glyph, { ...rest, duration: .72, ease: 'power4.inOut' }, 'open')
        .fromTo(body, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: .32, ease: 'power4.out' }, 'open+=.5')
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
        <div ref={shellRef} className="egg-shell" role="dialog" aria-modal="true" aria-labelledby="egg-title">
          <div ref={glyphRef} className="egg-glyph" aria-hidden="true"><PackageGlyph /></div>
          <div ref={bodyRef} className="egg-body" style={{ width: DIALOG_W }}>
            <button ref={startRef} type="button" className="egg-row" data-sound="none" onClick={() => close(true)}>
              <span>
                <span id="egg-title" className="egg-title">You found the easter egg!</span>
                <span className="egg-cta">Start the experience<LuArrowRight aria-hidden="true" /></span>
              </span>
              <span ref={slotRef} className="egg-slot" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const readEdges = (style: CSSStyleDeclaration, prop: 'margin' | 'padding' | 'border'): Edges =>
  (['top', 'right', 'bottom', 'left'] as const).map((side) =>
    parseFloat(style.getPropertyValue(prop === 'border' ? `border-${side}-width` : `${prop}-${side}`)) || 0,
  ) as Edges

function gapsOf(el: Element, rect: DOMRect, style: CSSStyleDeclaration): Gap[] {
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
      gaps.push({ x: left + sx, y: a.bottom + sy, w: right - left, h: b.top - a.bottom, value: b.top - a.bottom })
    } else if (b.left - a.right >= 1) {
      const top = Math.min(a.top, b.top)
      const bottom = Math.max(a.bottom, b.bottom)
      gaps.push({ x: a.right + sx, y: top + sy, w: b.left - a.right, h: bottom - top, value: b.left - a.right })
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

  const walk = (el: Element, depth: number) => {
    if (boxes.length >= MAX_BOXES) return
    const tag = el.tagName.toUpperCase()
    if (SKIP.has(tag) || el.hasAttribute('data-egg')) return
    const style = getComputedStyle(el)
    if (style.display === 'none') return
    const rect = el.getBoundingClientRect()
    const shown = style.display !== 'contents' && style.visibility !== 'hidden' && rect.width >= 1 && rect.height >= 1
    if (shown) {
      boxes.push({
        x: rect.left + sx,
        y: rect.top + sy,
        w: rect.width,
        h: rect.height,
        depth,
        margin: readEdges(style, 'margin').map((v) => Math.max(0, v)) as Edges,
        padding: readEdges(style, 'padding'),
        border: readEdges(style, 'border'),
        tag: LANDMARKS.has(tag) ? `${tag.toLowerCase()} ${fmt(rect.width)}×${fmt(rect.height)}` : undefined,
      })
      if (/flex|grid/.test(style.display) && (parseFloat(style.rowGap) > 0 || parseFloat(style.columnGap) > 0)) {
        gaps.push(...gapsOf(el, rect, style))
      }
    }
    if (LEAVES.has(tag)) return
    Array.from(el.children).forEach((child) => walk(child, shown ? depth + 1 : depth))
  }

  walk(root, 0)

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
  return { boxes, gaps }
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

/* Demolition: the facade is every piece of visible content (text blocks and
   replaced media). Pieces in view tremble, hinge off and drop in a shower of
   dust, top to bottom, and the blueprint is drafted in their wake. The facade
   then settles back as a faint ghost over the foundation. */
const REPLACED = new Set(['IMG', 'SVG', 'VIDEO', 'CANVAS', 'IFRAME', 'PICTURE'])
const SWEEP = 1.1 // seconds for the demolition to travel down the viewport
const GHOST = { opacity: .9 }
// In the egg state the settled facade (text and the dot glyphs) turns light
// blue, so the warm blueprint reads as the structure and the content as ink
// on a drawing. The swap lives in CSS (see html[data-egg-blue]).
const tintFacade = (on: boolean) => {
  if (on) document.documentElement.dataset.eggBlue = ''
  else delete document.documentElement.dataset.eggBlue
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
  // The facade settles back as a ghost so the foundation reads first.
  timeline.set(pieces, { x: 0, y: 0, rotation: 0 }, SWEEP + .7)
  timeline.call(tintFacade, [true], SWEEP + .7)
  timeline.to(pieces, { ...GHOST, duration: .5, ease: 'power1.out', stagger: { amount: .25 } }, SWEEP + .7)
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
function Blueprint({ onExit }: { onExit: () => void }) {
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
    const onLeave = () => {
      pointer = null
      last = null
      setHover(null)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', probe, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', probe)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

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
    tintFacade(false)
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
  const tipBelow = hover ? hover.y + hover.h + 40 < window.scrollY + window.innerHeight : true

  return (
    <>
      <div ref={grainRef} className="bp-grain" data-egg data-leaving={leaving || undefined} aria-hidden="true" />
      <div ref={dustRef} className="bp-dust" data-egg aria-hidden="true" />
      <div ref={layerRef} className="bp" data-egg data-leaving={leaving || undefined} aria-hidden="true" style={colorVars}>
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
        <span className="egg-hud-mark" aria-hidden="true">
          {palette.map((color) => <i key={color.name} style={{ '--c': color.base } as CSSProperties} />)}
        </span>
        <span className="egg-hud-track">
          <span className="egg-hud-eq" aria-hidden="true"><i /><i /><i /></span>
          {TRACK.title}<span>{TRACK.artist}</span>
        </span>
        <button type="button" onClick={() => setLeaving(true)} aria-label="Exit inspect mode">
          <LuX aria-hidden="true" />
        </button>
      </div>
    </>
  )
}
