import { describe, expect, it } from 'vitest'
import { describeTrack, parseMediaState } from './media'

describe('parseMediaState', () => {
  it('accepts a state with a track', () => {
    const state = {
      track: { title: 'Song', artist: 'Band' },
      playing: true,
      repeat: 'all',
      liked: true
    }
    expect(parseMediaState(state)).toEqual(state)
  })

  it('accepts a state without a track', () => {
    expect(parseMediaState({ track: null, playing: false, repeat: 'none', liked: false })).toEqual({
      track: null,
      playing: false,
      repeat: 'none',
      liked: false
    })
  })

  it('accepts a state without a repeat mode or a like', () => {
    const state = { track: null, playing: false, repeat: null, liked: null }
    expect(parseMediaState(state)).toEqual(state)
  })

  it('drops fields it does not know', () => {
    const state = {
      track: { title: 'Song', artist: 'Band', album: 'LP' },
      playing: true,
      repeat: 'one',
      liked: false,
      extra: 1
    }
    expect(parseMediaState(state)).toEqual({
      track: { title: 'Song', artist: 'Band' },
      playing: true,
      repeat: 'one',
      liked: false
    })
  })

  it.each([
    ['not an object', 'playing'],
    ['null', null],
    ['missing playing', { track: null, repeat: null, liked: null }],
    ['playing not a boolean', { track: null, playing: 'yes', repeat: null, liked: null }],
    ['missing track', { playing: true, repeat: null, liked: null }],
    ['track not an object', { track: 'Song', playing: true, repeat: null, liked: null }],
    [
      'title not a string',
      { track: { title: 1, artist: 'Band' }, playing: true, repeat: null, liked: null }
    ],
    ['artist missing', { track: { title: 'Song' }, playing: true, repeat: null, liked: null }],
    ['missing repeat', { track: null, playing: true, liked: null }],
    ['an unknown repeat mode', { track: null, playing: true, repeat: 'ALL', liked: null }],
    ['missing liked', { track: null, playing: true, repeat: null }],
    ['liked not a boolean', { track: null, playing: true, repeat: null, liked: 'LIKE' }]
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
