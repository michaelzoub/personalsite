import type { Metadata } from 'next'
import { GrassPreview } from './GrassPreview'

export const metadata: Metadata = {
  title: 'Grass preview',
  robots: { index: false },
}

export default function GrassPreviewPage() {
  return <GrassPreview />
}
