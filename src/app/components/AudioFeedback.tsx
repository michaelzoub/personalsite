'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

/** A single, quiet confirmation sound for every native app control. */
export function AudioFeedback() {
  const contextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const play = () => {
      const AudioContextClass = window.AudioContext ?? window.webkitAudioContext
      if (!AudioContextClass) return

      const context = contextRef.current ?? new AudioContextClass()
      contextRef.current = context
      void context.resume()

      const now = context.currentTime
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(720, now)
      oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.035)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.018, now + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + 0.05)
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const control = target.closest('button, a, [role="button"]')
      if (!control || control.matches('[aria-disabled="true"], :disabled')) return
      play()
    }

    window.addEventListener('click', onClick, { capture: true })
    return () => {
      window.removeEventListener('click', onClick, { capture: true })
      contextRef.current?.close()
    }
  }, [])

  return null
}
