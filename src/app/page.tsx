'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FaGithub } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { PiArrowUpRight } from 'react-icons/pi'
import FarmInstrument from './components/FarmInstrument'
import { ItemMedia } from './components/ItemMedia'
import { projects } from './data/projects'

const MusicGraph = dynamic(() => import('./components/musicVisual/graph'), { ssr: false })

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

declare global {
  interface Window { webkitAudioContext?: typeof AudioContext }
}

function useInterfaceSounds() {
  const contextRef = useRef<AudioContext | null>(null)
  const readyRef = useRef(false)

  // A watch-crown detent: tiny, high, dry, and over before it calls attention to itself.
  const click = useCallback((context: AudioContext) => {
    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const filter = context.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(3200, now)
    filter.Q.setValueAtTime(2.4, now)
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(3600, now)
    oscillator.frequency.exponentialRampToValueAtTime(2100, now + .012)
    gain.gain.setValueAtTime(.0001, now)
    gain.gain.exponentialRampToValueAtTime(.016, now + .0015)
    gain.gain.exponentialRampToValueAtTime(.0001, now + .018)
    oscillator.connect(filter).connect(gain).connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + .02)
  }, [])

  useEffect(() => {
    const enable = () => {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return
      contextRef.current ??= new AudioContextClass()
      void contextRef.current.resume()
      readyRef.current = true
    }
    const options = { passive: true } as AddEventListenerOptions
    window.addEventListener('wheel', enable, options)
    window.addEventListener('touchstart', enable, options)
    window.addEventListener('pointerdown', enable, options)
    window.addEventListener('keydown', enable)
    return () => {
      window.removeEventListener('wheel', enable)
      window.removeEventListener('touchstart', enable)
      window.removeEventListener('pointerdown', enable)
      window.removeEventListener('keydown', enable)
    }
  }, [click])

  const playClick = useCallback(() => {
    const context = contextRef.current
    if (!context || !readyRef.current) return
    click(context)
  }, [click])

  return { playClick }
}

export default function Home() {
  const [filter, setFilter] = useState<Filter>('All')
  const { playClick } = useInterfaceSounds()
  const reduceMotion = useReducedMotion()
  const [firstLoad, setFirstLoad] = useState(true)
  const isMusic = filter === 'Music'
  const isFuture = filter === 'Future'
  const showProjects = filter === 'All' || filter === 'Engineering'
  const showWriting = filter === 'All' || filter === 'Writing'
  const surfaceKey = isMusic ? 'music' : isFuture ? 'future' : 'work'

  // Lead the entrance only on the first paint; filter switches stay instant.
  useEffect(() => {
    const timer = setTimeout(() => setFirstLoad(false), 900)
    return () => clearTimeout(timer)
  }, [])

  const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]
  // Text fades in place — no vertical travel — so the page reads as one still sheet.
  const fadeIn = (delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: reduceMotion ? .3 : .55, delay: reduceMotion ? delay * .5 : delay, ease: 'easeOut' as const },
  })
  // The segmented control doesn't slide in — it seats into the page: slightly
  // raised and soft, then settles flush and sharp.
  const embed = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: .3, delay: .14 } }
    : {
        initial: { opacity: 0, scale: 1.04, filter: 'blur(3px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        transition: { duration: .55, delay: .28, ease },
      }
  const cardBase = firstLoad ? .3 : 0

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
        <motion.p {...fadeIn(.07)}>I build software around agents, markets, and interfaces.</motion.p>
        <motion.p {...fadeIn(.14)}>Right now I&apos;m working on <a className="inline-text-link" href="https://www.rubiconpay.xyz/" target="_blank" rel="noreferrer">Rubicon</a>: payment and access rails for agents that discover, buy, and use online writing.</motion.p>
      </header>

      <div className="editorial-filter-row">
        <motion.div className="reference-filter unified-filter" role="group" aria-label="Browse work and personal interests" {...embed}>
          <div className="filter-segment-group" aria-label="Work">
            {workFilters.map((item) => (
              <button key={item} onClick={() => { playClick(); setFilter(item) }} aria-pressed={filter === item}>
                {filter === item && <motion.span layoutId="filter-pill" className="reference-pill" transition={{ duration: .2, ease: [0.23, 1, 0.32, 1] }} />}
                <span>{item}</span>
              </button>
            ))}
          </div>
          <div className="filter-segment-group personal" aria-label="Personal">
            {personalFilters.map((item) => (
              <button key={item} onClick={() => { playClick(); setFilter(item) }} aria-pressed={filter === item}>
                {filter === item && <motion.span layoutId="filter-pill" className="reference-pill" transition={{ duration: .2, ease: [0.23, 1, 0.32, 1] }} />}
                <span>{item}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="editorial-surface">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={surfaceKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: .16, ease: 'easeIn' } }}
            transition={{ duration: .22, ease: 'easeOut' }}
          >
            {isMusic ? (
              <div className="editorial-music"><MusicGraph /></div>
            ) : isFuture ? (
              <FarmInstrument />
            ) : (
              <>
                {showProjects && (
                  <section className="work-grid" aria-label="Work">
                    {selectedWork.map((item, i) => {
                      const external = item.url.startsWith('http')
                      const isHero = i === 0
                      return (
                        <motion.a
                          key={item.id}
                          href={item.url}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noopener noreferrer' : undefined}
                          className={`work-card${isHero ? ' is-hero' : ''} project-${item.id}`}
                          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          transition={{ delay: cardBase + i * .05, duration: .45, ease }}
                        >
                          <div className="work-media"><ItemMedia item={item} sizes={isHero ? '(max-width:820px) 100vw, 560px' : '380px'} /></div>
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
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        transition={{ delay: cardBase + (showProjects ? selectedWork.length : 0) * .05 + i * .05, duration: .45, ease }}
                      >
                        <Link href={item.url} className="writing-card">
                          <div className="writing-media"><ItemMedia item={item} sizes="(max-width:620px) 100vw, 460px" /></div>
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
