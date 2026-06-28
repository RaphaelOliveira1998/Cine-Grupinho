import { describe, expect, it } from 'vitest'
import { currentWeekStart, weekEnd, isWithinWeek, nextWeekStart } from '@/lib/week'

// BRT is UTC-3. Monday 00:00 BRT == Monday 03:00 UTC.

describe('currentWeekStart', () => {
  it('returns Monday 03:00 UTC for a midweek instant', () => {
    // Wednesday 2026-06-24 12:00 BRT -> 15:00 UTC
    const now = new Date('2026-06-24T15:00:00.000Z')
    const start = currentWeekStart(now)
    // Monday 2026-06-22 00:00 BRT == 03:00 UTC
    expect(start.toISOString()).toBe('2026-06-22T03:00:00.000Z')
  })

  it('treats Monday 00:00 BRT as the start of its own week', () => {
    const monday = new Date('2026-06-22T03:00:00.000Z')
    expect(currentWeekStart(monday).toISOString()).toBe('2026-06-22T03:00:00.000Z')
  })

  it('keeps Sunday 23:59 BRT in the same week', () => {
    // Sunday 2026-06-28 23:59 BRT -> Monday 2026-06-29 02:59 UTC
    const sundayLate = new Date('2026-06-29T02:59:00.000Z')
    expect(currentWeekStart(sundayLate).toISOString()).toBe('2026-06-22T03:00:00.000Z')
  })

  it('rolls over to the next week exactly at Monday 00:00 BRT', () => {
    const nextMonday = new Date('2026-06-29T03:00:00.000Z')
    expect(currentWeekStart(nextMonday).toISOString()).toBe('2026-06-29T03:00:00.000Z')
  })

  it('just before Monday 00:00 BRT still belongs to the previous week', () => {
    const justBefore = new Date('2026-06-29T02:59:59.999Z')
    expect(currentWeekStart(justBefore).toISOString()).toBe('2026-06-22T03:00:00.000Z')
  })
})

describe('weekEnd', () => {
  it('closes on Sunday 19:00 BRT (6 days + 19 hours after Monday start)', () => {
    // Week starting Monday 2026-06-22 00:00 BRT (03:00 UTC)
    const start = currentWeekStart(new Date('2026-06-24T15:00:00.000Z'))
    // Sunday 2026-06-28 19:00 BRT == 22:00 UTC
    expect(weekEnd(start).toISOString()).toBe('2026-06-28T22:00:00.000Z')
  })
})

describe('isWithinWeek', () => {
  it('includes the start instant', () => {
    const start = new Date('2026-06-22T03:00:00.000Z')
    expect(isWithinWeek(start, start)).toBe(true)
  })

  it('includes a midweek instant (Sunday 17:00 BRT)', () => {
    const start = new Date('2026-06-22T03:00:00.000Z')
    // Sunday 2026-06-28 17:00 BRT == 20:00 UTC (2h before deadline)
    expect(isWithinWeek(start, new Date('2026-06-28T20:00:00.000Z'))).toBe(true)
  })

  it('excludes the exact end instant (Sunday 19:00 BRT)', () => {
    const start = new Date('2026-06-22T03:00:00.000Z')
    expect(isWithinWeek(start, weekEnd(start))).toBe(false)
  })

  it('excludes Sunday after 19:00 BRT (cycle already closed)', () => {
    const start = new Date('2026-06-22T03:00:00.000Z')
    // Sunday 2026-06-28 20:00 BRT == 23:00 UTC
    expect(isWithinWeek(start, new Date('2026-06-28T23:00:00.000Z'))).toBe(false)
  })
})

describe('nextWeekStart', () => {
  it('returns the Monday after the current week start', () => {
    const now = new Date('2026-06-24T15:00:00.000Z')
    expect(nextWeekStart(now).toISOString()).toBe('2026-06-29T03:00:00.000Z')
  })

  it('from Monday itself, next week starts 7 days later', () => {
    const monday = new Date('2026-06-22T03:00:00.000Z')
    expect(nextWeekStart(monday).toISOString()).toBe('2026-06-29T03:00:00.000Z')
  })

  it('is always exactly 7 days after currentWeekStart', () => {
    const now = new Date('2026-06-26T10:00:00.000Z')
    const expected = new Date(currentWeekStart(now).getTime() + 7 * 24 * 60 * 60 * 1000)
    expect(nextWeekStart(now).toISOString()).toBe(expected.toISOString())
  })
})
