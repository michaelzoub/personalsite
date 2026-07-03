import Link from 'next/link'
import { DotmTriangle9 } from '@/components/ui/dotm-triangle-9'

export function Navbar() {
  return (
    <header className="minimal-nav">
      <Link href="/" className="minimal-mark" aria-label="Home">
        <DotmTriangle9 size={30} dotSize={4} bloom color="var(--accent)" ariaLabel="" />
      </Link>
    </header>
  )
}
