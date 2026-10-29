import { describe, expect, it } from 'vitest'
import { describeTrack, parseMediaState } from './media'

describe('parseMediaState', () => {
  it('accepts a state with a track', () => {
    const state = { track: { title: 'Song', artist: 'Band' }, playing: true, repeat: 'all' }
    expect(parseMediaState(state)).toEqual(state)
  })

  it('accepts a state without a track', () => {
    expect(parseMediaState({ track: null, playing: false, repeat: 'none' })).toEqual({
      track: null,
      playing: false,
      repeat: 'none'
    })
  })

  it('accepts a state without a repeat mode', () => {
    const state = { track: null, playing: false, repeat: null }
    expect(parseMediaState(state)).toEqual(state)
  })

  it('drops fields it does not know', () => {
    const state = {
      track: { title: 'Song', artist: 'Band', album: 'LP' },
      playing: true,
      repeat: 'one',
      extra: 1
    }
    expect(parseMediaState(state)).toEqual({
      track: { title: 'Song', artist: 'Band' },
      playing: true,
      repeat: 'one'
    })
  })

  it.each([
    ['not an object', 'playing'],
    ['null', null],
    ['missing playing', { track: null, repeat: null }],
    ['playing not a boolean', { track: null, playing: 'yes', repeat: null }],
    ['missing track', { playing: true, repeat: null }],
    ['track not an object', { track: 'Song', playing: true, repeat: null }],
    ['title not a string', { track: { title: 1, artist: 'Band' }, playing: true, repeat: null }],
    ['artist missing', { track: { title: 'Song' }, playing: true, repeat: null }],
    ['missing repeat', { track: null, playing: true }],
    ['an unknown repeat mode', { track: null, playing: true, repeat: 'ALL' }]
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
