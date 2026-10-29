import { contextBridge } from 'electron'
import {
  ACTIVITY_REFRESH_INTERVAL,
  createYouThereFallback,
  shouldRefreshActivity,
  YouTherePage
} from '@core/keep-playing'

// `_lact` lives in the page's world. These are sent there as source, so they
// must not use anything from outside their own body.
function readLastActivity(): unknown {
  return (globalThis as { _lact?: unknown })._lact
}

function writeLastActivity(time: number): void {
  ;(globalThis as { _lact?: unknown })._lact = time
}

function refreshActivity(): void {
  const now = Date.now()
  if (shouldRefreshActivity(contextBridge.executeInMainWorld({ func: readLastActivity }), now)) {
    contextBridge.executeInMainWorld({ func: writeLastActivity, args: [now] })
  }
}

function getVideo(): HTMLVideoElement | null {
  return document.querySelector('#movie_player video')
}

// The renderer stays in the page once the dialog closes, so only a visible
// one counts.
function getDialog(): HTMLElement | null {
  const renderer = document.querySelector<HTMLElement>('ytmusic-you-there-renderer')
  return renderer?.checkVisibility() ? renderer : null
}

// Elements are looked up on every call, as the page may replace them.
const domPage: YouTherePage = {
  isDialogShowing: () => getDialog() !== null,
  confirm: () => getDialog()?.querySelector<HTMLElement>('button')?.click(),
  isPaused: () => getVideo()?.paused ?? false,
  // play() does nothing to a video that is already playing, unlike the
  // player bar's button, which would pause it.
  play: () => {
    getVideo()
      ?.play()
      .catch((error) => console.error('Could not resume playback:', error))
  }
}

// Keeps the page from pausing to ask whether the user is still there, and
// answers the question if it is asked anyway. The DOM is shared with the
// page, so this runs in the preload's own world.
export function startKeepPlaying(): void {
  setInterval(refreshActivity, ACTIVITY_REFRESH_INTERVAL)

  const update = createYouThereFallback(domPage)
  document.addEventListener('DOMContentLoaded', () => {
    refreshActivity()
    // The dialog is added to the page the first time it is needed, and
    // shown again later by changing its style.
    new MutationObserver(update).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['style', 'aria-hidden']
    })
  })
}
