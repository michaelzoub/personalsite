'use client'

import type { MouseEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'motion/react'

export type ArticleSection = { id: string; label: string }

const prefersInstantScroll = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function ArticleSectionNav({ sections }: { sections: ArticleSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const settleLockRef = useRef(false)
  const settleTimerRef = useRef(0)
  const targetRef = useRef<string | null>(null)
  const retryRef = useRef(0)
  const settleRef = useRef<() => void>(() => {})
  const reduceMotion = useReducedMotion()

  // Route transitions use transforms, which make `position: fixed` descendants
  // behave as if they are fixed to the article wrapper. Portaling to body keeps
  // the rail pinned to the viewport through both scrolling and transitions.
  useEffect(() => setPortalTarget(document.body), [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      if (settleLockRef.current) return
      const marker = Math.min(150, window.innerHeight * .24)
      let current = sections[0]?.id ?? ''
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element && element.getBoundingClientRect().top <= marker) current = section.id
      }
      // The last heading may never cross the marker line on short tail sections,
      // so bottom-of-page always counts as the final section.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = sections[sections.length - 1]?.id ?? current
      }
      setActive(current)
    }
    const queue = () => { if (!frame) frame = window.requestAnimationFrame(update) }

    // True when the clicked section hasn't landed where scroll-margin-top puts
    // it — happens when content above it (lazy images) changed height mid-scroll.
    const landedShort = () => {
      const id = targetRef.current
      if (!id) return false
      const element = document.getElementById(id)
      if (!element) return false
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (window.scrollY >= maxScroll - 2) return false
      const expected = parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0
      return Math.abs(element.getBoundingClientRect().top - expected) > 4
    }
    const unlock = () => {
      targetRef.current = null
      settleLockRef.current = false
      window.clearTimeout(settleTimerRef.current)
      queue()
    }
    // Runs when the glide stops (scrollend, or the fallback timer): if the
    // section drifted while we scrolled, glide the remaining distance.
    const settle = () => {
      if (!settleLockRef.current) return
      const id = targetRef.current
      if (id && retryRef.current < 2 && landedShort()) {
        retryRef.current += 1
        window.clearTimeout(settleTimerRef.current)
        settleTimerRef.current = window.setTimeout(settle, 1500)
        document.getElementById(id)?.scrollIntoView({ behavior: prefersInstantScroll() ? 'auto' : 'smooth', block: 'start' })
        return
      }
      unlock()
    }
    settleRef.current = settle
    // Manual scroll input hands control back immediately — no correction fights the user.
    const interrupt = () => { if (settleLockRef.current) unlock() }

    update()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    window.addEventListener('scrollend', settle)
    window.addEventListener('wheel', interrupt, { passive: true })
    window.addEventListener('touchmove', interrupt, { passive: true })
    window.addEventListener('keydown', interrupt)
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      window.removeEventListener('scrollend', settle)
      window.removeEventListener('wheel', interrupt)
      window.removeEventListener('touchmove', interrupt)
      window.removeEventListener('keydown', interrupt)
      window.clearTimeout(settleTimerRef.current)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [sections])

  const navigate = useCallback((event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    const target = document.getElementById(id)
    if (!target) return
    // Hold the scroll spy while the page glides so the marker doesn't sweep
    // back through every section between here and the target; the settle pass
    // re-checks the landing spot once the glide stops.
    settleLockRef.current = true
    targetRef.current = id
    retryRef.current = 0
    window.clearTimeout(settleTimerRef.current)
    settleTimerRef.current = window.setTimeout(() => settleRef.current(), 1500)
    target.scrollIntoView({ behavior: prefersInstantScroll() ? 'auto' : 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
    setActive(id)
  }, [])

  const navigation = <nav className="article-section-nav" aria-label="Article sections">
    <ol>
      {sections.map((section) => <li key={section.id} className={active === section.id ? 'is-active' : ''}>
        <a href={`#${section.id}`} onClick={(event) => navigate(event, section.id)} aria-label={`Go to ${section.label}`} aria-current={active === section.id ? 'location' : undefined}>
          <span>{section.label}</span>
          <i aria-hidden>
            {active === section.id && (
              <motion.b
                layoutId="article-section-signal"
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 34, mass: .7 }}
              />
            )}
          </i>
        </a>
      </li>)}
    </ol>
  </nav>

  return portalTarget ? createPortal(navigation, portalTarget) : null
}
