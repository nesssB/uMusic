import {
  app,
  nativeImage,
  nativeTheme,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  Tray
} from 'electron'
import { describeTrack } from '@core/media'
import { RepeatMode, REPEAT_MODES } from '@core/repeat'
import { MediaControls } from './media-controls'
import { Updater } from './updater'
// The 16px icons have an @2x version next to them, which nativeImage picks up.
import blackIcon from '../../resources/tray/tray-black.png?asset'
import whiteIcon from '../../resources/tray/tray-white.png?asset'
import blackIcon22 from '../../resources/tray/tray-black-22.png?asset'
import whiteIcon22 from '../../resources/tray/tray-white-22.png?asset'
import blackPlayingIcon from '../../resources/tray/tray-black-playing.png?asset'
import whitePlayingIcon from '../../resources/tray/tray-white-playing.png?asset'
import blackPlayingIcon22 from '../../resources/tray/tray-black-playing-22.png?asset'
import whitePlayingIcon22 from '../../resources/tray/tray-white-playing-22.png?asset'

const icons = {
  idle: { black: blackIcon, white: whiteIcon, black22: blackIcon22, white22: whiteIcon22 },
  playing: {
    black: blackPlayingIcon,
    white: whitePlayingIcon,
    black22: blackPlayingIcon22,
    white22: whitePlayingIcon22
  }
}

// Kept at module level so the tray is not garbage collected.
let tray: Tray | undefined

// The playing icon adds a play triangle to the top right of the U.
function trayIcon(playing: boolean): Electron.NativeImage {
  const set = playing ? icons.playing : icons.idle
  // macOS recolors template images to match the menu bar.
  if (process.platform === 'darwin') {
    const image = nativeImage.createFromPath(set.black)
    image.setTemplateImage(true)
    return image
  }
  // Light icon on dark panels and the other way round. Linux panels draw
  // tray icons at 22px, Windows at 16px.
  const dark = nativeTheme.shouldUseDarkColors
  if (process.platform === 'linux') {
    return nativeImage.createFromPath(dark ? set.white22 : set.black22)
  }
  return nativeImage.createFromPath(dark ? set.white : set.black)
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
    { label: 'Next', enabled, click: () => media.send('next') },
    { type: 'separator' },
    repeatMenuItem(media)
  ]
}

const REPEAT_LABELS: Record<RepeatMode, string> = { none: 'Off', all: 'All', one: 'One' }

// The mode can be changed with nothing playing, so this does not depend on
// the track. It is disabled while the page has no repeat button to press.
function repeatMenuItem(media: MediaControls): MenuItemConstructorOptions {
  const { repeat } = media.getState()
  return {
    label: 'Repeat',
    enabled: repeat !== null,
    submenu: REPEAT_MODES.map((mode) => ({
      label: REPEAT_LABELS[mode],
      type: 'radio' as const,
      checked: mode === repeat,
      click: () => media.setRepeat(mode)
    }))
  }
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

  const created = new Tray(trayIcon(media.getState().playing))
  const updateIcon = (): void => created.setImage(trayIcon(media.getState().playing))
  nativeTheme.on('updated', updateIcon)
  media.onChange(updateIcon)

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
