// The parts of a parsed URL that decide whether a request is an ad. A WHATWG
// URL object fits this shape.
export interface RequestUrl {
  hostname: string
  pathname: string
}

// Hosts that only serve ads and ad tracking. Their subdomains are blocked too.
const AD_DOMAINS = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'googletagservices.com',
  'adservice.google.com',
  'imasdk.googleapis.com'
]

// Hosts that serve ads alongside the content YouTube Music needs, so only
// their ad paths are blocked. Video ads stream from the same servers as the
// music, so they cannot be told apart at this level.
const AD_PATHS: ReadonlyArray<[domain: string, paths: string[]]> = [
  ['youtube.com', ['/api/stats/ads', '/pagead', '/ptracking', '/get_midroll_info']],
  ['google.com', ['/pagead']]
]

function isOnDomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`)
}

function isUnderPath(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`)
}

export function isAdRequest(url: RequestUrl): boolean {
  if (AD_DOMAINS.some((domain) => isOnDomain(url.hostname, domain))) return true

  return AD_PATHS.some(
    ([domain, paths]) =>
      isOnDomain(url.hostname, domain) && paths.some((path) => isUnderPath(url.pathname, path))
  )
}
