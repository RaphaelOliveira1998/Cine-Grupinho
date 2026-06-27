import { describe, expect, it } from 'vitest'
import {
  loginSchema,
  registerSchema,
  groupSchema,
  updateGroupSchema,
  joinGroupSchema,
  commentSchema,
  searchSchema,
  ratingSchema,
  profileSchema,
} from '@/lib/validators'

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    expect(() => loginSchema.parse({ email: 'user@test.com', password: 'secret123' })).not.toThrow()
  })

  it('rejects invalid email', () => {
    expect(() => loginSchema.parse({ email: 'not-an-email', password: 'secret123' })).toThrow()
  })

  it('rejects password shorter than 6 chars', () => {
    expect(() => loginSchema.parse({ email: 'user@test.com', password: '123' })).toThrow()
  })
})

describe('registerSchema', () => {
  it('accepts valid name, email and password', () => {
    expect(() => registerSchema.parse({ name: 'João', email: 'joao@test.com', password: 'senha123' })).not.toThrow()
  })

  it('rejects name shorter than 2 chars', () => {
    expect(() => registerSchema.parse({ name: 'J', email: 'j@test.com', password: 'senha123' })).toThrow()
  })

  it('rejects name longer than 80 chars', () => {
    expect(() => registerSchema.parse({ name: 'a'.repeat(81), email: 'j@test.com', password: 'senha123' })).toThrow()
  })
})

describe('groupSchema', () => {
  it('accepts minimal valid group', () => {
    const result = groupSchema.parse({ name: 'Cinephiles' })
    expect(result.name).toBe('Cinephiles')
    expect(result.isPublic).toBe(false)
  })

  it('rejects name shorter than 2 chars', () => {
    expect(() => groupSchema.parse({ name: 'A' })).toThrow()
  })

  it('rejects description longer than 240 chars', () => {
    expect(() => groupSchema.parse({ name: 'Grupo', description: 'x'.repeat(241) })).toThrow()
  })

  it('accepts empty accessPin as valid', () => {
    expect(() => groupSchema.parse({ name: 'Grupo', accessPin: '' })).not.toThrow()
  })

  it('rejects accessPin shorter than 4 chars (non-empty)', () => {
    expect(() => groupSchema.parse({ name: 'Grupo', accessPin: '123' })).toThrow()
  })
})

describe('updateGroupSchema', () => {
  it('requires a valid groupId UUID', () => {
    expect(() => updateGroupSchema.parse({ groupId: 'not-a-uuid', name: 'Grupo' })).toThrow()
  })

  it('accepts a valid UUID', () => {
    expect(() => updateGroupSchema.parse({ groupId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Grupo' })).not.toThrow()
  })
})

describe('joinGroupSchema', () => {
  it('transforms the invite code to uppercase', () => {
    const result = joinGroupSchema.parse({ inviteCode: 'abc12345' })
    expect(result.inviteCode).toBe('ABC12345')
  })

  it('trims whitespace from the invite code', () => {
    const result = joinGroupSchema.parse({ inviteCode: '  ABCD1234  ' })
    expect(result.inviteCode).toBe('ABCD1234')
  })

  it('rejects codes shorter than 4 chars', () => {
    expect(() => joinGroupSchema.parse({ inviteCode: 'AB' })).toThrow()
  })
})

describe('ratingSchema', () => {
  it('accepts stars from 1 to 5', () => {
    for (const stars of [1, 2, 3, 4, 5]) {
      expect(ratingSchema.parse({ stars }).stars).toBe(stars)
    }
  })

  it('rejects 0 and 6', () => {
    expect(() => ratingSchema.parse({ stars: 0 })).toThrow()
    expect(() => ratingSchema.parse({ stars: 6 })).toThrow()
  })

  it('coerces string numbers', () => {
    expect(ratingSchema.parse({ stars: '4' }).stars).toBe(4)
  })
})

describe('commentSchema', () => {
  it('accepts a non-empty comment', () => {
    expect(() => commentSchema.parse({ body: 'Ótimo filme!' })).not.toThrow()
  })

  it('rejects empty body', () => {
    expect(() => commentSchema.parse({ body: '' })).toThrow()
  })

  it('rejects body longer than 1000 chars', () => {
    expect(() => commentSchema.parse({ body: 'x'.repeat(1001) })).toThrow()
  })
})

describe('searchSchema', () => {
  it('accepts a valid query', () => {
    expect(() => searchSchema.parse({ q: 'Matrix' })).not.toThrow()
  })

  it('rejects empty query', () => {
    expect(() => searchSchema.parse({ q: '' })).toThrow()
  })

  it('rejects query longer than 120 chars', () => {
    expect(() => searchSchema.parse({ q: 'a'.repeat(121) })).toThrow()
  })
})

// ─── profileSchema ────────────────────────────────────────────────────────────

function validProfile(overrides: object = {}) {
  return { name: 'Beatriz Moretti', username: 'beatriz', favoriteTmdbIds: [], ...overrides }
}

describe('profileSchema — username format', () => {
  it('accepts lowercase letters only', () => {
    expect(profileSchema.parse(validProfile({ username: 'beatriz' })).username).toBe('beatriz')
  })

  it('accepts lowercase letters, numbers and underscore', () => {
    expect(profileSchema.parse(validProfile({ username: 'beatriz_m2' })).username).toBe('beatriz_m2')
  })

  it('lowercases automatically', () => {
    expect(profileSchema.parse(validProfile({ username: 'Rapho' })).username).toBe('rapho')
  })

  it('trims surrounding whitespace before validating', () => {
    expect(profileSchema.parse(validProfile({ username: '  rapho  ' })).username).toBe('rapho')
  })

  it('rejects username with an internal space', () => {
    expect(() => profileSchema.parse(validProfile({ username: 'beatriz moretti' }))).toThrow()
  })

  it('rejects username with a hyphen', () => {
    expect(() => profileSchema.parse(validProfile({ username: 'beatriz-m' }))).toThrow()
  })

  it('rejects username with special characters', () => {
    expect(() => profileSchema.parse(validProfile({ username: 'beatriz@m' }))).toThrow()
  })

  it('rejects username with accented characters', () => {
    expect(() => profileSchema.parse(validProfile({ username: 'ráfael' }))).toThrow()
  })

  it('rejects username shorter than 3 characters', () => {
    expect(() => profileSchema.parse(validProfile({ username: 'ab' }))).toThrow()
  })

  it('rejects username longer than 24 characters', () => {
    expect(() => profileSchema.parse(validProfile({ username: 'a'.repeat(25) }))).toThrow()
  })

  it('accepts username with exactly 3 characters', () => {
    expect(profileSchema.parse(validProfile({ username: 'abc' })).username).toBe('abc')
  })

  it('accepts username with exactly 24 characters', () => {
    expect(profileSchema.parse(validProfile({ username: 'a'.repeat(24) })).username).toBe('a'.repeat(24))
  })
})

describe('profileSchema — name', () => {
  it('accepts a normal full name', () => {
    expect(profileSchema.parse(validProfile({ name: 'Beatriz Moretti Andrade' })).name).toBe('Beatriz Moretti Andrade')
  })

  it('rejects name shorter than 2 characters', () => {
    expect(() => profileSchema.parse(validProfile({ name: 'A' }))).toThrow()
  })

  it('rejects name longer than 80 characters', () => {
    expect(() => profileSchema.parse(validProfile({ name: 'A'.repeat(81) }))).toThrow()
  })
})

describe('profileSchema — favoriteTmdbIds', () => {
  it('accepts an empty list', () => {
    expect(profileSchema.parse(validProfile({ favoriteTmdbIds: [] })).favoriteTmdbIds).toHaveLength(0)
  })

  it('accepts up to 5 movies', () => {
    expect(profileSchema.parse(validProfile({ favoriteTmdbIds: [1, 2, 3, 4, 5] })).favoriteTmdbIds).toHaveLength(5)
  })

  it('rejects more than 5 movies', () => {
    expect(() => profileSchema.parse(validProfile({ favoriteTmdbIds: [1, 2, 3, 4, 5, 6] }))).toThrow()
  })

  it('coerces string IDs to numbers (HTML form behaviour)', () => {
    const result = profileSchema.parse(validProfile({ favoriteTmdbIds: ['550', '27205'] }))
    expect(result.favoriteTmdbIds).toEqual([550, 27205])
  })
})
