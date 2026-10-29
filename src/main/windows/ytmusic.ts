import { join } from 'path'
import { session, shell, BrowserWindow, Session } from 'electron'
import { isAdRequest } from '@core/adblock'
import { KEEP_PLAYING_ARG } from '@core/keep-playing'
import { HIDE_MINIPLAYER_CSS } from '@core/miniplayer'
import { getNavigationTarget, NavigationTarget } from '@core/navigation'
import { isPermissionAllowed } from '@core/permissions'
import { SettingsStore } from '../settings'
import { initialWindowBounds, trackWindowState } from '../window-state'
import icon from '../../../resources/icon.png?asset'

function navigationTarget(url: string): NavigationTarget {
  const parsed = URL.parse(url)
  return parsed ? getNavigationTarget(parsed) : 'blocked'
}

function permissionAllowed(permission: string, url: string): boolean {
  const parsed = URL.parse(url)
  return parsed ? isPermissionAllowed(permission, parsed) : false
}

function adRequest(url: string): boolean {
  const parsed = URL.parse(url)
  return parsed ? isAdRequest(parsed) : false
}

let ytSession: Session | undefined

function getYTMusicSession(): Session {
  if (ytSession) return ytSession

  const created = session.fromPartition('persist:ytmusic')

  // Chromium writes cookies to disk only every ~30 seconds, so a sign-in is
  // lost if the app is killed before then. Flush shortly after any change.
  let flushPending = false
  created.cookies.on('changed', () => {
    if (flushPending) return
    flushPending = true
    setTimeout(() => {
      flushPending = false
      created.cookies.flushStore()
    }, 1000)
  })

  // Electron grants every permission by default. Pages usually check a
  // permission before requesting it, so both handlers are needed.
  created.setPermissionRequestHandler((_webContents, permission, callback, details) => {
    callback(permissionAllowed(permission, details.requestingUrl))
  })
  created.setPermissionCheckHandler((_webContents, permission, requestingOrigin) =>
    permissionAllowed(permission, requestingOrigin)
  )

  created.webRequest.onBeforeRequest((details, callback) => {
    callback({ cancel: adRequest(details.url) })
  })

  ytSession = created
  return created
}

export function createYTMusicWindow(settings: SettingsStore): BrowserWindow {
  const { maximized } = settings.get('window')
  const window = new BrowserWindow({
    ...initialWindowBounds(settings),
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, '../preload/ytmusic.js'),
      // Read once, so a change applies to the next window.
      additionalArguments: settings.get('keepPlaying') ? [KEEP_PLAYING_ARG] : [],
      session: getYTMusicSession()
    }
  })

  trackWindowState(window, settings)

  // Maximizing also shows the window, so it waits until the page has
  // something to show.
  window.on('ready-to-show', () => {
    if (maximized) window.maximize()
    window.show()
  })

  // YouTube Music sets a beforeunload handler while playing. A browser would
  // ask "Leave site?", but Electron silently cancels the close instead.
  window.webContents.on('will-prevent-unload', (event) => {
    event.preventDefault()
  })

  // Inserted CSS is dropped on every load, so it goes in again each time.
  // The setting is read here, so a change applies from the next load.
  window.webContents.on('did-finish-load', () => {
    const url = URL.parse(window.webContents.getURL())
    if (url?.hostname !== 'music.youtube.com' || !settings.get('hideMiniplayer')) return
    window.webContents.insertCSS(HIDE_MINIPLAYER_CSS).catch((error) => {
      console.error('Could not hide the miniplayer:', error)
    })
  })

  window.webContents.on('will-navigate', (event) => {
    const target = navigationTarget(event.url)
    if (target === 'app') return

    event.preventDefault()
    if (target === 'browser') shell.openExternal(event.url)
  })

  window.webContents.setWindowOpenHandler(({ url }) => {
    const target = navigationTarget(url)
    if (target === 'app') window.loadURL(url)
    if (target === 'browser') shell.openExternal(url)
    return { action: 'deny' }
  })

  window.loadURL('https://music.youtube.com')

  return window
}
