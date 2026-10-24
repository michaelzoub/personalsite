import Link from 'next/link'
import { palette } from '../data/palette'

const STRIPE = 5
const HEIGHT = 16

// Five touching stripes on integer pixels, so edges stay crisp with no seams.
export function BrandStripes() {
  return (
    <svg width={STRIPE * palette.length} height={HEIGHT} viewBox={`0 0 ${STRIPE * palette.length} ${HEIGHT}`} shapeRendering="crispEdges" aria-hidden="true">
      {palette.map((color, i) => (
        <rect key={color.name} x={i * STRIPE} y={0} width={STRIPE} height={HEIGHT} fill={color.base} />
      ))}
    </svg>
  )
}

export function BrandMark() {
  return (
    <Link href="/" className="brand-mark" aria-label="Michael Zoubkoff, home">
      <BrandStripes />
    </Link>
  )
}
