import { app, shell, Notification } from 'electron'
import { is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { isNewerVersion, releasePageUrl } from '@core/updates'
import icon from '../../resources/icon.png?asset'

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000

export type UpdateState =
  | { status: 'none' }
  // Downloaded. It installs when the app quits, or right away on restart.
  | { status: 'ready'; version: string }
  // Has to be downloaded and installed by hand from the release page.
  | { status: 'available'; version: string }

export interface Updater {
  getState: () => UpdateState
  onChange: (listener: (state: UpdateState) => void) => void
  apply: () => void
}

// The NSIS installer and the AppImage can replace themselves. Installing the
// .deb needs root, and the macOS build is not signed, which Squirrel.Mac
// requires, so those only point the user to the release.
function canInstallUpdates(): boolean {
  if (process.platform === 'win32') return true
  return process.platform === 'linux' && process.env.APPIMAGE !== undefined
}

// Kept at module level so a notification is not garbage collected before
// it is clicked.
let notification: Notification | undefined

function notify(title: string, body: string, onClick: () => void): void {
  if (!Notification.isSupported()) return
  notification = new Notification({ title, body, icon })
  notification.on('click', onClick)
  notification.show()
}

export function createUpdater(): Updater {
  let state: UpdateState = { status: 'none' }
  const listeners: Array<(state: UpdateState) => void> = []

  const setState = (next: UpdateState): void => {
    state = next
    for (const listener of listeners) listener(state)
  }

  const apply = (): void => {
    if (state.status === 'ready') autoUpdater.quitAndInstall(true, true)
    if (state.status === 'available') shell.openExternal(releasePageUrl(state.version))
  }

  const updater: Updater = {
    getState: () => state,
    onChange: (listener) => {
      listeners.push(listener)
    },
    apply
  }

  // A dev build has no app-update.yml. UMUSIC_DEV_UPDATES=1 makes it read
  // dev-app-update.yml instead, to try the updater out.
  if (is.dev) {
    if (!process.env.UMUSIC_DEV_UPDATES) return updater
    autoUpdater.forceDevUpdateConfig = true
  }

  const installs = canInstallUpdates()
  autoUpdater.autoDownload = installs
  autoUpdater.autoInstallOnAppQuit = true

  // Every check reports the same update again until the app restarts, and
  // it should only be announced once.
  const announce = (next: UpdateState & { status: 'ready' | 'available' }): void => {
    const known = state.status === 'none' ? app.getVersion() : state.version
    if (!isNewerVersion(next.version, known)) return
    setState(next)
    if (next.status === 'ready') {
      notify(
        `uMusic ${next.version} is ready`,
        'It installs when you quit uMusic. Click to restart now.',
        apply
      )
    } else {
      notify(`uMusic ${next.version} is available`, 'Click to open the download page.', apply)
    }
  }

  autoUpdater.on('update-available', ({ version }) => {
    if (!installs) announce({ status: 'available', version })
  })
  autoUpdater.on('update-downloaded', ({ version }) => {
    announce({ status: 'ready', version })
  })
  // Without a listener, the updater's 'error' event would throw. Being
  // offline is the usual cause, and the next check tries again.
  autoUpdater.on('error', (error) => {
    console.error('Update check failed:', error)
  })

  const check = (): void => {
    autoUpdater
      .checkForUpdates()
      .then((result) => result?.downloadPromise)
      .catch(() => {
        // Already reported through the 'error' event.
      })
  }
  check()
  setInterval(check, CHECK_INTERVAL_MS)

  return updater
}
