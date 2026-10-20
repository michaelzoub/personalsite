import { DataTexture, DataUtils, HalfFloatType, LinearFilter, RGBAFormat, ClampToEdgeWrapping, Vector3 } from 'three'
import type { GrassConfig } from './config'

export const TERRAIN_RESOLUTION = 256
// The terrain texture covers a bit more than the field so the ground can fade out past the grass.
export const TERRAIN_EXTENT_SCALE = 1.6

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Small seeded 2D gradient noise, roughly in [-1, 1].
function createNoise2D(seed: number) {
  const rand = mulberry32(seed)
  const perm = new Uint8Array(512)
  const base = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[base[i], base[j]] = [base[j], base[i]]
  }
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255]
  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 7
    const u = h < 4 ? x : y
    const v = h < 4 ? y : x
    return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v)
  }
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  return (x: number, y: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const X = xi & 255
    const Y = yi & 255
    const u = fade(xf)
    const v = fade(yf)
    const aa = perm[perm[X] + Y]
    const ab = perm[perm[X] + Y + 1]
    const ba = perm[perm[X + 1] + Y]
    const bb = perm[perm[X + 1] + Y + 1]
    const x1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf))
    const x2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1))
    return (x1 + v * (x2 - x1)) * 0.5
  }
}

export type Mound = { x: number; z: number; radius: number; height: number; cos: number; sin: number; aspect: number }

// Best-candidate placement keeps mounds evenly spaced. Each mound consumes a fixed
// number of random draws, so raising the count adds mounds without reshuffling the rest.
export function layoutMounds(config: GrassConfig): Mound[] {
  const { field, mounds } = config
  const rand = mulberry32(field.seed * 9973 + 17)
  const spread = field.radius * mounds.spread
  const cx = field.offset.x * field.radius * 0.5
  const cz = -field.offset.y * field.radius * 0.5
  const placed: Mound[] = []

  for (let i = 0; i < mounds.count; i++) {
    let bestX = cx
    let bestZ = cz
    let bestScore = -Infinity
    for (let k = 0; k < 10; k++) {
      const a = rand() * Math.PI * 2
      const r = Math.sqrt(rand()) * spread
      const x = cx + Math.cos(a) * r
      const z = cz + Math.sin(a) * r
      let score = Infinity
      for (const m of placed) score = Math.min(score, Math.hypot(x - m.x, z - m.z) - m.radius * 0.6)
      if (score > bestScore) {
        bestScore = score
        bestX = x
        bestZ = z
      }
    }
    const size = 1 + (rand() * 2 - 1) * mounds.sizeVariation
    const angle = rand() * Math.PI
    const aspect = 1 + rand() * mounds.elongation * 1.4
    const heightJitter = 0.75 + rand() * 0.5
    placed.push({
      x: bestX,
      z: bestZ,
      radius: Math.max(0.2, mounds.radius * size),
      height: mounds.height * heightJitter * (0.55 + 0.45 * Math.min(1.4, size)),
      cos: Math.cos(angle),
      sin: Math.sin(angle),
      aspect,
    })
  }
  return placed
}

export type Terrain = {
  texture: DataTexture
  extent: number
  heights: Float32Array
  sampleHeight: (x: number, z: number) => number
  dispose: () => void
}

// Heights + normals baked into a half-float texture so blades and ground share one
// cheap texture fetch instead of re-evaluating every mound per vertex.
export function createTerrain(config: GrassConfig): Terrain {
  const { field, mounds } = config
  const size = TERRAIN_RESOLUTION
  const extent = field.radius * TERRAIN_EXTENT_SCALE
  const list = layoutMounds(config)
  const noise = createNoise2D(field.seed + 101)
  const warp = mounds.irregularity * mounds.radius * 0.45
  const exponent = 0.55 + mounds.softness * 2.6
  const blendPower = 3
  const heights = new Float32Array(size * size)

  for (let j = 0; j < size; j++) {
    const z = ((j + 0.5) / size * 2 - 1) * extent
    for (let i = 0; i < size; i++) {
      const x = ((i + 0.5) / size * 2 - 1) * extent
      const wx = x + noise(x * 0.32, z * 0.32) * warp
      const wz = z + noise(x * 0.32 + 31.7, z * 0.32 - 12.3) * warp
      let sum = 0
      for (const m of list) {
        const dx = wx - m.x
        const dz = wz - m.z
        const lx = (dx * m.cos + dz * m.sin) / m.aspect
        const lz = -dx * m.sin + dz * m.cos
        const u2 = (lx * lx + lz * lz) / (m.radius * m.radius)
        if (u2 >= 1) continue
        sum += Math.pow(m.height * Math.pow(1 - u2, exponent), blendPower)
      }
      // p-norm union: overlapping mounds merge smoothly instead of stacking into spikes.
      let h = Math.pow(sum, 1 / blendPower)
      h += noise(x * 1.3 + 7.1, z * 1.3 - 3.4) * mounds.irregularity * 0.05 * mounds.height
      h += noise(x * 0.18 - 9.2, z * 0.18 + 4.4) * 0.08 * mounds.height
      heights[j * size + i] = h
    }
  }

  const texel = (2 * extent) / size
  const data = new Uint16Array(size * size * 4)
  const n = new Vector3()
  const at = (i: number, j: number) => heights[Math.min(size - 1, Math.max(0, j)) * size + Math.min(size - 1, Math.max(0, i))]
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const dx = (at(i + 1, j) - at(i - 1, j)) / (2 * texel)
      const dz = (at(i, j + 1) - at(i, j - 1)) / (2 * texel)
      n.set(-dx, 1, -dz).normalize()
      const o = (j * size + i) * 4
      data[o] = DataUtils.toHalfFloat(heights[j * size + i])
      data[o + 1] = DataUtils.toHalfFloat(n.x)
      data[o + 2] = DataUtils.toHalfFloat(n.y)
      data[o + 3] = DataUtils.toHalfFloat(n.z)
    }
  }

  const texture = new DataTexture(data, size, size, RGBAFormat, HalfFloatType)
  texture.magFilter = LinearFilter
  texture.minFilter = LinearFilter
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.needsUpdate = true

  const sampleHeight = (x: number, z: number) => {
    const fx = (x / extent * 0.5 + 0.5) * size - 0.5
    const fz = (z / extent * 0.5 + 0.5) * size - 0.5
    const i = Math.floor(fx)
    const j = Math.floor(fz)
    const tx = fx - i
    const tz = fz - j
    const a = at(i, j) + (at(i + 1, j) - at(i, j)) * tx
    const b = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * tx
    return a + (b - a) * tz
  }

  return { texture, extent, heights, sampleHeight, dispose: () => texture.dispose() }
}
