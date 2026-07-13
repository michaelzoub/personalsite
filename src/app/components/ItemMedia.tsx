'use client'

import Image, { type StaticImageData } from 'next/image'
import { useEffect, useRef, useState } from 'react'

export type MediaItem = {
  id: string
  name: string
  year: string
  url: string
  category: 'Engineering' | 'Writing'
  screenshotUrl?: string | StaticImageData
  videoUrl?: string
}

export function ItemMedia({ item, sizes, priority = false }: { item: MediaItem; sizes: string; priority?: boolean }) {
  const [ready, setReady] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const className = `media-item${ready ? ' is-ready' : ''}`
  const markReady = () => setReady(true)

  useEffect(() => {
    if (imageRef.current?.complete || (videoRef.current && videoRef.current.readyState >= 2)) setReady(true)
  }, [])

  if (item.videoUrl) return (
    <video
      ref={videoRef}
      className={className}
      src={item.videoUrl}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onLoadedData={markReady}
      onError={markReady}
    />
  )
  if (typeof item.screenshotUrl === 'string') return (
    <img
      ref={imageRef}
      className={className}
      src={item.screenshotUrl}
      alt=""
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={markReady}
      onError={markReady}
    />
  )
  return item.screenshotUrl ? (
    <Image
      ref={imageRef}
      className={className}
      src={item.screenshotUrl}
      fill
      sizes={sizes}
      alt=""
      priority={priority}
      onLoad={markReady}
      onError={markReady}
    />
  ) : null
}
