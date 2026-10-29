// The repeat modes YouTube Music offers, in the order its button steps
// through them.
export const REPEAT_MODES = ['none', 'all', 'one'] as const

export type RepeatMode = (typeof REPEAT_MODES)[number]

// The player bar keeps the mode in its `repeat-mode` attribute, as NONE, ALL
// or ONE. The button's title is translated, so it is no use for this.
// Returns null when the attribute is missing or has a value it does not know.
export function parseRepeatAttribute(value: string | null): RepeatMode | null {
  switch (value) {
    case 'NONE':
      return 'none'
    case 'ALL':
      return 'all'
    case 'ONE':
      return 'one'
    default:
      return null
  }
}

export function nextRepeatMode(mode: RepeatMode): RepeatMode {
  return REPEAT_MODES[(REPEAT_MODES.indexOf(mode) + 1) % REPEAT_MODES.length]
}

// The page only changes the mode through its button, one step per press.
// Returns how many presses it takes to go from one mode to the other.
export function repeatPresses(from: RepeatMode, to: RepeatMode): number {
  const count = REPEAT_MODES.length
  return (REPEAT_MODES.indexOf(to) - REPEAT_MODES.indexOf(from) + count) % count
}
