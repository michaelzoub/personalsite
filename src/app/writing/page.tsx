import type { Metadata } from 'next'
import BlogList from '../components/blogs/page'

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Essays by Michael Zoubkoff.',
}

export default function WritingPage() {
  return (
    <main className="simple-writing-page">
      <header className="simple-writing-intro">
        <div>
          <p>Essays & notes</p>
          <h1>Writing</h1>
          <span>Notes on agents, markets, intelligence, and the systems around them.</span>
        </div>
      </header>
      <BlogList />
    </main>
  )
}
