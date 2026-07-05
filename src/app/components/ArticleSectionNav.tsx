'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type ArticleSection = { id: string; label: string }

export default function ArticleSectionNav({ sections }: { sections: ArticleSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')
  const audioRef = useRef<AudioContext | null>(null)

  const playDetent = useCallback(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const context = audioRef.current ?? new AudioContextClass()
    audioRef.current = context
    void context.resume()

    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const filter = context.createBiquadFilter()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(1240, now)
    oscillator.frequency.exponentialRampToValueAtTime(820, now + .026)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2400, now)
    gain.gain.setValueAtTime(.0001, now)
    gain.gain.exponentialRampToValueAtTime(.025, now + .003)
    gain.gain.exponentialRampToValueAtTime(.0001, now + .04)
    oscillator.connect(filter).connect(gain).connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + .045)
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const marker = Math.min(150, window.innerHeight * .24)
      let current = sections[0]?.id ?? ''
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element && element.getBoundingClientRect().top <= marker) current = section.id
      }
      setActive(current)
    }
    const queue = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [sections])

  const navigate = useCallback((event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    const target = document.getElementById(id)
    if (!target) return
    playDetent()
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
    setActive(id)
  }, [playDetent])

  return <nav className="article-section-nav" aria-label="Article sections">
    <p>Contents</p>
    <ol>
      {sections.map((section) => <li key={section.id} className={active === section.id ? 'is-active' : ''}>
        <a href={`#${section.id}`} onClick={(event) => navigate(event, section.id)} aria-label={`Go to ${section.label}`} aria-current={active === section.id ? 'location' : undefined}>
          {section.label}
        </a>
      </li>)}
    </ol>
  </nav>
}
