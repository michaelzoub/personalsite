'use client'

import dynamic from 'next/dynamic'
import { DotmCircular3 } from '@/components/ui/dotm-circular-3'

const MusicGraph = dynamic(() => import('../components/musicVisual/graph'), {
  ssr: false,
  loading: () => (
    <div className="music-stage-loading" role="status" aria-label="Loading music map">
      <DotmCircular3 color="var(--accent-strong)" size={30} dotSize={4} ariaLabel="Loading music map" />
    </div>
  ),
})

export default function MusicPage() {
  return <main className="simple-music-page"><MusicGraph /></main>
}
