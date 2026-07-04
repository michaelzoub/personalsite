import Image, { type StaticImageData } from 'next/image'

export type MediaItem = {
  id: string
  name: string
  year: string
  url: string
  category: 'Engineering' | 'Writing'
  screenshotUrl?: string | StaticImageData
  videoUrl?: string
}

export function ItemMedia({ item, sizes }: { item: MediaItem; sizes: string }) {
  if (item.videoUrl) return <video src={item.videoUrl} autoPlay muted loop playsInline />
  if (typeof item.screenshotUrl === 'string') return <img src={item.screenshotUrl} alt="" />
  return item.screenshotUrl ? <Image src={item.screenshotUrl} fill sizes={sizes} alt="" /> : null
}
