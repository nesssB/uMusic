import { describe, expect, it } from 'vitest'
import { fitWindowBounds } from './window-state'

// A 1080p screen with a 40px panel at the bottom, and a second screen to its
// left with a 32px panel at the top.
const primary = { x: 0, y: 0, width: 1920, height: 1040 }
const left = { x: -1280, y: 32, width: 1280, height: 992 }
const workAreas = [primary, left]

const placed = { x: 100, y: 50, width: 1200, height: 800, maximized: false }

describe('fitWindowBounds', () => {
  it('keeps a window that fits on its screen as it is', () => {
    expect(fitWindowBounds(placed, workAreas, primary)).toEqual({
      x: 100,
      y: 50,
      width: 1200,
      height: 800
    })
    const onLeft = { ...placed, x: -1200, y: 100 }
    expect(fitWindowBounds(onLeft, workAreas, primary)).toEqual({
      x: -1200,
      y: 100,
      width: 1200,
      height: 800
    })
  })

  it('leaves a window that has not been placed to the OS', () => {
    const unplaced = { ...placed, x: null, y: null }
    expect(fitWindowBounds(unplaced, workAreas, primary)).toEqual({ width: 1200, height: 800 })
  })

  it('leaves a window on a screen that is gone to the OS', () => {
    const offScreen = { ...placed, x: 3000, y: 50 }
    expect(fitWindowBounds(offScreen, workAreas, primary)).toEqual({ width: 1200, height: 800 })
  })

  it('shrinks a window bigger than the screen to fit', () => {
    const big = { ...placed, x: null, y: null, width: 2560, height: 1440 }
    expect(fitWindowBounds(big, workAreas, primary)).toEqual({ width: 1920, height: 1040 })
    const bigOnLeft = { ...big, x: -1500, y: 0 }
    expect(fitWindowBounds(bigOnLeft, workAreas, primary)).toEqual({
      x: -1280,
      y: 32,
      width: 1280,
      height: 992
    })
  })

  it('moves a window partly off its screen fully onto it', () => {
    expect(fitWindowBounds({ ...placed, x: 1500, y: 600 }, workAreas, primary)).toEqual({
      x: 720,
      y: 240,
      width: 1200,
      height: 800
    })
    // Its title bar was under the top panel of the left screen.
    expect(fitWindowBounds({ ...placed, x: -1250, y: 0 }, workAreas, primary)).toEqual({
      x: -1250,
      y: 32,
      width: 1200,
      height: 800
    })
  })

  it('places a window across two screens on the one it covers most', () => {
    const across = { ...placed, x: -900, y: 100 }
    expect(fitWindowBounds(across, workAreas, primary)).toMatchObject({ x: -1200 })
    const mostlyRight = { ...placed, x: -300, y: 100 }
    expect(fitWindowBounds(mostlyRight, workAreas, primary)).toMatchObject({ x: 0 })
  })

  it('rounds the bounds to whole pixels', () => {
    const fractional = { ...placed, x: 100.4, y: 50.6, width: 1200.5, height: 799.5 }
    expect(fitWindowBounds(fractional, workAreas, primary)).toEqual({
      x: 100,
      y: 51,
      width: 1201,
      height: 800
    })
  })
})
