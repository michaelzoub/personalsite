import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'

// One highlight per list that snaps between rows and leans toward the cursor.
// The frame owns position, size, scale and opacity; the fill inside it owns
// the magnetic pull and the clamp squash, so the two never fight over a transform.
//
// The fill may never expose the row's text: the pull is rubber-banded so it can
// only approach MAX (always less than BLEED), and when it gets close to that
// wall it clamps: the leading edge pins against the wall and the trailing edge
// snaps in behind it. The trailing side only has BLEED - MAX of room, so the
// squash is sized to stop SQUASH_FLOOR short of the text.
const BLEED_X = 16
const BLEED_Y = 14
const MAX_X = 8
const MAX_Y = 6
const CUSHION = 4
const STIFFNESS = 1.6
const CLAMP_AT = .9
const RELEASE_AT = .7
const SQUASH_FLOOR = 2
const SQUASH = { x: BLEED_X - MAX_X - SQUASH_FLOOR, y: BLEED_Y - MAX_Y - SQUASH_FLOOR }
const BULGE = 2
const REACH = 1.4

const band = (raw: number) => Math.tanh(Math.max(-REACH, Math.min(REACH, raw)) * STIFFNESS)

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
      let clampedX = 0
      let clampedY = 0
      // Scale at which the frame keeps MAX + CUSHION of bleed, so even a fully
      // pulled fill still clears the text while it grows in or shrinks out.
      let safe = { scaleX: 1, scaleY: 1 }
      let squeeze: gsap.core.Timeline | null = null
      const pullX = gsap.quickTo(fill, 'x', { duration: .18, ease: 'power4.out' })
      const pullY = gsap.quickTo(fill, 'y', { duration: .18, ease: 'power4.out' })

      const boxFor = (row: HTMLElement) => {
        const t = track.getBoundingClientRect()
        const r = row.getBoundingClientRect()
        safe = {
          scaleX: (r.width + (MAX_X + CUSHION) * 2) / (r.width + BLEED_X * 2),
          scaleY: (r.height + (MAX_Y + CUSHION) * 2) / (r.height + BLEED_Y * 2),
        }
        return {
          x: r.left - t.left - BLEED_X,
          y: r.top - t.top - BLEED_Y,
          width: r.width + BLEED_X * 2,
          height: r.height + BLEED_Y * 2,
        }
      }

      const clamp = (axis: 'x' | 'y', side: number) => {
        const along = axis === 'x' ? fill.offsetWidth : fill.offsetHeight
        const across = axis === 'x' ? fill.offsetHeight : fill.offsetWidth
        const [main, cross] = axis === 'x' ? ['scaleX', 'scaleY'] : ['scaleY', 'scaleX']
        const edge = side > 0 ? '100%' : '0%'
        squeeze?.kill()
        squeeze = gsap.timeline()
          .set(fill, { transformOrigin: axis === 'x' ? `${edge} 50%` : `50% ${edge}` })
          .to(fill, { [main]: 1 - SQUASH[axis] / along, [cross]: 1 + BULGE / across, duration: .05, ease: 'power2.in' })
          .to(fill, { scaleX: 1, scaleY: 1, duration: .16, ease: 'expo.out' })
      }

      const pull = (row: HTMLElement, clientX: number, clientY: number, settle = true) => {
        if (reduced) return
        const r = row.getBoundingClientRect()
        const bx = band((clientX - (r.left + r.width / 2)) / (r.width / 2))
        const by = band((clientY - (r.top + r.height / 2)) / (r.height / 2))
        pullX(bx * MAX_X)
        pullY(by * MAX_Y)
        if (!settle) return
        // Clamp once per approach; re-arm only after backing well off the wall.
        if (Math.abs(bx) < RELEASE_AT) clampedX = 0
        if (Math.abs(by) < RELEASE_AT) clampedY = 0
        if (!clampedX && Math.abs(bx) >= CLAMP_AT) clamp('x', (clampedX = Math.sign(bx)))
        if (!clampedY && Math.abs(by) >= CLAMP_AT) clamp('y', (clampedY = Math.sign(by)))
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
        clampedX = clampedY = 0
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

      const leave = (clientX?: number, clientY?: number) => {
        if (!active) return
        if (clientX !== undefined && clientY !== undefined) pull(active, clientX, clientY, false)
        active = null
        squeeze?.kill()
        gsap.to(fill, { scaleX: 1, scaleY: 1, duration: .12, ease: 'power2.out', overwrite: 'auto' })
        gsap.to(frame, {
          autoAlpha: 0,
          ...(reduced ? {} : safe),
          duration: reduced ? .1 : .14,
          ease: 'power2.in',
          overwrite: 'auto',
          onComplete: () => {
            pullX(0, 0)
            pullY(0, 0)
          },
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
        if (active) pull(active, event.clientX, event.clientY)
      }
      // A click in the margin or a gap opens whichever row is lit.
      const onClick = (event: MouseEvent) => {
        if (!active || (event.target as Element).closest('.index-row')) return
        active.dispatchEvent(new MouseEvent('click', event))
      }
      const onPointerLeave = (event: PointerEvent) => leave(event.clientX, event.clientY)
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
        squeeze?.kill()
        gsap.killTweensOf([frame, fill])
        gsap.set([frame, fill], { clearProps: 'all' })
      })
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [scope])
}
