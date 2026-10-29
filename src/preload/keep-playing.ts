// The renderer stays in the page once the dialog closes, so only a visible
// one counts.
function getConfirmButton(): HTMLElement | null {
  const renderer = document.querySelector<HTMLElement>('ytmusic-you-there-renderer')
  if (!renderer?.checkVisibility()) return null
  return renderer.querySelector('button')
}

// For when the page asks "Continue watching?" in spite of the activity
// keeper, for example after renaming `_lact`: answer it, which also resumes
// playback. The DOM is shared with the page, so this runs in the preload's
// own world.
export function startYouThereFallback(): void {
  const update = (): void => getConfirmButton()?.click()

  document.addEventListener('DOMContentLoaded', () => {
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
