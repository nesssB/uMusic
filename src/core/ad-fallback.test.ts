import { describe, expect, it } from 'vitest'
import { AdPlayer, createAdFallback } from './ad-fallback'

class FakePlayer implements AdPlayer {
  adShowing = false
  muted = false
  skipClicks = 0
  skipsToEnd = 0

  isAdShowing(): boolean {
    return this.adShowing
  }

  isMuted(): boolean {
    return this.muted
  }

  setMuted(muted: boolean): void {
    this.muted = muted
  }

  clickSkipButton(): void {
    this.skipClicks++
  }

  skipToEnd(): void {
    this.skipsToEnd++
  }
}

function setUp(): { player: FakePlayer; update: () => void } {
  const player = new FakePlayer()
  return { player, update: createAdFallback(player) }
}

describe('createAdFallback', () => {
  it('does nothing while there is no ad', () => {
    const { player, update } = setUp()

    update()

    expect(player).toMatchObject({ muted: false, skipClicks: 0, skipsToEnd: 0 })
  })

  it('mutes the ad, presses "Skip" and jumps to its end', () => {
    const { player, update } = setUp()

    player.adShowing = true
    update()

    expect(player).toMatchObject({ muted: true, skipClicks: 1, skipsToEnd: 1 })
  })

  it('keeps trying while the ad is still showing', () => {
    const { player, update } = setUp()

    player.adShowing = true
    update()
    update()

    expect(player).toMatchObject({ muted: true, skipClicks: 2, skipsToEnd: 2 })
  })

  it('turns the sound back on when the ad is over', () => {
    const { player, update } = setUp()

    player.adShowing = true
    update()
    update()
    player.adShowing = false
    update()

    expect(player.muted).toBe(false)
  })

  it('leaves the player muted if the user had muted it', () => {
    const { player, update } = setUp()

    player.muted = true
    player.adShowing = true
    update()
    player.adShowing = false
    update()

    expect(player.muted).toBe(true)
  })

  it('does not touch the sound after the ad is over', () => {
    const { player, update } = setUp()

    player.adShowing = true
    update()
    player.adShowing = false
    update()
    player.muted = true
    update()

    expect(player.muted).toBe(true)
  })

  it('saves the sound again for the next ad', () => {
    const { player, update } = setUp()

    player.adShowing = true
    update()
    player.adShowing = false
    update()

    player.muted = true
    player.adShowing = true
    update()
    player.adShowing = false
    update()

    expect(player.muted).toBe(true)
  })
})
