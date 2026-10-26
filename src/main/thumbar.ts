import { nativeImage, BrowserWindow } from 'electron'
import { MediaControls } from './media-controls'
// Each icon has an @2x version next to it, which nativeImage picks up.
import previousIcon from '../../resources/thumbar/previous.png?asset'
import playIcon from '../../resources/thumbar/play.png?asset'
import pauseIcon from '../../resources/thumbar/pause.png?asset'
import nextIcon from '../../resources/thumbar/next.png?asset'

// Previous, play/pause and next buttons under the window's taskbar thumbnail.
export function setUpThumbar(window: BrowserWindow, media: MediaControls): void {
  if (process.platform !== 'win32') return

  const icons = {
    previous: nativeImage.createFromPath(previousIcon),
    play: nativeImage.createFromPath(playIcon),
    pause: nativeImage.createFromPath(pauseIcon),
    next: nativeImage.createFromPath(nextIcon)
  }

  const update = (): void => {
    // Windows rejects the buttons until the window is shown, and drops them
    // when it is hidden, so they are set again on every show.
    if (!window.isVisible()) return
    const { track, playing } = media.getState()
    const flags = track ? ['enabled'] : ['disabled']
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
      }
    ])
  }

  window.on('show', update)
  media.onChange(update)
}
