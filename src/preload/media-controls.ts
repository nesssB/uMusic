import { contextBridge, ipcRenderer } from 'electron'
import {
  MediaCommand,
  MediaState,
  MediaTrack,
  MEDIA_COMMAND_CHANNEL,
  MEDIA_LIKE_CHANNEL,
  MEDIA_REPEAT_CHANNEL,
  MEDIA_STATE_CHANNEL
} from '@core/media'
import { installMediaSessionBridge, MediaSessionBridge } from '@core/media-session'
import { RepeatMode } from '@core/repeat'
import { setLiked, watchLiked } from './like'
import { setRepeatMode, watchRepeatMode } from './repeat'

// Media events do not bubble, so they are caught on the way down to the video.
const PLAYBACK_EVENTS = ['play', 'pause', 'ended', 'emptied']

// Reports playback to the main process and runs the commands it sends back,
// through the same Media Session handlers the OS media controls use.
export function startMediaControls(): void {
  const state: MediaState = { track: null, playing: false, repeat: null, liked: null }
  const report = (): void => ipcRenderer.send(MEDIA_STATE_CHANNEL, state)

  // The handlers live in the page's world. Functions passed across the
  // context bridge are proxied, so both callbacks keep working later.
  const bridge: MediaSessionBridge = contextBridge.executeInMainWorld({
    func: installMediaSessionBridge,
    args: [
      (track: MediaTrack | null) => {
        state.track = track
        report()
      }
    ]
  })

  const updatePlaying = (event: Event): void => {
    if (!(event.target instanceof HTMLMediaElement)) return
    const playing = !event.target.paused
    if (playing === state.playing) return
    state.playing = playing
    report()
  }
  for (const type of PLAYBACK_EVENTS) document.addEventListener(type, updatePlaying, true)

  watchRepeatMode((repeat) => {
    state.repeat = repeat
    report()
  })
  ipcRenderer.on(MEDIA_REPEAT_CHANNEL, (_event, mode: RepeatMode) => setRepeatMode(mode))

  watchLiked((liked) => {
    state.liked = liked
    report()
  })
  ipcRenderer.on(MEDIA_LIKE_CHANNEL, (_event, liked: boolean) => setLiked(liked))

  ipcRenderer.on(MEDIA_COMMAND_CHANNEL, (_event, command: MediaCommand) => {
    if (command === 'playpause') bridge.runAction(state.playing ? 'pause' : 'play')
    if (command === 'previous') bridge.runAction('previoustrack')
    if (command === 'next') bridge.runAction('nexttrack')
  })
}
