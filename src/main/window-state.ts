import { screen, BrowserWindow } from 'electron'
import { fitWindowBounds, InitialBounds } from '@core/window-state'
import { SettingsStore } from './settings'

// Moving or resizing emits an event for every step of the drag.
const SAVE_DELAY_MS = 500

// The saved bounds, fitted to the screens connected now. The screen API is
// only there once the app is ready.
export function initialWindowBounds(settings: SettingsStore): InitialBounds {
  return fitWindowBounds(
    settings.get('window'),
    screen.getAllDisplays().map((display) => display.workArea),
    screen.getPrimaryDisplay().workArea
  )
}

// Saves the bounds the window has when it is neither maximized nor minimized,
// so it is restored to them, and maximized again if it was.
export function trackWindowState(window: BrowserWindow, settings: SettingsStore): void {
  let timer: NodeJS.Timeout | undefined

  const save = (): void => {
    clearTimeout(timer)
    timer = undefined
    // Full screen, as a video enters it, and minimized are not restored.
    // The state saved before them is kept instead.
    if (window.isFullScreen() || window.isMinimized()) return
    const { x, y, width, height } = window.getNormalBounds()
    settings.set('window', { x, y, width, height, maximized: window.isMaximized() })
  }

  const saveSoon = (): void => {
    clearTimeout(timer)
    timer = setTimeout(save, SAVE_DELAY_MS)
  }

  window.on('move', saveSoon)
  window.on('resize', saveSoon)
  window.on('maximize', save)
  window.on('unmaximize', save)
  // Emitted both when the window hides to the tray and when the app quits,
  // while the window can still be read.
  window.on('close', save)
}
