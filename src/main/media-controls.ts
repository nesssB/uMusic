import { ipcMain, BrowserWindow } from 'electron'
import {
  IDLE_MEDIA_STATE,
  MediaCommand,
  MediaState,
  MEDIA_COMMAND_CHANNEL,
  MEDIA_STATE_CHANNEL,
  parseMediaState
} from '@core/media'

export interface MediaControls {
  getState: () => MediaState
  onChange: (listener: (state: MediaState) => void) => void
  send: (command: MediaCommand) => void
}

export function createMediaControls(window: BrowserWindow): MediaControls {
  const { webContents } = window
  let state = IDLE_MEDIA_STATE
  const listeners: Array<(state: MediaState) => void> = []

  const setState = (next: MediaState): void => {
    state = next
    for (const listener of listeners) listener(state)
  }

  ipcMain.on(MEDIA_STATE_CHANNEL, (event, value) => {
    if (event.sender !== webContents) return
    const parsed = parseMediaState(value)
    if (parsed) setState(parsed)
  })

  // A page that goes away stops reporting, so its last state would stick.
  // The sign-in pages have no player and never report at all.
  webContents.on('did-start-navigation', ({ isMainFrame, isSameDocument }) => {
    if (isMainFrame && !isSameDocument) setState(IDLE_MEDIA_STATE)
  })
  webContents.on('render-process-gone', () => setState(IDLE_MEDIA_STATE))

  return {
    getState: () => state,
    onChange: (listener) => {
      listeners.push(listener)
    },
    send: (command) => webContents.send(MEDIA_COMMAND_CHANNEL, command)
  }
}
