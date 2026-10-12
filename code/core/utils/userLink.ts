/**
 * The login from a link to a PastVu profile: `/u/<login>`, with or without the site's host and
 * with any section after it (`/u/<login>/photo`). Returns null for every other link.
 */
export const userLoginFromLink = (href: string): string | null => {
  const match = href.match(/^(?:https?:\/\/(?:www\.)?pastvu\.com)?\/u\/([^/?#\s]+)/i)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}
