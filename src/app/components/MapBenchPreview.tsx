'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

const MAP_NODES = [
  { x: 180, y: 56 },
  { x: 109, y: 98 },
  { x: 251, y: 98 },
  { x: 72, y: 140 },
  { x: 151, y: 140 },
  { x: 288, y: 140 },
]
const MAP_EDGES = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]]
const ARTIFACT_X = [74, 180, 286]
const ARTIFACT_LABELS = ['Architecture', 'Skeleton', 'Call graph']
const CAPTIONS = ['Code as input', 'Generates a deterministic map', 'Agents use the map', 'Verifier grades the work']
const CAPTION_Y = { source: 272, frame: 294, artifacts: 358, workspace: 432 }
const DUR = { base: 0.36, slow: 0.55 }
const EASE = { out: 'power2.out', inOut: 'power2.inOut', draw: 'power1.inOut' }

if (typeof window !== 'undefined') gsap.registerPlugin(DrawSVGPlugin)

export default function MapBenchPreview() {
  const figureRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = figureRef.current
    if (!root) return

    let context: gsap.Context | undefined
    let frame = 0
    let lastWidth = Math.round(root.getBoundingClientRect().width)

    const create = () => {
      context?.revert()
      context = gsap.context(() => {
        const q = <T extends Element>(selector: string) => root.querySelector<T>(selector)!
        const qa = <T extends Element>(selector: string) => [...root.querySelectorAll<T>(selector)]
        const source = q<SVGRectElement>('.mb-source')
        const mapStage = q<SVGGElement>('.mb-map-stage')
        const sourceLines = qa<SVGLineElement>('.mb-source-line')
        const nodes = qa<SVGRectElement>('.mb-node')
        const edges = qa<SVGLineElement>('.mb-edge')
        const artifacts = qa<SVGRectElement>('.mb-artifact')
        const artifactLabels = qa<SVGTextElement>('.mb-artifact-label')
        const stems = qa<SVGLineElement>('.mb-stem')
        const workspace = q<SVGRectElement>('.mb-workspace')
        const held = q<SVGGElement>('.mb-held')
        const check = q<SVGPathElement>('.mb-check')
        const caption = q<SVGGElement>('.mb-caption')
        const lines = qa<SVGTextElement>('.mb-caption-line')
        const carried = artifacts[1]
        const carriedLabel = artifactLabels[1]
        const dropped = artifacts.filter((_, index) => index !== 1)
        const droppedLabels = artifactLabels.filter((_, index) => index !== 1)
        let visible = 0
        let baseline = CAPTION_Y.source

        const timeline = gsap.timeline({
          paused: true,
          repeat: -1,
          repeatDelay: 1.4,
          defaults: { ease: EASE.out },
        })

        const travel = (y: number, position: string) => {
          timeline.to(caption, { y, duration: DUR.slow, ease: EASE.inOut }, position)
          baseline = y
        }
        const fade = (text: string, y: number, position: string) => {
          const outgoing = lines[visible]
          const incoming = lines[1 - visible]
          visible = 1 - visible
          if (y !== baseline) travel(y, position)
          timeline
            .set(incoming, { textContent: text, opacity: 0 }, position)
            .to(outgoing, { opacity: 0, duration: DUR.base, ease: EASE.inOut }, position)
            .to(incoming, { opacity: 1, duration: DUR.slow, ease: EASE.inOut }, `${position}+=0.2`)
        }

        timeline
          .set(mapStage, { y: 100 }, 0)
          .set(caption, { y: CAPTION_Y.source }, 0)
          .set(lines[0], { textContent: CAPTIONS[0], opacity: 0 }, 0)
          .set(lines[1], { textContent: '', opacity: 0 }, 0)

        gsap.set(source, { opacity: 0, y: 8 })
        gsap.set(sourceLines, { opacity: 0 })
        gsap.set([...nodes, ...artifacts, ...artifactLabels, workspace, held], { opacity: 0 })
        gsap.set([...edges, ...stems, check], { drawSVG: '0%' })

        timeline
          .to(source, { opacity: 1, y: 0, duration: DUR.base })
          .to(sourceLines, { opacity: 1, duration: DUR.base, stagger: 0.06 }, '-=0.22')
          .to(lines[0], { opacity: 1, duration: DUR.base }, '<')
          .addLabel('opens', '+=0.45')
          .to(sourceLines, { opacity: 0, duration: DUR.base }, 'opens')
          .to(source, { attr: { x: 30, y: 24, width: 300, height: 140, rx: 14 }, duration: DUR.slow, ease: EASE.inOut }, 'opens')
          .to(source, { opacity: 0.45, duration: DUR.slow }, 'opens')
          .to(nodes, { opacity: 1, duration: DUR.base, stagger: 0.05 }, 'opens+=0.3')
          .to(edges, { drawSVG: '100%', duration: DUR.base, stagger: 0.05, ease: EASE.draw }, 'opens+=0.45')
        fade(CAPTIONS[1], CAPTION_Y.frame, 'opens')

        timeline
          .addLabel('artifacts', '+=0.4')
          .to(stems, { drawSVG: '100%', duration: DUR.base, stagger: 0.06, ease: EASE.draw }, 'artifacts')
          .to(artifacts, { opacity: 1, duration: DUR.base, stagger: 0.05 }, 'artifacts+=0.2')
          .to(artifactLabels, { opacity: 1, duration: DUR.base, stagger: 0.05 }, 'artifacts+=0.26')
        travel(CAPTION_Y.artifacts, 'artifacts')

        timeline.addLabel('handoff', '+=0.45').to(mapStage, { y: 0, duration: DUR.slow, ease: EASE.inOut }, 'handoff')
        fade(CAPTIONS[2], CAPTION_Y.workspace, 'handoff')
        timeline
          .to(workspace, { opacity: 1, duration: DUR.base }, 'handoff+=0.5')
          .to(held, { opacity: 1, duration: DUR.base }, 'handoff+=0.68')
          .to([...dropped, ...stems, ...droppedLabels], { opacity: 0, duration: DUR.base }, 'handoff+=0.9')
          .to(source, { opacity: 0, duration: DUR.slow }, '<')
          .to([...nodes, ...edges], { opacity: 0.26, duration: DUR.slow }, '<')
          .to(carried, { attr: { x: 206, y: 315, width: 88, height: 32, rx: 6 }, duration: DUR.slow, ease: EASE.inOut }, '-=0.16')
          .to(carriedLabel, { attr: { x: 250, y: 331 }, fill: '#777777', duration: DUR.slow, ease: EASE.inOut }, '<')
          .addLabel('graded', '+=0.2')
          .to(check, { drawSVG: '100%', duration: DUR.base, ease: EASE.draw }, 'graded')
        fade(CAPTIONS[3], CAPTION_Y.workspace, 'graded')

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) timeline.progress(1).pause()
        else timeline.play()
      }, root)
    }

    create()
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width)
      if (width === lastWidth) return
      lastWidth = width
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(create)
    })
    observer.observe(root)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      context?.revert()
    }
  }, [])

  return (
    <div className="mapbench-card-preview" aria-hidden="true">
      <section className="mapbench-card-hero">
        <img src="/mapbench-hero-terraces.png" alt="" />
        <i />
        <div>
          <strong>MapBench</strong>
          <p>Do deterministic structural artifacts help agents traverse unfamiliar codebases more efficiently?</p>
          <span>See how the benchmark works&nbsp; →</span>
        </div>
      </section>
      <figure className="mapbench-card-pipeline" ref={figureRef}>
        <svg viewBox="0 0 360 456">
          <rect className="mb-workspace" x="30" y="288" width="300" height="114" rx="14" />
          <g className="mb-map-stage">
            <rect className="mb-source" x="138" y="46" width="84" height="96" rx="10" />
            {[0, 1, 2].map((index) => <line className="mb-source-line" key={index} x1="158" x2={index === 1 ? 190 : 202} y1={74 + index * 20} y2={74 + index * 20} />)}
            {MAP_EDGES.map(([from, to]) => <line className="mb-edge" key={`${from}-${to}`} x1={MAP_NODES[from].x} y1={MAP_NODES[from].y} x2={MAP_NODES[to].x} y2={MAP_NODES[to].y} />)}
            {MAP_NODES.map((node, index) => <rect className={`mb-node ${index === 0 ? 'is-core' : ''}`} key={index} x={node.x - 10} y={node.y - 10} width="20" height="20" rx="5" />)}
            <line className="mb-stem" x1="180" y1="164" x2="180" y2="180" />
            <line className="mb-stem" x1="74" y1="180" x2="286" y2="180" />
            {ARTIFACT_X.map((x) => <line className="mb-stem" key={x} x1={x} y1="180" x2={x} y2="196" />)}
            {ARTIFACT_X.map((x) => <rect className="mb-artifact" key={x} x={x - 44} y="196" width="88" height="32" rx="6" />)}
            {ARTIFACT_X.map((x, index) => <text className="mb-artifact-label" key={ARTIFACT_LABELS[index]} x={x} y="212">{ARTIFACT_LABELS[index]}</text>)}
          </g>
          <g className="mb-held"><rect x="66" y="315" width="88" height="32" rx="6" /><text x="110" y="331">Source</text></g>
          <path className="mb-check" d="M169 375 L176 382 L191 368" />
          <g className="mb-caption"><text className="mb-caption-line" x="180" y="0">Code as input</text><text className="mb-caption-line" x="180" y="0" /></g>
        </svg>
      </figure>
    </div>
  )
}
