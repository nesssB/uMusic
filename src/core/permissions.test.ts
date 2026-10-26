import { describe, expect, it } from 'vitest'
import { isPermissionAllowed } from './permissions'

const allowed = (permission: string, url: string): boolean =>
  isPermissionAllowed(permission, new URL(url))

describe('isPermissionAllowed', () => {
  it('lets YouTube Music go fullscreen and copy links', () => {
    expect(allowed('fullscreen', 'https://music.youtube.com')).toBe(true)
    expect(allowed('clipboard-sanitized-write', 'https://music.youtube.com/watch?v=abc')).toBe(true)
  })

  it('denies everything else to YouTube Music', () => {
    expect(allowed('media', 'https://music.youtube.com')).toBe(false)
    expect(allowed('notifications', 'https://music.youtube.com')).toBe(false)
    expect(allowed('geolocation', 'https://music.youtube.com')).toBe(false)
    expect(allowed('clipboard-read', 'https://music.youtube.com')).toBe(false)
    expect(allowed('openExternal', 'https://music.youtube.com')).toBe(false)
  })

  it('denies other origins, even the ones allowed to load in the app', () => {
    expect(allowed('fullscreen', 'https://accounts.google.com')).toBe(false)
    expect(allowed('fullscreen', 'https://www.youtube.com')).toBe(false)
    expect(allowed('fullscreen', 'https://music.youtube.com.example.com')).toBe(false)
  })

  it('denies plain http', () => {
    expect(allowed('fullscreen', 'http://music.youtube.com')).toBe(false)
  })
})
