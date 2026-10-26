import { describe, expect, it } from 'vitest'
import { compareVersions, isNewerVersion, releasePageUrl } from './updates'

describe('compareVersions', () => {
  it('orders by major, then minor, then patch', () => {
    expect(compareVersions('1.0.0', '0.9.9')).toBe(1)
    expect(compareVersions('0.2.0', '0.1.9')).toBe(1)
    expect(compareVersions('0.1.1', '0.1.0')).toBe(1)
    expect(compareVersions('0.1.0', '0.1.1')).toBe(-1)
    expect(compareVersions('0.1.0', '0.1.0')).toBe(0)
  })

  it('compares the numbers as numbers, not as text', () => {
    expect(compareVersions('0.10.0', '0.9.0')).toBe(1)
    expect(compareVersions('0.1.10', '0.1.2')).toBe(1)
  })

  it('accepts the leading v of release tags', () => {
    expect(compareVersions('v0.2.0', '0.1.0')).toBe(1)
    expect(compareVersions('v0.1.0', 'v0.1.0')).toBe(0)
  })

  it('puts a pre-release before its release', () => {
    expect(compareVersions('1.0.0-beta', '1.0.0')).toBe(-1)
    expect(compareVersions('1.0.0', '1.0.0-beta')).toBe(1)
    expect(compareVersions('1.0.0-beta', '0.9.0')).toBe(1)
  })

  it('orders pre-releases by semver precedence', () => {
    const ordered = [
      '1.0.0-alpha',
      '1.0.0-alpha.1',
      '1.0.0-alpha.beta',
      '1.0.0-beta',
      '1.0.0-beta.2',
      '1.0.0-beta.11',
      '1.0.0-rc.1',
      '1.0.0'
    ]
    for (let i = 1; i < ordered.length; i++) {
      expect(compareVersions(ordered[i], ordered[i - 1])).toBe(1)
      expect(compareVersions(ordered[i - 1], ordered[i])).toBe(-1)
    }
  })

  it('ignores build metadata', () => {
    expect(compareVersions('1.0.0+build.5', '1.0.0+build.9')).toBe(0)
  })

  it('returns null for anything that is not a version', () => {
    expect(compareVersions('', '1.0.0')).toBeNull()
    expect(compareVersions('1.0', '1.0.0')).toBeNull()
    expect(compareVersions('1.0.0', 'latest')).toBeNull()
    expect(compareVersions('1.0.0.0', '1.0.0')).toBeNull()
  })
})

describe('isNewerVersion', () => {
  it('is true only when the candidate is strictly newer', () => {
    expect(isNewerVersion('0.2.0', '0.1.0')).toBe(true)
    expect(isNewerVersion('0.1.0', '0.1.0')).toBe(false)
    expect(isNewerVersion('0.1.0', '0.2.0')).toBe(false)
  })

  it('is false when either version is invalid', () => {
    expect(isNewerVersion('garbage', '0.1.0')).toBe(false)
    expect(isNewerVersion('0.2.0', 'garbage')).toBe(false)
  })
})

describe('releasePageUrl', () => {
  it('points at the release tagged with the version', () => {
    expect(releasePageUrl('0.2.0')).toBe('https://github.com/nesssB/uMusic/releases/tag/v0.2.0')
  })

  it('keeps the version inside the path', () => {
    expect(releasePageUrl('../../evil')).toBe(
      'https://github.com/nesssB/uMusic/releases/tag/v..%2F..%2Fevil'
    )
  })
})
