'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { gsap } from 'gsap'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FaGithub } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
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

const writing = [{
  id: 'fluid-computer',
  name: 'The Fluid Computer',
  category: 'Writing' as const,
  year: '2026-09-25',
  description: 'A proof-learning environment where language, verification, and interface adapt around the student’s reasoning.',
  url: '/writing/the-fluid-computer',
  screenshotUrl: '/writing/fluid-computer/cover.svg' as string | undefined,
}, {
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
  ...projects.filter((p) => p.id === 'rubicon'),
  ...projects.filter((p) => p.id === 'mapbench'),
  ...projects.filter((p) => p.id !== 'rubicon' && p.id !== 'mapbench'),
]

export default function Home() {
  const [filter, setFilter] = useState<Filter>('All')
  const [animateSurface, setAnimateSurface] = useState(true)
  const reduceMotion = useReducedMotion()
  const deckRef = useRef<HTMLDivElement>(null)
  const isMusic = filter === 'Music'
  const isFuture = filter === 'Future'
  const showProjects = filter === 'All' || filter === 'Engineering'
  const showWriting = filter === 'All' || filter === 'Writing'
  const visibleItems = [
    ...(showProjects ? selectedWork : []),
    ...(showWriting ? writing : []),
  ]
  const [activeId, setActiveId] = useState(selectedWork[0].id)
  const activeItem = visibleItems.find((item) => item.id === activeId) ?? visibleItems[0]
  const surfaceKey = isMusic ? 'music' : isFuture ? 'future' : 'archive'

  // Fetch the graph code after the hero is interactive so entering Music does
  // not wait on its otherwise on-demand chunk. Mounting still waits until the
  // user selects Music, avoiding background WebGL work and texture loading.
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadMusicGraph() }, 800)
    return () => window.clearTimeout(timer)
  }, [])

  useLayoutEffect(() => {
    if (!visibleItems.length) return
    setActiveId(visibleItems[0].id)

    const cards = deckRef.current?.querySelectorAll<HTMLElement>('[data-cascade-card]')
    if (!cards?.length || window.matchMedia('(max-width:620px)').matches) return

    const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches
    gsap.killTweensOf(cards)
    if (reduced) {
      gsap.set(cards, {
        x: 0,
        xPercent: (i) => i * 11.5,
        y: (i) => i * -39,
        z: (i) => i * -52,
        scale: (i) => 1 - i * .016,
        rotationX: 4,
        rotationY: -14,
        rotationZ: -.7,
        opacity: 1,
      })
      return
    }

    gsap.fromTo(cards,
      { x: 0, xPercent: 2, y: 18, z: 0, scale: .975, opacity: 0 },
      {
        x: 0,
        xPercent: (i) => i * 11.5,
        y: (i) => i * -39,
        z: (i) => i * -52,
        scale: (i) => 1 - i * .016,
        rotationX: 4,
        rotationY: -14,
        rotationZ: -.7,
        opacity: 1,
        duration: .52,
        stagger: .045,
        ease: 'power3.out',
        overwrite: true,
      },
    )
  // The visible sequence changes only with this filter.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]
  // Text fades in place — no vertical travel — so the page reads as one still sheet.
  const fadeIn = (delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: reduceMotion ? .16 : .54, delay: reduceMotion ? 0 : delay, ease: 'easeOut' as const },
  })
  // The segmented control doesn't slide in — it seats into the page: slightly
  // raised and soft, then settles flush and sharp.
  const embed = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: .16, delay: 0 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: .54, delay: .12, ease },
      }
  const selectFilter = (item: Filter, pointerInitiated: boolean) => {
    if (item === filter) return
    setAnimateSurface(pointerInitiated)
    setFilter(item)
  }

  const emphasizeCard = (card: HTMLElement, index: number, active: boolean, immediate = false) => {
    if (window.matchMedia('(max-width:620px)').matches) return
    const panel = card.querySelector<HTMLElement>('.cascade-hover-panel')
    const glass = card.querySelector<HTMLElement>('.cascade-glass')
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      if (panel) gsap.set(panel, { opacity: active ? 1 : 0, visibility: active ? 'visible' : 'hidden' })
      return
    }
    gsap.to(card, {
      x: 0,
      xPercent: index * 11.5,
      y: index * -39 + (active ? -10 : 0),
      z: index * -52 + (active ? 112 : 0),
      scale: 1 - index * .016 + (active ? .028 : 0),
      rotationX: active ? 2 : 4,
      rotationY: active ? -7 : -14,
      rotationZ: active ? -.15 : -.7,
      zIndex: active ? 50 : visibleItems.length - index,
      duration: immediate ? 0 : .18,
      ease: 'power3.out',
      overwrite: true,
    })
    if (panel) {
      gsap.to(panel, {
        opacity: active ? 1 : 0,
        yPercent: -50,
        y: active ? 0 : 8,
        scale: active ? 1 : .97,
        rotationX: active ? -2 : -4,
        rotationY: active ? 7 : 14,
        rotationZ: active ? .15 : .7,
        visibility: active ? 'visible' : 'hidden',
        duration: immediate ? 0 : active ? .2 : .12,
        ease: active ? 'power3.out' : 'power2.in',
        overwrite: true,
      })
    }
    if (glass) {
      gsap.to(glass, { opacity: active ? .72 : .34, xPercent: active ? 16 : 0, duration: .24, ease: 'power2.out', overwrite: true })
    }
  }

  return (
    <main className="editorial">
      <header className="lede">
        <div className="lede-head">
          <motion.h1 {...fadeIn(0)}>Michael Zoubkoff</motion.h1>
          <motion.nav className="lede-links" aria-label="Social links" {...fadeIn(.06)}>
            {socials.map((item) => {
              const Icon = item.icon
              return (
                <a key={item.href} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>
                  <Icon aria-hidden />
                </a>
              )
            })}
          </motion.nav>
        </div>
        <motion.section className="consulting" aria-label="Consulting" {...fadeIn(.04)}>
          <p>Available for consulting.</p>
          <a className="book-call" href="https://calendly.com/michaezl/new-meeting" target="_blank" rel="noreferrer" aria-label="Book a call. I help startups build AI agents, developer tools, and production systems.">
            <span className="book-call-label" aria-hidden>Book a call →</span>
            <span className="book-call-detail" aria-hidden>I help startups build AI agents, developer tools, and production systems.</span>
          </a>
        </motion.section>
        <motion.p {...fadeIn(.07)}>I build software around agents, markets, and interfaces.</motion.p>
        <motion.p {...fadeIn(.14)}>Right now I&apos;m working on <a className="inline-text-link" href="https://www.rubiconpay.xyz/" target="_blank" rel="noreferrer">Rubicon</a>: payment and access rails for agents that discover, buy, and use online writing.</motion.p>
      </header>

      <div className="editorial-filter-row">
        <motion.div className="reference-filter unified-filter" role="group" aria-label="Browse work and personal interests" {...embed}>
          <div className="filter-segment-group" aria-label="Work">
            {workFilters.map((item) => (
              <button key={item} data-sound="control" onClick={(event) => selectFilter(item, event.detail > 0)} aria-pressed={filter === item}>
                {filter === item && <motion.span layoutId="filter-pill" className="reference-pill" transition={{ duration: animateSurface && !reduceMotion ? .2 : 0, ease }} />}
                <span>{item}</span>
              </button>
            ))}
          </div>
          <div className="filter-segment-group personal" aria-label="Personal">
            {personalFilters.map((item) => (
              <button key={item} data-sound="control" onClick={(event) => selectFilter(item, event.detail > 0)} aria-pressed={filter === item}>
                {filter === item && <motion.span layoutId="filter-pill" className="reference-pill" transition={{ duration: animateSurface && !reduceMotion ? .2 : 0, ease }} />}
                <span>{item}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="editorial-surface">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={surfaceKey}
            className="editorial-view"
            initial={animateSurface && !reduceMotion ? { opacity: 0, transform: 'translateY(6px)' } : false}
            animate={{ opacity: 1, transform: 'translateY(0)' }}
            exit={animateSurface && !reduceMotion
              ? { opacity: 0, transform: 'translateY(-3px)', transition: { duration: .11, ease: 'easeIn' } }
              : { opacity: 0, transition: { duration: .06 } }}
            transition={{ duration: animateSurface && !reduceMotion ? .21 : .08, ease }}
          >
            {isMusic ? (
              <div className="editorial-music"><MusicGraph /></div>
            ) : isFuture ? (
              <FarmInstrument />
            ) : (
              <section className="cascade-archive" aria-label="Selected work and writing">
                <div ref={deckRef} className="cascade-stage">
                  {visibleItems.map((item, i) => {
                    const external = item.url.startsWith('http')
                    return (
                      <a
                        key={item.id}
                        href={item.url}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        className={`cascade-card${activeItem?.id === item.id ? ' is-active' : ''}`}
                        data-cascade-card
                        data-sound="card"
                        style={{
                          zIndex: visibleItems.length - i,
                          '--cascade-x': `${i * 11.5}%`,
                          '--cascade-y': `${i * -39}px`,
                          '--cascade-z': `${i * -52}px`,
                          '--cascade-scale': 1 - i * .016,
                        } as CSSProperties}
                        aria-label={`${item.name}, ${item.category}`}
                        onPointerEnter={(event) => {
                          if (event.pointerType !== 'mouse') return
                          setActiveId(item.id)
                          emphasizeCard(event.currentTarget, i, true)
                        }}
                        onPointerLeave={(event) => emphasizeCard(event.currentTarget, i, false)}
                        onFocus={(event) => {
                          setActiveId(item.id)
                          emphasizeCard(event.currentTarget, i, true, true)
                        }}
                        onBlur={(event) => emphasizeCard(event.currentTarget, i, false, true)}
                      >
                        <div className="cascade-media">
                          <ItemMedia item={item} sizes="(max-width:620px) 82vw, 520px" priority={i < 3} />
                          <span className="cascade-glass" aria-hidden />
                        </div>
                        <div className="cascade-hover-panel">
                          <span className="cascade-hover-kicker">{item.category}</span>
                          <strong>{item.name}</strong>
                          <p>{item.description}</p>
                          {'supportWordmark' in item && item.supportWordmark && (
                            <span className="cascade-hover-support">
                              <span>with support from</span>
                              <Image src={item.supportWordmark} width={22} height={9} alt={item.supportName ?? 'Supporting organization'} />
                            </span>
                          )}
                          <PiArrowUpRight className="cascade-hover-arrow" aria-hidden />
                        </div>
                      </a>
                    )
                  })}
                </div>

                {activeItem && (
                  <div className="cascade-caption" aria-live="polite">
                    <div>
                      <span className="cascade-kicker">{activeItem.category}</span>
                      <h2>{activeItem.name}</h2>
                      {'supportWordmark' in activeItem && activeItem.supportWordmark && (
                        <span className="cascade-support">
                          <span>with support from</span>
                          <Image
                            src={activeItem.supportWordmark}
                            width={22}
                            height={9}
                            alt={activeItem.supportName ?? 'Supporting organization'}
                          />
                        </span>
                      )}
                    </div>
                    <p>{activeItem.description}</p>
                    <span className="cascade-date">
                      <time>{activeItem.year}</time>
                      <PiArrowUpRight aria-hidden />
                    </span>
                  </div>
                )}
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </main>
  )
}
