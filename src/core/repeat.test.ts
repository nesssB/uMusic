import { describe, expect, it } from 'vitest'
import { nextRepeatMode, parseRepeatAttribute, repeatPresses } from './repeat'

describe('parseRepeatAttribute', () => {
  it.each([
    ['NONE', 'none'],
    ['ALL', 'all'],
    ['ONE', 'one']
  ])('reads %s as %s', (value, mode) => {
    expect(parseRepeatAttribute(value)).toBe(mode)
  })

  it.each([
    ['missing', null],
    ['empty', ''],
    ['lowercase', 'all'],
    ['unknown', 'SHUFFLE'],
    ['an Object.prototype key', 'constructor']
  ])('rejects an attribute that is %s', (_, value) => {
    expect(parseRepeatAttribute(value)).toBeNull()
  })
})

describe('nextRepeatMode', () => {
  it('steps through the modes like the button does', () => {
    expect(nextRepeatMode('none')).toBe('all')
    expect(nextRepeatMode('all')).toBe('one')
    expect(nextRepeatMode('one')).toBe('none')
  })
})

describe('repeatPresses', () => {
  it('needs no presses to stay on the same mode', () => {
    expect(repeatPresses('all', 'all')).toBe(0)
  })

  it.each([
    ['none', 'all', 1],
    ['none', 'one', 2],
    ['all', 'one', 1],
    ['all', 'none', 2],
    ['one', 'none', 1],
    ['one', 'all', 2]
  ] as const)('takes %s to %s in %i presses', (from, to, presses) => {
    expect(repeatPresses(from, to)).toBe(presses)
  })
})
