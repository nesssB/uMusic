// Settings are stored as JSON, with the schema version next to them. Data
// from an older version is migrated, and a field that does not fit the
// schema falls back to its default, so a damaged or hand-edited file never
// keeps the app from starting.

export const SETTINGS_VERSION = 1

export interface WindowState {
  // Both null until the window has been placed, so the OS positions it.
  x: number | null
  y: number | null
  width: number
  height: number
  maximized: boolean
}

export interface Settings {
  window: WindowState
  // Closing the window hides it to the tray, so playback keeps going.
  keepPlayingOnClose: boolean
  // Keeps YT Music from pausing to ask whether the user is still there.
  keepPlaying: boolean
}

type SettingsData = Record<string, unknown>

// MIGRATIONS[n] turns version n data into version n + 1. A new field only
// needs a default. Renaming or reshaping one needs a new SETTINGS_VERSION
// and a step here.
export const MIGRATIONS: Record<number, (data: SettingsData) => SettingsData> = {}

export function defaultSettings(): Settings {
  return {
    window: { x: null, y: null, width: 900, height: 670, maximized: false },
    keepPlayingOnClose: true,
    keepPlaying: true
  }
}

function isRecord(value: unknown): value is SettingsData {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isPosition(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value)
}

// A missing or invalid version is read as the first one.
function readVersion(data: SettingsData): number {
  const { version } = data
  return typeof version === 'number' && Number.isSafeInteger(version) && version >= 1 ? version : 1
}

// Data from a newer version, left by a newer uMusic before a downgrade, is
// returned as it is. The fields that still fit are kept.
export function migrateSettings(
  data: SettingsData,
  from: number,
  to = SETTINGS_VERSION,
  migrations = MIGRATIONS
): SettingsData {
  let migrated = data
  for (let version = from; version < to; version++) {
    const step = migrations[version]
    if (!step) throw new Error(`No settings migration from version ${version}`)
    migrated = step(migrated)
  }
  return migrated
}

// The window state is taken whole or not at all: a saved position with a
// default size would not make sense.
function readWindow(value: unknown): WindowState | undefined {
  if (!isRecord(value)) return undefined
  const { x, y, width, height, maximized } = value
  if (!isPosition(x) || !isPosition(y) || (x === null) !== (y === null)) return undefined
  if (!isFiniteNumber(width) || !isFiniteNumber(height) || width <= 0 || height <= 0) {
    return undefined
  }
  if (typeof maximized !== 'boolean') return undefined
  return { x, y, width, height, maximized }
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

// Takes anything JSON.parse returns. Unknown fields are dropped.
export function parseSettings(raw: unknown): Settings {
  const defaults = defaultSettings()
  if (!isRecord(raw)) return defaults
  const data = migrateSettings(raw, readVersion(raw))
  return {
    window: readWindow(data.window) ?? defaults.window,
    keepPlayingOnClose: readBoolean(data.keepPlayingOnClose) ?? defaults.keepPlayingOnClose,
    keepPlaying: readBoolean(data.keepPlaying) ?? defaults.keepPlaying
  }
}

export function serializeSettings(settings: Settings): string {
  return JSON.stringify({ version: SETTINGS_VERSION, ...settings }, null, 2) + '\n'
}
