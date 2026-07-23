'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
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
  ...projects.filter((p) => p.id !== 'rubicon'),
]

export default function Home() {
  const [filter, setFilter] = useState<Filter>('All')
  const [animateSurface, setAnimateSurface] = useState(true)
  const reduceMotion = useReducedMotion()
  const [firstLoad, setFirstLoad] = useState(true)
  const [isWorkExpanded, setIsWorkExpanded] = useState(false)
  const isMusic = filter === 'Music'
  const isFuture = filter === 'Future'
  const showProjects = filter === 'All' || filter === 'Engineering'
  const showWriting = filter === 'All' || filter === 'Writing'
  // "All" and "Engineering" share the same project media. Keep that subtree
  // mounted when moving between the two so an in-progress video is never reset.
  const surfaceKey = showProjects ? 'work' : filter.toLowerCase()

  // Lead the entrance only on the first paint; filter switches stay instant.
  useEffect(() => {
    const timer = setTimeout(() => setFirstLoad(false), 520)
    return () => clearTimeout(timer)
  }, [])

  // Fetch the graph code after the hero is interactive so entering Music does
  // not wait on its otherwise on-demand chunk. Mounting still waits until the
  // user selects Music, avoiding background WebGL work and texture loading.
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadMusicGraph() }, 800)
    return () => window.clearTimeout(timer)
  }, [])

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
  const cardBase = .14
  const cardInitial = firstLoad
    ? { opacity: 0 }
    : false

  const selectFilter = (item: Filter, pointerInitiated: boolean) => {
    if (item === filter) return
    setAnimateSurface(pointerInitiated)
    setFilter(item)
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
              <>
                {showProjects && (
                  <section
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
                        <motion.a
                          key={item.id}
                          href={item.url}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noopener noreferrer' : undefined}
                          data-sound="card"
                          className={`work-card${isHero ? ' is-hero' : ''}${isWorkExpanded ? ' is-expanded' : ''} project-${item.id}`}
                          aria-expanded={isWorkExpanded}
                          initial={cardInitial}
                          animate={{ opacity: 1 }}
                          transition={{ delay: firstLoad ? cardBase + i * .035 : 0, duration: firstLoad ? .54 : 0, ease }}
                        >
                          <div className="work-media"><ItemMedia item={item} sizes={isHero ? '(max-width:820px) 100vw, 560px' : '380px'} priority={i < 3} /></div>
                          <div className="work-reveal">
                            <div className="work-meta">
                              <div className="work-meta-row">
                                <span className="work-name">{item.name}</span>
                                <span className="work-status">{item.status}</span>
                              </div>
                              <p>{item.description}</p>
                            </div>
                          </div>
                        </motion.a>
                      )
                    })}
                  </section>
                )}
                {showWriting && (
                  <section className={`writing-grid${showProjects ? ' after-work' : ''}`} aria-label="Writing">
                    {writing.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={cardInitial}
                        animate={{ opacity: 1 }}
                        transition={{ delay: firstLoad ? cardBase + (showProjects ? selectedWork.length : 0) * .035 + i * .035 : 0, duration: firstLoad ? .54 : 0, ease }}
                      >
                        <Link href={item.url} className="writing-card" data-sound="none">
                          <div className="writing-media"><ItemMedia item={item} sizes="(max-width:620px) 100vw, 460px" priority={!showProjects} /></div>
                          <div className="writing-body">
                            <div className="writing-heading">
                              <h3>{item.name}</h3>
                              <span className="writing-meta"><time>{item.year}</time><PiArrowUpRight aria-hidden /></span>
                            </div>
                            <p>{item.description}</p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </section>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </main>
  )
}
