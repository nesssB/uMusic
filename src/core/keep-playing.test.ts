import { afterEach, describe, expect, it, vi } from 'vitest'
import { ActivityScope, installActivityKeeper } from './keep-playing'

describe('installActivityKeeper', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('reports the current time as the last activity', () => {
    vi.useFakeTimers({ now: 1_000 })
    const scope: ActivityScope = {}
    installActivityKeeper(scope)

    expect(scope._lact).toBe(1_000)
    vi.advanceTimersByTime(2 * 60 * 60 * 1000)
    expect(scope._lact).toBe(1_000 + 2 * 60 * 60 * 1000)
  })

  it('replaces a last activity time the page already set', () => {
    vi.useFakeTimers({ now: 5_000 })
    const scope: ActivityScope = { _lact: 1 }
    installActivityKeeper(scope)

    expect(scope._lact).toBe(5_000)
  })

  it('ignores the times the page sets later', () => {
    vi.useFakeTimers({ now: 5_000 })
    const scope: ActivityScope = {}
    installActivityKeeper(scope)

    scope._lact = 1
    expect(scope._lact).toBe(5_000)
  })

  it('lets the page redefine the property without throwing', () => {
    const scope: ActivityScope = {}
    installActivityKeeper(scope)

    expect(() => Object.defineProperty(scope, '_lact', { value: 1 })).not.toThrow()
  })
})
