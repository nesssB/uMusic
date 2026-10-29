import { nativeImage, BrowserWindow } from 'electron'
import { nextRepeatMode, RepeatMode } from '@core/repeat'
import { MediaControls } from './media-controls'
// Each icon has an @2x version next to it, which nativeImage picks up.
import previousIcon from '../../resources/thumbar/previous.png?asset'
import playIcon from '../../resources/thumbar/play.png?asset'
import pauseIcon from '../../resources/thumbar/pause.png?asset'
import nextIcon from '../../resources/thumbar/next.png?asset'
import repeatOffIcon from '../../resources/thumbar/repeat-off.png?asset'
import repeatAllIcon from '../../resources/thumbar/repeat-all.png?asset'
import repeatOneIcon from '../../resources/thumbar/repeat-one.png?asset'

const REPEAT_TOOLTIPS: Record<RepeatMode, string> = {
  none: 'Repeat off',
  all: 'Repeat all',
  one: 'Repeat one'
}

// Previous, play/pause, next and repeat buttons under the window's taskbar
// thumbnail.
export function setUpThumbar(window: BrowserWindow, media: MediaControls): void {
  if (process.platform !== 'win32') return

  const icons = {
    previous: nativeImage.createFromPath(previousIcon),
    play: nativeImage.createFromPath(playIcon),
    pause: nativeImage.createFromPath(pauseIcon),
    next: nativeImage.createFromPath(nextIcon),
    repeat: {
      none: nativeImage.createFromPath(repeatOffIcon),
      all: nativeImage.createFromPath(repeatAllIcon),
      one: nativeImage.createFromPath(repeatOneIcon)
    }
  }

  const stepRepeat = (): void => {
    const { repeat } = media.getState()
    if (repeat) media.setRepeat(nextRepeatMode(repeat))
  }

  const update = (): void => {
    // Windows rejects the buttons until the window is shown, and drops them
    // when it is hidden, so they are set again on every show.
    if (!window.isVisible()) return
    const { track, playing, repeat } = media.getState()
    // A button is enabled when it has no flags. Electron accepts 'enabled' but
    // the whole call then fails, leaving the buttons as they were.
    const flags = track ? [] : ['disabled']
    // Like the player bar's button, repeat shows the current mode and a click
    // moves on to the next one. It works with nothing playing, but needs the
    // page's button to press: without one it shows as off, disabled.
    const repeatShown = repeat ?? 'none'
    window.setThumbarButtons([
      {
        tooltip: 'Previous',
        icon: icons.previous,
        flags,
        click: () => media.send('previous')
      },
      {
        tooltip: playing ? 'Pause' : 'Play',
        icon: playing ? icons.pause : icons.play,
        flags,
        click: () => media.send('playpause')
      },
      {
        tooltip: 'Next',
        icon: icons.next,
        flags,
        click: () => media.send('next')
      },
      {
        tooltip: REPEAT_TOOLTIPS[repeatShown],
        icon: icons.repeat[repeatShown],
        flags: repeat ? [] : ['disabled'],
        click: stepRepeat
      }
    ])
  }

  window.on('show', update)
  media.onChange(update)
}
