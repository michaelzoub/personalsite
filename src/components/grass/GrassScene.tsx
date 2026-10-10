'use client'

import { OrbitControls, PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Color, NeutralToneMapping, PerspectiveCamera } from 'three'
import { getBladeCount, type GrassConfig } from './config'
import { GrassField } from './GrassField'

function SceneSync({ config }: { config: GrassConfig }) {
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const { background } = config.colors
  const { fov } = config.camera

  useEffect(() => {
    const next = new Color()
    try {
      next.set(background)
    } catch {
      next.set('#ffffff')
    }
    if (scene.background instanceof Color) scene.background.copy(next)
    else scene.background = next
  }, [background, scene])

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    camera.fov = fov
    camera.updateProjectionMatrix()
  }, [camera, fov])

  return null
}

// Writes FPS + blade count straight into a DOM node twice a second; no React re-renders.
function StatsProbe({ target, config }: { target: RefObject<HTMLElement | null>; config: GrassConfig }) {
  const counterRef = useRef({ frames: 0, elapsed: 0 })
  useFrame((_, delta) => {
    const counter = counterRef.current
    counter.frames++
    counter.elapsed += delta
    if (counter.elapsed < 0.5 || !target.current) return
    const fps = Math.round(counter.frames / counter.elapsed)
    target.current.textContent = `${fps} fps · ${getBladeCount(config).toLocaleString()} blades`
    counter.frames = 0
    counter.elapsed = 0
  })
  return null
}

export type GrassSceneProps = {
  config: GrassConfig
  className?: string
  statsRef?: RefObject<HTMLElement | null>
  controls?: boolean
  children?: ReactNode
}

// Drop-in canvas: grass, camera, orbit controls and adaptive resolution.
// For an existing canvas, render <GrassField config={...} /> inside it instead.
export function GrassScene({ config, className, statsRef, controls = true, children }: GrassSceneProps) {
  const [dpr, setDpr] = useState(1.5)

  return (
    <Canvas
      className={className}
      dpr={dpr}
      gl={{ antialias: true, toneMapping: NeutralToneMapping, powerPreference: 'high-performance' }}
      camera={{ position: [10.6, 6.4, 12.2], fov: config.camera.fov, near: 0.1, far: 200 }}
    >
      <PerformanceMonitor
        bounds={() => [50, 58]}
        onIncline={() => setDpr((value) => Math.min(2, value + 0.25))}
        onDecline={() => setDpr((value) => Math.max(1, value - 0.25))}
      />
      <SceneSync config={config} />
      <GrassField config={config} />
      {controls ? (
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          target={[0, 0.45, 0]}
          minDistance={2.5}
          maxDistance={32}
          maxPolarAngle={Math.PI * 0.47}
          autoRotate={config.camera.autoRotate}
          autoRotateSpeed={config.camera.rotateSpeed}
        />
      ) : null}
      {statsRef ? <StatsProbe target={statsRef} config={config} /> : null}
      {children}
    </Canvas>
  )
}
