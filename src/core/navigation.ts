export type NavigationTarget = 'app' | 'browser' | 'blocked'

// The parts of a parsed URL that decide where it opens. A WHATWG URL object
// fits this shape.
export interface NavigationUrl {
  protocol: string
  hostname: string
  pathname: string
}

const IN_APP_HOSTS = new Set([
  'music.youtube.com',
  'accounts.google.com',
  'accounts.youtube.com',
  'consent.google.com',
  'consent.youtube.com'
])

// Signing in and out goes through www.youtube.com before landing back on
// YouTube Music. The rest of www.youtube.com opens in the browser.
const IN_APP_YOUTUBE_PATHS = new Set(['/signin', '/logout'])

export function getNavigationTarget(url: NavigationUrl): NavigationTarget {
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'blocked'
  if (url.protocol !== 'https:') return 'browser'

  if (IN_APP_HOSTS.has(url.hostname)) return 'app'
  if (url.hostname === 'www.youtube.com' && IN_APP_YOUTUBE_PATHS.has(url.pathname)) return 'app'

  return 'browser'
}
