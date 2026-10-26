import { contextBridge } from 'electron'
import { installPlayerAdFilter } from '@core/player-ads'
import { startAdFallback } from './ad-fallback'

// Preloads run before the page's own scripts, so the filter is in place
// before the first player response arrives. The sign-in pages load in the
// same window and are left alone.
if (location.hostname === 'music.youtube.com') {
  contextBridge.executeInMainWorld({ func: installPlayerAdFilter })
  startAdFallback()
}
