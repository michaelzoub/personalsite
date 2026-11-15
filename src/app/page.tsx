'use client'

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { FaGithub } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { DotmCircular3 } from '@/components/ui/dotm-circular-3'
import { BrandMark } from './components/BrandMark'
import FarmInstrument from './components/FarmInstrument'
import MapBenchPreview from './components/MapBenchPreview'
import { ProjectGlyph } from './components/ProjectGlyph'
// import { ProjectPreview } from './components/ProjectPreview'
import { useMagneticHighlight } from './components/useMagneticHighlight'
import { assignTints } from './data/palette'
import { projects } from './data/projects'
import { formatDate } from './utils/formatDate'

function MusicStageLoading() {
  return (
    <div className="music-stage-loading" role="status" aria-label="Loading music map">
      <DotmCircular3 color="var(--accent-strong)" size={30} dotSize={4} ariaLabel="Loading music map" />
    </div>
  )
}

const loadMusicGraph = () => import('./components/musicVisual/graph')

const MusicGraph = dynamic(loadMusicGraph, {
  ssr: false,
  loading: MusicStageLoading,
})

const filters = ['All', 'Engineering', 'Writing', 'Music', 'Future'] as const
const workFilters = ['All', 'Engineering', 'Writing'] as const
const personalFilters = ['Music', 'Future'] as const
type Filter = (typeof filters)[number]

const socials = [
  { label: 'X', href: 'https://x.com/wenkafka', icon: FaXTwitter },
  { label: 'GitHub', href: 'https://github.com/michaelzoub', icon: FaGithub },
]

const writing = [{
  id: 'biggest-hurdle-agi',
  name: 'The biggest hurdle to achieving AGI',
  category: 'Writing' as const,
  year: '2026-06-02',
  description: 'Why open-ended exploration and uncertainty over objectives matter more than optimizing harder against fixed targets.',
  url: '/writing/the-biggest-hurdle-to-achieving-agi',
  screenshotUrl: '/writing/agi/cover.jpg' as string | undefined,
  excerpt: 'Most people would be quick to jump in and claim that energy production, compute, or even algorithmic optimization is the bottleneck to truly intelligent systems. I believe it\'s something much more abstract, yet foundational. Current systems often treat the user prompt as a complete target, then optimize towards an inferred interpretation. But real human tasks are underspecified.',
}, {
  id: 'decentralizing-ai',
  name: 'The war against frontier labs: decentralizing AI',
  category: 'Writing' as const,
  year: '2026-06-14',
  description: 'Why access to intelligence should remain contestable, and why decentralized training and open weights matter.',
  url: '/writing/decentralizing-ai',
  screenshotUrl: '/writing/decentralizing-ai/cover.jpg',
  excerpt: 'If you follow frontier AI, the Fable 5 episode should bother you. Anthropic released one of the most capable models available to the public. Within days, access was restricted after the U.S. government intervened over national-security and export-control concerns. Access to intelligence is becoming dependent on a few labs, a few clouds, a few distribution platforms, and a few governments.',
}].sort((a, b) => b.year.localeCompare(a.year))

// Lead with the current work, then keep the remaining artifacts on the same baseline.
const selectedWork = [
  ...projects.filter((p) => p.id === 'mapbench'),
  ...projects.filter((p) => p.id !== 'mapbench'),
]

// One pass over both lists in reading order, so neighbors across the section break differ too.
// Screenshots that lift out above the hovered project row. Writing never previews.
// MapBench plays its live pipeline; the rest are stills.
const previews: Record<string, string> = {
  rubicon: '/rubicon-hover.png',
  magic: '/magic-hover.png',
}

// A random lean, kept off near-level so it always reads as tilted.
const randomTilt = () => (Math.random() < .5 ? -1 : 1) * (3 + Math.random() * 6)
// Each card keeps the lean it first opened with until the page reloads.
const tilts: Record<string, number> = {}
// Slightly underdamped: the card catches up with a small overshoot, then the swing wobbles out.
const FOLLOW = { stiffness: 420, damping: 32 }
const SWING = { gain: .012, max: 10, stiffness: 260, damping: 11 }

function HoverShot({ id, active }: { id: string; active: boolean }) {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [tilt, setTilt] = useState(0)
  useLayoutEffect(() => {
    if (active) setTilt((tilts[id] ??= randomTilt()))
  }, [active, id])

  // Follow the cursor while it is inside this row, like a stiff card with mass:
  // a spring drags it after the pointer with a little overshoot, and its own
  // inertia swings it about the grab point (the cursor) before it settles.
  useLayoutEffect(() => {
    const anchor = anchorRef.current
    const row = anchor?.parentElement
    if (!anchor || !row) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = { x: 0, y: 0 }
    const pos = { x: 0, y: 0 }
    const vel = { x: 0, y: 0 }
    let angle = 0
    let spin = 0
    let resting = true

    const step = (_time: number, deltaMs: number) => {
      if (resting) return
      const dt = Math.min(deltaMs, 32) / 1000
      for (const axis of ['x', 'y'] as const) {
        vel[axis] += (FOLLOW.stiffness * (target[axis] - pos[axis]) - FOLLOW.damping * vel[axis]) * dt
        pos[axis] += vel[axis] * dt
      }
      // Moving right leaves the card's weight behind, so it leans left, and vice versa.
      const lean = Math.max(-SWING.max, Math.min(SWING.max, -vel.x * SWING.gain))
      spin += (SWING.stiffness * (lean - angle) - SWING.damping * spin) * dt
      angle += spin * dt
      gsap.set(anchor, { x: pos.x, y: pos.y, rotation: angle })
      resting = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) < .1
        && Math.abs(vel.x) + Math.abs(vel.y) < 1 && Math.abs(angle) + Math.abs(spin) < .05
    }

    const place = (event: PointerEvent, instant: boolean) => {
      const box = row.getBoundingClientRect()
      target.x = event.clientX - box.left
      target.y = event.clientY - box.top
      if (instant || reduced) {
        Object.assign(pos, target)
        vel.x = vel.y = angle = spin = 0
        gsap.set(anchor, { x: pos.x, y: pos.y, rotation: 0 })
        return
      }
      resting = false
    }
    const onEnter = (event: PointerEvent) => place(event, true)
    const onMove = (event: PointerEvent) => place(event, false)
    row.addEventListener('pointerenter', onEnter)
    row.addEventListener('pointermove', onMove)
    gsap.ticker.add(step)
    return () => {
      row.removeEventListener('pointerenter', onEnter)
      row.removeEventListener('pointermove', onMove)
      gsap.ticker.remove(step)
    }
  }, [])

  const src = previews[id]
  if (!src && id !== 'mapbench') return null
  return (
    <span ref={anchorRef} className="hover-shot-anchor" aria-hidden="true">
      <span className="hover-shot" data-kind={id} data-active={active} style={{ '--tilt': `${tilt.toFixed(1)}deg` } as CSSProperties}>
        {src ? <Image src={src} alt="" fill sizes="340px" /> : <MapBenchPreview playing={active} />}
      </span>
    </span>
  )
}

const tints = assignTints([...selectedWork, ...writing].map((item) => item.id))

export default function Home() {
  const [filter, setFilter] = useState<Filter>('All')
  const [hovered, setHovered] = useState<string | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const portfolioRef = useRef<HTMLDivElement>(null)
  const musicRef = useRef<HTMLDivElement>(null)
  const futureRef = useRef<HTMLDivElement>(null)
  const previousPane = useRef<'portfolio' | 'music' | 'future'>('portfolio')
  const panelTimeline = useRef<gsap.core.Timeline | null>(null)
  const hasSwitched = useRef(false)
  const isMusic = filter === 'Music'
  const isFuture = filter === 'Future'
  const showProjects = filter === 'All' || filter === 'Engineering'
  const showWriting = filter === 'All' || filter === 'Writing'

  const activePane: 'portfolio' | 'music' | 'future' = isMusic ? 'music' : isFuture ? 'future' : 'portfolio'
  const panes = { portfolio: portfolioRef, music: musicRef, future: futureRef }

  useMagneticHighlight(portfolioRef)

  // One physical pill moves between every segment. Updating it in a layout
  // effect prevents the old button from flashing selected for a frame.
  useLayoutEffect(() => {
    const control = filterRef.current
    const pill = pillRef.current
    if (!control || !pill) return

    const positionPill = (animate: boolean) => {
      const button = control.querySelector<HTMLButtonElement>(`button[data-filter="${filter}"]`)
      if (!button) return
      const controlBox = control.getBoundingClientRect()
      const buttonBox = button.getBoundingClientRect()
      const vars = {
        x: buttonBox.left - controlBox.left,
        y: buttonBox.top - controlBox.top,
        width: buttonBox.width,
        height: buttonBox.height,
        duration: animate ? .2 : 0,
        ease: 'power2.out',
      }
      gsap.killTweensOf(pill)
      gsap.to(pill, vars)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    positionPill(hasSwitched.current && !reduced)
    const observer = new ResizeObserver(() => positionPill(false))
    observer.observe(control)
    return () => observer.disconnect()
  }, [filter])

  // Crossfade the already-mounted panels. The outgoing panel is held in place
  // briefly while the incoming panel establishes the new document height.
  useLayoutEffect(() => {
    const current = panes[activePane].current
    const oldPane = previousPane.current
    const outgoing = panes[oldPane].current
    const allPanels = [portfolioRef.current, musicRef.current, futureRef.current].filter((panel): panel is HTMLDivElement => Boolean(panel))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!current) return
    panelTimeline.current?.kill()
    gsap.killTweensOf(allPanels)
    allPanels.forEach((panel) => gsap.set(panel, { clearProps: 'all' }))

    if (!hasSwitched.current || reduced) {
      previousPane.current = activePane
      return
    }

    if (outgoing === current) {
      gsap.fromTo(current, { autoAlpha: .72, y: 4 }, { autoAlpha: 1, y: 0, duration: .16, ease: 'power2.out', clearProps: 'opacity,visibility,transform' })
    } else if (outgoing) {
      gsap.killTweensOf([outgoing, current])
      gsap.set(outgoing, { position: 'absolute', inset: 0, visibility: 'visible', opacity: 1, y: 0, pointerEvents: 'none' })
      gsap.set(current, { visibility: 'visible', opacity: 0, y: 6 })
      panelTimeline.current = gsap.timeline()
        .to(outgoing, { autoAlpha: 0, y: -3, duration: .1, ease: 'power1.in' })
        .to(current, { autoAlpha: 1, y: 0, duration: .18, ease: 'power2.out' }, '-=.05')
        .set(outgoing, { clearProps: 'all' })
        .set(current, { clearProps: 'all' })
    }
    previousPane.current = activePane

    return () => {
      panelTimeline.current?.kill()
    }
  }, [activePane, filter])

  const selectFilter = (item: Filter) => {
    if (item === filter) return
    hasSwitched.current = true
    setFilter(item)
  }

  return (
    <main className="editorial">
      <header className="lede">
        <BrandMark />
        <div className="lede-head">
          <h1>Michael Zoubkoff</h1>
          <nav className="lede-links" aria-label="Social links">
            {socials.map((item) => {
              const Icon = item.icon
              return (
                <a key={item.href} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>
                  <Icon aria-hidden />
                </a>
              )
            })}
          </nav>
        </div>
        <p>Currently conducting independent research and experimenting with new ways of building software.</p>
      </header>

      {/* Segmented control hidden for the index layout — uncomment to bring back Music / Future.
      <div className="editorial-filter-row">
        <div ref={filterRef} className="reference-filter unified-filter" role="group" aria-label="Browse work and personal interests">
          <span ref={pillRef} className="reference-pill filter-pill-gsap" aria-hidden="true" />
          <div className="filter-segment-group" aria-label="Work">
            {workFilters.map((item) => (
              <button
                key={item}
                data-filter={item}
                onPointerDown={() => selectFilter(item)}
                onMouseDown={() => selectFilter(item)}
                onClick={() => selectFilter(item)}
                aria-pressed={filter === item}
              >
                <span>{item}</span>
              </button>
            ))}
          </div>
          <div className="filter-segment-group personal" aria-label="Personal">
            {personalFilters.map((item) => (
              <button
                key={item}
                data-filter={item}
                onPointerDown={() => selectFilter(item)}
                onMouseDown={() => selectFilter(item)}
                onClick={() => selectFilter(item)}
                aria-pressed={filter === item}
              >
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      */}

      <div className="editorial-surface">
        <div className="segmented-panels">
          <div ref={portfolioRef} className="editorial-view segmented-panel" data-active={activePane === 'portfolio'} aria-hidden={activePane !== 'portfolio'}>
            <div className="index">
              <section hidden={!showProjects} className="index-section" aria-labelledby="index-work">
                <h2 id="index-work" className="index-label">Work</h2>
                <div className="index-track" data-magnetic-track>
                  <span className="magnetic-frame" aria-hidden="true"><span className="magnetic-fill" /></span>
                  <ul className="index-list">
                    {selectedWork.map((item, index) => {
                      const external = item.url.startsWith('http')
                      return (
                        <li
                          key={item.id}
                          className="index-entry"
                          onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(item.id)}
                          onPointerLeave={() => setHovered((current) => (current === item.id ? null : current))}
                        >
                          <a
                            href={item.url}
                            target={external ? '_blank' : undefined}
                            rel={external ? 'noopener noreferrer' : undefined}
                            data-tint={tints[item.id]}
                            className="index-row"
                          >
                            <div>
                              <h3>{item.name}</h3>
                              <p>{item.description}</p>
                            </div>
                            <ProjectGlyph id={item.id} />
                          </a>
                          <HoverShot id={item.id} active={hovered === item.id} />
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </section>
              <section hidden={!showWriting} className="index-section" aria-labelledby="index-writing">
                <h2 id="index-writing" className="index-label">Writing</h2>
                <div className="index-track" data-magnetic-track>
                  <span className="magnetic-frame" aria-hidden="true"><span className="magnetic-fill" /></span>
                  <ul className="index-list">
                    {writing.map((item, index) => (
                      <li
                        key={item.id}
                        className="index-entry"
                        onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(item.id)}
                        onPointerLeave={() => setHovered((current) => (current === item.id ? null : current))}
                      >
                        <Link href={item.url} className="index-row" data-tint={tints[item.id]}>
                          <div>
                            <h3>{item.name}</h3>
                            <p><time dateTime={item.year}>{formatDate(item.year)}</time></p>
                          </div>
                          <ProjectGlyph id={item.id} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </div>
          <div ref={musicRef} className="editorial-view segmented-panel" data-active={activePane === 'music'} aria-hidden={activePane !== 'music'}>
            <div className="editorial-music"><MusicGraph /></div>
          </div>
          <div ref={futureRef} className="editorial-view segmented-panel" data-active={activePane === 'future'} aria-hidden={activePane !== 'future'}>
            <FarmInstrument />
          </div>
        </div>
      </div>

    </main>
  )
}
