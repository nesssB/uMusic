# Changelog

## 0.1.1 (2026-10-29)

uMusic now remembers its window, keeps playing without asking whether you're
still there, and adds repeat and like controls outside the window. An
installed 0.1.0 updates to this version on its own.

### Downloads

| Platform | File                     | Updates                             |
| -------- | ------------------------ | ----------------------------------- |
| Windows  | `umusic-0.1.1-setup.exe` | Updates itself                      |
| Linux    | `umusic-0.1.1.AppImage`  | Updates itself                      |
| Linux    | `.deb` package           | Tells you when a new version is out |

There is no macOS build yet.

### Features

- **No more "Continue watching?".** YouTube Music no longer pauses to ask
  whether you're still listening. If the question shows up anyway, uMusic
  answers it and resumes the track. A pause of your own is never undone.
- **No miniplayer.** The small video player YouTube Music shows in the corner
  when you leave the player page is hidden. The music keeps playing, and the
  full player still opens from the player bar.
- **The window remembers where it was.** Its size, position and maximized
  state are restored at launch. If the screen it was on is gone or got
  smaller, the window is moved and resized to fit.
- **Repeat from the tray.** A _Repeat_ submenu in the tray menu sets repeat
  to Off, All or One.
- **More Windows taskbar controls.** Two new buttons under the window's
  taskbar thumbnail:
  - Repeat: shows the current mode and moves on to the next one when clicked,
    like the player bar's button.
  - Like: likes the current track, or removes the like. It's filled while the
    track is liked.
- **New icons.** A new app icon, and a tray icon that follows the light or
  dark theme of the taskbar or panel and shows a play badge while music plays.

### Fixes

- The Windows taskbar buttons no longer get stuck showing an old state.

### Known limitations

- No macOS build.
- The .deb package doesn't update itself. Install new versions from the
  [releases page](https://github.com/nesssB/uMusic/releases).
- There is no settings screen yet. Keeping playback going and hiding the
  miniplayer are on by default and can only be turned off by editing
  `settings.json` in the app's data folder. A settings window is planned for
  0.2.0.

## 0.1.0 (2026-10-26)

The first release of uMusic, an unofficial desktop client for YouTube Music.

### Downloads

| Platform | File                    | Updates                             |
| -------- | ----------------------- | ----------------------------------- |
| Linux    | `umusic-0.1.0.AppImage` | Updates itself                      |
| Linux    | `.deb` package          | Tells you when a new version is out |

There is no macOS build yet.

### Features

- **YouTube Music in its own window.** Your sign-in is kept in its own session
  and survives restarts, even if the app is forced to quit.
- **Ad blocking.** Requests to ad domains and paths are blocked, ad data is
  removed from player responses before the player reads it, and any ad that
  still reaches the player is muted and skipped.
- **Plays in the background.** Closing the window hides it to the tray and the
  music keeps playing. Quit from the tray menu.
- **Tray menu.** Shows the current track, Previous, Play/Pause and Next, and
  lets you show, hide or quit uMusic. Clicking the tray icon shows or hides the
  window.
- **Windows taskbar controls.** Previous, Play/Pause and Next buttons under the
  window's taskbar thumbnail.
- **One window at a time.** Opening uMusic again brings up the window that is
  already open instead of starting a second copy.
- **Automatic updates.** uMusic checks for a new version at launch and every
  4 hours.
  - AppImage and Windows: the update downloads in the background and installs
    when you quit. To install it right away, click the notification or use
    _Restart to Update_ in the tray menu.
  - .deb: a notification and a tray menu item take you to the release page.
- **External links open in your browser.** Only YouTube Music and Google
  sign-in pages open inside the app.

### Privacy and security

- YouTube Music only gets the permissions it needs: fullscreen and copying to
  the clipboard. Microphone, location, notifications and the rest are denied.
- The window runs with hardened settings and locked-down Electron fuses, and
  sign-in cookies are encrypted on disk.

### Known limitations

- No macOS build.
- The .deb package doesn't update itself. Install new versions from the
  [releases page](https://github.com/nesssB/uMusic/releases).
