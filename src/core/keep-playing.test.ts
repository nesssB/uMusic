import { describe, expect, it } from 'vitest'
import {
  ACTIVITY_REFRESH_INTERVAL,
  createYouThereFallback,
  shouldRefreshActivity,
  YouTherePage
} from './keep-playing'

describe('shouldRefreshActivity', () => {
  const now = 10 * 60 * 1000

  it('leaves a recent activity time alone', () => {
    expect(shouldRefreshActivity(now, now)).toBe(false)
    expect(shouldRefreshActivity(now - ACTIVITY_REFRESH_INTERVAL + 1, now)).toBe(false)
  })

  it('refreshes an activity time that is at least the maximum age', () => {
    expect(shouldRefreshActivity(now - ACTIVITY_REFRESH_INTERVAL, now)).toBe(true)
    expect(shouldRefreshActivity(now - 2 * 60 * 60 * 1000, now)).toBe(true)
    expect(shouldRefreshActivity(0, now)).toBe(true)
  })

  it('takes a different maximum age', () => {
    expect(shouldRefreshActivity(now - 500, now, 1000)).toBe(false)
    expect(shouldRefreshActivity(now - 1000, now, 1000)).toBe(true)
  })

  it('leaves a time from the future alone', () => {
    expect(shouldRefreshActivity(now + 5000, now)).toBe(false)
  })

  it.each([
    ['missing', undefined],
    ['null', null],
    ['a string', '1000'],
    ['NaN', NaN],
    ['infinite', -Infinity]
  ])('refreshes an activity time that is %s', (_, value) => {
    expect(shouldRefreshActivity(value, now)).toBe(true)
  })
})

function createPage(): YouTherePage & { dialogShowing: boolean; paused: boolean; log: string[] } {
  return {
    dialogShowing: false,
    paused: false,
    log: [],
    isDialogShowing() {
      return this.dialogShowing
    },
    confirm() {
      this.log.push('confirm')
    },
    isPaused() {
      return this.paused
    },
    play() {
      this.log.push('play')
      this.paused = false
    }
  }
}

describe('createYouThereFallback', () => {
  it('does nothing while there is no dialog', () => {
    const page = createPage()
    const update = createYouThereFallback(page)

    update()
    page.paused = true
    update()
    expect(page.log).toEqual([])
  })

  it('presses the button once while the dialog shows', () => {
    const page = createPage()
    const update = createYouThereFallback(page)

    page.dialogShowing = true
    page.paused = true
    update()
    update()
    expect(page.log).toEqual(['confirm'])
  })

  it('resumes playback when the dialog closes with the track still paused', () => {
    const page = createPage()
    const update = createYouThereFallback(page)

    page.dialogShowing = true
    page.paused = true
    update()
    page.dialogShowing = false
    update()
    expect(page.log).toEqual(['confirm', 'play'])
  })

  it('does not touch playback when the page resumed it itself', () => {
    const page = createPage()
    const update = createYouThereFallback(page)

    page.dialogShowing = true
    page.paused = true
    update()
    page.dialogShowing = false
    page.paused = false
    update()
    expect(page.log).toEqual(['confirm'])
  })

  it('leaves a later pause by the user alone', () => {
    const page = createPage()
    const update = createYouThereFallback(page)

    page.dialogShowing = true
    update()
    page.dialogShowing = false
    update()
    page.paused = true
    update()
    expect(page.log).toEqual(['confirm'])
  })

  it('answers the dialog again the next time it shows', () => {
    const page = createPage()
    const update = createYouThereFallback(page)

    for (let i = 0; i < 2; i++) {
      page.dialogShowing = true
      page.paused = true
      update()
      page.dialogShowing = false
      update()
    }
    expect(page.log).toEqual(['confirm', 'play', 'confirm', 'play'])
  })
})
