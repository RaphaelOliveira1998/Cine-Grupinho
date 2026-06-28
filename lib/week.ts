// Weekly cycle time helpers for Beckflix.
// A "week" starts Monday 00:00 BRT (America/Sao_Paulo, fixed UTC-3).
// A cycle's active window closes at Sunday 19:00 BRT (6 days + 19 hours after
// the Monday start). Brazil has no daylight saving since 2019, so UTC-3 is constant.

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000 // UTC-3
const WEEK_MS = 7 * 24 * 60 * 60 * 1000
// Mon 00:00 BRT → Sun 19:00 BRT = 6 days + 19 hours
const WEEK_ACTIVE_MS = (6 * 24 + 19) * 60 * 60 * 1000

/**
 * Returns the start of the current week (Monday 00:00 BRT) as a UTC Date,
 * for the given reference instant.
 */
export function currentWeekStart(now: Date = new Date()): Date {
  // Shift into BRT-local space so day/time math is in Brasília terms.
  const brtNow = new Date(now.getTime() - BRT_OFFSET_MS)
  const day = brtNow.getUTCDay() // 0 = Sunday ... 1 = Monday
  const daysSinceMonday = (day + 6) % 7
  const brtMidnight = Date.UTC(
    brtNow.getUTCFullYear(),
    brtNow.getUTCMonth(),
    brtNow.getUTCDate() - daysSinceMonday,
    0,
    0,
    0,
    0
  )
  // Convert the BRT-local midnight back to a real UTC instant.
  return new Date(brtMidnight + BRT_OFFSET_MS)
}

/**
 * Returns the end of the active window for a given week start:
 * Sunday 19:00 BRT (6 days and 19 hours after Monday 00:00 BRT).
 */
export function weekEnd(weekStart: Date): Date {
  return new Date(weekStart.getTime() + WEEK_ACTIVE_MS)
}

/**
 * Returns the rating deadline for a cycle: Sunday 19:00 BRT.
 */
export function ratingDeadline(weekStart: Date): Date {
  return weekEnd(weekStart)
}

/** True when `now` falls within the [weekStart, weekEnd) interval. */
export function isWithinWeek(weekStart: Date, now: Date = new Date()): boolean {
  const start = weekStart.getTime()
  const end = weekEnd(weekStart).getTime()
  const t = now.getTime()
  return t >= start && t < end
}

/** Returns the start of the next week (next Monday 00:00 BRT) as a UTC Date. */
export function nextWeekStart(now: Date = new Date()): Date {
  return new Date(currentWeekStart(now).getTime() + WEEK_MS)
}
