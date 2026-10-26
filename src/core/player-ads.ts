// The globals the filter patches. In the page this is `window`; tests pass a
// stand-in so the real globals stay untouched.
export interface PlayerAdScope {
  JSON: JSON
  Response?: { prototype: { json: () => Promise<unknown> } }
}

// The player decides which ads to play from the player response. Removing the
// ad fields before it reads the response means it never asks for them.
//
// The preload sends this function's source to the page, so it must not use
// anything from outside its own body: no imports, no module constants.
export function installPlayerAdFilter(
  scope: PlayerAdScope = globalThis as unknown as PlayerAdScope
): void {
  const AD_FIELDS = ['adPlacements', 'playerAds', 'adSlots']

  const removeAdFields = (data: unknown): void => {
    if (typeof data !== 'object' || data === null) return
    for (const field of AD_FIELDS) delete (data as Record<string, unknown>)[field]
  }

  // The player response comes on its own from /youtubei/v1/player, or
  // wrapped in `playerResponse` by other endpoints and the page data.
  const removeAds = <T>(data: T): T => {
    removeAdFields(data)
    if (typeof data === 'object' && data !== null) {
      removeAdFields((data as Record<string, unknown>).playerResponse)
    }
    return data
  }

  const parse = scope.JSON.parse
  scope.JSON.parse = function (this: JSON, ...args: Parameters<JSON['parse']>) {
    return removeAds(parse.apply(this, args))
  }

  const json = scope.Response?.prototype.json
  if (scope.Response && json) {
    scope.Response.prototype.json = function (this: unknown) {
      return json.call(this).then(removeAds)
    }
  }

  // Full page loads embed the first player response in the HTML.
  let initialPlayerResponse: unknown
  Object.defineProperty(scope, 'ytInitialPlayerResponse', {
    configurable: true,
    get: () => initialPlayerResponse,
    set: (value) => {
      initialPlayerResponse = removeAds(value)
    }
  })
}
