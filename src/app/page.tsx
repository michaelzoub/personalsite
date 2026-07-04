'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { FaGithub, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'
import { LuArrowDown, LuArrowUpRight } from 'react-icons/lu'
import ProjectCard from './components/ProjectCard'
import FarmInstrument from './components/FarmInstrument'
import ZoomStage from './components/ZoomStage'
import { ItemMedia } from './components/ItemMedia'
import { BuildingIcon, ReadingIcon, RepeatIcon } from './components/NowIcons'
import { projects } from './data/projects'

const MusicGraph = dynamic(() => import('./components/musicVisual/graph'), { ssr: false })

const filters = ['All', 'Engineering', 'Writing', 'Music', 'Future'] as const
type Filter = (typeof filters)[number]

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
  description: 'Why access to intelligence should remain contestable,and why decentralized training and open weights matter.',
  url: '/writing/decentralizing-ai',
  screenshotUrl: '/writing/decentralizing-ai/cover.jpg',
}]

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

  // A carousel detent: lower, two-stage, and slightly mechanical rather than glassy.
  const carousel = useCallback((context: AudioContext) => {
    const now = context.currentTime
    const body = context.createOscillator()
    const tooth = context.createOscillator()
    const bodyGain = context.createGain()
    const toothGain = context.createGain()
    const filter = context.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(920, now)
    filter.Q.setValueAtTime(1.1, now)
    body.type = 'triangle'
    body.frequency.setValueAtTime(1050, now)
    body.frequency.exponentialRampToValueAtTime(520, now + .028)
    tooth.type = 'square'
    tooth.frequency.setValueAtTime(1800, now + .007)
    tooth.frequency.exponentialRampToValueAtTime(1100, now + .024)
    bodyGain.gain.setValueAtTime(.0001, now)
    bodyGain.gain.exponentialRampToValueAtTime(.022, now + .002)
    bodyGain.gain.exponentialRampToValueAtTime(.0001, now + .034)
    toothGain.gain.setValueAtTime(.0001, now)
    toothGain.gain.setValueAtTime(.0001, now + .006)
    toothGain.gain.exponentialRampToValueAtTime(.008, now + .009)
    toothGain.gain.exponentialRampToValueAtTime(.0001, now + .03)
    body.connect(bodyGain).connect(filter)
    tooth.connect(toothGain).connect(filter)
    filter.connect(context.destination)
    body.start(now)
    tooth.start(now)
    body.stop(now + .04)
    tooth.stop(now + .04)
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

  const playCarousel = useCallback(() => {
    const context = contextRef.current
    if (!context || !readyRef.current) return
    carousel(context)
  }, [carousel])

  return { playClick, playCarousel }
}

export default function Home() {
  const [filter, setFilter] = useState<Filter>('All')
  const [activeId, setActiveId] = useState('intro')
  const previousActiveRef = useRef('intro')
  const { playClick, playCarousel } = useInterfaceSounds()
  const isMusic = filter === 'Music'
  const isFuture = filter === 'Future'
  const items = [...projects, ...writing]
  const visible = isMusic || isFuture ? [] : items.filter((item) => filter === 'All' || item.category === filter)
  const active = items.find((item) => item.id === activeId)
  const firstVisible = visible[0]
  const isIntro = !active && !isMusic && !isFuture

  const focusItem = useCallback((id: string) => {
    if (previousActiveRef.current !== id) {
      previousActiveRef.current = id
      playCarousel()
      setActiveId(id)
    }
  }, [playCarousel])

  const resetFocus = useCallback(() => {
    if (previousActiveRef.current !== 'intro') { previousActiveRef.current = 'intro'; setActiveId('intro') }
  }, [])

  return (
    <main className="reference-shell focus-layout">
      <aside className="focus-sidebar">
        <div className="focus-sidebar-inner">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={active?.id ?? (isMusic ? 'music' : isFuture ? 'future' : 'intro')} className={`focus-copy${isIntro ? ' is-intro' : ''}`} initial={{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(2px)' }} animate={{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }} exit={{ opacity: 0, transform: 'translateY(-7px)', filter: 'blur(2px)', transition: { duration: .15, ease: [0.4, 0, 1, 1] } }} transition={{ duration: .2, ease: [0.23, 1, 0.32, 1] }}>
              {active ? <>
                <h1>{active.name}</h1>
                <p className="focus-description">{active.description}</p>
                <a className="focus-link" href={active.url} target={active.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">Open project <LuArrowUpRight size={13} aria-hidden /></a>
              </> : isMusic ? <>
                <h1>What I listen to<span className="glow-mark">.</span></h1>
                <p className="focus-description">Fourteen tracks mapped as a force graph: electronic through techno, ambient, rap, and jazz. Drag to explore, scroll to zoom, click an album to play it.</p>
              </> : isFuture ? <>
                <h1>Later<span className="glow-mark">.</span></h1>
                <p className="focus-description">I want a life that feels a little less abstract.</p>
                <p className="focus-description">I&apos;m still a city person, and I know I&apos;ll always want to travel. But I also want somewhere I can return to, land I know well, work that changes with the seasons, and a home I can build with my family. A farm feels like a real way to grow into that life.</p>
              </> : <>
                <h1>Michael Zoubkoff<span className="glow-mark">.</span></h1>
                <p className="focus-description">I make tools for machines that spend money, markets that reveal what people believe, and questions without neat endings.</p>
                <dl className="now-panel now-inline" aria-label="Now">
                  <div className="now-panel-head"><span>Now</span><time dateTime="2026-07-03">2026-07-03</time></div>
                  <div className="now-row"><dt><BuildingIcon />Building</dt><dd>Rubicon&apos;s agent-side payments</dd></div>
                  <div className="now-row"><dt><ReadingIcon />Rereading</dt><dd>The Voyager paper</dd></div>
                  <div className="now-row"><dt><RepeatIcon />On repeat</dt><dd><Link href="/music">&ldquo;Mos 6581,&rdquo; Carbon Based Lifeforms</Link></dd></div>
                </dl>
              </>}
            </motion.div>
          </AnimatePresence>
          <div className="sidebar-foot">
            <nav className="focus-socials" aria-label="Social links">
              <a href="https://x.com/wenkafka" target="_blank" rel="noreferrer" aria-label="X"><FaXTwitter size={15} /></a>
              <a href="https://github.com/michaelzoub" target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub size={15} /></a>
              <a href="https://www.linkedin.com/in/michael-zoubkoff-732a7b227/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedinIn size={15} /></a>
            </nav>
          </div>
        </div>
      </aside>

      <div className="focus-content">
        <div className="reference-filter" role="group" aria-label="Filter work">
          {filters.map((item) => (
            <button key={item} onClick={() => { playClick(); setFilter(item); previousActiveRef.current = 'intro'; setActiveId('intro') }} aria-pressed={filter === item}>
              {filter === item && <motion.span layoutId="reference-pill" className="reference-pill" transition={{ type: 'spring', bounce: 0, duration: .3 }} />}
              <span>{item}</span>
            </button>
          ))}
        </div>
        {isMusic ? <motion.div key="music-embed" className="music-embed" initial={{ opacity: 0, transform: 'translateY(8px)' }} animate={{ opacity: 1, transform: 'translateY(0)' }} transition={{ duration: .28, ease: [0.23, 1, 0.32, 1] }}>
          <MusicGraph />
        </motion.div> : isFuture ? <motion.div key="future-stage" className="future-stage" initial={{ opacity: 0, transform: 'translateY(8px)' }} animate={{ opacity: 1, transform: 'translateY(0)' }} transition={{ duration: .28, ease: [0.23, 1, 0.32, 1] }}>
          <FarmInstrument />
        </motion.div> : <>
        <section className="overview-grid" aria-label="Work overview">
          {visible.slice(0, 9).map((item, index) => {
            const external = item.url.startsWith('http')
            return (
              <motion.a
                key={`overview-${item.id}`}
                href={item.url}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className={`overview-card overview-${item.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * .045, duration: .28, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="overview-image">
                  <ItemMedia item={item} sizes="220px" />
                </div>
                <div><span>{item.name}</span><time>{item.year}</time></div>
              </motion.a>
            )
          })}
          <p className="overview-scroll-cue">Scroll to focus <LuArrowDown size={11} aria-hidden /></p>
        </section>
        {firstVisible && <ZoomStage item={firstVisible} onFocus={focusItem} onReset={resetFocus} />}
        <motion.section layout className="focus-feed" aria-label="Selected work">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.slice(1).map((item, index) => <ProjectCard key={item.id} project={item} index={index + 1} active={activeId === item.id} onFocus={() => focusItem(item.id)} />)}
          </AnimatePresence>
        </motion.section>
        </>}
      </div>

      <footer className="reference-footer"><span>© {new Date().getFullYear()}</span><span>Montréal, Québec</span></footer>
    </main>
  )
}
