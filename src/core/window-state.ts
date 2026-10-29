import type { WindowState } from './settings'

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

// Without x and y, the OS places the window.
export type InitialBounds = Pick<Rectangle, 'width' | 'height'> & Partial<Rectangle>

function overlapArea(a: Rectangle, b: Rectangle): number {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
  return width > 0 && height > 0 ? width * height : 0
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// The saved window goes back to the screen it covers most, shrunk to fit and
// moved fully onto it, so a change of resolution or layout cannot leave the
// title bar out of reach. A window on a screen that is gone is left for the
// OS to place on the primary one. workAreas leave out taskbars and panels.
export function fitWindowBounds(
  state: WindowState,
  workAreas: Rectangle[],
  primary: Rectangle
): InitialBounds {
  const { x, y } = state
  const saved = { x: x ?? 0, y: y ?? 0, width: state.width, height: state.height }
  let area: Rectangle | undefined
  if (x !== null && y !== null) {
    let largest = 0
    for (const candidate of workAreas) {
      const overlap = overlapArea(saved, candidate)
      if (overlap > largest) {
        largest = overlap
        area = candidate
      }
    }
  }

  // Electron rejects bounds that are not whole numbers.
  const fit = area ?? primary
  const width = Math.round(Math.min(saved.width, fit.width))
  const height = Math.round(Math.min(saved.height, fit.height))
  if (!area) return { width, height }
  return {
    x: Math.round(clamp(saved.x, area.x, area.x + area.width - width)),
    y: Math.round(clamp(saved.y, area.y, area.y + area.height - height)),
    width,
    height
  }
}
