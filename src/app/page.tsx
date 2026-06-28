'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import ProjectCard from './components/ProjectCard'
import { projects } from './data/projects'

const filters = ['All', 'Engineering', 'Writing'] as const
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

export default function Home() {
  const [filter, setFilter] = useState<Filter>('All')
  const [activeId, setActiveId] = useState('intro')
  const zoomStageRef = useRef<HTMLDivElement>(null)
  const items = [...projects, ...writing]
  const visible = items.filter((item) => filter === 'All' || item.category === filter)
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
            <motion.div key={active?.id ?? 'intro'} className="focus-copy" initial={{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(2px)' }} animate={{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }} exit={{ opacity: 0, transform: 'translateY(-7px)', filter: 'blur(2px)' }} transition={{ duration: .2, ease: [0.23, 1, 0.32, 1] }}>
              {active ? <>
                <h1>{active.name}</h1>
                <p className="focus-description">{active.description}</p>
                <a className="focus-link" href={active.url} target={active.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">Open project <span>↗</span></a>
              </> : <>
                <h1>Bridging engineering, research, product, design, and intel.</h1>
                <p className="focus-description">I try to go deep, iterate as fast as possible, learn wide, stay curious, and keep the work fun.</p>
              </>}
            </motion.div>
          </AnimatePresence>
          <nav className="focus-socials" aria-label="Social links">
            <a href="https://x.com/kafkaesc" target="_blank" rel="noreferrer">X</a>
            <a href="https://github.com/michaelzoub" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/michael-zoubkoff/" target="_blank" rel="noreferrer">LinkedIn</a>
          </nav>
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
                  {typeof item.screenshotUrl === 'string'
                    ? <img src={item.screenshotUrl} alt="" />
                    : item.screenshotUrl && <Image src={item.screenshotUrl} fill sizes="220px" alt="" />}
                </div>
                <div><span>{item.name}</span><time>{item.year}</time></div>
              </motion.a>
            )
          })}
          <p className="overview-scroll-cue">Scroll to focus <span>↓</span></p>
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
                {typeof firstVisible.screenshotUrl === 'string'
                  ? <img src={firstVisible.screenshotUrl} alt="" />
                  : firstVisible.screenshotUrl && <Image src={firstVisible.screenshotUrl} fill sizes="60vw" alt="" />}
              </div>
              <footer><span>{firstVisible.category}</span><span>Open ↗</span></footer>
            </motion.a>}
          </div>
        </div>
        <motion.section layout className="focus-feed" aria-label="Selected work">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.slice(1).map((item, index) => <ProjectCard key={item.id} project={item} index={index + 1} active={activeId === item.id} onFocus={() => setActiveId(item.id)} />)}
          </AnimatePresence>
        </motion.section>
      </div>

      <footer className="reference-footer"><span>© {new Date().getFullYear()}</span><span>Montréal, Québec</span></footer>
    </main>
  )
}
