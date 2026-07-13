'use client'

import { useEffect } from 'react'
import { playUiSound, type UiSound } from './sound'

/** Semantic feedback for controls and navigation, backed by Howler. */
export function AudioFeedback() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const control = target.closest('button, a, [role="button"]')
      if (!control || control.matches('[aria-disabled="true"], :disabled')) return
      const sound = control.getAttribute('data-sound') ?? (control.tagName === 'BUTTON' ? 'control' : 'navigate')
      playUiSound(sound as UiSound)
    }

    window.addEventListener('click', onClick, { capture: true })
    return () => window.removeEventListener('click', onClick, { capture: true })
  }, [])

  return null
}
