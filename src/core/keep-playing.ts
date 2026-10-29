// The global the keeper patches. In the page this is `window`; tests pass a
// stand-in so the real global stays untouched.
export interface ActivityScope {
  _lact?: number
}

// The page keeps the time of the user's last click or key press in `_lact`.
// When too long has passed since then, it pauses and asks "Video paused.
// Continue watching?". Reading `_lact` as the current time means the user
// always looks active, and the page's own updates to it are ignored.
//
// The preload sends this function's source to the page, so it must not use
// anything from outside its own body: no imports, no module constants.
export function installActivityKeeper(
  scope: ActivityScope = globalThis as unknown as ActivityScope
): void {
  Object.defineProperty(scope, '_lact', {
    configurable: true,
    get: () => Date.now(),
    set: () => {}
  })
}
