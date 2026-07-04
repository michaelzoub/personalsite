'use client'

import { useRef } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { LuArrowUpRight } from 'react-icons/lu'
import { ItemMedia, type MediaItem } from './ItemMedia'

export default function ZoomStage({ item, onFocus, onReset }: { item: MediaItem; onFocus: (id: string) => void; onReset: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [.1, .46, .6], [.6, 1, 1])
  const opacity = useTransform(scrollYProgress, [.08, .24, .78, .92], [0, 1, 1, 0])
  const external = item.url.startsWith('http')

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (progress >= .4 && progress < .78) onFocus(item.id)
    if (progress <= .12) onReset()
  })

  return (
    <div ref={ref} className="overview-zoom-stage">
      <div className="overview-stage-sticky">
        <motion.a href={item.url} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="overview-focus-card" style={{ scale, opacity }}>
          <header><span>{item.name}</span><time>{item.year}</time></header>
          <div className="overview-focus-image"><ItemMedia item={item} sizes="60vw" /></div>
          <footer><span>{item.category}</span><span>Open <LuArrowUpRight size={12} aria-hidden /></span></footer>
        </motion.a>
      </div>
    </div>
  )
}
