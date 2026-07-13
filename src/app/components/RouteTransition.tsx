'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'

const easeOut = [0.23, 1, 0.32, 1] as const
const easeIn = [0.4, 0, 1, 1] as const

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const isInitialRender = useRef(true)

  useEffect(() => {
    isInitialRender.current = false
  }, [])
  const isInitial = isInitialRender.current

  return (
    <AnimatePresence initial={isInitial} mode="popLayout">
      <motion.div
        key={pathname}
        className="route-transition"
        initial={isInitial || reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(4px)' }}
        animate={isInitial || reduceMotion ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0)' }}
        exit={reduceMotion
          ? { opacity: 0, transition: { duration: 0.08, ease: easeIn } }
          : { opacity: 0, transform: 'translateY(-3px)', transition: { duration: 0.12, ease: easeIn } }}
        transition={{ duration: reduceMotion ? 0.12 : isInitial ? 0.62 : 0.18, ease: easeOut }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
