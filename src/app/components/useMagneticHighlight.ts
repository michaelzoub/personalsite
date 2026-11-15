import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'

// One highlight per list that snaps between rows and sits fixed on the active
// one. The frame owns position, size, scale and opacity; the fill inside it
// carries the row's tint.
const BLEED_X = 16
const BLEED_Y = 14
// Bleed the frame grows in from, so it starts hugging the text.
const START_X = 12
const START_Y = 10

export function useMagneticHighlight(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cleanups: Array<() => void> = []

    root.querySelectorAll<HTMLElement>('[data-magnetic-track]').forEach((track) => {
      const frame = track.querySelector<HTMLElement>('.magnetic-frame')
      const fill = frame?.querySelector<HTMLElement>('.magnetic-fill')
      if (!frame || !fill) return

      let active: HTMLElement | null = null
      let safe = { scaleX: 1, scaleY: 1 }

      const boxFor = (row: HTMLElement) => {
        const t = track.getBoundingClientRect()
        const r = row.getBoundingClientRect()
        safe = {
          scaleX: (r.width + START_X * 2) / (r.width + BLEED_X * 2),
          scaleY: (r.height + START_Y * 2) / (r.height + BLEED_Y * 2),
        }
        return {
          x: r.left - t.left - BLEED_X,
          y: r.top - t.top - BLEED_Y,
          width: r.width + BLEED_X * 2,
          height: r.height + BLEED_Y * 2,
        }
      }

      // Each row carries its own tint; the fill eases between them via CSS.
      const tint = (row: HTMLElement, instant: boolean) => {
        const color = row.dataset.tint
        if (!color) return fill.style.removeProperty('--tint')
        if (!instant) return fill.style.setProperty('--tint', color)
        fill.style.transition = 'none'
        fill.style.setProperty('--tint', color)
        void fill.offsetWidth
        fill.style.removeProperty('transition')
      }

      const enter = (row: HTMLElement) => {
        const box = boxFor(row)
        tint(row, !active)
        if (active) {
          // Already lit: jump to the new row with a hard snap.
          gsap.to(frame, { ...box, duration: reduced ? 0 : .2, ease: 'expo.out', overwrite: 'auto' })
        } else {
          // Start hugging the text, then snap out to full bleed.
          gsap.killTweensOf(frame)
          gsap.set(frame, { ...box, transformOrigin: '50% 50%' })
          gsap.fromTo(
            frame,
            { autoAlpha: 0, ...(reduced ? {} : safe) },
            { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: reduced ? .1 : .16, ease: reduced ? 'none' : 'power4.out' },
          )
        }
        active = row
      }

      const leave = () => {
        if (!active) return
        active = null
        gsap.to(frame, {
          autoAlpha: 0,
          ...(reduced ? {} : safe),
          duration: reduced ? .1 : .14,
          ease: 'power2.in',
          overwrite: 'auto',
        })
      }

      // In the gaps and the hit margin around the list, the nearest row owns the cursor.
      const nearest = (clientY: number) => {
        let best: HTMLElement | null = null
        let bestDistance = Infinity
        track.querySelectorAll<HTMLElement>('.index-row').forEach((row) => {
          const r = row.getBoundingClientRect()
          const distance = Math.max(r.top - clientY, clientY - r.bottom, 0)
          if (distance < bestDistance) [best, bestDistance] = [row, distance]
        })
        return best
      }

      const onPointerMove = (event: PointerEvent) => {
        const row = (event.target as Element).closest<HTMLElement>('.index-row') ?? nearest(event.clientY)
        if (row && row !== active) enter(row)
      }
      // A click in the margin or a gap opens whichever row is lit.
      const onClick = (event: MouseEvent) => {
        if (!active || (event.target as Element).closest('.index-row')) return
        active.dispatchEvent(new MouseEvent('click', event))
      }
      const onPointerLeave = () => leave()
      const onFocusIn = (event: FocusEvent) => {
        const row = (event.target as Element).closest<HTMLElement>('.index-row')
        if (row?.matches(':focus-visible')) enter(row)
      }
      const onFocusOut = (event: FocusEvent) => {
        if (!track.contains(event.relatedTarget as Node | null)) leave()
      }

      track.addEventListener('pointermove', onPointerMove)
      track.addEventListener('pointerleave', onPointerLeave)
      track.addEventListener('focusin', onFocusIn)
      track.addEventListener('focusout', onFocusOut)
      track.addEventListener('click', onClick)
      cleanups.push(() => {
        track.removeEventListener('pointermove', onPointerMove)
        track.removeEventListener('pointerleave', onPointerLeave)
        track.removeEventListener('focusin', onFocusIn)
        track.removeEventListener('focusout', onFocusOut)
        track.removeEventListener('click', onClick)
        gsap.killTweensOf([frame, fill])
        gsap.set([frame, fill], { clearProps: 'all' })
      })
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [scope])
}
