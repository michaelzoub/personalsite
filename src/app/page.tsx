'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import { FaGithub, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'
import { LuArrowDown, LuArrowUpRight, LuBookOpen, LuHammer } from 'react-icons/lu'
import ProjectCard from './components/ProjectCard'
import { projects } from './data/projects'

const MusicGraph = dynamic(() => import('./components/musicVisual/graph'), { ssr: false })

const filters = ['All', 'Engineering', 'Writing', 'Music'] as const
type Filter = (typeof filters)[number]

const writing = [{
  id: 'biggest-hurdle-agi',
  name: 'The biggest hurdle to achieving AGI',
  category: 'Writing' as const,
  year: '2026-06-02',
  description: 'Why open-ended exploration and uncertainty over objectives matter more than optimizing harder against fixed targets.',
  url: '/writing/the-biggest-hurdle-to-achieving-agi',
  screenshotUrl: '/writing/agi/cover.jpg',
}]

type Item = (typeof projects)[number] | (typeof writing)[number]

function ItemMedia({ item, sizes }: { item: Item; sizes: string }) {
  if ('videoUrl' in item && item.videoUrl) {
    return <video src={item.videoUrl} autoPlay muted loop playsInline />
  }
  if (typeof item.screenshotUrl === 'string') return <img src={item.screenshotUrl} alt="" />
  return item.screenshotUrl ? <Image src={item.screenshotUrl} fill sizes={sizes} alt="" /> : null
}

export default function Home() {
  const [filter, setFilter] = useState<Filter>('All')
  const [activeId, setActiveId] = useState('intro')
  const zoomStageRef = useRef<HTMLDivElement>(null)
  const isMusic = filter === 'Music'
  const items = [...projects, ...writing]
  const visible = isMusic ? [] : items.filter((item) => filter === 'All' || item.category === filter)
  const active = items.find((item) => item.id === activeId)
  const firstVisible = visible[0]
  const { scrollYProgress } = useScroll({ target: zoomStageRef, offset: ['start end', 'end start'] })
  const focusScale = useTransform(scrollYProgress, [.1, .46, .6], [.6, 1, 1])
  const focusOpacity = useTransform(scrollYProgress, [.08, .24, .78, .92], [0, 1, 1, 0])

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const first = visible[0]
    if (progress >= .4 && progress < .78 && first) {
      setActiveId((current) => current === first.id ? current : first.id)
    }
    if (progress <= .12) setActiveId((current) => current === 'intro' ? current : 'intro')
  })

  return (
    <main className="reference-shell focus-layout">
      <aside className="focus-sidebar">
        <div className="focus-sidebar-inner">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={active?.id ?? (isMusic ? 'music' : 'intro')} className="focus-copy" initial={{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(2px)' }} animate={{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }} exit={{ opacity: 0, transform: 'translateY(-7px)', filter: 'blur(2px)' }} transition={{ duration: .2, ease: [0.23, 1, 0.32, 1] }}>
              {active ? <>
                <h1>{active.name}</h1>
                <p className="focus-description">{active.description}</p>
                <a className="focus-link" href={active.url} target={active.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">Open project <LuArrowUpRight size={13} aria-hidden /></a>
              </> : isMusic ? <>
                <h1>What I listen to<span className="glow-mark">.</span></h1>
                <p className="focus-description">Fourteen tracks mapped as a force graph: electronic through techno, ambient, rap, and jazz. Drag to explore, scroll to zoom, click an album to play it.</p>
              </> : <>
                <h1>Michael Zoubkoff<span className="glow-mark">.</span></h1>
                <p className="focus-description">I build tools where autonomous agents spend real money: payment rails for machine readers, a prediction-market terminal, and frontier-tech research, from Montréal.</p>
                <p className="focus-description">My working belief: the hard part of intelligence isn&apos;t optimizing harder against a fixed objective, it&apos;s exploring while holding the objective loosely.</p>
              </>}
            </motion.div>
          </AnimatePresence>
          <div className="sidebar-foot">
            <dl className="now-panel" aria-label="Now">
              <div className="now-panel-head"><span>Now</span><time dateTime="2026-07-03">July 3, 2026</time></div>
              <div className="now-row"><dt><LuHammer aria-hidden />Building</dt><dd>Rubicon&apos;s agent-side payments</dd></div>
              <div className="now-row"><dt><LuBookOpen aria-hidden />Rereading</dt><dd>The Voyager paper</dd></div>
              <div className="now-row"><dt><span className="eq" aria-hidden><i /><i /><i /></span>On repeat</dt><dd><Link href="/music">&ldquo;Mos 6581,&rdquo; Carbon Based Lifeforms</Link></dd></div>
            </dl>
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
            <button key={item} onClick={() => { setFilter(item); setActiveId('intro') }} aria-pressed={filter === item}>
              {filter === item && <motion.span layoutId="reference-pill" className="reference-pill" transition={{ type: 'spring', bounce: .12, duration: .35 }} />}
              <span>{item}</span>
            </button>
          ))}
        </div>
        {isMusic ? <motion.div key="music-embed" className="music-embed" initial={{ opacity: 0, transform: 'translateY(8px)' }} animate={{ opacity: 1, transform: 'translateY(0)' }} transition={{ duration: .28, ease: [0.23, 1, 0.32, 1] }}>
          <MusicGraph />
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
                className="overview-card"
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
        <div ref={zoomStageRef} className="overview-zoom-stage">
          <div className="overview-stage-sticky">
            {firstVisible && <motion.a
              href={firstVisible.url}
              target={firstVisible.url.startsWith('http') ? '_blank' : undefined}
              rel={firstVisible.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="overview-focus-card"
              style={{ scale: focusScale, opacity: focusOpacity }}
            >
              <header><span>{firstVisible.name}</span><time>{firstVisible.year}</time></header>
              <div className="overview-focus-image">
                <ItemMedia item={firstVisible} sizes="60vw" />
              </div>
              <footer><span>{firstVisible.category}</span><span>Open <LuArrowUpRight size={12} aria-hidden /></span></footer>
            </motion.a>}
          </div>
        </div>
        <motion.section layout className="focus-feed" aria-label="Selected work">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.slice(1).map((item, index) => <ProjectCard key={item.id} project={item} index={index + 1} active={activeId === item.id} onFocus={() => setActiveId(item.id)} />)}
          </AnimatePresence>
        </motion.section>
        </>}
      </div>

      <footer className="reference-footer"><span>© {new Date().getFullYear()}</span><span>Montréal, Québec</span></footer>
    </main>
  )
}
