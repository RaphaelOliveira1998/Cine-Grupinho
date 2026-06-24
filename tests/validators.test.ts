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
