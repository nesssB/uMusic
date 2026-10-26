import { describe, expect, it } from 'vitest'
import { isAdRequest } from './adblock'

const blocked = (url: string): boolean => isAdRequest(new URL(url))

describe('isAdRequest', () => {
  it('blocks ad hosts and their subdomains', () => {
    expect(blocked('https://doubleclick.net/')).toBe(true)
    expect(blocked('https://googleads.g.doubleclick.net/pagead/id')).toBe(true)
    expect(blocked('https://static.doubleclick.net/instream/ad_status.js')).toBe(true)
    expect(blocked('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')).toBe(true)
    expect(blocked('https://www.googleadservices.com/pagead/conversion/123')).toBe(true)
    expect(blocked('https://www.googletagservices.com/tag/js/gpt.js')).toBe(true)
    expect(blocked('https://adservice.google.com/ddm/fls/z/')).toBe(true)
    expect(blocked('https://imasdk.googleapis.com/js/sdkloader/ima3.js')).toBe(true)
  })

  it('blocks the YouTube ad and ad-tracking endpoints', () => {
    expect(blocked('https://www.youtube.com/api/stats/ads?ver=2&ad_v=1')).toBe(true)
    expect(blocked('https://music.youtube.com/api/stats/ads?ver=2')).toBe(true)
    expect(blocked('https://www.youtube.com/pagead/viewthroughconversion/123/')).toBe(true)
    expect(blocked('https://www.youtube.com/pagead/adview?ai=abc')).toBe(true)
    expect(blocked('https://www.youtube.com/ptracking?ptk=youtube_none')).toBe(true)
    expect(blocked('https://www.youtube.com/get_midroll_info?ei=abc')).toBe(true)
    expect(blocked('https://www.google.com/pagead/1p-user-list/123/')).toBe(true)
  })

  it('lets YouTube Music and its playback through', () => {
    expect(blocked('https://music.youtube.com/')).toBe(false)
    expect(blocked('https://music.youtube.com/youtubei/v1/player?prettyPrint=false')).toBe(false)
    expect(blocked('https://music.youtube.com/youtubei/v1/next')).toBe(false)
    expect(blocked('https://www.youtube.com/api/stats/watchtime?ns=yt')).toBe(false)
    expect(blocked('https://www.youtube.com/api/stats/playback?ns=yt')).toBe(false)
    expect(blocked('https://rr1---sn-abc.googlevideo.com/videoplayback?id=abc')).toBe(false)
    expect(blocked('https://i.ytimg.com/vi/abc/hqdefault.jpg')).toBe(false)
    expect(blocked('https://lh3.googleusercontent.com/abc=w120-h120')).toBe(false)
  })

  it('lets the sign-in pages through', () => {
    expect(blocked('https://accounts.google.com/ServiceLogin?service=youtube')).toBe(false)
    expect(blocked('https://www.youtube.com/signin?action_handle_signin=true')).toBe(false)
  })

  it('only blocks whole path segments', () => {
    expect(blocked('https://www.youtube.com/pageadvice')).toBe(false)
    expect(blocked('https://www.youtube.com/api/stats/adsense-is-not-an-ad-path')).toBe(false)
  })

  it('does not trust look-alike hosts', () => {
    expect(blocked('https://notdoubleclick.net/')).toBe(false)
    expect(blocked('https://doubleclick.net.example.com/')).toBe(false)
    expect(blocked('https://example.com/pagead/adview')).toBe(false)
    expect(blocked('https://notyoutube.com/api/stats/ads')).toBe(false)
  })
})
