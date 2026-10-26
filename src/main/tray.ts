import { app, nativeImage, BrowserWindow, Menu, MenuItemConstructorOptions, Tray } from 'electron'
import { describeTrack } from '@core/media'
import { MediaControls } from './media-controls'
import { Updater } from './updater'
import icon from '../../resources/icon.png?asset'

// Kept at module level so the tray is not garbage collected.
let tray: Tray | undefined

function trayIcon(): Electron.NativeImage {
  // The source icon is 512px. Trays draw it at 16px (macOS) or 16-32px
  // depending on scaling, and some Linux hosts don't downscale it at all.
  const size = process.platform === 'darwin' ? 16 : 32
  return nativeImage.createFromPath(icon).resize({ width: size, height: size })
}

function isShown(window: BrowserWindow): boolean {
  return window.isVisible() && !window.isMinimized()
}

function showWindow(window: BrowserWindow): void {
  if (window.isMinimized()) window.restore()
  window.show()
  window.focus()
}

function toggleWindow(window: BrowserWindow): void {
  if (isShown(window)) window.hide()
  else showWindow(window)
}

// Menus read "&" as the start of an access key, so a title like
// "Simon & Garfunkel" would lose it.
function escapeMenuLabel(label: string): string {
  return label.replaceAll('&', '&&')
}

function mediaMenuItems(media: MediaControls): MenuItemConstructorOptions[] {
  const { track, playing } = media.getState()
  const enabled = track !== null
  return [
    ...(track
      ? [
          { label: escapeMenuLabel(describeTrack(track)), enabled: false },
          { type: 'separator' as const }
        ]
      : []),
    { label: 'Previous', enabled, click: () => media.send('previous') },
    { label: playing ? 'Pause' : 'Play', enabled, click: () => media.send('playpause') },
    { label: 'Next', enabled, click: () => media.send('next') }
  ]
}

function updaterMenuItems(updater: Updater): MenuItemConstructorOptions[] {
  const state = updater.getState()
  if (state.status === 'none') return []
  const label =
    state.status === 'ready'
      ? `Restart to Update (${state.version})`
      : `Download uMusic ${state.version}`
  return [{ label, click: () => updater.apply() }, { type: 'separator' }]
}

export function createTray(window: BrowserWindow, media: MediaControls, updater: Updater): Tray {
  if (tray) return tray

  // Closing the window only hides it, so playback keeps going. The app
  // quits from the tray menu, or when the OS asks it to.
  let quitting = false
  app.on('before-quit', () => {
    quitting = true
  })
  // Windows shuts down without emitting before-quit.
  window.on('session-end', () => {
    quitting = true
  })
  window.on('close', (event) => {
    if (quitting) return
    event.preventDefault()
    window.hide()
  })

  const created = new Tray(trayIcon())

  // Linux trays only pick up menu changes through setContextMenu, so the
  // menu is rebuilt instead of updating the item's label in place.
  const updateMenu = (): void => {
    const { track } = media.getState()
    created.setToolTip(track ? describeTrack(track) : 'uMusic')
    created.setContextMenu(
      Menu.buildFromTemplate([
        ...mediaMenuItems(media),
        { type: 'separator' },
        {
          label: isShown(window) ? 'Hide uMusic' : 'Show uMusic',
          click: () => toggleWindow(window)
        },
        { type: 'separator' },
        ...updaterMenuItems(updater),
        { label: 'Quit uMusic', click: () => app.quit() }
      ])
    )
  }
  window.on('show', updateMenu)
  window.on('hide', updateMenu)
  window.on('minimize', updateMenu)
  window.on('restore', updateMenu)
  media.onChange(updateMenu)
  updater.onChange(updateMenu)
  updateMenu()

  created.on('click', () => toggleWindow(window))

  tray = created
  return created
}
