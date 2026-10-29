import { isRepeatMode, RepeatMode } from './repeat'

export interface MediaTrack {
  title: string
  artist: string
}

export interface MediaState {
  track: MediaTrack | null
  playing: boolean
  // Null while the page has no repeat button to read it from.
  repeat: RepeatMode | null
  // Null while the page has no like button to read it from.
  liked: boolean | null
}

export type MediaCommand = 'playpause' | 'previous' | 'next'

export const IDLE_MEDIA_STATE: MediaState = {
  track: null,
  playing: false,
  repeat: null,
  liked: null
}

// IPC channels between the YouTube Music preload and the main process.
export const MEDIA_STATE_CHANNEL = 'media:state'
export const MEDIA_COMMAND_CHANNEL = 'media:command'
export const MEDIA_REPEAT_CHANNEL = 'media:repeat'
export const MEDIA_LIKE_CHANNEL = 'media:like'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseTrack(value: unknown): MediaTrack | null | undefined {
  if (value === null) return null
  if (!isRecord(value)) return undefined
  const { title, artist } = value
  if (typeof title !== 'string' || typeof artist !== 'string') return undefined
  return { title, artist }
}

// The state comes from the page over IPC, so its shape is checked rather
// than trusted. Returns null when it is malformed.
export function parseMediaState(value: unknown): MediaState | null {
  if (!isRecord(value) || typeof value.playing !== 'boolean') return null
  const track = parseTrack(value.track)
  if (track === undefined) return null
  const { repeat } = value
  if (repeat !== null && !isRepeatMode(repeat)) return null
  const { liked } = value
  if (liked !== null && typeof liked !== 'boolean') return null
  return { track, playing: value.playing, repeat, liked }
}

export function describeTrack(track: MediaTrack): string {
  if (!track.artist) return track.title
  if (!track.title) return track.artist
  return `${track.title} — ${track.artist}`
}
