const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

// ISO date (YYYY-MM-DD) → "14 June 2026", the one date format used across the site.
export const formatDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number)
  return `${day} ${months[month - 1]} ${year}`
}
