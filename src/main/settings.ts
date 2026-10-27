import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { app } from 'electron'
import { defaultSettings, parseSettings, serializeSettings, Settings } from '@core/settings'

export interface SettingsStore {
  get: <K extends keyof Settings>(key: K) => Settings[K]
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

function load(path: string): Settings {
  let text: string
  try {
    text = readFileSync(path, 'utf8')
  } catch (error) {
    // There is no file until a setting is first changed.
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Could not read settings:', error)
    }
    return defaultSettings()
  }
  try {
    return parseSettings(JSON.parse(text))
  } catch (error) {
    console.error('Could not parse settings, using the defaults:', error)
    return defaultSettings()
  }
}

// Written to a temporary file and renamed over the old one, so a crash or a
// power cut leaves either the old settings or the new ones, never half a
// file. The write is synchronous: the file is small, and an async write
// still pending when the app quits would be lost.
function save(path: string, settings: Settings): void {
  const temporary = `${path}.tmp`
  try {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(temporary, serializeSettings(settings), { flush: true })
    renameSync(temporary, path)
  } catch (error) {
    console.error('Could not save settings:', error)
  }
}

// Every set writes the file, so a setting that changes often, like the
// window bounds while dragging, should be debounced by its caller.
export function createSettingsStore(): SettingsStore {
  const path = join(app.getPath('userData'), 'settings.json')
  const settings = load(path)
  return {
    get: (key) => settings[key],
    set: (key, value) => {
      settings[key] = value
      save(path, settings)
    }
  }
}
