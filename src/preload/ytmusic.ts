import { contextBridge } from 'electron'
import { installActivityKeeper } from '@core/keep-playing'
import { installPlayerAdFilter } from '@core/player-ads'
import { startAdFallback } from './ad-fallback'
import { startYouThereFallback } from './keep-playing'
import { startMediaControls } from './media-controls'

// Preloads run before the page's own scripts, so the filter, the activity
// keeper and the media bridge are in place before the page uses them. The
// sign-in pages load in the same window and are left alone.
if (location.hostname === 'music.youtube.com') {
  contextBridge.executeInMainWorld({ func: installPlayerAdFilter })
  contextBridge.executeInMainWorld({ func: installActivityKeeper })
  startAdFallback()
  startYouThereFallback()
  startMediaControls()
}
