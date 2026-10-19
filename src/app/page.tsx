'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import gsap from 'gsap'
import { FaGithub } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { DotmCircular3 } from '@/components/ui/dotm-circular-3'
import { BrandMark } from './components/BrandMark'
import FarmInstrument from './components/FarmInstrument'
import { ProjectGlyph } from './components/ProjectGlyph'
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
}, {
  id: 'decentralizing-ai',
  name: 'The war against frontier labs: decentralizing AI',
  category: 'Writing' as const,
  year: '2026-06-14',
  description: 'Why access to intelligence should remain contestable, and why decentralized training and open weights matter.',
  url: '/writing/decentralizing-ai',
  screenshotUrl: '/writing/decentralizing-ai/cover.jpg',
}].sort((a, b) => b.year.localeCompare(a.year))

// Lead with the current work, then keep the remaining artifacts on the same baseline.
const selectedWork = [
  ...projects.filter((p) => p.id === 'mapbench'),
  ...projects.filter((p) => p.id !== 'mapbench'),
]

// One pass over both lists in reading order, so neighbors across the section break differ too.
const tints = assignTints([...selectedWork, ...writing].map((item) => item.id))

export default function Home() {
  const [filter, setFilter] = useState<Filter>('All')
  const rootRef = useRef<HTMLElement>(null)
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

  // GSAP owns the initial reveal. All segmented views already exist in the DOM,
  // so this animation never gates loading or component setup.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-gsap-enter]',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: reduced ? .01 : .42, stagger: reduced ? 0 : .04, ease: 'power2.out', clearProps: 'opacity,visibility' },
      )
      gsap.fromTo(
        '.index-entry',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: reduced ? .01 : .42, stagger: reduced ? 0 : .035, ease: 'power2.out', clearProps: 'opacity,visibility' },
      )
    }, root)
    return () => context.revert()
  }, [])

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
    <main ref={rootRef} className="editorial">
      <header className="lede">
        <BrandMark />
        <div className="lede-head">
          <h1 data-gsap-enter>Michael Zoubkoff</h1>
          <nav data-gsap-enter className="lede-links" aria-label="Social links">
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
        <p data-gsap-enter>I research and build agents.</p>
        <p data-gsap-enter>Right now I&apos;m researching independently and experimenting with new ways of building software.</p>
      </header>

      {/* Segmented control hidden for the index layout — uncomment to bring back Music / Future.
      <div className="editorial-filter-row">
        <div ref={filterRef} data-gsap-enter className="reference-filter unified-filter" role="group" aria-label="Browse work and personal interests">
          <span ref={pillRef} className="reference-pill filter-pill-gsap" aria-hidden="true" />
          <div className="filter-segment-group" aria-label="Work">
            {workFilters.map((item) => (
              <button
                key={item}
                data-filter={item}
                data-sound="control"
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
                data-sound="control"
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
                    {selectedWork.map((item) => {
                      const external = item.url.startsWith('http')
                      return (
                        <li key={item.id} className="index-entry">
                          <a
                            href={item.url}
                            target={external ? '_blank' : undefined}
                            rel={external ? 'noopener noreferrer' : undefined}
                            data-sound="card"
                            data-tint={tints[item.id]}
                            className="index-row"
                          >
                            <div>
                              <h3>{item.name}</h3>
                              <p>{item.description}</p>
                            </div>
                            <ProjectGlyph id={item.id} />
                          </a>
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
                    {writing.map((item) => (
                      <li key={item.id} className="index-entry">
                        <Link href={item.url} className="index-row" data-sound="none" data-tint={tints[item.id]}>
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
