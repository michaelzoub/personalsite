import { ImageResponse } from 'next/og'
import { palette } from './data/palette'

// Link preview card: the logo, the name, the two-line statement and the domain,
// set like the landing's lede on the site's paper.
export const alt = 'Michael Zoubkoff — I research and build agents.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const NAME = 'Michael Zoubkoff'
const LINES = ['I research and build agents.', 'Experimenting with new ways of building software.']
const DOMAIN = 'zoubkoff.com'

// Satori can't read woff2; an unrecognized user agent makes Google Fonts serve TTF.
async function inter(weight: number, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(text)}`)).text()
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
    if (!url) return null
    return { name: 'Inter', data: await (await fetch(url)).arrayBuffer(), weight: weight as 400 | 500, style: 'normal' as const }
  } catch {
    return null
  }
}

export default async function OpengraphImage() {
  const text = [NAME, ...LINES, DOMAIN].join('')
  const fonts = (await Promise.all([inter(400, text), inter(500, text)])).filter((font) => font !== null)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '78px 74px 74px',
          background: '#fafcff',
          fontFamily: fonts.length ? 'Inter' : 'sans-serif',
          letterSpacing: '-0.01em',
        }}
      >
        <div style={{ display: 'flex' }}>
          {palette.map((color) => (
            <div key={color.name} style={{ width: 16, height: 52, background: color.base }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          <div style={{ fontSize: 44, fontWeight: 500, color: '#1a2331' }}>{NAME}</div>
          {LINES.map((line, i) => (
            <div key={line} style={{ marginTop: i ? 10 : 22, fontSize: 38, color: '#5c6774' }}>{line}</div>
          ))}
        </div>
        <div style={{ marginTop: 92, fontSize: 36, color: '#5c6774' }}>{DOMAIN}</div>
      </div>
    ),
    { ...size, fonts },
  )
}
