type IconProps = { className?: string }

export function BuildingIcon({ className }: IconProps) {
  return <span className={`now-icon-shell ${className ?? ''}`} aria-hidden>
    <svg viewBox="0 0 18 18" fill="none">
      <path d="M3.25 14.25V9.4L6.2 7.55l2.75 1.7 2.9-1.8 2.9 1.82v4.98" />
      <path d="M6.2 7.55V4.1h5.65v3.35M2.5 14.25h13M8.95 9.25v5" />
      <circle cx="11.85" cy="4.1" r="1.15" />
    </svg>
  </span>
}

export function ReadingIcon({ className }: IconProps) {
  return <span className={`now-icon-shell ${className ?? ''}`} aria-hidden>
    <svg viewBox="0 0 18 18" fill="none">
      <path d="M3 4.15c2.25-.55 4.2.05 6 1.45v8.15c-1.8-1.4-3.75-2-6-1.45V4.15Z" />
      <path d="M15 4.15c-2.25-.55-4.2.05-6 1.45v8.15c1.8-1.4 3.75-2 6-1.45V4.15Z" />
      <path d="M5 6.35c.75-.03 1.42.12 2 .44M11 6.79c.58-.32 1.25-.47 2-.44" />
    </svg>
  </span>
}

export function RepeatIcon({ className }: IconProps) {
  return <span className={`now-icon-shell now-icon-audio ${className ?? ''}`} aria-hidden>
    <svg viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6" />
      <path d="M5.5 9h1.2M11.3 9h1.2" />
      <path className="now-wave-a" d="M7.5 11V7" />
      <path className="now-wave-b" d="M9 12.25v-6.5" />
      <path className="now-wave-c" d="M10.5 10.5v-3" />
    </svg>
  </span>
}
