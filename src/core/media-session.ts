import type { MediaTrack } from './media'

type ActionHandler = ((details: { action: string }) => void) | null

interface MediaSessionLike {
  setActionHandler: (action: string, handler: ActionHandler) => void
  metadata: { title?: unknown; artist?: unknown } | null
}

// The globals the bridge patches. In the page this is `window`; tests pass a
// stand-in so the real globals stay untouched.
export interface MediaSessionScope {
  navigator: { mediaSession: MediaSessionLike }
}

export interface MediaSessionBridge {
  // Returns false when the page has no handler for the action.
  runAction: (action: string) => boolean
}

// YouTube Music already drives the OS media controls through the Media
// Session API. The bridge keeps the handlers it registers and reports the
// metadata it sets, so the app's own controls behave exactly the same.
//
// The preload sends this function's source to the page, so it must not use
// anything from outside its own body: no imports, no module constants.
export function installMediaSessionBridge(
  onTrack: (track: MediaTrack | null) => void,
  scope: MediaSessionScope = globalThis as unknown as MediaSessionScope
): MediaSessionBridge {
  const session = scope.navigator.mediaSession
  const proto = Object.getPrototypeOf(session) as MediaSessionLike
  const handlers = new Map<string, NonNullable<ActionHandler>>()

  const setActionHandler = proto.setActionHandler
  proto.setActionHandler = function (this: MediaSessionLike, action, handler) {
    if (handler) handlers.set(action, handler)
    else handlers.delete(action)
    return setActionHandler.call(this, action, handler)
  }

  const metadata = Object.getOwnPropertyDescriptor(proto, 'metadata')
  if (metadata?.get && metadata.set) {
    const { get, set } = metadata
    Object.defineProperty(proto, 'metadata', {
      configurable: true,
      enumerable: metadata.enumerable,
      get,
      set(this: MediaSessionLike, value: MediaSessionLike['metadata']) {
        set.call(this, value)
        onTrack(
          value ? { title: String(value.title ?? ''), artist: String(value.artist ?? '') } : null
        )
      }
    })
  }

  return {
    runAction: (action) => {
      const handler = handlers.get(action)
      if (!handler) return false
      handler({ action })
      return true
    }
  }
}
