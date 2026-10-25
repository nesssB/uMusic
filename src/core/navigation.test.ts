import { describe, expect, it } from 'vitest'
import { getNavigationTarget } from './navigation'

const target = (url: string): string => getNavigationTarget(new URL(url))

describe('getNavigationTarget', () => {
  it('keeps YouTube Music in the app', () => {
    expect(target('https://music.youtube.com/')).toBe('app')
    expect(target('https://music.youtube.com/watch?v=abc')).toBe('app')
  })

  it('keeps the Google sign-in and consent pages in the app', () => {
    expect(target('https://accounts.google.com/ServiceLogin?service=youtube')).toBe('app')
    expect(target('https://accounts.youtube.com/accounts/SetSID')).toBe('app')
    expect(target('https://consent.google.com/ml')).toBe('app')
    expect(target('https://consent.youtube.com/m')).toBe('app')
  })

  it('keeps the www.youtube.com sign-in and sign-out steps in the app', () => {
    expect(target('https://www.youtube.com/signin?action_handle_signin=true')).toBe('app')
    expect(target('https://www.youtube.com/logout')).toBe('app')
  })

  it('opens the rest of YouTube in the browser', () => {
    expect(target('https://www.youtube.com/watch?v=abc')).toBe('browser')
    expect(target('https://www.youtube.com/')).toBe('browser')
  })

  it('opens other websites in the browser', () => {
    expect(target('https://example.com/')).toBe('browser')
    expect(target('https://support.google.com/youtubemusic')).toBe('browser')
  })

  it('does not trust look-alike hosts', () => {
    expect(target('https://music.youtube.com.example.com/')).toBe('browser')
    expect(target('https://evilmusic.youtube.com.example.com/')).toBe('browser')
  })

  it('opens plain http in the browser, even for YouTube Music', () => {
    expect(target('http://music.youtube.com/')).toBe('browser')
  })

  it('blocks anything that is not http or https', () => {
    expect(target('file:///etc/passwd')).toBe('blocked')
    expect(target('javascript:alert(1)')).toBe('blocked')
    expect(target('mailto:someone@example.com')).toBe('blocked')
  })
})
