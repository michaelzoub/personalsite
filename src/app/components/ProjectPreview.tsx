'use client'

import MapBenchPreview from './MapBenchPreview'
import { RubiconReadPreview } from './RubiconReadPreview'

// Hover-only backdrop behind an index row. Static until hovered; resets on leave.
export function ProjectPreview({ id, active, excerpt }: { id: string; active: boolean; excerpt?: string }) {
  const content =
    id === 'rubicon' ? <RubiconReadPreview playing={active} />
    : id === 'mapbench' ? <MapBenchPreview playing={active} />
    : excerpt ? <p className="index-excerpt">{excerpt}</p>
    : null
  if (!content) return null

  return (
    <div className="index-preview" data-active={active} data-kind={excerpt ? 'text' : id} aria-hidden="true">
      {content}
    </div>
  )
}
