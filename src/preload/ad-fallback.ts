import { AdPlayer, createAdFallback } from '@core/ad-fallback'

// YouTube has renamed the skip button a few times. Older names are kept in
// case a region still gets them.
const SKIP_BUTTON_SELECTOR = [
  '.ytp-skip-ad-button',
  '.ytp-ad-skip-button-modern',
  '.ytp-ad-skip-button'
].join(', ')

function getPlayer(): HTMLElement | null {
  return document.querySelector('#movie_player')
}

function getVideo(): HTMLVideoElement | null {
  return document.querySelector('#movie_player video')
}

// Elements are looked up on every call, as the page may replace them.
const domPlayer: AdPlayer = {
  isAdShowing: () => getPlayer()?.classList.contains('ad-showing') ?? false,
  isMuted: () => getVideo()?.muted ?? false,
  setMuted: (muted) => {
    const video = getVideo()
    if (video) video.muted = muted
  },
  clickSkipButton: () => {
    document.querySelector<HTMLElement>(SKIP_BUTTON_SELECTOR)?.click()
  },
  skipToEnd: () => {
    const video = getVideo()
    // The duration is NaN until the ad has loaded. The `loadedmetadata`
    // listener below tries again then.
    if (video && Number.isFinite(video.duration) && video.currentTime < video.duration) {
      video.currentTime = video.duration
    }
  }
}

// The DOM is shared with the page, so this runs in the preload's own world.
export function startAdFallback(): void {
  const update = createAdFallback(domPlayer)

  document.addEventListener('DOMContentLoaded', () => {
    // The player toggles `ad-showing` on itself, and the skip button shows up
    // a few seconds into the ad.
    new MutationObserver(update).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class']
    })
  })

  // Media events do not bubble, so listen while they go down to the video.
  document.addEventListener('loadedmetadata', update, true)
}
