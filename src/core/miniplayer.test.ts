import { describe, expect, it } from 'vitest'
import { HIDE_MINIPLAYER_CSS } from './miniplayer'

describe('HIDE_MINIPLAYER_CSS', () => {
  it('only targets the player in the miniplayer state', () => {
    const selectors = HIDE_MINIPLAYER_CSS.slice(0, HIDE_MINIPLAYER_CSS.indexOf('{'))
      .split(',')
      .map((selector) => selector.trim())
    expect(selectors).toHaveLength(2)
    for (const selector of selectors) {
      expect(selector).toMatch(/^ytmusic-app-layout\[player-ui-state_?='MINIPLAYER'\] #player$/)
    }
  })

  it('hides the player without taking it out of the layout', () => {
    expect(HIDE_MINIPLAYER_CSS).toContain('visibility: hidden')
    expect(HIDE_MINIPLAYER_CSS).not.toContain('display')
  })
})
