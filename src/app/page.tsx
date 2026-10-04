'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import gsap from 'gsap'
import { FaGithub } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { LuCircleCheck, LuCircleDotDashed, LuCirclePlay, LuLoaderCircle } from 'react-icons/lu'
import { PiArrowUpRight } from 'react-icons/pi'
import { DotmCircular3 } from '@/components/ui/dotm-circular-3'
import FarmInstrument from './components/FarmInstrument'
import { ItemMedia } from './components/ItemMedia'
import { projects } from './data/projects'

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

const statusIcons = {
  active: LuCirclePlay,
  published: LuCircleCheck,
  'in progress': LuLoaderCircle,
}

function ProjectStatus({ status }: { status: string }) {
  const Icon = statusIcons[status as keyof typeof statusIcons] ?? LuCircleDotDashed
  const statusClass = status.toLowerCase().replaceAll(' ', '-')
  return (
    <span className={`work-status is-${statusClass}`}>
      <Icon aria-hidden="true" />
      <span>{status}</span>
    </span>
  )
}

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
}]

// Lead with the current work, then keep the remaining artifacts on the same baseline.
const selectedWork = [
  ...projects.filter((p) => p.id === 'mapbench'),
  ...projects.filter((p) => p.id !== 'mapbench'),
]

export default function Home() {
  const [filter, setFilter] = useState<Filter>('All')
  const [isWorkExpanded, setIsWorkExpanded] = useState(false)
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
        '.work-card, .writing-entry',
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
        <section data-gsap-enter className="consulting" aria-label="Consulting">
          <p>Available for consulting.</p>
          <a className="book-call" href="https://calendly.com/michaezl/new-meeting" target="_blank" rel="noreferrer" aria-label="Book a call. I help startups build AI agents, developer tools, and production systems.">
            <span className="book-call-label" aria-hidden>Book a call →</span>
            <span className="book-call-detail" aria-hidden>I help startups build AI agents, developer tools, and production systems.</span>
          </a>
        </section>
        <p data-gsap-enter>I build software around agents, markets, and interfaces.</p>
        <p data-gsap-enter>Right now I&apos;m working on <a className="inline-text-link" href="https://www.rubiconpay.xyz/" target="_blank" rel="noreferrer">Rubicon</a>: payment and access rails for agents that discover, buy, and use online writing.</p>
      </header>

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

      <div className="editorial-surface">
        <div className="segmented-panels">
          <div ref={portfolioRef} className="editorial-view segmented-panel" data-active={activePane === 'portfolio'} aria-hidden={activePane !== 'portfolio'}>
            <section
                    hidden={!showProjects}
                    className="work-grid"
                    aria-label="Work"
                    onPointerEnter={(event) => {
                      if (event.pointerType === 'mouse') setIsWorkExpanded(true)
                    }}
                    onPointerLeave={(event) => {
                      if (event.pointerType === 'mouse') setIsWorkExpanded(false)
                    }}
                    onFocusCapture={() => setIsWorkExpanded(true)}
                    onBlurCapture={(event) => {
                      if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
                        setIsWorkExpanded(false)
                      }
                    }}
                  >
                    {selectedWork.map((item, i) => {
                      const external = item.url.startsWith('http')
                      const isHero = i === 0
                      return (
                        <a
                          key={item.id}
                          href={item.url}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noopener noreferrer' : undefined}
                          data-sound="card"
                          className={`work-card${isHero ? ' is-hero' : ''}${isWorkExpanded ? ' is-expanded' : ''} project-${item.id}`}
                          aria-expanded={isWorkExpanded}
                        >
                          <div className="work-media"><ItemMedia item={item} sizes={isHero ? '(max-width:820px) 100vw, 560px' : '380px'} priority /></div>
                          <div className="work-reveal">
                            <div className="work-meta">
                              <div className="work-meta-row">
                                <span className="work-name">{item.name}</span>
                                <ProjectStatus status={item.status} />
                              </div>
                              <p>{item.description}</p>
                            </div>
                          </div>
                        </a>
                      )
                    })}
            </section>
            <section hidden={!showWriting} className={`writing-grid${showProjects ? ' after-work' : ''}`} aria-label="Writing">
                    {writing.map((item) => (
                      <div className="writing-entry" key={item.id}>
                        <Link href={item.url} className="writing-card" data-sound="none">
                          <div className="writing-media"><ItemMedia item={item} sizes="(max-width:620px) 100vw, 460px" priority /></div>
                          <div className="writing-body">
                            <div className="writing-heading">
                              <h3>{item.name}</h3>
                              <span className="writing-meta"><time>{item.year}</time><PiArrowUpRight aria-hidden /></span>
                            </div>
                            <p>{item.description}</p>
                          </div>
                        </Link>
                      </div>
                    ))}
            </section>
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
