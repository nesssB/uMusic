import { describe, expect, it } from 'vitest'
import { installPlayerAdFilter, PlayerAdScope } from './player-ads'

class FakeResponse {
  constructor(private readonly body: string) {}

  json(): Promise<unknown> {
    return Promise.resolve(JSON.parse(this.body))
  }
}

type Scope = PlayerAdScope & { Response: typeof FakeResponse; ytInitialPlayerResponse?: unknown }

function createScope(): Scope {
  const json = { parse: JSON.parse, stringify: JSON.stringify } as JSON
  // A fresh class per scope, so patching its prototype does not leak.
  return { JSON: json, Response: class extends FakeResponse {} }
}

const playerResponse = {
  videoDetails: { videoId: 'abc' },
  streamingData: { adaptiveFormats: [] },
  adPlacements: [{ adPlacementRenderer: {} }],
  playerAds: [{ playerLegacyDesktopWatchAdsRenderer: {} }],
  adSlots: [{ adSlotRenderer: {} }]
}

const withoutAds = {
  videoDetails: { videoId: 'abc' },
  streamingData: { adaptiveFormats: [] }
}

describe('installPlayerAdFilter', () => {
  it('removes the ads from player responses read with JSON.parse', () => {
    const scope = createScope()
    installPlayerAdFilter(scope)

    expect(scope.JSON.parse(JSON.stringify(playerResponse))).toEqual(withoutAds)
  })

  it('removes the ads from player responses read with Response.json', async () => {
    const scope = createScope()
    installPlayerAdFilter(scope)

    const response = new scope.Response(JSON.stringify(playerResponse))
    expect(await response.json()).toEqual(withoutAds)
  })

  it('removes the ads from a wrapped player response', () => {
    const scope = createScope()
    installPlayerAdFilter(scope)

    const wrapped = { playerResponse, endpoint: {} }
    expect(scope.JSON.parse(JSON.stringify(wrapped))).toEqual({
      playerResponse: withoutAds,
      endpoint: {}
    })
  })

  it('removes the ads from the player response embedded in the page', () => {
    const scope = createScope()
    installPlayerAdFilter(scope)

    scope.ytInitialPlayerResponse = structuredClone(playerResponse)
    expect(scope.ytInitialPlayerResponse).toEqual(withoutAds)
  })

  it('leaves everything else as it was', () => {
    const scope = createScope()
    installPlayerAdFilter(scope)

    expect(scope.JSON.parse('{"contents":{"items":[1,2]}}')).toEqual({
      contents: { items: [1, 2] }
    })
    expect(scope.JSON.parse('[1,2]')).toEqual([1, 2])
    expect(scope.JSON.parse('"text"')).toBe('text')
    expect(scope.JSON.parse('null')).toBeNull()
    expect(scope.JSON.parse('{"a":1}', (key, value) => (key === 'a' ? 2 : value))).toEqual({
      a: 2
    })
  })

  it('still works when sent to the page as source code', () => {
    // Electron serializes the function, so anything it used from the module
    // would be missing in the page.
    const serialized = new Function(`return (${installPlayerAdFilter.toString()})`)()
    const scope = createScope()
    serialized(scope)

    expect(scope.JSON.parse(JSON.stringify(playerResponse))).toEqual(withoutAds)
  })
})
