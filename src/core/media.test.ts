import { describe, expect, it } from 'vitest'
import { describeTrack, parseMediaState } from './media'

describe('parseMediaState', () => {
  it('accepts a state with a track', () => {
    const state = { track: { title: 'Song', artist: 'Band' }, playing: true }
    expect(parseMediaState(state)).toEqual(state)
  })

  it('accepts a state without a track', () => {
    expect(parseMediaState({ track: null, playing: false })).toEqual({
      track: null,
      playing: false
    })
  })

  it('drops fields it does not know', () => {
    const state = { track: { title: 'Song', artist: 'Band', album: 'LP' }, playing: true, extra: 1 }
    expect(parseMediaState(state)).toEqual({
      track: { title: 'Song', artist: 'Band' },
      playing: true
    })
  })

  it.each([
    ['not an object', 'playing'],
    ['null', null],
    ['missing playing', { track: null }],
    ['playing not a boolean', { track: null, playing: 'yes' }],
    ['missing track', { playing: true }],
    ['track not an object', { track: 'Song', playing: true }],
    ['title not a string', { track: { title: 1, artist: 'Band' }, playing: true }],
    ['artist missing', { track: { title: 'Song' }, playing: true }]
  ])('rejects a state with %s', (_, value) => {
    expect(parseMediaState(value)).toBeNull()
  })
})

describe('describeTrack', () => {
  it('joins the title and the artist', () => {
    expect(describeTrack({ title: 'Song', artist: 'Band' })).toBe('Song — Band')
  })

  it('leaves out an empty artist', () => {
    expect(describeTrack({ title: 'Song', artist: '' })).toBe('Song')
  })

  it('leaves out an empty title', () => {
    expect(describeTrack({ title: '', artist: 'Band' })).toBe('Band')
  })
})
