'use client'

import gsap from 'gsap'
import { usePathname } from 'next/navigation'
import { useLayoutEffect, useRef, type ReactNode } from 'react'

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const routeRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const route = routeRef.current
    if (!route) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.killTweensOf(route)
    gsap.fromTo(
      route,
      reduced ? { autoAlpha: 0 } : { autoAlpha: 0, y: 4 },
      { autoAlpha: 1, y: 0, duration: reduced ? .01 : .2, ease: 'power2.out', clearProps: 'opacity,visibility,transform' },
    )
  }, [pathname])

  return (
    <div ref={routeRef} className="route-transition">{children}</div>
  )
}
