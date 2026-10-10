// Grass configuration: one serializable object drives the whole simulation.
// Exported JSON from /preview/grass can be pasted straight into <GrassField config={...} />.

export type GrassConfig = {
  blades: {
    length: number
    width: number
    lengthVariation: number
    curvature: number
    stiffness: number
    density: number
    roundness: number
    slopeAlign: number
    segments: number
  }
  field: {
    radius: number
    offset: { x: number; y: number }
    groundCover: number
    edgeSoftness: number
    clumping: number
    seed: number
  }
  mounds: {
    count: number
    height: number
    radius: number
    sizeVariation: number
    spread: number
    softness: number
    irregularity: number
    elongation: number
    lift: number
  }
  wind: {
    direction: number
    strength: number
    speed: number
    gustScale: number
    gustContrast: number
    turbulence: number
    flutter: number
    sheen: number
  }
  interaction: {
    enabled: boolean
    radius: number
    strength: number
    recovery: number
  }
  colors: {
    base: string
    tip: string
    dry: string
    variation: number
    ground: string
    background: string
  }
  lighting: {
    sunAzimuth: number
    sunElevation: number
    sunIntensity: number
    sunColor: string
    skyColor: string
    ambient: number
    translucency: number
    specular: number
    softness: number
    occlusion: number
    fog: number
  }
  camera: {
    autoRotate: boolean
    rotateSpeed: number
    fov: number
  }
}

export const MAX_BLADES = 520_000

export const DEFAULT_GRASS_CONFIG: GrassConfig = {
  blades: {
    length: 0.42,
    width: 0.038,
    lengthVariation: 0.4,
    curvature: 0.55,
    stiffness: 0.45,
    density: 1900,
    roundness: 0.55,
    slopeAlign: 0.35,
    segments: 6,
  },
  field: {
    radius: 7,
    offset: { x: 0, y: 0 },
    groundCover: 0.55,
    edgeSoftness: 0.22,
    clumping: 0.45,
    seed: 7,
  },
  mounds: {
    count: 7,
    height: 0.95,
    radius: 2.1,
    sizeVariation: 0.45,
    spread: 0.62,
    softness: 0.62,
    irregularity: 0.5,
    elongation: 0.35,
    lift: 0.35,
  },
  wind: {
    direction: 32,
    strength: 0.55,
    speed: 1.1,
    gustScale: 1,
    gustContrast: 0.55,
    turbulence: 0.4,
    flutter: 0.25,
    sheen: 0.22,
  },
  interaction: {
    enabled: true,
    radius: 0.7,
    strength: 1.1,
    recovery: 1.6,
  },
  colors: {
    base: '#1b3411',
    tip: '#7e9f3b',
    dry: '#bdb067',
    variation: 0.35,
    ground: '#1a2a10',
    background: '#eef3f9',
  },
  lighting: {
    sunAzimuth: 215,
    sunElevation: 34,
    sunIntensity: 2.15,
    sunColor: '#fff3dc',
    skyColor: '#cfe0f5',
    ambient: 0.7,
    translucency: 0.65,
    specular: 0.35,
    softness: 0.55,
    occlusion: 0.7,
    fog: 0.025,
  },
  camera: {
    autoRotate: false,
    rotateSpeed: 0.35,
    fov: 32,
  },
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }
export type GrassConfigOverrides = DeepPartial<GrassConfig>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Merge overrides onto a base, keeping only keys (and value types) the base defines.
// Used for presets and for safely loading exported/imported JSON.
export function mergeGrassConfig(base: GrassConfig, overrides: unknown): GrassConfig {
  const merge = (target: Record<string, unknown>, source: unknown): Record<string, unknown> => {
    const out: Record<string, unknown> = { ...target }
    if (!isRecord(source)) return out
    for (const key of Object.keys(target)) {
      const current = target[key]
      const next = source[key]
      if (next === undefined) continue
      if (isRecord(current)) out[key] = merge(current, next)
      else if (typeof next === typeof current) out[key] = next
    }
    return out
  }
  return merge(base as unknown as Record<string, unknown>, overrides) as unknown as GrassConfig
}

export type GrassPreset = { id: string; label: string; config: GrassConfig }

const preset = (id: string, label: string, overrides: GrassConfigOverrides): GrassPreset => ({
  id,
  label,
  config: mergeGrassConfig(DEFAULT_GRASS_CONFIG, overrides),
})

export const GRASS_PRESETS: GrassPreset[] = [
  preset('meadow', 'Meadow', {}),
  preset('moss', 'Moss islands', {
    blades: { length: 0.24, width: 0.03, lengthVariation: 0.3, curvature: 0.8, stiffness: 0.3, density: 3400, roundness: 0.7, slopeAlign: 0.75 },
    field: { radius: 6, groundCover: 0, edgeSoftness: 0.2, clumping: 0.25, seed: 21 },
    mounds: { count: 9, height: 1.05, radius: 1.55, sizeVariation: 0.55, spread: 0.68, softness: 0.4, irregularity: 0.35, elongation: 0.3, lift: 0.2 },
    wind: { direction: 300, strength: 0.32, speed: 0.8, gustScale: 1.4, turbulence: 0.3, flutter: 0.15, sheen: 0.15 },
    colors: { base: '#203f14', tip: '#9ec44a', dry: '#b9c46a', variation: 0.25, ground: '#e3e9f1', background: '#f4f7fb' },
    lighting: { sunAzimuth: 140, sunElevation: 46, sunIntensity: 2.2, ambient: 0.9, translucency: 0.55, softness: 0.72, occlusion: 0.75, fog: 0.012 },
  }),
  preset('prairie', 'Windswept', {
    blades: { length: 0.78, width: 0.032, lengthVariation: 0.5, curvature: 0.35, stiffness: 0.6, density: 1150, roundness: 0.45, slopeAlign: 0.2 },
    field: { radius: 9, groundCover: 1, edgeSoftness: 0.35, clumping: 0.6, seed: 4 },
    mounds: { count: 5, height: 1.25, radius: 3.2, sizeVariation: 0.4, spread: 0.6, softness: 0.85, irregularity: 0.6, elongation: 0.6, lift: 0.15 },
    wind: { direction: 75, strength: 1.05, speed: 2.1, gustScale: 0.8, gustContrast: 0.7, turbulence: 0.55, flutter: 0.35, sheen: 0.38 },
    colors: { base: '#31371a', tip: '#a8944c', dry: '#cdb57a', variation: 0.55, ground: '#2d2a12', background: '#edf0f3' },
    lighting: { sunAzimuth: 250, sunElevation: 24, sunIntensity: 2.2, sunColor: '#ffe9c4', ambient: 0.45, translucency: 0.8, specular: 0.45, softness: 0.35, fog: 0.024 },
  }),
  preset('dusk', 'Dusk', {
    blades: { length: 0.5, curvature: 0.6 },
    mounds: { count: 6, height: 1.1, radius: 2.4 },
    wind: { direction: 190, strength: 0.42, speed: 0.75, sheen: 0.3 },
    colors: { base: '#0a170b', tip: '#457640', dry: '#7d7446', variation: 0.3, ground: '#081008', background: '#1c2433' },
    lighting: { sunAzimuth: 228, sunElevation: 7, sunIntensity: 1.6, sunColor: '#ffbf86', skyColor: '#56689a', ambient: 0.32, translucency: 1.3, specular: 0.8, softness: 0.3, occlusion: 0.8, fog: 0.04 },
  }),
  preset('frost', 'Frost', {
    blades: { length: 0.34, width: 0.034, curvature: 0.6, density: 2600 },
    field: { groundCover: 0.7 },
    mounds: { softness: 0.75, lift: 0.4 },
    wind: { strength: 0.3, speed: 0.6, sheen: 0.4 },
    colors: { base: '#2b4434', tip: '#cddfdc', dry: '#eef4fb', variation: 0.4, ground: '#d6dfe9', background: '#f2f6fd' },
    lighting: { sunAzimuth: 160, sunElevation: 28, sunIntensity: 1.9, sunColor: '#f4f8ff', skyColor: '#dce9fb', ambient: 0.9, translucency: 0.5, specular: 0.6, softness: 0.65, fog: 0.02 },
  }),
]

export function getBladeCount(config: GrassConfig) {
  const area = Math.PI * config.field.radius * config.field.radius
  return Math.min(MAX_BLADES, Math.round(config.blades.density * area))
}

export function serializeGrassConfig(config: GrassConfig) {
  return JSON.stringify(config, null, 2)
}

export function parseGrassConfig(json: string): GrassConfig {
  return mergeGrassConfig(DEFAULT_GRASS_CONFIG, JSON.parse(json))
}
