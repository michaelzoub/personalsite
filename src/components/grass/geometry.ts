import {
  BufferAttribute,
  DataTexture,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  LinearMipmapLinearFilter,
  RGBAFormat,
  RepeatWrapping,
  UnsignedByteType,
} from 'three'
import { mulberry32 } from './terrain'

// One blade: a tapered strip of `segments` quads capped by a tip vertex.
// position.x is the side (-1..1), position.y is the height fraction t (0..1).
// Per-instance aBlade = (x, z in the unit disk, random, random); the shader scales it
// by the field radius, so radius and density changes never rebuild buffers.
export function createBladeGeometry(segments: number, blades: Float32Array) {
  const vertexCount = segments * 2 + 1
  const positions = new Float32Array(vertexCount * 3)
  for (let i = 0; i < segments; i++) {
    const t = i / segments
    positions.set([-1, t, 0, 1, t, 0], i * 6)
  }
  positions.set([0, 1, 0], segments * 6)

  const indices: number[] = []
  for (let i = 0; i < segments - 1; i++) {
    const a = i * 2
    indices.push(a, a + 1, a + 2, a + 2, a + 1, a + 3)
  }
  const last = (segments - 1) * 2
  indices.push(last, last + 1, segments * 2)

  const geometry = new InstancedBufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.setAttribute('aBlade', new InstancedBufferAttribute(blades, 4))
  return geometry
}

// Uniform samples in the unit disk. Samples are i.i.d., so any prefix is itself a
// uniform scatter: density is just geometry.instanceCount.
export function createBladeInstances(count: number, seed: number) {
  const rand = mulberry32(seed * 7919 + 3)
  const data = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(rand())
    const a = rand() * Math.PI * 2
    data[i * 4] = Math.cos(a) * r
    data[i * 4 + 1] = Math.sin(a) * r
    data[i * 4 + 2] = rand()
    data[i * 4 + 3] = rand()
  }
  return data
}

// Tileable value-noise fbm. Lattice periods divide the texture so it wraps seamlessly.
function periodicNoise(size: number, periods: number[], weights: number[], rand: () => number) {
  const out = new Float32Array(size * size)
  const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  periods.forEach((period, octave) => {
    const lattice = Float32Array.from({ length: period * period }, () => rand())
    const value = (i: number, j: number) => lattice[(j % period) * period + (i % period)]
    for (let y = 0; y < size; y++) {
      const fy = (y / size) * period
      const j = Math.floor(fy)
      const ty = smooth(fy - j)
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * period
        const i = Math.floor(fx)
        const tx = smooth(fx - i)
        const a = value(i, j) + (value(i + 1, j) - value(i, j)) * tx
        const b = value(i, j + 1) + (value(i + 1, j + 1) - value(i, j + 1)) * tx
        out[y * size + x] += (a + (b - a) * ty) * weights[octave]
      }
    }
  })
  let min = Infinity
  let max = -Infinity
  for (const v of out) {
    min = Math.min(min, v)
    max = Math.max(max, v)
  }
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - min) / (max - min || 1)
  return out
}

// R: broad gusts, G: turbulence, B: clump pattern, A: colour patches.
export function createNoiseTexture(size = 256, seed = 1) {
  const rand = mulberry32(seed * 31 + 5)
  const channels = [
    periodicNoise(size, [3, 6, 12], [0.62, 0.28, 0.1], rand),
    periodicNoise(size, [8, 16, 32], [0.55, 0.3, 0.15], rand),
    periodicNoise(size, [10, 20, 40], [0.6, 0.28, 0.12], rand),
    periodicNoise(size, [4, 8, 16], [0.6, 0.3, 0.1], rand),
  ]
  const data = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    for (let c = 0; c < 4; c++) data[i * 4 + c] = Math.round(channels[c][i] * 255)
  }
  const texture = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.magFilter = LinearFilter
  texture.minFilter = LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}
