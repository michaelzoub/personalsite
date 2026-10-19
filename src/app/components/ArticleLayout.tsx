import type { ReactNode } from 'react'
import Link from 'next/link'
import { LuArrowUpRight } from 'react-icons/lu'
import { BrandMark } from './BrandMark'
import ArticleSectionNav, { type ArticleSection } from './ArticleSectionNav'
import { ProjectGlyph } from './ProjectGlyph'
import { formatDate } from '../utils/formatDate'

type ArticleLayoutProps = {
  glyph: string
  title: string
  date: string
  deck: string
  sections: ArticleSection[]
  source: { label: string; href: string }
  children: ReactNode
}

// Essays reuse the landing's grammar: the name in the same spot, a label column
// on the left (here the section index), and the entry's title row with its glyph.
export default function ArticleLayout({ glyph, title, date, deck, sections, source, children }: ArticleLayoutProps) {
  return (
    <main className="editorial article">
      <header className="lede article-lede">
        <BrandMark />
        <Link href="/" className="article-home" aria-label="Michael Zoubkoff, back home" data-sound="none">Michael Zoubkoff</Link>
      </header>

      <div className="article-layout">
        <ArticleSectionNav sections={sections} />
        <article className="article-body">
          <header className="article-head" id={sections[0]?.id}>
            <div>
              <h1>{title}</h1>
              <p><time dateTime={date}>{formatDate(date)}</time></p>
            </div>
            <ProjectGlyph id={glyph} />
          </header>
          <p className="article-deck">{deck}</p>
          {children}
          <footer>
            <a href={source.href} target="_blank" rel="noreferrer" data-sound="none">
              <span>{source.label}</span> <LuArrowUpRight aria-hidden />
            </a>
          </footer>
        </article>
      </div>
    </main>
  )
}
