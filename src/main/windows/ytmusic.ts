import { session, shell, BrowserWindow, Session } from 'electron'
import { getNavigationTarget, NavigationTarget } from '@core/navigation'
import icon from '../../../resources/icon.png?asset'

function navigationTarget(url: string): NavigationTarget {
  const parsed = URL.parse(url)
  return parsed ? getNavigationTarget(parsed) : 'blocked'
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

  ytSession = created
  return created
}

export function createYTMusicWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      session: getYTMusicSession()
    }
  })

  window.on('ready-to-show', () => {
    window.show()
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
