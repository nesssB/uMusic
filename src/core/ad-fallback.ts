// What the fallback needs from the player. The preload implements it on top
// of the page's DOM; tests use a fake.
export interface AdPlayer {
  isAdShowing(): boolean
  isMuted(): boolean
  setMuted(muted: boolean): void
  clickSkipButton(): void
  skipToEnd(): void
}

// For the ads that get past the player response filter: while one is
// showing, mute it, press "Skip" if the button is there and jump to its end.
// Once it is over, the sound goes back to how the user had it.
//
// Returns the function to call whenever the player may have changed.
export function createAdFallback(player: AdPlayer): () => void {
  // Set while an ad is being handled. The fallback mutes the player itself,
  // so the user's choice has to be saved when the ad starts.
  let mutedBeforeAd: boolean | undefined

  return () => {
    if (player.isAdShowing()) {
      mutedBeforeAd ??= player.isMuted()
      player.setMuted(true)
      player.clickSkipButton()
      player.skipToEnd()
    } else if (mutedBeforeAd !== undefined) {
      player.setMuted(mutedBeforeAd)
      mutedBeforeAd = undefined
    }
  }
}
