import { describe, expect, it } from 'vitest'
import { formatRatingStars } from '@/lib/ratings'

describe('formatRatingStars', () => {
  it('formats rated members with five-star scale', () => {
    expect(formatRatingStars(4)).toBe('★★★★☆ 4/5')
  })

  it('shows pending label when member did not rate', () => {
    expect(formatRatingStars(null)).toBe('Ainda não avaliou')
  })
})
