'use client'

import { useCallback, useRef } from 'react'

// Static scene rendered before the arms: ground prism, greenhouse, crop beds, flow path.
const SCENE_BG = `<polygon points="9.56,62.7 61,92.4 61,104.82 9.56,75.12" fill="#ded5c4"/>
<polygon points="61,92.4 112.44,62.7 112.44,75.12 61,104.82" fill="#e7ded0"/>
<polygon points="9.56,62.7 9.56,75.12 61,104.82 112.44,75.12 112.44,62.7 61,92.4" fill="none" stroke="rgba(120,104,78,.28)" stroke-width=".7"/>
<polygon points="61,33 112.44,62.7 61,92.4 9.56,62.7" fill="#f2ede2" stroke="rgba(120,104,78,.3)" stroke-width=".7"/>
<polyline class="fd-flow" points="61,36.78 105.89,62.7 61,88.62 16.11,62.7 61,36.78 81.11,48.39 36.22,74.31" fill="none" stroke="#cf7a4c" stroke-width=".8" stroke-dasharray="2 1.8" stroke-linecap="round" opacity=".62"/>
<polygon points="61,36.24 78.77,46.5 64.27,54.87 46.5,44.61" fill="#e4e9df"/>
<polygon class="fd-glass" points="61,36.24 78.77,46.5 78.77,31.38 61,21.12" fill="rgba(150,180,163,.14)"/>
<polygon class="fd-glass" points="61,36.24 46.5,44.61 46.5,29.49 61,21.12" fill="rgba(150,180,163,.14)"/>
<rect x="58.84" y="28.68" width="4.32" height="11.34" rx="2.16" fill="#bcd4ab"/>
<line x1="59.24" y1="31.52" x2="62.76" y2="31.52" stroke="#94b57f" stroke-width=".5"/>
<line x1="59.24" y1="34.35" x2="62.76" y2="34.35" stroke="#94b57f" stroke-width=".5"/>
<line x1="59.24" y1="37.19" x2="62.76" y2="37.19" stroke="#94b57f" stroke-width=".5"/>
<ellipse cx="61" cy="28.68" rx="2.16" ry="1.25" fill="#cfe2c0"/>
<rect x="52.76" y="32.19" width="4.32" height="11.34" rx="2.16" fill="#bcd4ab"/>
<line x1="53.16" y1="35.02" x2="56.68" y2="35.02" stroke="#94b57f" stroke-width=".5"/>
<line x1="53.16" y1="37.86" x2="56.68" y2="37.86" stroke="#94b57f" stroke-width=".5"/>
<line x1="53.16" y1="40.70" x2="56.68" y2="40.70" stroke="#94b57f" stroke-width=".5"/>
<ellipse cx="54.92" cy="32.19" rx="2.16" ry="1.25" fill="#cfe2c0"/>
<rect x="65.15" y="32.32" width="4.32" height="11.34" rx="2.16" fill="#bcd4ab"/>
<line x1="65.55" y1="35.16" x2="69.07" y2="35.16" stroke="#94b57f" stroke-width=".5"/>
<line x1="65.55" y1="37.99" x2="69.07" y2="37.99" stroke="#94b57f" stroke-width=".5"/>
<line x1="65.55" y1="40.82" x2="69.07" y2="40.82" stroke="#94b57f" stroke-width=".5"/>
<ellipse cx="67.31" cy="32.32" rx="2.16" ry="1.25" fill="#cfe2c0"/>
<rect x="59.07" y="35.84" width="4.32" height="11.34" rx="2.16" fill="#bcd4ab"/>
<line x1="59.47" y1="38.68" x2="62.99" y2="38.68" stroke="#94b57f" stroke-width=".5"/>
<line x1="59.47" y1="41.51" x2="62.99" y2="41.51" stroke="#94b57f" stroke-width=".5"/>
<line x1="59.47" y1="44.34" x2="62.99" y2="44.34" stroke="#94b57f" stroke-width=".5"/>
<ellipse cx="61.23" cy="35.84" rx="2.16" ry="1.25" fill="#cfe2c0"/>
<polygon points="46.5,44.61 64.27,54.87 64.27,39.75 46.5,29.49" fill="rgba(158,186,170,.2)"/>
<polygon points="78.77,46.5 64.27,54.87 64.27,39.75 78.77,31.38" fill="rgba(158,186,170,.2)"/>
<polygon class="fd-glass" points="61,21.12 78.77,31.38 64.27,39.75 46.5,29.49" fill="rgba(180,205,190,.28)"/>
<line x1="46.5" y1="44.61" x2="64.27" y2="54.87" stroke="rgba(86,120,100,.55)" stroke-width=".7"/>
<line x1="64.27" y1="54.87" x2="78.77" y2="46.5" stroke="rgba(86,120,100,.55)" stroke-width=".7"/>
<line x1="46.5" y1="44.61" x2="46.5" y2="29.49" stroke="rgba(86,120,100,.55)" stroke-width=".7"/>
<line x1="64.27" y1="54.87" x2="64.27" y2="39.75" stroke="rgba(86,120,100,.55)" stroke-width=".7"/>
<line x1="78.77" y1="46.5" x2="78.77" y2="31.38" stroke="rgba(86,120,100,.55)" stroke-width=".7"/>
<line x1="61" y1="21.12" x2="78.77" y2="31.38" stroke="rgba(86,120,100,.55)" stroke-width=".7"/>
<line x1="78.77" y1="31.38" x2="64.27" y2="39.75" stroke="rgba(86,120,100,.55)" stroke-width=".7"/>
<line x1="64.27" y1="39.75" x2="46.5" y2="29.49" stroke="rgba(86,120,100,.55)" stroke-width=".7"/>
<line x1="46.5" y1="29.49" x2="61" y2="21.12" stroke="rgba(86,120,100,.55)" stroke-width=".7"/>
<polygon points="65.68,56.76 89.06,70.26 89.06,72.96 65.68,59.46" fill="#6f8f5c"/>
<polygon points="89.06,70.26 97.48,65.4 97.48,68.1 89.06,72.96" fill="#7fa06a"/>
<polygon points="74.09,51.9 97.48,65.4 89.06,70.26 65.68,56.76" fill="#9dbb84" stroke="rgba(80,90,55,.35)" stroke-width=".5"/>
<line x1="70.73" y1="54.82" x2="92.43" y2="67.34" stroke="#5f8146" stroke-width=".9" stroke-linecap="round"/>
<polygon points="54.92,62.97 78.3,76.47 78.3,79.17 54.92,65.67" fill="#6f8f5c"/>
<polygon points="78.3,76.47 86.72,71.61 86.72,74.31 78.3,79.17" fill="#7fa06a"/>
<polygon points="63.34,58.11 86.72,71.61 78.3,76.47 54.92,62.97" fill="#9dbb84" stroke="rgba(80,90,55,.35)" stroke-width=".5"/>
<line x1="59.97" y1="61.03" x2="81.67" y2="73.55" stroke="#5f8146" stroke-width=".9" stroke-linecap="round"/>
<polygon points="44.63,68.91 68.01,82.41 68.01,85.11 44.63,71.61" fill="#6f8f5c"/>
<polygon points="68.01,82.41 76.43,77.55 76.43,80.25 68.01,85.11" fill="#7fa06a"/>
<polygon points="53.05,64.05 76.43,77.55 68.01,82.41 44.63,68.91" fill="#9dbb84" stroke="rgba(80,90,55,.35)" stroke-width=".5"/>
<line x1="49.68" y1="66.97" x2="71.38" y2="79.49" stroke="#5f8146" stroke-width=".9" stroke-linecap="round"/>
<polygon points="37.15,47.31 55.39,57.84 55.39,60.54 37.15,50.01" fill="#c9a98f"/>
<polygon points="55.39,57.84 61.47,54.33 61.47,57.03 55.39,60.54" fill="#d8bfa9"/>
<polygon points="43.23,43.8 61.47,54.33 55.39,57.84 37.15,47.31" fill="#e7d3c2" stroke="rgba(80,90,55,.35)" stroke-width=".5"/>
<line x1="41.03" y1="46.04" x2="57.59" y2="55.6" stroke="#8aa06a" stroke-width=".9" stroke-linecap="round"/>
<circle cx="42.06" cy="46.64" r=".8" fill="#cf6a52"/>
<circle cx="46.89" cy="49.42" r=".8" fill="#cf6a52"/>
<circle cx="51.73" cy="52.22" r=".8" fill="#cf6a52"/>
<circle cx="56.56" cy="55" r=".8" fill="#cf6a52"/>
<polygon points="29.67,51.63 47.91,62.16 47.91,64.86 29.67,54.33" fill="#c9a98f"/>
<polygon points="47.91,62.16 53.99,58.65 53.99,61.35 47.91,64.86" fill="#d8bfa9"/>
<polygon points="35.75,48.12 53.99,58.65 47.91,62.16 29.67,51.63" fill="#e7d3c2" stroke="rgba(80,90,55,.35)" stroke-width=".5"/>
<line x1="33.55" y1="50.36" x2="50.1" y2="59.92" stroke="#8aa06a" stroke-width=".9" stroke-linecap="round"/>
<circle cx="34.58" cy="50.95" r=".8" fill="#cf6a52"/>
<circle cx="39.41" cy="53.75" r=".8" fill="#cf6a52"/>
<circle cx="44.24" cy="56.53" r=".8" fill="#cf6a52"/>
<circle cx="49.08" cy="59.33" r=".8" fill="#cf6a52"/>
<polygon points="15.64,59.73 37.15,72.15 37.15,74.85 15.64,62.43" fill="#6f8f5c"/>
<polygon points="37.15,72.15 47.91,65.94 47.91,68.64 37.15,74.85" fill="#7fa06a"/>
<polygon points="26.39,53.52 47.91,65.94 37.15,72.15 15.64,59.73" fill="#9dbb84" stroke="rgba(80,90,55,.35)" stroke-width=".5"/>
<line x1="23.65" y1="56.08" x2="43.48" y2="67.52" stroke="#5f8146" stroke-width=".9" stroke-linecap="round"/>
<line x1="20.07" y1="58.15" x2="39.89" y2="69.59" stroke="#5f8146" stroke-width=".9" stroke-linecap="round"/>`

// Static scene rendered after the arms (paints on top): water tanks.
const SCENE_FG = `<g class="fd-water"><ellipse cx="55.39" cy="80.52" rx="3.09" ry="1.78" fill="rgba(70,80,90,.25)"/><rect x="52.30" y="70.26" width="6.17" height="10.26" rx="1.54" fill="#9db2c0"/><ellipse cx="55.39" cy="70.26" rx="3.09" ry="1.78" fill="#c3d2dc"/><ellipse cx="58.66" cy="85.11" rx="2.57" ry="1.49" fill="rgba(70,80,90,.25)"/><rect x="56.09" y="76.47" width="5.14" height="8.64" rx="1.29" fill="#aebfca"/><ellipse cx="58.66" cy="76.47" rx="2.57" ry="1.49" fill="#ccd8e0"/></g>`

// Robotic arm anatomy, all derived from a base point + facing direction so the boom, elbow, and
// gripper always stay aligned (the old hardcoded SVG drifted out of sync on the left-facing arms).
const BOOM_LEN = 6
const GRIP_LEN = 2.3
const GRIP_KINK = 12 // degrees the gripper folds downward from the boom
const POST_H = 5.4   // shoulder height above the base center
const RAD = Math.PI / 180

type Dir = 1 | -1

type RoboticArmProps = {
  x: number        // base (shadow) center in viewBox units
  y: number
  face: number     // rest angle of the boom in degrees (+ = boom tip down, - = up)
  dir: Dir         // +1 boom extends right, -1 extends left
  duration: number // pick-and-place cycle length in seconds
  delay: number    // animation delay in seconds (negative offsets the phase)
}

function RoboticArm({ x, y, face, dir, duration, delay }: RoboticArmProps) {
  const sx = x              // the shoulder sits directly above the base center
  const sy = y - POST_H
  const boomAngle = dir > 0 ? face : 180 - face
  const gripAngle = dir > 0 ? face + GRIP_KINK : 180 - face - GRIP_KINK
  const elbowX = sx + BOOM_LEN * Math.cos(boomAngle * RAD)
  const elbowY = sy + BOOM_LEN * Math.sin(boomAngle * RAD)
  const gripX = elbowX + GRIP_LEN * Math.cos(gripAngle * RAD)
  const gripY = elbowY + GRIP_LEN * Math.sin(gripAngle * RAD)
  const boomRectX = dir > 0 ? sx : sx - BOOM_LEN
  const boomRot = dir > 0 ? face : -face

  return (
    <>
      {/* Anchor: ground shadow, mount plate, vertical post. Stays put. */}
      <g className="fd-base">
        <ellipse cx={x} cy={y} rx={3} ry={1.3} fill="rgba(90,80,56,.16)" />
        <rect x={x - 2.3} y={y - 2.1} width={4.6} height={2.4} rx={1} fill="#e7e4da" stroke="rgba(120,104,78,.42)" strokeWidth=".5" />
        <rect x={x - 1.1} y={sy} width={2.2} height={3.6} rx={1} fill="#f6f4ee" stroke="rgba(120,104,78,.42)" strokeWidth=".5" />
      </g>
      {/* Boom: pivots around the shoulder (transform-origin set inline) and runs the
          pick-and-place choreography from CSS (.fd-arm / @keyframes fdPick). */}
      <g
        className="fd-arm"
        style={{
          transformBox: 'view-box',
          transformOrigin: `${sx}px ${sy}px`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      >
        <rect
          x={boomRectX}
          y={sy - 0.95}
          width={BOOM_LEN}
          height={1.9}
          rx={0.95}
          fill="#f6f4ee"
          stroke="rgba(120,104,78,.42)"
          strokeWidth=".5"
          transform={`rotate(${boomRot} ${sx} ${sy})`}
        />
        <circle cx={sx} cy={sy} r={1.25} fill="#dcd8cc" stroke="rgba(120,104,78,.42)" strokeWidth=".5" />
        <circle cx={elbowX} cy={elbowY} r={1} fill="#dcd8cc" stroke="rgba(120,104,78,.42)" strokeWidth=".5" />
        <line x1={elbowX} y1={elbowY} x2={gripX} y2={gripY} stroke="#c9c4b6" strokeWidth={1.1} strokeLinecap="round" />
      </g>
    </>
  )
}

// One arm per picking station along the rows. Durations/delays are coprime-ish so the arms
// drift in and out of phase instead of ever moving together.
const ARMS: RoboticArmProps[] = [
  { x: 74.56, y: 57.83, face: 26, dir: 1, duration: 15, delay: 0 },
  { x: 73.63, y: 70.79, face: -26, dir: -1, duration: 18, delay: -7 },
  { x: 46.5, y: 50.81, face: 26, dir: 1, duration: 17, delay: -3 },
  { x: 30.6, y: 62.69, face: 26, dir: 1, duration: 14, delay: -10 },
  { x: 54.45, y: 70.52, face: -26, dir: -1, duration: 19, delay: -5 },
]

function FarmArchitectureIcon() {
  const ref = useRef<HTMLDivElement>(null)

  // A restrained hover tilt: the miniature leans toward the cursor, then settles back.
  const onMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - .5
    const y = (event.clientY - rect.top) / rect.height - .5
    el.style.transform = `rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg)`
  }, [])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'rotateX(0deg) rotateY(0deg)'
  }, [])

  return (
    <div className="farm-architecture-icon" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div
        ref={ref}
        className="farm-device"
        role="img"
        aria-label="A working miniature of a one-hectare plot: crop beds, a glass greenhouse of grow wheels, robotic picking arms tracing their rows, water tanks, and a robot-transit path."
      >
        <div className="farm-device-screen">
          <svg className="fd-svg" viewBox="0 0 122 122" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g dangerouslySetInnerHTML={{ __html: SCENE_BG }} />
            {ARMS.map((arm, i) => <RoboticArm key={i} {...arm} />)}
            <g dangerouslySetInnerHTML={{ __html: SCENE_FG }} />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function FarmInstrument() {
  return (
    <section className="farm" aria-label="Future">
      <header className="farm-title">
        <h2>A place to return to</h2>
      </header>

      <div className="farm-frame">
        <FarmArchitectureIcon />
      </div>

      <div className="farm-prose">
        <p>Eventually I&apos;d like to build a small automated farm: berries, greens, a greenhouse, and enough machinery to handle the repetitive work.</p>
        <p>Not because everything needs to become a dashboard. Mostly because I want a place to come back to, grow real things, and spend more time outside.</p>
      </div>

      <figure className="farm-sketch">
        <img src="/farm-architecture.webp" alt="Hand-drawn architecture sketch of the automated plot: beds, greenhouse, water and power, sensor mesh, and rover routing." loading="lazy" decoding="async" />
        <figcaption>farm architecture sketch</figcaption>
      </figure>
    </section>
  )
}
