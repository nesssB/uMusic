import { contextBridge } from 'electron'
import { KEEP_PLAYING_ARG } from '@core/keep-playing'
import { installPlayerAdFilter } from '@core/player-ads'
import { startAdFallback } from './ad-fallback'
import { startKeepPlaying } from './keep-playing'
import { startMediaControls } from './media-controls'

// Preloads run before the page's own scripts, so the filter and the media
// bridge are in place before the page uses them. The sign-in pages load in
// the same window and are left alone.
if (location.hostname === 'music.youtube.com') {
  contextBridge.executeInMainWorld({ func: installPlayerAdFilter })
  startAdFallback()
  startMediaControls()
  if (process.argv.includes(KEEP_PLAYING_ARG)) startKeepPlaying()
}
