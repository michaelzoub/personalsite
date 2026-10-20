'use client'

import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import { MotionConfig, motion } from 'motion/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LuArrowLeft, LuCheck, LuCopy, LuDownload, LuRotateCcw } from 'react-icons/lu'
import { Color } from 'three'
import { DotmCircular3 } from '@/components/ui/dotm-circular-3'
import { GRASS_PRESETS, serializeGrassConfig } from '@/components/grass'
import { useGrassDials } from './useGrassDials'

const GrassScene = dynamic(() => import('@/components/grass/GrassScene').then((mod) => mod.GrassScene), {
  ssr: false,
  loading: () => (
    <div className="grass-loading" role="status" aria-label="Loading grass">
      <DotmCircular3 color="var(--accent-strong)" size={30} dotSize={4} ariaLabel="Loading grass" />
    </div>
  ),
})

function isDark(background: string) {
  try {
    const { r, g, b } = new Color(background)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.18
  } catch {
    return false
  }
}

const presetJson = GRASS_PRESETS.map((preset) => ({ id: preset.id, json: serializeGrassConfig(preset.config) }))

export function GrassPreview() {
  const { config, apply, reset } = useGrassDials()
  const statsRef = useRef<HTMLSpanElement>(null)
  const [copied, setCopied] = useState(false)
  const json = serializeGrassConfig(config)
  const activePreset = presetJson.find((preset) => preset.json === json)?.id
  const dark = useMemo(() => isDark(config.colors.background), [config.colors.background])

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timeout)
  }, [copied])

  const copy = async () => {
    await navigator.clipboard.writeText(json)
    setCopied(true)
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'grass-config.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="grass-preview" data-tone={dark ? 'dark' : 'light'}>
        <GrassScene config={config} statsRef={statsRef} className="grass-canvas" />

        <header className="grass-header">
          <Link href="/" className="grass-back" aria-label="Back to home">
            <LuArrowLeft aria-hidden="true" />
          </Link>
          <div>
            <h1>Grass</h1>
            <p>Drag to orbit, scroll to zoom, hover to brush through it.</p>
            <span ref={statsRef} className="grass-stats" aria-live="off" />
          </div>
        </header>

        <footer className="grass-footer">
          <div className="reference-filter unified-filter grass-presets" role="group" aria-label="Presets">
            <div className="filter-segment-group">
              {GRASS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={activePreset === preset.id}
                  onClick={() => apply(preset.config)}
                >
                  {activePreset === preset.id ? (
                    <motion.span layoutId="grass-preset-pill" className="reference-pill" transition={{ type: 'spring', duration: 0.3, bounce: 0.12 }} />
                  ) : null}
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grass-actions">
            <button type="button" className="grass-action" onClick={copy}>
              {copied ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
              <span>{copied ? 'Copied' : 'Copy config'}</span>
            </button>
            <button type="button" className="grass-action" onClick={download}>
              <LuDownload aria-hidden="true" />
              <span>Export JSON</span>
            </button>
            <button type="button" className="grass-action is-icon" onClick={reset} aria-label="Reset to defaults">
              <LuRotateCcw aria-hidden="true" />
            </button>
          </div>
        </footer>

        <DialRoot position="top-right" theme={dark ? 'dark' : 'light'} productionEnabled />
      </main>
    </MotionConfig>
  )
}
