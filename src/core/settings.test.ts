import { describe, expect, it } from 'vitest'
import {
  defaultSettings,
  migrateSettings,
  parseSettings,
  serializeSettings,
  MIGRATIONS,
  SETTINGS_VERSION
} from './settings'

const placedWindow = { x: 100, y: 50, width: 1200, height: 800, maximized: true }

describe('defaultSettings', () => {
  it('returns a new object every time', () => {
    const settings = defaultSettings()
    settings.window.width = 1
    settings.keepPlayingOnClose = false
    expect(defaultSettings().window.width).toBe(900)
    expect(defaultSettings().keepPlayingOnClose).toBe(true)
  })
})

describe('parseSettings', () => {
  it('uses the defaults for anything that is not an object', () => {
    for (const raw of [null, undefined, 'settings', 42, true, []]) {
      expect(parseSettings(raw)).toEqual(defaultSettings())
    }
  })

  it('uses the default for every missing field', () => {
    expect(parseSettings({})).toEqual(defaultSettings())
    expect(parseSettings({ version: SETTINGS_VERSION, keepPlayingOnClose: false })).toEqual({
      ...defaultSettings(),
      keepPlayingOnClose: false
    })
  })

  it('reads back what serializeSettings writes', () => {
    const settings = { window: placedWindow, keepPlayingOnClose: false }
    expect(parseSettings(JSON.parse(serializeSettings(settings)))).toEqual(settings)
  })

  it('replaces only the fields that do not fit the schema', () => {
    expect(parseSettings({ window: placedWindow, keepPlayingOnClose: 'no' })).toEqual({
      window: placedWindow,
      keepPlayingOnClose: true
    })
    expect(parseSettings({ window: 'big', keepPlayingOnClose: false })).toEqual({
      window: defaultSettings().window,
      keepPlayingOnClose: false
    })
  })

  it('drops unknown fields', () => {
    const raw = JSON.parse('{"theme": "dark", "__proto__": {"keepPlayingOnClose": false}}')
    expect(parseSettings(raw)).toEqual(defaultSettings())
  })

  it('accepts a window that has not been placed yet', () => {
    const window = { x: null, y: null, width: 1000, height: 700, maximized: false }
    expect(parseSettings({ window }).window).toEqual(window)
  })

  it('accepts a window placed at negative coordinates', () => {
    const window = { ...placedWindow, x: -1920, y: -40 }
    expect(parseSettings({ window }).window).toEqual(window)
  })

  it('rejects a window state with any part out of shape', () => {
    const broken = [
      { ...placedWindow, x: null },
      { ...placedWindow, y: undefined },
      { ...placedWindow, x: '100' },
      { ...placedWindow, width: 0 },
      { ...placedWindow, height: -1 },
      { ...placedWindow, width: Infinity },
      { ...placedWindow, height: NaN },
      { ...placedWindow, maximized: 1 },
      { x: 100, y: 50, width: 1200, height: 800 }
    ]
    for (const window of broken) {
      expect(parseSettings({ window }).window).toEqual(defaultSettings().window)
    }
  })

  it('keeps the fields that still fit in data from a newer version', () => {
    expect(
      parseSettings({ version: SETTINGS_VERSION + 1, keepPlayingOnClose: false, theme: 'dark' })
    ).toEqual({ ...defaultSettings(), keepPlayingOnClose: false })
  })

  it('reads a missing or invalid version as the first one', () => {
    for (const version of [undefined, null, '1', 0, -1, 1.5]) {
      expect(parseSettings({ version, keepPlayingOnClose: false }).keepPlayingOnClose).toBe(false)
    }
  })
})

describe('serializeSettings', () => {
  it('stores the schema version with the settings', () => {
    expect(JSON.parse(serializeSettings(defaultSettings()))).toEqual({
      version: SETTINGS_VERSION,
      ...defaultSettings()
    })
  })
})

describe('migrateSettings', () => {
  const migrations = {
    1: (data: Record<string, unknown>) => ({ ...data, steps: ['1→2'] }),
    2: (data: Record<string, unknown>) => ({ ...data, steps: [...(data.steps as string[]), '2→3'] })
  }

  it('applies every step from the stored version, in order', () => {
    expect(migrateSettings({}, 1, 3, migrations)).toEqual({ steps: ['1→2', '2→3'] })
    expect(migrateSettings({ steps: ['old'] }, 2, 3, migrations)).toEqual({
      steps: ['old', '2→3']
    })
  })

  it('leaves current and newer data as it is', () => {
    const data = { keepPlayingOnClose: false }
    expect(migrateSettings(data, 3, 3, migrations)).toBe(data)
    expect(migrateSettings(data, 4, 3, migrations)).toBe(data)
  })

  it('fails when a step is missing', () => {
    expect(() => migrateSettings({}, 1, 4, migrations)).toThrow('version 3')
  })

  it('has a step for every version before the current one', () => {
    for (let version = 1; version < SETTINGS_VERSION; version++) {
      expect(MIGRATIONS[version]).toBeTypeOf('function')
    }
  })
})
