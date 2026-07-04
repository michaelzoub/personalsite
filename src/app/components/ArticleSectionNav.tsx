'use client'

import { useEffect, useState } from 'react'

export type ArticleSection = { id: string; label: string }

export default function ArticleSectionNav({ sections }: { sections: ArticleSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const marker = window.scrollY + window.innerHeight * .34
      let current = sections[0]?.id ?? ''
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element && element.offsetTop <= marker) current = section.id
      }
      setActive(current)
    }
    const queue = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [sections])

  return <nav className="article-section-nav" aria-label="Article sections">
    <ol>
      {sections.map((section) => <li key={section.id} className={active === section.id ? 'is-active' : ''}>
        <a href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined}>
          <span>{section.label}</span><i />
        </a>
      </li>)}
    </ol>
  </nav>
}
