import { describe, expect, it } from 'vitest'
import { pickChooser } from '@/lib/draw'

const members = [{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }]

describe('pickChooser', () => {
  it('returns null when there are no members', () => {
    expect(pickChooser([], {})).toBeNull()
  })

  it('picks the only member who has never been chosen', () => {
    const counts = { a: 2, b: 2, c: 0 }
    expect(pickChooser(members, counts, () => 0)).toBe('c')
  })

  it('only ever picks among the least-chosen members', () => {
    const counts = { a: 1, b: 1, c: 3 }
    // c has the highest count, so it must never be selected regardless of random.
    for (const r of [0, 0.49, 0.5, 0.99]) {
      expect(pickChooser(members, counts, () => r)).not.toBe('c')
    }
  })

  it('treats missing counts as zero', () => {
    const counts = { a: 1 }
    // b and c are at 0 (lowest); a is excluded.
    expect(pickChooser(members, counts, () => 0)).toBe('b')
    expect(pickChooser(members, counts, () => 0.99)).toBe('c')
  })

  it('distributes across all candidates when counts are equal', () => {
    const seen = new Set<string>()
    for (const r of [0, 0.34, 0.67]) {
      const picked = pickChooser(members, {}, () => r)
      if (picked) seen.add(picked)
    }
    expect(seen.size).toBe(3)
  })
})
