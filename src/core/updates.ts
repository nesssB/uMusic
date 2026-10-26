const RELEASES_URL = 'https://github.com/nesssB/uMusic/releases'

interface Version {
  numbers: number[]
  prerelease: string[]
}

// major.minor.patch, an optional -prerelease and an optional +build, which
// takes no part in the order. Release tags carry a leading "v".
const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/

function parseVersion(version: string): Version | null {
  const match = VERSION_PATTERN.exec(version)
  if (!match) return null
  const [, major, minor, patch, prerelease] = match
  return {
    numbers: [major, minor, patch].map(Number),
    prerelease: prerelease ? prerelease.split('.') : []
  }
}

// Numeric identifiers compare as numbers and sort before alphanumeric ones.
function compareIdentifiers(a: string, b: string): number {
  const aNumeric = /^\d+$/.test(a)
  const bNumeric = /^\d+$/.test(b)
  if (aNumeric && bNumeric) return Math.sign(Number(a) - Number(b))
  if (aNumeric) return -1
  if (bNumeric) return 1
  return a < b ? -1 : a > b ? 1 : 0
}

// Orders two versions by semver precedence: -1, 0 or 1, as a sort comparator
// would. Returns null when either one is not a valid version.
export function compareVersions(a: string, b: string): number | null {
  const left = parseVersion(a)
  const right = parseVersion(b)
  if (!left || !right) return null

  for (let i = 0; i < 3; i++) {
    const diff = Math.sign(left.numbers[i] - right.numbers[i])
    if (diff !== 0) return diff
  }

  // A pre-release comes before its release: 1.0.0-beta < 1.0.0.
  if (!left.prerelease.length || !right.prerelease.length) {
    return Math.sign(right.prerelease.length - left.prerelease.length)
  }
  const length = Math.max(left.prerelease.length, right.prerelease.length)
  for (let i = 0; i < length; i++) {
    // A shorter list of identifiers comes first when the rest are equal.
    if (i >= left.prerelease.length) return -1
    if (i >= right.prerelease.length) return 1
    const diff = compareIdentifiers(left.prerelease[i], right.prerelease[i])
    if (diff !== 0) return diff
  }
  return 0
}

export function isNewerVersion(candidate: string, current: string): boolean {
  return compareVersions(candidate, current) === 1
}

export function releasePageUrl(version: string): string {
  return `${RELEASES_URL}/tag/v${encodeURIComponent(version)}`
}
