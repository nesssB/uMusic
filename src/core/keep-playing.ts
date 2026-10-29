// The page keeps the time of the user's last click or key press in
// `window._lact`. When too long has passed since then, it pauses and asks
// "Video paused. Continue watching?". Moving `_lact` forward every so often
// keeps that from happening, while it stays a plain value the page and the
// console can still set.
export const ACTIVITY_REFRESH_INTERVAL = 60 * 1000

// Passed to the YT Music window's preload when the feature is on. The
// preload cannot read the settings itself.
export const KEEP_PLAYING_ARG = '--umusic-keep-playing'

// True when `lastActivity` is missing, not a time or at least `maxAge` old.
// A recent time is left alone, so a real click still counts as one.
export function shouldRefreshActivity(
  lastActivity: unknown,
  now: number,
  maxAge = ACTIVITY_REFRESH_INTERVAL
): boolean {
  if (typeof lastActivity !== 'number' || !Number.isFinite(lastActivity)) return true
  return now - lastActivity >= maxAge
}

// What the fallback needs from the page. The preload implements it on top
// of the page's DOM; tests use a fake.
export interface YouTherePage {
  isDialogShowing(): boolean
  confirm(): void
  isPaused(): boolean
  play(): void
}

// For when the page asks "Continue watching?" anyway: press the dialog's
// button once, and when the dialog is gone, start the track again if it is
// still paused. The dialog only shows up after the page paused playback
// itself, so resuming never overrides a pause by the user.
//
// Returns the function to call whenever the page may have changed.
export function createYouThereFallback(page: YouTherePage): () => void {
  // Set from the press until the dialog has closed.
  let answered = false

  return () => {
    if (page.isDialogShowing()) {
      if (answered) return
      answered = true
      page.confirm()
      return
    }
    if (!answered) return
    answered = false
    if (page.isPaused()) page.play()
  }
}
