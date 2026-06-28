import { describe, expect, it } from 'vitest'
import { currentWeekStart, weekEnd, isWithinWeek, nextWeekStart } from '@/lib/week'

// BRT is UTC-3. Cycles start Sunday 19:30 BRT = Sunday 22:30 UTC.
// Cycles end   Sunday 19:00 BRT = Sunday 22:00 UTC (following week).
// 30-minute gap (19:00–19:30 BRT) separates end of one cycle from the next.

// Reference cycle used across tests:
//   Start : Sunday 2026-06-28 19:30 BRT = 2026-06-28T22:30:00.000Z
//   End   : Sunday 2026-07-05 19:00 BRT = 2026-07-05T22:00:00.000Z
//   Next  : Sunday 2026-07-05 19:30 BRT = 2026-07-05T22:30:00.000Z

describe('currentWeekStart', () => {
  it('returns the current Sunday 19:30 BRT for a midweek instant', () => {
    // Wednesday 2026-07-01 12:00 BRT = 15:00 UTC
    const now = new Date('2026-07-01T15:00:00.000Z')
    expect(currentWeekStart(now).toISOString()).toBe('2026-06-28T22:30:00.000Z')
  })

  it('returns the same Sunday when called at exactly 19:30 BRT', () => {
    const start = new Date('2026-06-28T22:30:00.000Z')
    expect(currentWeekStart(start).toISOString()).toBe('2026-06-28T22:30:00.000Z')
  })

  it('returns the previous Sunday when called before 19:30 BRT on Sunday', () => {
    // Sunday 2026-06-28 18:00 BRT = 21:00 UTC — still in previous cycle
    const beforeCutoff = new Date('2026-06-28T21:00:00.000Z')
    expect(currentWeekStart(beforeCutoff).toISOString()).toBe('2026-06-21T22:30:00.000Z')
  })

  it('returns the current Sunday when called after 19:30 BRT on Sunday', () => {
    // Sunday 2026-06-28 20:00 BRT = 23:00 UTC
    const afterCutoff = new Date('2026-06-28T23:00:00.000Z')
    expect(currentWeekStart(afterCutoff).toISOString()).toBe('2026-06-28T22:30:00.000Z')
  })

  it('returns last Sunday 19:30 BRT on a Saturday', () => {
    // Saturday 2026-07-04 23:00 BRT = 2026-07-05T02:00:00.000Z
    const saturday = new Date('2026-07-05T02:00:00.000Z')
    expect(currentWeekStart(saturday).toISOString()).toBe('2026-06-28T22:30:00.000Z')
  })

  it('returns last Sunday 19:30 BRT on a Monday', () => {
    // Monday 2026-06-29 08:00 BRT = 11:00 UTC
    const monday = new Date('2026-06-29T11:00:00.000Z')
    expect(currentWeekStart(monday).toISOString()).toBe('2026-06-28T22:30:00.000Z')
  })

  it('rolls over exactly at Sunday 19:30 BRT — one minute before stays in old cycle', () => {
    const justBefore = new Date('2026-06-28T22:29:00.000Z')
    expect(currentWeekStart(justBefore).toISOString()).toBe('2026-06-21T22:30:00.000Z')
  })
})

describe('weekEnd', () => {
  it('closes on Sunday 19:00 BRT (7 days minus 30 minutes after the start)', () => {
    const start = new Date('2026-06-28T22:30:00.000Z')
    // Sunday 2026-07-05 19:00 BRT = 22:00 UTC
    expect(weekEnd(start).toISOString()).toBe('2026-07-05T22:00:00.000Z')
  })
})

describe('isWithinWeek', () => {
  const start = new Date('2026-06-28T22:30:00.000Z')

  it('includes the exact start instant', () => {
    expect(isWithinWeek(start, start)).toBe(true)
  })

  it('includes a midweek instant (Wednesday)', () => {
    // Wednesday 2026-07-01 12:00 BRT = 15:00 UTC
    expect(isWithinWeek(start, new Date('2026-07-01T15:00:00.000Z'))).toBe(true)
  })

  it('includes one minute before the cycle ends (Sunday 18:59 BRT)', () => {
    // Sunday 2026-07-05 18:59 BRT = 21:59 UTC
    expect(isWithinWeek(start, new Date('2026-07-05T21:59:00.000Z'))).toBe(true)
  })

  it('excludes the exact end instant (Sunday 19:00 BRT)', () => {
    expect(isWithinWeek(start, weekEnd(start))).toBe(false)
  })

  it('excludes the 30-minute gap (Sunday 19:15 BRT, between cycles)', () => {
    // Sunday 2026-07-05 19:15 BRT = 22:15 UTC
    expect(isWithinWeek(start, new Date('2026-07-05T22:15:00.000Z'))).toBe(false)
  })

  it('excludes an instant before the cycle started', () => {
    // One minute before start
    expect(isWithinWeek(start, new Date('2026-06-28T22:29:00.000Z'))).toBe(false)
  })
})

describe('nextWeekStart', () => {
  it('returns the next Sunday 19:30 BRT from a midweek instant', () => {
    // Wednesday 2026-07-01 15:00 UTC → next Sunday = 2026-07-05T22:30:00.000Z
    const now = new Date('2026-07-01T15:00:00.000Z')
    expect(nextWeekStart(now).toISOString()).toBe('2026-07-05T22:30:00.000Z')
  })

  it('from exactly the cycle start, next week is 7 days later', () => {
    const start = new Date('2026-06-28T22:30:00.000Z')
    expect(nextWeekStart(start).toISOString()).toBe('2026-07-05T22:30:00.000Z')
  })

  it('is always exactly 7 days after currentWeekStart', () => {
    const now = new Date('2026-07-02T10:00:00.000Z')
    const expected = new Date(currentWeekStart(now).getTime() + 7 * 24 * 60 * 60 * 1000)
    expect(nextWeekStart(now).toISOString()).toBe(expected.toISOString())
  })
})
