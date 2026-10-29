import { describe, expect, it } from 'vitest'
import { parseLikeAttribute } from './like'

describe('parseLikeAttribute', () => {
  it('reads LIKE as liked', () => {
    expect(parseLikeAttribute('LIKE')).toBe(true)
  })

  it.each(['DISLIKE', 'INDIFFERENT'])('reads %s as not liked', (value) => {
    expect(parseLikeAttribute(value)).toBe(false)
  })

  it.each([
    ['missing', null],
    ['empty', ''],
    ['lowercase', 'like'],
    ['unknown', 'LOVE'],
    ['an Object.prototype key', 'constructor']
  ])('rejects an attribute that is %s', (_, value) => {
    expect(parseLikeAttribute(value)).toBeNull()
  })
})
