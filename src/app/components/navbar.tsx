import Link from 'next/link'

export function Navbar() {
  return (
    <header className="minimal-nav">
      <Link href="/" className="minimal-mark">MZ<span>·</span></Link>
      <nav><Link href="/">Work</Link><Link href="/components/blogpage">Writing</Link><Link href="/music">Music</Link></nav>
    </header>
  )
}
