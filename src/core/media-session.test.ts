import { describe, expect, it, vi } from 'vitest'
import { installMediaSessionBridge, MediaSessionScope } from './media-session'

type Handler = ((details: { action: string }) => void) | null
type Metadata = MediaSessionScope['navigator']['mediaSession']['metadata']

function createScope(): MediaSessionScope & { registered: Map<string, Handler> } {
  const registered = new Map<string, Handler>()
  // A fresh class per scope, so patching its prototype does not leak.
  class FakeMediaSession {
    #metadata: Metadata = null

    setActionHandler(action: string, handler: Handler): void {
      registered.set(action, handler)
    }

    get metadata(): Metadata {
      return this.#metadata
    }

    set metadata(value: Metadata) {
      this.#metadata = value
    }
  }
  return { navigator: { mediaSession: new FakeMediaSession() }, registered }
}

describe('installMediaSessionBridge', () => {
  it('runs the handler the page registered for an action', () => {
    const scope = createScope()
    const bridge = installMediaSessionBridge(() => {}, scope)
    const handler = vi.fn()

    scope.navigator.mediaSession.setActionHandler('nexttrack', handler)

    expect(bridge.runAction('nexttrack')).toBe(true)
    expect(handler).toHaveBeenCalledWith({ action: 'nexttrack' })
  })

  it('still registers the handlers with the real media session', () => {
    const scope = createScope()
    installMediaSessionBridge(() => {}, scope)
    const handler = vi.fn()

    scope.navigator.mediaSession.setActionHandler('play', handler)

    expect(scope.registered.get('play')).toBe(handler)
  })

  it('reports that an action has no handler', () => {
    const scope = createScope()
    const bridge = installMediaSessionBridge(() => {}, scope)

    expect(bridge.runAction('previoustrack')).toBe(false)
  })

  it('forgets a handler the page removed', () => {
    const scope = createScope()
    const bridge = installMediaSessionBridge(() => {}, scope)
    const handler = vi.fn()

    scope.navigator.mediaSession.setActionHandler('nexttrack', handler)
    scope.navigator.mediaSession.setActionHandler('nexttrack', null)

    expect(bridge.runAction('nexttrack')).toBe(false)
    expect(handler).not.toHaveBeenCalled()
  })

  it('reports the track when the page sets the metadata', () => {
    const scope = createScope()
    const onTrack = vi.fn()
    installMediaSessionBridge(onTrack, scope)

    scope.navigator.mediaSession.metadata = { title: 'Song', artist: 'Band' }

    expect(onTrack).toHaveBeenCalledWith({ title: 'Song', artist: 'Band' })
    expect(scope.navigator.mediaSession.metadata).toEqual({ title: 'Song', artist: 'Band' })
  })

  it('reports no track when the page clears the metadata', () => {
    const scope = createScope()
    const onTrack = vi.fn()
    installMediaSessionBridge(onTrack, scope)

    scope.navigator.mediaSession.metadata = null

    expect(onTrack).toHaveBeenCalledWith(null)
  })

  it('fills in missing metadata fields with empty strings', () => {
    const scope = createScope()
    const onTrack = vi.fn()
    installMediaSessionBridge(onTrack, scope)

    scope.navigator.mediaSession.metadata = { title: 'Song' }

    expect(onTrack).toHaveBeenCalledWith({ title: 'Song', artist: '' })
  })
})
