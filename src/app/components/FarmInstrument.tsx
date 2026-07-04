'use client'

import { motion, useReducedMotion } from 'motion/react'

function FarmArchitectureIcon() {
  const reduce = useReducedMotion()
  return (
    <div className="farm-architecture-icon" role="img" aria-label="Miniature site plan with crop beds, greenhouse, nursery, packhouse, solar charging canopy, water plant, and robot transit loop">
      <div className="farm-icon-canopy" aria-hidden>{Array.from({ length: 7 }).map((_, i) => <i key={i} />)}</div>
      <div className="farm-icon-greenhouse" aria-hidden><span /><span /><span /></div>
      <div className="farm-icon-packhouse" aria-hidden><small>control</small></div>
      <div className="farm-icon-nursery" aria-hidden />
      <div className="farm-icon-zone berries" aria-hidden>{Array.from({ length: 4 }).map((_, i) => <i key={i} />)}</div>
      <div className="farm-icon-zone greens" aria-hidden>{Array.from({ length: 5 }).map((_, i) => <i key={i} />)}</div>
      <div className="farm-icon-zone vegetables" aria-hidden>{Array.from({ length: 4 }).map((_, i) => <i key={i} />)}</div>
      <div className="farm-icon-water" aria-hidden><i /><i /></div>
      <div className="farm-icon-trellis" aria-hidden />
      <div className="farm-icon-route" aria-hidden>
        <motion.i animate={reduce ? undefined : { offsetDistance: ['0%', '100%'] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }} />
      </div>
    </div>
  )
}

export default function FarmInstrument() {
  return (
    <article className="future-plan">
      <header className="future-plan-header">
        <div>
          {/* <p>Future / a working plan</p> */}
          <h2>Starting a farm.</h2>
          <span>I keep picturing a mixed farm: berries, brassicas, fruiting vegetables, leafy crops, a trellised edge, plus a greenhouse and nursery. I want enough automation to make it manageable, but not so much that it puts distance between me and the work.</span>
          </div>
        <FarmArchitectureIcon />
      </header>

      

      <figure className="future-architecture">
        <img src="/farm-architecture.webp" alt="Plan of a one-hectare automated farm with outdoor crop zones, controlled-environment greenhouse, nursery, packhouse, solar robot-charging canopy, water and energy systems, sensors, and robotic transit paths." />
        <figcaption><span>Site architecture v0.2</span></figcaption>
      </figure>
    </article>
  )
}
