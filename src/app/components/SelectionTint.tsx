'use client'

import { useEffect } from 'react'
import { palette } from '../data/palette'

// Each new text selection picks one of the logo's five colors, never the same twice in a row.
export function SelectionTint() {
  useEffect(() => {
    const root = document.documentElement
    let last = -1
    let selecting = false
    const onChange = () => {
      const active = !(document.getSelection()?.isCollapsed ?? true)
      if (active && !selecting) {
        let next = Math.floor(Math.random() * (palette.length - 1))
        if (next >= last) next += 1
        last = next
        root.style.setProperty('--selection', palette[next].base)
      }
      selecting = active
    }
    document.addEventListener('selectionchange', onChange)
    return () => document.removeEventListener('selectionchange', onChange)
  }, [])
  return null
}
