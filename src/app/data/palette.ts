// The site's five-color identity: rich primaries for the logo, each paired with
// a hover wash. Washes are the spec tints (#F4E5E0, #F7EBDD, #F6F0DE, #F6ECDD,
// #F2E9DC) mixed 62% of the way to white, so they stay as quiet as possible.
export const palette = [
  { name: 'red', base: '#B74E2D', tint: '#FBF5F3' },
  { name: 'orange', base: '#CC6A2F', tint: '#FCF7F2' },
  { name: 'yellow', base: '#C9971A', tint: '#FCF9F2' },
  { name: 'amber', base: '#D4842F', tint: '#FCF8F2' },
  { name: 'ochre', base: '#9F6A1C', tint: '#FAF7F2' },
] as const

// FNV-1a: small, stable across reloads and runtimes.
function hash(key: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 0x01000193)
  return h >>> 0
}

// Shuffle bag: each id draws a color from the ones still left, picked by its
// hash, so no color repeats until all five are used; then the bag refills.
// The first draw after a refill skips the color the row above just used.
export function assignTints(ids: string[]) {
  const tints: Record<string, string> = {}
  let bag: number[] = []
  let previous = -1
  for (const id of ids) {
    if (!bag.length) bag = palette.map((_, i) => i)
    let pick = hash(id) % bag.length
    if (bag[pick] === previous) pick = (pick + 1) % bag.length
    const [index] = bag.splice(pick, 1)
    tints[id] = palette[index].tint
    previous = index
  }
  return tints
}
