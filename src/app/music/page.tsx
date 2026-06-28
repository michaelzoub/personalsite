'use client'

import dynamic from 'next/dynamic'

const MusicGraph = dynamic(() => import('../components/musicVisual/graph'), { ssr: false })

export default function MusicPage() {
  return <main className="simple-music-page"><MusicGraph /></main>
}
