export const TRAIL_LENGTH = 12

// Shared lighting so blades and ground sit in exactly the same light.
const lightingChunk = /* glsl */ `
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uSkyColor;
  uniform vec3 uGroundBounce;
  uniform float uAmbient;
  uniform vec3 uFogColor;
  uniform float uFogDensity;

  vec3 ambientLight(vec3 n) {
    return mix(uGroundBounce, uSkyColor, n.y * 0.5 + 0.5) * uAmbient;
  }

  float wrapDiffuse(vec3 n, float wrap) {
    return clamp((dot(n, uSunDir) + wrap) / (1.0 + wrap), 0.0, 1.0);
  }

  float fogAmount(vec3 worldPos) {
    float d = length(cameraPosition - worldPos);
    return 1.0 - exp(-pow(d * uFogDensity, 2.0));
  }
`

const terrainChunk = /* glsl */ `
  uniform sampler2D uHeightmap;
  uniform sampler2D uNoise;
  uniform float uTerrainExtent;
  uniform float uFieldRadius;
  uniform float uGroundCover;
  uniform float uMoundHeight;
  uniform float uEdgeSoftness;

  vec4 sampleTerrain(vec2 xz) {
    return texture2D(uHeightmap, xz / (2.0 * uTerrainExtent) + 0.5);
  }

  // 1 inside the field, 0 outside. The outline is warped with low-frequency noise
  // so the field never reads as a perfect disc.
  float fieldEdge(vec2 xz) {
    float wobble = texture2D(uNoise, xz * 0.035 + 0.71).a - 0.5;
    float radial = length(xz) / uFieldRadius + wobble * (0.12 + 0.35 * uEdgeSoftness);
    return 1.0 - smoothstep(1.0 - uEdgeSoftness, 1.0, radial);
  }

  // 0..1 likelihood of grass growing at a point: field edge falloff x mound mask.
  float grassCoverage(vec2 xz, float height) {
    float edge = fieldEdge(xz);
    float mound = smoothstep(0.1, 0.32, height / max(uMoundHeight, 0.001));
    return edge * mix(mound, 1.0, uGroundCover);
  }
`

export const bladeVertexShader = /* glsl */ `
  #define TRAIL_LENGTH ${TRAIL_LENGTH}

  attribute vec4 aBlade;

  uniform float uTime;

  uniform float uBladeLength;
  uniform float uBladeWidth;
  uniform float uLengthVariation;
  uniform float uCurvature;
  uniform float uStiffness;
  uniform float uSlopeAlign;
  uniform float uRoundness;
  uniform float uClumping;
  uniform float uLift;

  uniform vec2 uWindDir;
  uniform float uWindStrength;
  uniform vec2 uGustScroll;
  uniform vec2 uTurbScroll;
  uniform float uGustScale;
  uniform float uGustContrast;
  uniform float uTurbulence;
  uniform float uFlutter;

  uniform vec4 uTrail[TRAIL_LENGTH];
  uniform float uTrailActive;
  uniform float uPointerRadius;
  uniform float uPointerStrength;

  uniform vec3 uBaseColor;
  uniform vec3 uTipColor;
  uniform vec3 uDryColor;
  uniform float uVariation;
  uniform float uOcclusion;

  ${terrainChunk}

  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec3 vTerrainNormal;
  varying vec3 vAlbedo;
  varying float vT;
  varying float vAO;
  varying float vSheen;

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  void main() {
    float t = position.y;
    float side = position.x;
    vec2 xz = aBlade.xy * uFieldRadius;
    float r1 = aBlade.z;
    float r2 = aBlade.w;
    float r3 = hash11(r1 * 913.7 + r2 * 131.3);
    float r4 = hash11(r2 * 571.1 + 3.1);
    float r5 = hash11(r1 * 179.9 + r2 * 713.3);

    vec4 terrain = sampleTerrain(xz);
    float height = terrain.r;
    vec3 terrainNormal = normalize(terrain.gba);
    vec4 patches = texture2D(uNoise, xz * 0.085 + 0.37);
    float moundFactor = clamp(height / max(uMoundHeight, 0.001), 0.0, 1.0);

    // Grow or skip: dithered against the coverage so edges thin out instead of cutting off.
    float coverage = grassCoverage(xz, height);
    if (r3 > smoothstep(0.15, 0.85, coverage)) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }

    // Distance LOD: thin out far blades and widen the survivors so coverage holds.
    vec3 rootWorld = (modelMatrix * vec4(xz.x, height, xz.y, 1.0)).xyz;
    float lodKeep = 1.0 - 0.6 * smoothstep(uFieldRadius * 1.3, uFieldRadius * 4.0, distance(cameraPosition, rootWorld));
    if (hash11(r1 * 37.1 + r2 * 3.7) > lodKeep) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }

    float len = uBladeLength
      * (1.0 + (r4 * 2.0 - 1.0) * uLengthVariation)
      * mix(1.0, 0.45 + patches.b * 1.1, uClumping)
      * (1.0 + uLift * moundFactor)
      * mix(0.45, 1.0, smoothstep(0.0, 0.6, coverage));

    // Blade frame: grows up, leaning slightly into the slope of the mound.
    vec3 up = normalize(mix(vec3(0.0, 1.0, 0.0), terrainNormal, uSlopeAlign));
    float yaw = r1 * 6.2831853;
    vec3 facing = vec3(cos(yaw), 0.0, sin(yaw));
    facing = normalize(facing - up * dot(facing, up));
    vec3 widthDir = normalize(cross(up, facing));

    // Bend = own droop + wind + pointer, accumulated as one horizontal vector.
    vec2 bend = facing.xz * uCurvature * (0.5 + r5);

    vec2 gustUv = xz * uGustScale * 0.045 - uGustScroll;
    float gust = texture2D(uNoise, gustUv).r;
    gust = clamp((gust - 0.5) * (1.0 + 2.5 * uGustContrast) + 0.5, 0.0, 1.0);
    gust = gust * gust * (3.0 - 2.0 * gust);
    float turb = texture2D(uNoise, xz * uGustScale * 0.13 - uTurbScroll).g - 0.5;
    vec2 windPerp = vec2(-uWindDir.y, uWindDir.x);
    float windAngle = uWindStrength * (0.2 + 1.05 * gust) * mix(0.8, 1.2, r4);
    vec2 wind = uWindDir * windAngle + windPerp * turb * uTurbulence * uWindStrength * 1.4;
    float flutter = sin(uTime * (6.3 + r2 * 4.1) + r1 * 47.0) * 0.6
      + sin(uTime * (10.7 + r4 * 3.3) + r2 * 29.0) * 0.4;
    wind += (uWindDir * 0.5 + windPerp) * flutter * uFlutter * uWindStrength * (0.12 + 0.35 * gust);
    bend += wind;

    vec2 push = vec2(0.0);
    for (int i = 0; i < TRAIL_LENGTH; i++) {
      if (uTrailActive < 0.5) break;
      vec4 point = uTrail[i];
      vec2 d = xz - point.xy;
      float dist = length(d);
      float falloff = 1.0 - smoothstep(0.0, uPointerRadius, dist);
      push += (d / max(dist, 0.0001)) * falloff * falloff * point.z;
    }
    float pushLength = length(push);
    if (pushLength > 1.0) push /= pushLength;
    bend += push * uPointerStrength * 0.6;
    // Pressing (and strong gusts) tilts the whole blade from its root, not just the soft tip.
    vec2 rootTilt = push * uPointerStrength * 1.1 + wind * 0.22;
    up = normalize(up + vec3(rootTilt.x, 0.0, rootTilt.y));
    facing = normalize(facing - up * dot(facing, up));

    vec3 bendDir = vec3(bend.x, 0.0, bend.y);
    float theta = length(bendDir);
    bendDir = theta > 0.0001 ? bendDir / theta : facing;
    bendDir = normalize(bendDir - up * dot(bendDir, up) + facing * 0.0001);
    theta = min(theta, 2.2);

    // Integrate the centreline of a blade whose bend angle grows as s^p:
    // stiff near the root, soft at the tip, and its length never stretches.
    float p = mix(1.0, 2.6, uStiffness);
    vec2 arc = vec2(0.0);
    float ds = t / 5.0;
    for (int i = 0; i < 5; i++) {
      float s = (float(i) + 0.5) * ds;
      float a = theta * pow(s, p);
      arc += vec2(sin(a), cos(a)) * ds;
    }
    float tipAngle = theta * pow(max(t, 0.0001), p);
    vec3 tangent = normalize(bendDir * sin(tipAngle) + up * cos(tipAngle));
    vec3 sideDir = normalize(widthDir - tangent * dot(widthDir, tangent));

    float taper = (1.0 - pow(t, 1.5)) * mix(0.8, 1.0, smoothstep(0.0, 0.25, t));
    float halfWidth = uBladeWidth * (0.7 + 0.6 * r5) * taper * 0.5 * inversesqrt(lodKeep);

    vec3 base = vec3(xz.x, height - 0.015, xz.y);
    vec3 centre = base + (bendDir * arc.x + up * arc.y) * len;
    vec3 local = centre + sideDir * side * halfWidth;

    vec3 faceNormal = normalize(cross(sideDir, tangent));
    vec4 world = modelMatrix * vec4(local, 1.0);
    vec3 worldNormal = normalize(mat3(modelMatrix) * faceNormal);

    // Thin blades vanish edge-on; widen them slightly in view space when seen side-on.
    vec4 mvPosition = viewMatrix * world;
    vec3 viewDir = normalize(cameraPosition - world.xyz);
    float edgeOn = 1.0 - abs(dot(worldNormal, viewDir));
    mvPosition.x += side * halfWidth * edgeOn * edgeOn * 1.2;
    gl_Position = projectionMatrix * mvPosition;

    // Rounded blade normal: tilt across the width so each blade catches light like a cylinder.
    vNormal = normalize(worldNormal + normalize(mat3(modelMatrix) * sideDir) * side * uRoundness);
    vTerrainNormal = normalize(mat3(modelMatrix) * terrainNormal);
    vWorld = world.xyz;
    vT = t;

    float dryness = clamp(uVariation * (smoothstep(0.35, 0.9, patches.a) * 1.1 + (r2 - 0.5) * 0.6), 0.0, 1.0);
    vec3 tip = mix(uTipColor, uDryColor, dryness);
    vec3 root = mix(uBaseColor, uDryColor * 0.45, dryness * 0.35);
    float brightness = 1.0 + (r4 - 0.5) * 0.22 * (0.4 + uVariation);
    vAlbedo = mix(root, tip, pow(t, 0.85)) * brightness;

    float rootShade = 1.0 - pow(1.0 - smoothstep(0.0, 0.85, t), 1.6);
    // Sparse blades (field edge, mound fringes) are less occluded than ones deep in a dense patch.
    float occlusion = uOcclusion * smoothstep(0.1, 0.85, coverage);
    vAO = mix(1.0 - occlusion, 1.0, rootShade) * mix(1.0, 0.82, occlusion * (1.0 - moundFactor) * uGroundCover);
    // Bent-over blades show their lighter flanks: gust waves and brushed paths read as sheen.
    vSheen = (gust * uWindStrength + min(pushLength, 1.0) * uPointerStrength * 0.8) * t;
  }
`

export const bladeFragmentShader = /* glsl */ `
  uniform float uTranslucency;
  uniform float uSpecular;
  uniform float uSoftness;
  uniform float uSheen;

  ${lightingChunk}

  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec3 vTerrainNormal;
  varying vec3 vAlbedo;
  varying float vT;
  varying float vAO;
  varying float vSheen;

  void main() {
    vec3 bladeNormal = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
    vec3 terrainNormal = normalize(vTerrainNormal);
    // Blending toward the mound normal makes a field of blades read as one soft volume.
    vec3 n = normalize(mix(bladeNormal, terrainNormal, uSoftness));
    vec3 v = normalize(cameraPosition - vWorld);

    vec3 albedo = vAlbedo;
    vec3 light = ambientLight(n) + uSunColor * wrapDiffuse(n, 0.25);
    vec3 color = albedo * light;

    // Light scattering through the blade when the sun is behind it.
    float backLit = pow(clamp(dot(v, -uSunDir), 0.0, 1.0), 2.5);
    float thinness = 0.25 + 0.75 * vT;
    float behindBlade = clamp(-dot(bladeNormal, uSunDir) * 0.5 + 0.5, 0.0, 1.0);
    color += albedo * uSunColor * vec3(1.05, 1.15, 0.7) * uTranslucency * thinness * (backLit * 1.3 + behindBlade * 0.25);

    vec3 h = normalize(uSunDir + v);
    float spec = pow(clamp(dot(bladeNormal, h), 0.0, 1.0), 36.0) * uSpecular * vT;
    color += uSunColor * spec * 0.6;

    color *= 1.0 + vSheen * uSheen;
    color *= vAO;

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    // Fog after tone mapping so the horizon matches the (untonemapped) clear colour exactly.
    gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogColor, fogAmount(vWorld));
    #include <colorspace_fragment>
  }
`

export const groundVertexShader = /* glsl */ `
  ${terrainChunk}

  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vCoverage;
  varying float vEdge;

  void main() {
    // Plane is authored in XY; flipping Y keeps its front face pointing up once laid in XZ.
    vec2 xz = vec2(position.x, -position.y) * uTerrainExtent;
    vec4 terrain = sampleTerrain(xz);
    vec3 local = vec3(xz.x, terrain.r - 0.02, xz.y);
    vec4 world = modelMatrix * vec4(local, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * terrain.gba);
    vCoverage = grassCoverage(xz, terrain.r);
    vEdge = fieldEdge(xz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const groundFragmentShader = /* glsl */ `
  uniform vec3 uGroundColor;
  uniform vec3 uRootColor;
  uniform float uOcclusion;

  ${lightingChunk}

  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vCoverage;
  varying float vEdge;

  void main() {
    vec3 n = normalize(vNormal);
    // Under grass the ground takes the shadowed root colour; bare ground keeps its own.
    vec3 albedo = mix(uGroundColor, uRootColor * (1.0 - uOcclusion * 0.6), smoothstep(0.0, 0.5, vCoverage));
    vec3 color = albedo * (ambientLight(n) + uSunColor * wrapDiffuse(n, 0.2));
    // Soft contact shadow around grass patches.
    color *= 1.0 - uOcclusion * 0.35 * smoothstep(0.0, 0.25, vCoverage) * (1.0 - smoothstep(0.25, 0.9, vCoverage));

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    // Ground dissolves into the backdrop exactly where the grass runs out.
    float edgeFade = 1.0 - smoothstep(0.0, 0.7, vEdge);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogColor, max(fogAmount(vWorld), edgeFade));
    #include <colorspace_fragment>
  }
`
