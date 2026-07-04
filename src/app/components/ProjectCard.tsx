'use client'

import Image, { type StaticImageData } from 'next/image'
import { motion } from 'motion/react'
import { LuArrowUpRight } from 'react-icons/lu'

type CardProject = {
  id: string
  name: string
  category: 'Engineering' | 'Writing'
  year: string
  description: string
  url: string
  screenshotUrl?: StaticImageData | string
  videoUrl?: string
}

export default function ProjectCard({ project, index, active = false, onFocus }: { project: CardProject; index: number; active?: boolean; onFocus?: () => void }) {
  const external = project.url.startsWith('http')
  return (
    <motion.article
      layout
      initial={{ opacity: 0, transform: 'translateY(14px)' }}
      animate={{ opacity: 1, transform: 'translateY(0)' }}
      exit={{ opacity: 0, transform: 'translateY(8px)', transition: { duration: .15, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: .26, delay: index * .045, ease: [0.23, 1, 0.32, 1] }}
      viewport={{ amount: index === 0 ? .8 : .58, margin: '-8% 0px -8% 0px' }}
      onViewportEnter={onFocus}
      className={`masonry-card card-shape-${index % 4} ${active ? 'is-active' : ''}`}
    >
      <a href={project.url} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
        <header><span>{project.name}</span><time>{project.year}</time></header>
        <div className="masonry-image">
          {project.videoUrl
            ? <video src={project.videoUrl} autoPlay muted loop playsInline />
            : project.screenshotUrl && (typeof project.screenshotUrl === 'string'
              ? <img src={project.screenshotUrl} alt="" loading="lazy" />
              : <Image src={project.screenshotUrl} fill sizes="(max-width: 760px) 100vw, 34vw" alt="" />)}
          <div className="image-tint" />
          <span className="card-arrow" aria-hidden="true"><LuArrowUpRight size={16} /></span>
        </div>
        <footer><span>{project.category}</span><p>View {project.category === 'Writing' ? 'writing' : 'project'} <LuArrowUpRight size={11} aria-hidden /></p></footer>
      </a>
    </motion.article>
  )
}
