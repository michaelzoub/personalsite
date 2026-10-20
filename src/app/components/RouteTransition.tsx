import type { ReactNode } from 'react'

// Each page owns its entrance in CSS (see `enterFade` / `articleFade`), so it
// runs from the first paint and hydration never hides server-rendered content.
export function RouteTransition({ children }: { children: ReactNode }) {
  return <div className="route-transition">{children}</div>
}
