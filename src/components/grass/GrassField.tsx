'use client'

import { useFrame, useThree, type RootState } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  Color,
  Group,
  Matrix4,
  PlaneGeometry,
  Ray,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  type IUniform,
} from 'three'
import { getBladeCount, MAX_BLADES, type GrassConfig } from './config'
import { createBladeGeometry, createBladeInstances, createNoiseTexture } from './geometry'
import {
  bladeFragmentShader,
  bladeVertexShader,
  groundFragmentShader,
  groundVertexShader,
  TRAIL_LENGTH,
} from './shaders'
import { createTerrain, type Terrain } from './terrain'

type Uniforms = Record<string, IUniform>
type Smoothable = number | Color | Vector2 | Vector3

const DEG = Math.PI / 180
const SMOOTHING = 5

const color = (value: string, fallback = '#000000') => {
  const parsed = new Color()
  try {
    parsed.set(value)
  } catch {
    parsed.set(fallback)
  }
  return parsed
}

function sunDirection(azimuth: number, elevation: number, target = new Vector3()) {
  const el = elevation * DEG
  const az = azimuth * DEG
  return target.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)).normalize()
}

// Everything the shaders read, derived from the config. Uniforms ease toward these
// each frame, so preset switches and slider drags blend instead of popping.
function targetValues(config: GrassConfig): Record<string, Smoothable> {
  const { blades, field, mounds, wind, interaction, colors, lighting } = config
  const sky = color(lighting.skyColor)
  const groundColor = color(colors.ground)
  const windAngle = wind.direction * DEG
  return {
    uBladeLength: blades.length,
    uBladeWidth: blades.width,
    uLengthVariation: blades.lengthVariation,
    uCurvature: blades.curvature,
    uStiffness: blades.stiffness,
    uSlopeAlign: blades.slopeAlign,
    uRoundness: blades.roundness,
    uClumping: field.clumping,
    uLift: mounds.lift,
    uGroundCover: field.groundCover,
    uEdgeSoftness: Math.max(0.01, field.edgeSoftness),
    uWindDir: new Vector2(Math.cos(windAngle), Math.sin(windAngle)),
    uWindStrength: wind.strength,
    uGustScale: wind.gustScale,
    uGustContrast: wind.gustContrast,
    uTurbulence: wind.turbulence,
    uFlutter: wind.flutter,
    uSheen: wind.sheen,
    uPointerRadius: interaction.radius,
    uPointerStrength: interaction.enabled ? interaction.strength : 0,
    uBaseColor: color(colors.base),
    uTipColor: color(colors.tip),
    uDryColor: color(colors.dry),
    uVariation: colors.variation,
    uGroundColor: groundColor,
    uRootColor: color(colors.base),
    uFogColor: color(colors.background, '#ffffff'),
    uSunDir: sunDirection(lighting.sunAzimuth, lighting.sunElevation),
    uSunColor: color(lighting.sunColor, '#ffffff').multiplyScalar(lighting.sunIntensity),
    uSkyColor: sky,
    uGroundBounce: groundColor.clone().lerp(color(colors.base), 0.5).multiplyScalar(0.6),
    uAmbient: lighting.ambient,
    uTranslucency: lighting.translucency,
    uSpecular: lighting.specular,
    uSoftness: lighting.softness,
    uOcclusion: lighting.occlusion,
    uFogDensity: lighting.fog,
  }
}

function approach(uniform: IUniform, target: Smoothable, k: number) {
  if (typeof target === 'number') {
    uniform.value += (target - uniform.value) * k
  } else if (target instanceof Color) {
    ;(uniform.value as Color).lerp(target, k)
  } else {
    uniform.value.lerp(target, k)
  }
}

function cloneValue(value: Smoothable) {
  return typeof value === 'number' ? value : value.clone()
}

function createUniforms(config: GrassConfig): Uniforms {
  const uniforms: Uniforms = {
    uTime: { value: 0 },
    uHeightmap: { value: null },
    uNoise: { value: null },
    uTerrainExtent: { value: 1 },
    uFieldRadius: { value: config.field.radius },
    uMoundHeight: { value: config.mounds.height },
    uGustScroll: { value: new Vector2() },
    uTurbScroll: { value: new Vector2() },
    uTrail: { value: Array.from({ length: TRAIL_LENGTH }, () => new Vector4()) },
    uTrailActive: { value: 0 },
  }
  for (const [key, value] of Object.entries(targetValues(config))) uniforms[key] = { value: cloneValue(value) }
  return uniforms
}

// Walk the ray down onto the heightfield (plane hit, then refine against sampled heights).
function intersectTerrain(ray: Ray, terrain: Terrain, out: Vector3) {
  if (ray.direction.y > -0.0001) return null
  let height = 0
  for (let i = 0; i < 5; i++) {
    const distance = (height - ray.origin.y) / ray.direction.y
    if (distance < 0) return null
    ray.at(distance, out)
    height = terrain.sampleHeight(out.x, out.z)
  }
  return out
}

type TrailPoint = { x: number; z: number; age: number; live: boolean }

export function GrassField({ config }: { config: GrassConfig }) {
  const configRef = useRef(config)
  configRef.current = config
  const targets = useMemo(() => targetValues(config), [config])
  const targetsRef = useRef(targets)
  targetsRef.current = targets
  const groupRef = useRef<Group>(null)
  const gl = useThree((state) => state.gl)

  const noise = useMemo(() => createNoiseTexture(256, 1), [])
  const instances = useMemo(() => createBladeInstances(MAX_BLADES, config.field.seed), [config.field.seed])
  const segments = Math.round(config.blades.segments)
  const bladeGeometry = useMemo(() => createBladeGeometry(segments, instances), [segments, instances])
  const groundGeometry = useMemo(() => new PlaneGeometry(2, 2, 192, 192), [])

  const { field, mounds } = config
  const terrainKey = JSON.stringify([field.radius, field.offset, field.seed, mounds])
  const terrain = useMemo(() => createTerrain(config), [terrainKey])

  const uniforms = useMemo(() => createUniforms(config), [])
  const bladeMaterial = useMemo(
    () => new ShaderMaterial({ uniforms, vertexShader: bladeVertexShader, fragmentShader: bladeFragmentShader }),
    [uniforms],
  )
  const groundMaterial = useMemo(
    () => new ShaderMaterial({ uniforms, vertexShader: groundVertexShader, fragmentShader: groundFragmentShader }),
    [uniforms],
  )

  // Geometry-bound values snap: they must agree with the baked terrain texture.
  useLayoutEffect(() => {
    uniforms.uHeightmap.value = terrain.texture
    uniforms.uTerrainExtent.value = terrain.extent
    uniforms.uFieldRadius.value = config.field.radius
    uniforms.uMoundHeight.value = config.mounds.height
    return () => terrain.dispose()
  }, [terrain])

  useEffect(() => {
    uniforms.uNoise.value = noise
    return () => noise.dispose()
  }, [noise, uniforms])

  useEffect(() => () => bladeGeometry.dispose(), [bladeGeometry])
  useEffect(() => () => {
    groundGeometry.dispose()
    bladeMaterial.dispose()
    groundMaterial.dispose()
  }, [groundGeometry, bladeMaterial, groundMaterial])

  // Pointer state lives outside React: hovering (not dragging the orbit) brushes the grass.
  const pointer = useRef({ inside: false, dragging: false, ndc: new Vector2() })
  useEffect(() => {
    const el = gl.domElement
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      pointer.current.ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
      pointer.current.inside = true
      pointer.current.dragging = event.buttons !== 0
    }
    const leave = () => {
      pointer.current.inside = false
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerdown', move)
    el.addEventListener('pointerup', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerdown', move)
      el.removeEventListener('pointerup', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [gl])

  const trail = useRef<TrailPoint[]>(Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, z: 0, age: Infinity, live: false })))
  const scratch = useMemo(() => ({ ray: new Ray(), hit: new Vector3(), inverse: new Matrix4(), stamp: new Vector2(), cursor: 0 }), [])

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const current = configRef.current
    const k = 1 - Math.exp(-delta * SMOOTHING)
    const targets = targetsRef.current
    for (const key in targets) approach(uniforms[key], targets[key], k)
    ;(uniforms.uWindDir.value as Vector2).normalize()

    bladeGeometry.instanceCount = getBladeCount(current)
    uniforms.uTime.value += delta

    // Scroll the gust field in texture space so speed / scale edits never jump the pattern.
    const dir = uniforms.uWindDir.value as Vector2
    const speed = current.wind.speed * 1.5 * delta * uniforms.uGustScale.value
    const gust = uniforms.uGustScroll.value as Vector2
    gust.x = (gust.x + dir.x * speed * 0.045) % 1
    gust.y = (gust.y + dir.y * speed * 0.045) % 1
    const c = Math.cos(0.45)
    const s = Math.sin(0.45)
    const turb = uniforms.uTurbScroll.value as Vector2
    turb.x = (turb.x + (dir.x * c - dir.y * s) * speed * 1.7 * 0.13) % 1
    turb.y = (turb.y + (dir.x * s + dir.y * c) * speed * 1.7 * 0.13) % 1

    updateTrail(state, delta, current)
  })

  function updateTrail(state: RootState, delta: number, current: GrassConfig) {
    const points = trail.current
    const head = points[0]
    const { inside, dragging, ndc } = pointer.current
    const brushing = current.interaction.enabled && inside && !dragging
    let hit: Vector3 | null = null

    if (brushing && groupRef.current) {
      scratch.ray.origin.setFromMatrixPosition(state.camera.matrixWorld)
      scratch.ray.direction.set(ndc.x, ndc.y, 0.5).unproject(state.camera).sub(scratch.ray.origin).normalize()
      scratch.inverse.copy(groupRef.current.matrixWorld).invert()
      scratch.ray.applyMatrix4(scratch.inverse)
      hit = intersectTerrain(scratch.ray, terrain, scratch.hit)
    }

    // Leaving or lifting off releases the head into the trail so it springs back.
    const stamp = () => {
      scratch.cursor = (scratch.cursor % (TRAIL_LENGTH - 1)) + 1
      Object.assign(points[scratch.cursor], { x: head.x, z: head.z, age: 0, live: false })
      scratch.stamp.set(head.x, head.z)
    }

    if (hit) {
      if (!head.live) scratch.stamp.set(hit.x, hit.z)
      Object.assign(head, { x: hit.x, z: hit.z, age: 0, live: true })
      if (Math.hypot(scratch.stamp.x - hit.x, scratch.stamp.y - hit.z) > current.interaction.radius * 0.35) stamp()
    } else if (head.live) {
      stamp()
      head.live = false
      head.age = Infinity
    }

    // Under-damped spring: blades swing slightly past upright before settling.
    const recovery = Math.max(0.2, current.interaction.recovery)
    const tau = recovery / 3.5
    const omega = (Math.PI * 2) / (recovery * 0.9)
    const trailUniform = uniforms.uTrail.value as Vector4[]
    let active = 0
    points.forEach((point, i) => {
      if (!point.live) point.age += delta
      const a = point.age
      let strength = point.live ? 1 : Number.isFinite(a) ? Math.exp(-a / tau) * (Math.cos(omega * a) + Math.sin(omega * a) / (omega * tau)) : 0
      if (Math.abs(strength) < 0.002) strength = 0
      else active = 1
      trailUniform[i].set(point.x, point.z, strength, 0)
    })
    uniforms.uTrailActive.value = active
  }

  return (
    <group ref={groupRef}>
      <mesh geometry={groundGeometry} material={groundMaterial} frustumCulled={false} renderOrder={0} />
      <mesh geometry={bladeGeometry} material={bladeMaterial} frustumCulled={false} renderOrder={1} />
    </group>
  )
}
