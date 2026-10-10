'use client'

import { useDialKitController, type DialConfig } from 'dialkit'
import { DEFAULT_GRASS_CONFIG as d, mergeGrassConfig, type GrassConfig } from '@/components/grass'

const color = (value: string) => ({ type: 'color' as const, default: value })

// Mirrors GrassConfig key-for-key, so DialKit values, presets and exports are the same shape.
const dialConfig = {
  blades: {
    length: [d.blades.length, 0.08, 1.4, 0.01],
    width: [d.blades.width, 0.008, 0.12, 0.001],
    lengthVariation: [d.blades.lengthVariation, 0, 1, 0.01],
    curvature: [d.blades.curvature, 0, 1.6, 0.01],
    stiffness: [d.blades.stiffness, 0, 1, 0.01],
    density: [d.blades.density, 100, 4000, 50],
    roundness: [d.blades.roundness, 0, 1.5, 0.01],
    slopeAlign: [d.blades.slopeAlign, 0, 1, 0.01],
    segments: [d.blades.segments, 3, 10, 1],
  },
  field: {
    radius: [d.field.radius, 2, 12, 0.1],
    offset: { type: 'pad' as const, x: [d.field.offset.x, -1, 1, 0.01], y: [d.field.offset.y, -1, 1, 0.01], labels: { x: 'X', y: 'Z' } },
    groundCover: [d.field.groundCover, 0, 1, 0.01],
    edgeSoftness: [d.field.edgeSoftness, 0, 1, 0.01],
    clumping: [d.field.clumping, 0, 1, 0.01],
    seed: [d.field.seed, 1, 99, 1],
  },
  mounds: {
    count: [d.mounds.count, 0, 16, 1],
    height: [d.mounds.height, 0, 2.5, 0.01],
    radius: [d.mounds.radius, 0.4, 5, 0.05],
    sizeVariation: [d.mounds.sizeVariation, 0, 1, 0.01],
    spread: [d.mounds.spread, 0, 1, 0.01],
    softness: [d.mounds.softness, 0, 1, 0.01],
    irregularity: [d.mounds.irregularity, 0, 1, 0.01],
    elongation: [d.mounds.elongation, 0, 1, 0.01],
    lift: [d.mounds.lift, 0, 1.5, 0.01],
  },
  wind: {
    direction: [d.wind.direction, 0, 360, 1],
    strength: [d.wind.strength, 0, 1.8, 0.01],
    speed: [d.wind.speed, 0, 4, 0.01],
    gustScale: [d.wind.gustScale, 0.2, 3, 0.01],
    gustContrast: [d.wind.gustContrast, 0, 1, 0.01],
    turbulence: [d.wind.turbulence, 0, 1, 0.01],
    flutter: [d.wind.flutter, 0, 1, 0.01],
    sheen: [d.wind.sheen, 0, 1, 0.01],
  },
  interaction: {
    _collapsed: true,
    enabled: d.interaction.enabled,
    radius: [d.interaction.radius, 0.1, 2.5, 0.01],
    strength: [d.interaction.strength, 0, 2, 0.01],
    recovery: [d.interaction.recovery, 0.2, 6, 0.05],
  },
  colors: {
    base: color(d.colors.base),
    tip: color(d.colors.tip),
    dry: color(d.colors.dry),
    variation: [d.colors.variation, 0, 1, 0.01],
    ground: color(d.colors.ground),
    background: color(d.colors.background),
  },
  lighting: {
    _collapsed: true,
    sunAzimuth: [d.lighting.sunAzimuth, 0, 360, 1],
    sunElevation: [d.lighting.sunElevation, 2, 90, 1],
    sunIntensity: [d.lighting.sunIntensity, 0, 5, 0.01],
    sunColor: color(d.lighting.sunColor),
    skyColor: color(d.lighting.skyColor),
    ambient: [d.lighting.ambient, 0, 2, 0.01],
    translucency: [d.lighting.translucency, 0, 2, 0.01],
    specular: [d.lighting.specular, 0, 1.5, 0.01],
    softness: [d.lighting.softness, 0, 1, 0.01],
    occlusion: [d.lighting.occlusion, 0, 1, 0.01],
    fog: [d.lighting.fog, 0, 0.12, 0.001],
  },
  camera: {
    _collapsed: true,
    autoRotate: d.camera.autoRotate,
    rotateSpeed: [d.camera.rotateSpeed, 0, 3, 0.01],
    fov: [d.camera.fov, 18, 70, 1],
  },
} satisfies DialConfig

export function useGrassDials() {
  const dial = useDialKitController('Grass', dialConfig, { id: 'grass-preview', persist: true })
  // Normalise through the merge so the rest of the app only ever sees a complete GrassConfig.
  const config: GrassConfig = mergeGrassConfig(d, dial.values)
  const apply = (next: GrassConfig) => dial.setValues(next)
  return { config, apply, reset: dial.resetValues }
}
