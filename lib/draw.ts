// Fair-rotation draw for the weekly chooser.
// Picks randomly among the members who have been chosen the fewest times,
// so everyone takes a turn before anyone repeats.

export type DrawMember = { userId: string }

/**
 * Selects the next chooser among `members`, preferring those with the lowest
 * prior selection count. `counts` maps userId -> number of past selections.
 * `random` defaults to Math.random and can be injected for testing.
 */
export function pickChooser(
  members: DrawMember[],
  counts: Record<string, number>,
  random: () => number = Math.random
): string | null {
  if (members.length === 0) return null
  let minCount = Infinity
  for (const member of members) {
    const count = counts[member.userId] ?? 0
    if (count < minCount) minCount = count
  }
  const candidates = members.filter((member) => (counts[member.userId] ?? 0) === minCount)
  const index = Math.floor(random() * candidates.length)
  return candidates[Math.min(index, candidates.length - 1)].userId
}
