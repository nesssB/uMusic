// When a video plays and the user leaves the player page, YT Music shrinks
// the player into a small window over the bottom corner. The layout marks
// that state on its `player-ui-state` attribute; older builds reflect it as
// `player-ui-state_`, so both are matched.
//
// The player is made invisible rather than removed: `display: none` would
// detach the video from the layout and can stop playback, while
// `visibility: hidden` leaves it playing and also lets clicks through to the
// page below. Opening the player page from the player bar changes the state,
// so the full player shows as usual.
export const HIDE_MINIPLAYER_CSS = `
ytmusic-app-layout[player-ui-state='MINIPLAYER'] #player,
ytmusic-app-layout[player-ui-state_='MINIPLAYER'] #player {
  visibility: hidden !important;
}
`
