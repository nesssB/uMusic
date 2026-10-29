import { parseLikeAttribute } from '@core/like'

function getLikeRenderer(): HTMLElement | null {
  return document.querySelector('ytmusic-player-bar ytmusic-like-button-renderer')
}

// Like the repeat button, a narrow window hides this one but it still takes
// clicks.
function getLikeButton(): HTMLElement | null {
  return document.querySelector(
    'ytmusic-player-bar ytmusic-like-button-renderer #button-shape-like button'
  )
}

// Null when there is no button to like the track with, as with nothing
// playing or during an ad.
function readLiked(): boolean | null {
  if (!getLikeButton()) return null
  return parseLikeAttribute(getLikeRenderer()?.getAttribute('like-status') ?? null)
}

// Calls `onChange` with whether the page's current track is liked whenever
// that changes. The DOM is shared with the page, so this runs in the
// preload's own world.
export function watchLiked(onChange: (liked: boolean | null) => void): void {
  let liked: boolean | null = null
  const update = (): void => {
    const next = readLiked()
    if (next === liked) return
    liked = next
    onChange(liked)
  }

  document.addEventListener('DOMContentLoaded', () => {
    update()
    // The renderer sets `like-status` on itself when the track is rated, and
    // again when the next track starts.
    new MutationObserver(update).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['like-status']
    })
  })
}

// Presses the page's own button, which likes the track, or takes the like
// back when it is already liked. A press is only made when it gets to
// `liked`, so a request that arrives late does nothing.
export function setLiked(liked: boolean): void {
  const current = readLiked()
  const button = getLikeButton()
  if (current === null || !button || current === liked) return
  button.click()
}
