'use client'

import BlogList from '../blogs/page'

export default function Blogpage() {
  return (
    <main className="simple-writing-page">
      <aside className="simple-writing-intro">
        <div><p>Writing</p><h1>Notes, ideas, and things I&apos;m still figuring out.</h1><span>Software, markets, research, and the occasional beautiful detour.</span></div>
      </aside>
      <BlogList />
    </main>
  )
}
