// Weekly cycle time helpers for Beckflix.
// A cycle runs from Sunday 19:30 BRT to the following Sunday 19:00 BRT
// (6 days, 23 hours, 30 minutes). A 30-minute gap (19:00–19:30) on Sunday
// separates the end of one cycle from the start of the next, giving the
// group owner time to draw the next week's chooser.
// Brazil has no daylight saving since 2019, so UTC-3 is constant.

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000 // UTC-3
const WEEK_MS = 7 * 24 * 60 * 60 * 1000
// Sun 19:30 BRT → Sun 19:00 BRT = 7 days - 30 minutes
const WEEK_ACTIVE_MS = WEEK_MS - 30 * 60 * 1000
// Cycles start at 19:30 BRT = 1170 minutes past midnight
const WEEK_START_MINUTES_BRT = 19 * 60 + 30

/**
 * Returns the start of the current cycle (Sunday 19:30 BRT) as a UTC Date.
 * Before Sunday 19:30 BRT, returns the previous Sunday's 19:30 BRT.
 */
export function currentWeekStart(now: Date = new Date()): Date {
  // Shift into BRT-local space so day/time math is in Brasília terms.
  const brtNow = new Date(now.getTime() - BRT_OFFSET_MS)
  const day = brtNow.getUTCDay() // 0 = Sunday
  const brtMinutes = brtNow.getUTCHours() * 60 + brtNow.getUTCMinutes()

  // How many days back is the most recent Sunday 19:30 BRT?
  // Sunday at/after 19:30 → 0 days ago (this Sunday)
  // Sunday before 19:30  → 7 days ago (last Sunday)
  // Mon–Sat              → day index days ago
  const isAfterCutoff = day === 0 && brtMinutes >= WEEK_START_MINUTES_BRT
  const daysAgo = isAfterCutoff ? 0 : day === 0 ? 7 : day

  // Build that Sunday at 19:30 in BRT-local space, then convert back to UTC.
  const brtSunday1930 = Date.UTC(
    brtNow.getUTCFullYear(),
    brtNow.getUTCMonth(),
    brtNow.getUTCDate() - daysAgo,
    19, 30, 0, 0
  )
  return new Date(brtSunday1930 + BRT_OFFSET_MS)
}

/**
 * Returns the end of the active window for a given cycle start:
 * Sunday 19:00 BRT (6 days and 23.5 hours after Sunday 19:30 BRT).
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

/** Returns the start of the next cycle (next Sunday 19:30 BRT). */
export function nextWeekStart(now: Date = new Date()): Date {
  return new Date(currentWeekStart(now).getTime() + WEEK_MS)
}
