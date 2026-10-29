import { parseRepeatAttribute, repeatPresses, RepeatMode } from '@core/repeat'

function getPlayerBar(): HTMLElement | null {
  return document.querySelector('ytmusic-player-bar')
}

// A narrow window hides this button and shows a copy in the bar's overflow
// menu instead. Both stay in the DOM and in sync, and a hidden button still
// takes clicks, so this one works at any width.
function getRepeatButton(): HTMLElement | null {
  return document.querySelector('ytmusic-player-bar .right-controls-buttons .repeat')
}

// Null when there is no button to change the mode with, as on a page that
// has not rendered the player bar yet.
function readRepeatMode(): RepeatMode | null {
  if (!getRepeatButton()) return null
  return parseRepeatAttribute(getPlayerBar()?.getAttribute('repeat-mode') ?? null)
}

// Calls `onChange` with the page's repeat mode whenever it changes. The DOM
// is shared with the page, so this runs in the preload's own world.
export function watchRepeatMode(onChange: (mode: RepeatMode | null) => void): void {
  let mode: RepeatMode | null = null
  const update = (): void => {
    const next = readRepeatMode()
    if (next === mode) return
    mode = next
    onChange(mode)
  }

  document.addEventListener('DOMContentLoaded', () => {
    update()
    // The player bar is added after the page loads, and sets `repeat-mode`
    // on itself whenever the mode changes.
    new MutationObserver(update).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['repeat-mode']
    })
  })
}

// Presses the page's own button rather than setting the mode some other
// way, so YouTube Music does everything it would do for a click.
export function setRepeatMode(mode: RepeatMode): void {
  const current = readRepeatMode()
  const button = getRepeatButton()
  if (!current || !button) return
  for (let presses = repeatPresses(current, mode); presses > 0; presses--) button.click()
}
