import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMediaControls } from './media-controls'
import { createSettingsStore, SettingsStore } from './settings'
import { setUpThumbar } from './thumbar'
import { createTray } from './tray'
import { createUpdater } from './updater'
import { createYTMusicWindow } from './windows/ytmusic'

// A second instance would open another window on the same persist:ytmusic
// partition and play alongside the first. Hand the launch over instead.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  // userData can be read before the app is ready.
  const settings = createSettingsStore()
  app.on('second-instance', () => {
    if (app.isReady()) showYTMusicWindow(settings)
  })
  app.whenReady().then(() => onReady(settings))
}

function showYTMusicWindow(settings: SettingsStore): void {
  const [window] = BrowserWindow.getAllWindows()
  if (!window) {
    createYTMusicWindow(settings)
    return
  }
  if (window.isMinimized()) window.restore()
  window.show()
  window.focus()
}

// Called when Electron has finished initialization and is ready to create
// browser windows. Some APIs can only be used after this event occurs.
function onReady(settings: SettingsStore): void {
  // Windows groups the taskbar button and names the app in its media
  // overlay by this id. It must match appId in electron-builder.yml.
  electronApp.setAppUserModelId('io.github.nesssb.umusic')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const window = createYTMusicWindow(settings)
  const media = createMediaControls(window)
  const updater = createUpdater()
  createTray(window, media, updater)
  setUpThumbar(window, media)

  // On macOS, clicking the dock icon brings back the window hidden by closing.
  app.on('activate', () => showYTMusicWindow(settings))
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
