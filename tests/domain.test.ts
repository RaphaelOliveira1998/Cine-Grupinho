import { describe, expect, it } from 'vitest'
import { createInviteCode } from '@/lib/invite'
import { ratingSchema } from '@/lib/validators'

describe('invite codes', () => {
  it('creates short uppercase codes', () => {
    expect(createInviteCode()).toMatch(/^[A-Z0-9]{8}$/)
  })
})

describe('rating validation', () => {
  it('accepts stars from 1 to 5', () => {
    expect(ratingSchema.parse({ stars: 5 }).stars).toBe(5)
  })

  it('rejects ratings outside the allowed range', () => {
    expect(() => ratingSchema.parse({ stars: 6 })).toThrow()
  })
})
