'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { getLocalStorage, setLocalStorage } from '@/app/utils/localStorage'

type Post = { id: number; name: string; date: string; description?: string }

const localWriting = [
  { name: 'The biggest hurdle to achieving AGI', date: '2026-06-02', description: 'Why open-ended exploration and objective uncertainty are foundational to intelligent systems.', href: '/writing/the-biggest-hurdle-to-achieving-agi', published: true },
  { name: 'The war against frontier labs: decentralizing AI', date: '2026-06-14', description: 'Why access to intelligence should remain contestable, and why decentralized training and open weights matter.', href: '/writing/decentralizing-ai', published: true },
]

const drafts = [
  { name: 'Research loops for curious machines', date: 'Draft', description: 'Notes on evidence search, critique, and agents that can change their mind.' },
  { name: 'Markets as an interface', date: 'Draft', description: 'Prediction markets, information, and software that sharpens judgment.' },
]

export default function BlogList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const cached = getLocalStorage()
        const parsed = JSON.parse(cached || '{}')
        let next: Post[]
        if (!cached || parsed.date !== new Date().toISOString().split('T')[0]) {
          const response = await fetch('/api/blogs')
          next = await response.json()
          next = Array.isArray(next) ? [...next].reverse() : []
          setLocalStorage(next)
        } else next = parsed.array || []
        setPosts(next)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <section className="simple-writing-list"><div className="simple-writing-row writing-skeleton" /><div className="simple-writing-row writing-skeleton" /></section>

  const localNames = new Set(localWriting.map((post) => post.name))
  const remotePosts = posts.filter((post) => !localNames.has(post.name))
  const published = [...localWriting, ...remotePosts]

  return (
    <section className="simple-writing-list" aria-label="Writing archive">
      {published.map((post, index) => (
        <motion.article key={'href' in post ? post.href : post.id} className="simple-writing-row" initial={{ opacity: 0, transform: 'translateY(10px)' }} animate={{ opacity: 1, transform: 'translateY(0)' }} transition={{ delay: index * .045 }}>
          <Link href={'href' in post ? post.href : `/${post.name}?id=${post.id}`}>
            <div><small>Essay / {String(index + 1).padStart(2, '0')}</small><h2>{post.name}</h2><p>{post.description || 'A note from the ongoing archive.'}</p></div>
            <div><time>{post.date}</time><span>↗</span></div>
          </Link>
        </motion.article>
      ))}
      {drafts.map((draft, index) => <article className="simple-writing-row is-draft" key={draft.name}><div><div><small>Writing / {String(published.length + index + 1).padStart(2, '0')}</small><h2>{draft.name}</h2><p>{draft.description}</p></div><div><time>{draft.date}</time></div></div></article>)}
    </section>
  )
}
